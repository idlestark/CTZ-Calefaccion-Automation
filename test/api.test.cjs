const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { DatabaseSync } = require("node:sqlite"); // stand-in de better-sqlite3 solo para las pruebas
const { initializeDatabase } = require("../electron/database.cjs");
const { createApi } = require("../electron/api.cjs");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ctz-"));
const db = new DatabaseSync(":memory:");
initializeDatabase(db);
const api = createApi({ store: { db }, paths: { backupsDir: path.join(tmp, "backups") } });
const call = (name, args, token) => api.dispatch(name, args, token);
const adminTok = call("auth:login", { username: "admin", password: "admin" }).token;
const subTok = call("auth:login", { username: "subadmin", password: "subadmin" }).token;

test("login: credenciales inválidas y roles", () => {
  assert.throws(() => call("auth:login", { username: "admin", password: "x" }), /incorrectos/);
  assert.throws(() => call("clock:parse", {}, subTok), /permiso/);
  assert.throws(() => call("employee:getAll", {}, "token-falso"), /sesión/i);
  assert.throws(() => call("settings:get", {}, subTok), /permiso/);
  assert.ok(call("justification:months", {}, subTok));
});

test("empleados: alta, duplicado, edición, validaciones", () => {
  call("employee:create", { id: 5, name: "  Ana   Pérez ", dni: "30.111.222" }, adminTok);
  assert.throws(() => call("employee:create", { id: 5, name: "X" }, adminTok), /Ya existe/);
  assert.throws(() => call("employee:create", { id: 6, name: "" }, adminTok), /obligatorio/);
  assert.deepEqual(call("employee:getAll", {}, subTok)[0], { id: 5, name: "Ana Pérez", dni: 30111222 });
  call("employee:update", { id: 5, name: "Ana P.", dni: null }, adminTok);
  assert.equal(call("employee:getAll", {}, adminTok)[0].name, "Ana P.");
  call("employee:delete", { id: 5 }, adminTok);
  assert.equal(call("employee:getAll", {}, adminTok).length, 0);
});

test("flujo completo con el CSV de julio: parse -> empleado nuevo frena -> alta -> faltantes -> finalizar -> historial", () => {
  const csv = "/mnt/user-data/uploads/Muestra_del_reloj.csv";
  if (!fs.existsSync(csv)) return;
  const parsed = call("clock:parse", { base64: fs.readFileSync(csv).toString("base64") }, adminTok);
  assert.equal(parsed.monthKey, "2026-07");
  assert.equal(parsed.alreadyProcessed, false);
  const holidays = ["2026-07-09", "2026-07-10"];
  let a = call("clock:analyze", { monthKey: parsed.monthKey, records: parsed.records, holidays }, adminTok);
  assert.equal(a.blocked, true);
  assert.equal(a.alerts.filter((x) => x.kind === "newEmployee").length, 61);
  for (const e of parsed.employees) call("employee:quickAdd", { id: e.id, name: e.name }, adminTok);

  a = call("clock:analyze", { monthKey: parsed.monthKey, records: parsed.records, holidays }, adminTok);
  assert.equal(a.blocked, false);
  const missing = a.alerts.filter((x) => x.kind === "missing");
  assert.ok(missing.length > 0);
  assert.throws(() => call("clock:finalize", { monthKey: parsed.monthKey, records: parsed.records, holidays }, adminTok), /faltantes/);

  // se descartan todas las alertas (dar por revisado)
  const dismissed = missing.flatMap((m) => m.days.map((d) => `${m.employeeId}|${d.date}`));
  const fin = call("clock:finalize", { monthKey: parsed.monthKey, records: parsed.records, holidays, dismissed }, adminTok);
  assert.equal(fin.summary.employees.length, 61);
  assert.ok(fin.backup && fs.existsSync(fin.backup), "debe crear copia de seguridad local");
  assert.match(fin.html, /TANDILTA - JULIO 2026/);
  assert.equal(db.prepare("SELECT COUNT(*) n FROM time_report WHERE source='reloj'").get().n, 2538);

  assert.deepEqual(call("history:months", {}, subTok).map((m) => m.month), ["2026-07"]);
  const h = call("history:get", { month: "2026-07" }, subTok);
  assert.equal(h.summary.employees.length, 61);
  assert.equal(call("history:employee", { employeeId: 116 }, adminTok).length, 1);
  assert.equal(call("history:employeeMonth", { employeeId: 116, month: "2026-07" }, adminTok).employee.id, 116);

  // reprocesar el mismo mes reemplaza, no duplica
  call("clock:finalize", { monthKey: parsed.monthKey, records: parsed.records, holidays, dismissed }, adminTok);
  assert.equal(db.prepare("SELECT COUNT(*) n FROM time_report WHERE source='reloj'").get().n, 2538);
  assert.equal(call("clock:parse", { base64: fs.readFileSync(csv).toString("base64") }, adminTok).alreadyProcessed, true);
});

test("backup desactivable desde ajustes (con PIN para los parámetros)", () => {
  assert.throws(() => call("settings:save", { values: { tolerance_min: 20 }, pin: "0000" }, adminTok), /PIN/);
  call("settings:save", { values: { tolerance_min: 20, bonus_puntualidad: 150000 }, pin: "1234" }, adminTok);
  assert.equal(call("settings:get", {}, adminTok).tolerance_min, 20);
  assert.equal(call("settings:get", {}, adminTok).pin, undefined);
  assert.throws(() => call("settings:save", { values: { work_start: "17:00", work_end: "16:00" }, pin: "1234" }, adminTok), /anterior/);
  call("settings:changePin", { pin: "1234", newPin: "9876" }, adminTok);
  assert.throws(() => call("settings:save", { values: {}, pin: "1234" }, adminTok), /PIN/);
  call("settings:save", { values: { tolerance_min: 15, backup_enabled: false }, pin: "9876" }, adminTok);
  const files = () => fs.readdirSync(path.join(tmp, "backups")).length;
  const before = files();
  const csv = "/mnt/user-data/uploads/Muestra_del_reloj.csv";
  if (!fs.existsSync(csv)) return;
  const p = call("clock:parse", { base64: fs.readFileSync(csv).toString("base64") }, adminTok);
  const an = call("clock:analyze", { monthKey: p.monthKey, records: p.records, holidays: [] }, adminTok);
  const dismissed = an.alerts.filter((x) => x.kind === "missing").flatMap((m) => m.days.map((d) => `${m.employeeId}|${d.date}`));
  const fin = call("clock:finalize", { monthKey: p.monthKey, records: p.records, holidays: [], dismissed }, adminTok);
  assert.equal(fin.backup, null);
  assert.equal(files(), before);
});

test("justificaciones: alta, listado por mes, validaciones y borrado", () => {
  call("employee:create", { id: 77, name: "Hugo Silva", dni: 1 }, adminTok);
  const id = call("justification:create", { employee_id: 77, reason_id: 1, start_date: "2026-07-13", end_date: "2026-07-14", hours: 18, description: "Gripe" }, subTok).id;
  assert.throws(() => call("justification:create", { employee_id: 77, reason_id: 1, start_date: "2026-07-14", end_date: "2026-07-13", hours: 1 }, subTok), /fin/);
  assert.throws(() => call("justification:create", { employee_id: 999, reason_id: 1, start_date: "2026-07-14", hours: 1 }, subTok), /no existe/);
  const list = call("justification:list", { month: "2026-07" }, subTok);
  assert.equal(list.length, 1);
  assert.equal(list[0].reason_name, "Enfermedad");
  assert.equal(call("justification:list", { month: "2026-08" }, subTok).length, 0);
  call("justification:delete", { id }, subTok);
  assert.equal(call("justification:list", { month: "2026-07" }, subTok).length, 0);
});

test("db:clear exige PIN y borra registros pero conserva empleados", () => {
  assert.throws(() => call("db:clear", { pin: "x" }, adminTok), /PIN/);
  call("db:clear", { pin: "9876" }, adminTok);
  assert.equal(db.prepare("SELECT COUNT(*) n FROM time_report").get().n, 0);
  assert.ok(call("employee:getAll", {}, adminTok).length > 0);
});
