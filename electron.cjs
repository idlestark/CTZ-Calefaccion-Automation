const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

const { openDatabase } = require("./electron/database.cjs");
const { createApi } = require("./electron/api.cjs");
const { startServer } = require("./electron/server.cjs");

// ---------------------------------------------------------------- configuración
// mode: "host"   -> esta PC guarda la base y atiende a la otra PC por la red local
//       "client" -> esta PC se conecta a la PC principal (hostUrl)
const DEFAULT_CONFIG = { mode: "host", hostUrl: "", port: 3737 };
const configFile = () => path.join(app.getPath("userData"), "config.json");

function loadConfig() {
  try {
    return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(configFile(), "utf8")) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

let config;
let store = null; // { db, dbFile }
let api = null;
let server = null;
let serverError = null;

const dataRoot = () => path.join(app.getPath("documents"), "CTZ");
const paths = () => ({
  backupsDir: path.join(dataRoot(), "Copias de seguridad"),
  pdfDir: path.join(dataRoot(), "Planillas"),
});

function lanAddress() {
  for (const list of Object.values(os.networkInterfaces())) {
    for (const i of list || []) if (i.family === "IPv4" && !i.internal) return i.address;
  }
  return null;
}

async function startHost() {
  const dbFile = path.join(app.getPath("userData"), "ctz.sqlite");
  store = { db: openDatabase(dbFile), dbFile };
  api = createApi({ store, paths: paths() });
  try {
    server = await startServer(api.dispatch, { port: Number(config.port) || 3737 });
  } catch (e) {
    serverError = e.code === "EADDRINUSE" ? `El puerto ${config.port} ya está en uso.` : e.message;
  }
}

// ---------------------------------------------------------------- IPC
ipcMain.handle("api:call", async (_e, name, args, token) => {
  try {
    if (config.mode === "host") {
      if (!api) throw new Error("La base de datos no está disponible.");
      return { ok: true, data: api.dispatch(name, args, token) };
    }
    const base = String(config.hostUrl || "").replace(/\/+$/, "");
    if (!base) return { ok: false, error: "Falta configurar la dirección de la PC principal.", code: 503 };
    const res = await fetch(`${base}/api/${encodeURIComponent(name)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ args, token }),
      signal: AbortSignal.timeout(60000),
    });
    return await res.json();
  } catch (e) {
    const offline = e && (e.name === "TimeoutError" || e.cause || /fetch failed/i.test(String(e.message)));
    return {
      ok: false,
      error: offline ? "No se pudo conectar con la PC principal. Verificá que esté encendida y con la aplicación abierta." : e.message,
      code: e.code || 500,
    };
  }
});

ipcMain.handle("local:info", () => ({
  mode: config.mode,
  hostUrl: config.hostUrl,
  port: config.port,
  address: lanAddress(),
  serverError,
  backupsDir: paths().backupsDir,
  pdfDir: paths().pdfDir,
}));

ipcMain.handle("local:saveConfig", (_e, cfg) => {
  const next = {
    mode: cfg.mode === "client" ? "client" : "host",
    hostUrl: String(cfg.hostUrl || "").trim(),
    port: Math.max(1024, Math.min(65535, Number(cfg.port) || 3737)),
  };
  if (next.hostUrl && !/^https?:\/\//i.test(next.hostUrl)) next.hostUrl = `http://${next.hostUrl}`;
  fs.mkdirSync(path.dirname(configFile()), { recursive: true });
  fs.writeFileSync(configFile(), JSON.stringify(next, null, 2));
  app.relaunch();
  app.exit(0);
});

ipcMain.handle("local:testConnection", async (_e, url) => {
  try {
    let base = String(url || "").trim().replace(/\/+$/, "");
    if (!/^https?:\/\//i.test(base)) base = `http://${base}`;
    const res = await fetch(`${base}/ping`, { signal: AbortSignal.timeout(4000) });
    const j = await res.json();
    return { ok: !!j.ok };
  } catch {
    return { ok: false };
  }
});

// El PDF se genera siempre en la PC donde se está usando la aplicación.
ipcMain.handle("local:savePdf", async (_e, html, filename) => {
  const safe = String(filename || "planilla.pdf").replace(/[^\w.\- ]+/g, "_");
  fs.mkdirSync(paths().pdfDir, { recursive: true });
  const out = path.join(paths().pdfDir, safe.endsWith(".pdf") ? safe : `${safe}.pdf`);
  const win = new BrowserWindow({ show: false, webPreferences: { sandbox: true, javascript: false } });
  try {
    await win.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));
    const pdf = await win.webContents.printToPDF({ pageSize: "A4", printBackground: true, preferCSSPageSize: true });
    fs.writeFileSync(out, pdf);
  } finally {
    win.destroy();
  }
  return out;
});

ipcMain.handle("local:openPath", async (_e, p) => shell.openPath(p));
ipcMain.handle("local:showInFolder", (_e, p) => shell.showItemInFolder(p));

// Importar una copia de seguridad (solo en la PC principal)
ipcMain.handle("local:importBackup", async () => {
  if (config.mode !== "host" || !store) return { ok: false, error: "Solo se puede importar en la PC principal." };
  const r = await dialog.showOpenDialog({
    title: "Importar copia de seguridad",
    defaultPath: paths().backupsDir,
    filters: [{ name: "Base de datos", extensions: ["sqlite", "db"] }],
    properties: ["openFile"],
  });
  if (r.canceled || !r.filePaths[0]) return { ok: false, canceled: true };
  const src = r.filePaths[0];
  try {
    const Database = require("better-sqlite3");
    const test = new Database(src, { readonly: true, fileMustExist: true });
    const ok = test.prepare("SELECT name FROM sqlite_master WHERE name IN ('employee','time_report','monthly_summary')").all().length === 3;
    test.close();
    if (!ok) return { ok: false, error: "El archivo no parece ser una copia de seguridad de esta aplicación." };
    // copia de resguardo de la base actual por si algo sale mal
    const safety = path.join(paths().backupsDir, `antes-de-importar-${Date.now()}.sqlite`);
    require("./electron/database.cjs").backupTo(store.db, safety);
    store.db.close();
    fs.copyFileSync(src, store.dbFile);
    store.db = openDatabase(store.dbFile); // initializeDatabase completa tablas faltantes
    return { ok: true };
  } catch (e) {
    try {
      store.db = openDatabase(store.dbFile);
    } catch {
      /* noop */
    }
    return { ok: false, error: e.message };
  }
});

// ---------------------------------------------------------------- ventana
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1000,
    minHeight: 640,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "electron", "preload.cjs"),
    },
  });
  if (process.env.ELECTRON_DEV === "true") {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "dist", "index.html"));
  }
}

app.whenReady().then(async () => {
  config = loadConfig();
  if (config.mode === "host") await startHost();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("will-quit", () => {
  if (server) server.close();
  if (store && store.db) store.db.close();
});
