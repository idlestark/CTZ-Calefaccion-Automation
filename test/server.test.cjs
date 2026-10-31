const test = require("node:test");
const assert = require("node:assert");
const os = require("os");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const { initializeDatabase } = require("../electron/database.cjs");
const { createApi } = require("../electron/api.cjs");
const { startServer } = require("../electron/server.cjs");

test("PC secundaria: login, permisos por rol y operaciones por HTTP en la red local", async () => {
  const db = new DatabaseSync(":memory:");
  initializeDatabase(db);
  const api = createApi({ store: { db }, paths: { backupsDir: path.join(os.tmpdir(), "ctz-srv") } });
  const server = await startServer(api.dispatch, { port: 0, host: "127.0.0.1" });
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = async (name, args, token) => (await fetch(`${base}/api/${encodeURIComponent(name)}`, { method: "POST", body: JSON.stringify({ args, token }) })).json();

  assert.deepEqual(await (await fetch(`${base}/ping`)).json(), { ok: true, app: "ctz" });
  const bad = await post("auth:login", { username: "subadmin", password: "mal" });
  assert.equal(bad.ok, false);
  const { token } = (await post("auth:login", { username: "subadmin", password: "subadmin" })).data;
  const emp = await post("employee:create", { id: 9, name: "X" }, token);
  assert.equal(emp.ok, false); // el subadmin no puede crear empleados
  assert.equal(emp.code, 403);
  const admin = (await post("auth:login", { username: "admin", password: "admin" })).data.token;
  assert.equal((await post("employee:create", { id: 9, name: "Ana" }, admin)).ok, true);
  // la sub-administrativa ve el empleado que cargó el administrador y puede justificar
  assert.equal((await post("employee:getAll", {}, token)).data.length, 1);
  assert.equal((await post("justification:create", { employee_id: 9, reason_id: 1, start_date: "2026-07-01", hours: 9 }, token)).ok, true);
  assert.equal((await post("justification:list", { month: "2026-07" }, admin)).data.length, 1);
  assert.equal((await post("operacion:inexistente", {}, admin)).ok, false);
  server.close();
});
