// Base de datos SQLite (better-sqlite3). Todo corre en local.
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { DEFAULT_SETTINGS, mergeSettings } = require("./core/settings.cjs");

function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString("hex");
  return `${salt}:${crypto.scryptSync(String(pw), salt, 32).toString("hex")}`;
}

function verifyPassword(pw, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(String(pw), salt, 32);
  const real = Buffer.from(hash, "hex");
  return real.length === test.length && crypto.timingSafeEqual(real, test);
}

function initializeDatabase(db) {
  db.exec("PRAGMA foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS "user" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','subadmin'))
    );

    -- El id del empleado es su número de ID en el reloj (legajo)
    CREATE TABLE IF NOT EXISTS employee (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      dni INTEGER
    );

    CREATE TABLE IF NOT EXISTS time_report (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL REFERENCES employee(id) ON UPDATE CASCADE ON DELETE CASCADE,
      date TEXT NOT NULL,            -- YYYY-MM-DD
      time TEXT NOT NULL,            -- HH:MM:SS
      source TEXT NOT NULL DEFAULT 'reloj',  -- 'reloj' | 'manual'
      ignored INTEGER NOT NULL DEFAULT 0,
      note TEXT,
      UNIQUE (employee_id, date, time, source)
    );
    CREATE INDEX IF NOT EXISTS idx_time_report_date ON time_report(date);

    CREATE TABLE IF NOT EXISTS reason (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS justification (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL REFERENCES employee(id) ON UPDATE CASCADE ON DELETE CASCADE,
      reason_id INTEGER NOT NULL REFERENCES reason(id),
      description TEXT,
      start_date TEXT NOT NULL,
      end_date TEXT,
      hours REAL NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_justification_start ON justification(start_date);

    CREATE TABLE IF NOT EXISTS setting (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- Planilla/resumen final de cada mes (lo que se imprimió). El grado de presentismo
    -- no se arrastra de un mes al otro: cada mes se calcula de cero.
    CREATE TABLE IF NOT EXISTS monthly_summary (
      month TEXT PRIMARY KEY,        -- YYYY-MM
      data TEXT NOT NULL,            -- JSON
      created_at TEXT NOT NULL
    );
  `);

  const seedReason = db.prepare("INSERT OR IGNORE INTO reason (name) VALUES (?)");
  ["Enfermedad", "ART", "Licencia", "Otro"].forEach((n) => seedReason.run(n));

  const users = db.prepare('SELECT COUNT(*) AS n FROM "user"').get();
  if (!users.n) {
    const ins = db.prepare('INSERT INTO "user" (username, name, password_hash, role) VALUES (?, ?, ?, ?)');
    ins.run("admin", "Admin", hashPassword("admin"), "admin");
    ins.run("subadmin", "Subadmin", hashPassword("subadmin"), "subadmin");
  }
}

function openDatabase(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const Database = require("better-sqlite3");
  const db = new Database(file);
  initializeDatabase(db);
  return db;
}

function getSettings(db) {
  const stored = {};
  for (const r of db.prepare("SELECT key, value FROM setting").all()) {
    if (r.key in DEFAULT_SETTINGS) {
      try {
        stored[r.key] = JSON.parse(r.value);
      } catch {
        /* se ignora un valor dañado y queda el de fábrica */
      }
    }
  }
  return mergeSettings(stored);
}

function saveSettings(db, values) {
  const up = db.prepare("INSERT INTO setting (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  for (const [k, v] of Object.entries(values)) up.run(k, JSON.stringify(v));
}

/** Copia de seguridad consistente del archivo de la base. */
function backupTo(db, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (fs.existsSync(file)) fs.unlinkSync(file);
  db.exec(`VACUUM INTO '${file.replace(/'/g, "''")}'`);
  return file;
}

module.exports = { openDatabase, initializeDatabase, getSettings, saveSettings, backupTo, hashPassword, verifyPassword };
