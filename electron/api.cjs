// Capa de operaciones (lógica de negocio). La misma capa la usa la PC principal
// (por IPC) y la PC secundaria (por HTTP en la red local).
const crypto = require("crypto");
const path = require("path");
const { verifyPassword, getSettings, saveSettings, backupTo } = require("./database.cjs");
const { DEFAULT_SETTINGS } = require("./core/settings.cjs");
const { parseClockCsv } = require("./core/csv.cjs");
const { analyzeMonth, buildSummary, MONTHS_ES } = require("./core/calc.cjs");
const { buildPlanillaHtml } = require("./core/planilla.cjs");

class ApiError extends Error {
  constructor(message, code = 400) {
    super(message);
    this.code = code;
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_KEY = /^\d{4}-(0[1-9]|1[0-2])$/;
const pad = (n) => String(n).padStart(2, "0");

function posInt(v, label) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new ApiError(`${label} inválido.`);
  return n;
}
function cleanName(v) {
  const s = String(v ?? "").trim().replace(/\s+/g, " ");
  if (!s) throw new ApiError("El nombre es obligatorio.");
  if (s.length > 40) throw new ApiError("El nombre no puede superar los 40 caracteres.");
  return s;
}
function cleanDni(v) {
  if (v === null || v === undefined || String(v).trim() === "") return null;
  const n = Number(String(v).replace(/[.\s]/g, ""));
  if (!Number.isInteger(n) || n <= 0) throw new ApiError("DNI inválido.");
  return n;
}
function monthLabel(key) {
  return `${MONTHS_ES[Number(key.slice(5, 7)) - 1]} ${key.slice(0, 4)}`;
}
function monthRange(key) {
  const [y, m] = key.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return [`${key}-01`, `${key}-${pad(last)}`];
}

function tx(db, fn) {
  db.exec("BEGIN");
  try {
    const out = fn();
    db.exec("COMMIT");
    return out;
  } catch (e) {
    try {
      db.exec("ROLLBACK");
    } catch {
      /* noop */
    }
    throw e;
  }
}

/**
 * @param {{store:{db:any}, paths:{backupsDir:string}}} opts  store.db puede reemplazarse (importar copia)
 */
function createApi({ store, paths }) {
  const sessions = new Map();
  const db = () => store.db;
  const H = {};
  const def = (name, roles, fn) => (H[name] = { roles, fn });
  const ADMIN = ["admin"];
  const BOTH = ["admin", "subadmin"];

  // ---------------------------------------------------------------- sesión
  H["auth:login"] = {
    public: true,
    fn: ({ username, password }) => {
      const u = db().prepare('SELECT * FROM "user" WHERE username = ?').get(String(username || "").trim());
      if (!u || !verifyPassword(password, u.password_hash)) throw new ApiError("Usuario o contraseña incorrectos.", 401);
      const token = crypto.randomUUID();
      const user = { id: u.id, username: u.username, name: u.name, role: u.role };
      sessions.set(token, user);
      return { token, user };
    },
  };
  H["auth:logout"] = { public: true, fn: (_a, _u, token) => (sessions.delete(token), true) };
  def("auth:me", BOTH, (_a, user) => user);

  // ------------------------------------------------------------- empleados
  def("employee:getAll", BOTH, () => db().prepare("SELECT id, name, dni FROM employee ORDER BY id").all());

  const createEmployee = ({ id, name, dni }) => {
    const eid = posInt(id, "El ID del reloj");
    if (db().prepare("SELECT 1 FROM employee WHERE id = ?").get(eid)) throw new ApiError(`Ya existe un empleado con ID ${eid}.`);
    db().prepare("INSERT INTO employee (id, name, dni) VALUES (?, ?, ?)").run(eid, cleanName(name), cleanDni(dni));
    return { id: eid };
  };
  def("employee:create", ADMIN, createEmployee);
  def("employee:quickAdd", ADMIN, createEmployee);
  def("employee:update", ADMIN, ({ id, name, dni }) => {
    const r = db().prepare("UPDATE employee SET name = ?, dni = ? WHERE id = ?").run(cleanName(name), cleanDni(dni), posInt(id, "ID"));
    if (!r.changes) throw new ApiError("El empleado no existe.", 404);
    return true;
  });
  def("employee:delete", ADMIN, ({ id }) => {
    db().prepare("DELETE FROM employee WHERE id = ?").run(posInt(id, "ID"));
    return true;
  });

  // ------------------------------------------------------- justificaciones
  def("reason:getAll", BOTH, () => db().prepare("SELECT id, name FROM reason ORDER BY id").all());

  def("justification:list", BOTH, ({ month }) => {
    if (!MONTH_KEY.test(month || "")) throw new ApiError("Mes inválido.");
    return db()
      .prepare(
        `SELECT j.id, j.employee_id, e.name AS employee_name, e.dni AS employee_dni, j.reason_id, r.name AS reason_name,
                j.description, j.start_date, j.end_date, j.hours
         FROM justification j
         JOIN employee e ON e.id = j.employee_id
         JOIN reason r ON r.id = j.reason_id
         WHERE j.start_date >= ? AND j.start_date <= ?
         ORDER BY j.start_date DESC, j.id DESC`,
      )
      .all(...monthRange(month));
  });

  def("justification:months", BOTH, () => {
    const rows = db().prepare("SELECT DISTINCT substr(start_date, 1, 7) AS month FROM justification ORDER BY month DESC").all();
    return rows.map((r) => r.month);
  });

  def("justification:create", BOTH, (a) => {
    const emp = posInt(a.employee_id, "Empleado");
    const reason = posInt(a.reason_id, "Motivo");
    if (!ISO_DATE.test(a.start_date || "")) throw new ApiError("Fecha de inicio inválida.");
    const end = a.end_date ? String(a.end_date) : null;
    if (end && (!ISO_DATE.test(end) || end < a.start_date)) throw new ApiError("La fecha de fin es inválida.");
    const hours = Number(a.hours);
    if (!Number.isFinite(hours) || hours < 0 || hours > 744) throw new ApiError("Cantidad de horas inválida.");
    if (!db().prepare("SELECT 1 FROM employee WHERE id = ?").get(emp)) throw new ApiError("El empleado no existe.");
    if (!db().prepare("SELECT 1 FROM reason WHERE id = ?").get(reason)) throw new ApiError("El motivo no existe.");
    const desc = String(a.description || "").trim().slice(0, 255) || null;
    const r = db()
      .prepare("INSERT INTO justification (employee_id, reason_id, description, start_date, end_date, hours) VALUES (?, ?, ?, ?, ?, ?)")
      .run(emp, reason, desc, a.start_date, end, hours);
    return { id: Number(r.lastInsertRowid) };
  });

  def("justification:delete", BOTH, ({ id }) => {
    db().prepare("DELETE FROM justification WHERE id = ?").run(posInt(id, "ID"));
    return true;
  });

  // -------------------------------------------------------------- reloj
  def("clock:parse", ADMIN, ({ base64 }) => {
    if (!base64) throw new ApiError("No se recibió ningún archivo.");
    let parsed;
    try {
      parsed = parseClockCsv(Buffer.from(base64, "base64"));
    } catch (e) {
      throw new ApiError(e.message);
    }
    const processed = !!db().prepare("SELECT 1 FROM monthly_summary WHERE month = ?").get(parsed.monthKey);
    return { ...parsed, monthLabel: monthLabel(parsed.monthKey), alreadyProcessed: processed };
  });

  function runAnalysis(a) {
    if (!MONTH_KEY.test(a.monthKey || "")) throw new ApiError("Mes inválido.");
    if (!Array.isArray(a.records) || !a.records.length) throw new ApiError("No hay registros para procesar.");
    const [from, to] = monthRange(a.monthKey);
    const justifications = db()
      .prepare(
        `SELECT j.employee_id, r.name AS reason_name, j.start_date, j.end_date, j.hours
         FROM justification j JOIN reason r ON r.id = j.reason_id
         WHERE j.start_date <= ? AND COALESCE(j.end_date, j.start_date) >= ?`,
      )
      .all(to, from);
    return analyzeMonth({
      monthKey: a.monthKey,
      records: a.records,
      manual: a.manual || [],
      dismissed: a.dismissed || [],
      ignoredMarks: a.ignoredMarks || [],
      holidays: a.holidays || [],
      employees: db().prepare("SELECT id, name, dni FROM employee").all(),
      justifications,
      settings: getSettings(db()),
    });
  }

  def("clock:analyze", ADMIN, (a) => {
    const r = runAnalysis(a);
    const { settings, ...rest } = r;
    return rest;
  });

  def("clock:finalize", ADMIN, (a) => {
    const analysis = runAnalysis(a);
    if (analysis.blocked) throw new ApiError("Hay empleados nuevos sin dar de alta.");
    if (analysis.alerts.some((x) => x.kind === "missing")) throw new ApiError("Quedan registros faltantes sin revisar.");
    const summary = buildSummary(analysis);
    const [from, to] = monthRange(a.monthKey);

    const ignoreCount = new Map();
    (a.ignoredMarks || []).forEach((k) => ignoreCount.set(k, (ignoreCount.get(k) || 0) + 1));

    tx(db(), () => {
      db().prepare("DELETE FROM time_report WHERE date >= ? AND date <= ?").run(from, to);
      const ins = db().prepare("INSERT OR IGNORE INTO time_report (employee_id, date, time, source, ignored, note) VALUES (?, ?, ?, ?, ?, ?)");
      for (const r of a.records) {
        const k = `${r.employeeId}|${r.date}|${String(r.time).slice(0, 5)}`;
        const left = ignoreCount.get(k) || 0;
        if (left > 0) ignoreCount.set(k, left - 1);
        ins.run(r.employeeId, r.date, r.time, "reloj", left > 0 ? 1 : 0, null);
      }
      for (const m of a.manual || []) ins.run(m.employeeId, m.date, `${String(m.time).slice(0, 5)}:00`, "manual", 0, m.note || null);
      db()
        .prepare("INSERT INTO monthly_summary (month, data, created_at) VALUES (?, ?, ?) ON CONFLICT(month) DO UPDATE SET data = excluded.data, created_at = excluded.created_at")
        .run(a.monthKey, JSON.stringify(summary), summary.generatedAt);
    });

    let backup = null;
    const s = getSettings(db());
    if (s.backup_enabled) {
      const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "_").slice(0, 15);
      try {
        backup = backupTo(db(), path.join(paths.backupsDir, `ctz-${a.monthKey}-${stamp}.sqlite`));
      } catch (e) {
        backup = null; // un fallo de backup no debe perder el procesamiento
      }
    }
    return { summary, html: buildPlanillaHtml(summary), backup };
  });

  // ------------------------------------------------------------ historial
  const readSummary = (month) => {
    if (!MONTH_KEY.test(month || "")) throw new ApiError("Mes inválido.");
    const row = db().prepare("SELECT data FROM monthly_summary WHERE month = ?").get(month);
    if (!row) throw new ApiError("Ese mes no tiene datos procesados.", 404);
    return JSON.parse(row.data);
  };

  def("history:months", BOTH, () =>
    db()
      .prepare("SELECT month FROM monthly_summary ORDER BY month DESC")
      .all()
      .map((r) => ({ month: r.month, year: Number(r.month.slice(0, 4)), monthName: MONTHS_ES[Number(r.month.slice(5, 7)) - 1] })),
  );

  def("history:get", BOTH, ({ month }) => {
    const summary = readSummary(month);
    return { summary, html: buildPlanillaHtml(summary) };
  });

  def("history:employee", BOTH, ({ employeeId }) => {
    const id = posInt(employeeId, "ID");
    const rows = db().prepare("SELECT month, data FROM monthly_summary ORDER BY month DESC").all();
    const months = [];
    for (const r of rows) {
      const e = JSON.parse(r.data).employees.find((x) => x.id === id);
      if (e) months.push({ month: r.month, year: Number(r.month.slice(0, 4)), monthName: MONTHS_ES[Number(r.month.slice(5, 7)) - 1], grade: e.grade, gradeLabel: e.gradeLabel });
    }
    return months;
  });

  def("history:employeeMonth", BOTH, ({ employeeId, month }) => {
    const summary = readSummary(month);
    const e = summary.employees.find((x) => x.id === posInt(employeeId, "ID"));
    if (!e) throw new ApiError("El empleado no tiene datos en ese mes.", 404);
    return { employee: e, title: summary.title };
  });

  // ------------------------------------------------------------- ajustes
  def("settings:get", ADMIN, () => {
    const { pin, ...rest } = getSettings(db());
    return rest;
  });

  const checkPin = (pin) => {
    if (String(pin ?? "") !== String(getSettings(db()).pin)) throw new ApiError("PIN incorrecto.", 403);
  };

  def("settings:save", ADMIN, ({ values, pin }) => {
    checkPin(pin);
    const clean = {};
    for (const [k, v] of Object.entries(values || {})) {
      if (k === "pin" || !(k in DEFAULT_SETTINGS)) continue;
      const def_ = DEFAULT_SETTINGS[k];
      if (typeof def_ === "number") {
        const n = Number(v);
        if (!Number.isFinite(n) || n < 0) throw new ApiError(`Valor inválido para "${k}".`);
        clean[k] = n;
      } else if (typeof def_ === "boolean") clean[k] = !!v;
      else if (k === "work_start" || k === "work_end") {
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(String(v))) throw new ApiError("Horario inválido (HH:MM).");
        clean[k] = String(v);
      } else clean[k] = String(v).trim().slice(0, 60) || def_;
    }
    if (clean.work_start && clean.work_end && clean.work_start >= clean.work_end) throw new ApiError("El inicio de jornada debe ser anterior al fin.");
    saveSettings(db(), clean);
    return true;
  });

  def("settings:changePin", ADMIN, ({ pin, newPin }) => {
    checkPin(pin);
    if (!/^\d{4,10}$/.test(String(newPin || ""))) throw new ApiError("El nuevo PIN debe tener entre 4 y 10 números.");
    saveSettings(db(), { pin: String(newPin) });
    return true;
  });

  def("settings:setBackup", ADMIN, ({ enabled }) => {
    saveSettings(db(), { backup_enabled: !!enabled });
    return true;
  });

  // ---------------------------------------------------- base de datos
  def("db:backupNow", ADMIN, () => {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "_").slice(0, 15);
    return { path: backupTo(db(), path.join(paths.backupsDir, `ctz-manual-${stamp}.sqlite`)) };
  });

  def("db:clear", ADMIN, ({ pin }) => {
    checkPin(pin);
    tx(db(), () => {
      db().exec("DELETE FROM time_report; DELETE FROM justification; DELETE FROM monthly_summary;");
    });
    return true;
  });

  // -------------------------------------------------------------- despacho
  function dispatch(name, args, token) {
    const h = H[name];
    if (!h) throw new ApiError("Operación desconocida.", 404);
    let user = null;
    if (!h.public) {
      user = sessions.get(token);
      if (!user) throw new ApiError("La sesión venció. Volvé a iniciar sesión.", 401);
      if (h.roles && !h.roles.includes(user.role)) throw new ApiError("No tenés permiso para esta operación.", 403);
    }
    return h.fn(args || {}, user, token);
  }

  return { dispatch, sessions };
}

module.exports = { createApi, ApiError };
