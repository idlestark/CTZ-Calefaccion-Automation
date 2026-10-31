const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const { parseClockCsv } = require("../electron/core/csv.cjs");
const { analyzeMonth, buildSummary } = require("../electron/core/calc.cjs");
const { buildPlanillaHtml } = require("../electron/core/planilla.cjs");

// helper: arma registros de un empleado (id 1) para un día de julio 2026
const rec = (day, ...times) => times.map((t) => ({ employeeId: 1, name: "Test Uno", date: `2026-07-${String(day).padStart(2, "0")}`, time: t + ":00" }));
const EMP = [{ id: 1, name: "Test Uno", dni: 1 }];
// 21 días laborales de julio 2026 (sin 9 y 10 = feriados)
const WORK = [1,2,3,6,7,8,13,14,15,16,17,20,21,22,23,24,27,28,29,30,31];
const base = (over = {}, perDay = (d) => rec(d, "06:55", "16:01")) =>
  analyzeMonth({ monthKey: "2026-07", records: WORK.flatMap(perDay), employees: EMP, holidays: ["2026-07-09", "2026-07-10"], ...over });

test("mes perfecto: puntualidad, 189 hs, comp 12, feriados 18, total 219", () => {
  const r = base();
  const e = r.employees[0];
  assert.equal(e.grade, "puntualidad");
  assert.deepEqual([e.planilla.hs, e.planilla.comp, e.planilla.fer, e.planilla.total, e.planilla.bonus], [189, 12, 18, 219, 137000]);
  assert.equal(r.alerts.length, 0);
});

test("llegada a las 7:10 (dentro de tolerancia): no es tarde, pero rompe la puntualidad -> presentismo y alerta 'casi puntualidad'", () => {
  const r = base({}, (d) => (d === 14 ? rec(d, "07:10", "16:00") : rec(d, "06:55", "16:00")));
  const e = r.employees[0];
  assert.equal(e.grade, "presentismo");
  assert.equal(e.stats.late, 0);
  assert.equal(e.planilla.hs, 189); // dentro de la tolerancia no se descuenta
  const near = r.alerts.find((a) => a.kind === "near");
  assert.equal(near.target, "puntualidad");
  assert.deepEqual(near.dates, ["2026-07-14"]);
});

test("llegada a las 7:20 (tarde): se descuentan 20 min y cuenta como llegada tarde", () => {
  const r = base({}, (d) => (d === 14 ? rec(d, "07:20", "16:00") : rec(d, "07:00", "16:00")));
  const e = r.employees[0];
  assert.equal(e.stats.late, 1);
  assert.equal(e.grade, "presentismo");
  assert.equal(e.planilla.hs, 188.5); // 189 - 0,33h redondeado a 0,5
});

test("dos llegadas tarde -> medio presentismo; tres -> sin presentismo", () => {
  const late = (n) => (d) => (WORK.slice(0, n).includes(d) ? rec(d, "07:40", "16:00") : rec(d, "07:00", "16:00"));
  assert.equal(base({}, late(2)).employees[0].grade, "medio");
  assert.equal(base({}, late(3)).employees[0].grade, "ninguno");
});

test("salida intermedia: 4 marcas = 1 salida; <=4hs mantiene puntualidad, >4hs baja a medio", () => {
  const r = base({}, (d) => (d === 14 ? rec(d, "07:00", "10:00", "12:00", "16:00") : rec(d, "07:00", "16:00")));
  assert.equal(r.employees[0].stats.exits, 1);
  assert.equal(r.employees[0].stats.exitHours, 2);
  assert.equal(r.employees[0].grade, "puntualidad"); // 1 salida <= 4hs y llegadas <= 7:00
  const r2 = base({}, (d) => (d === 14 ? rec(d, "07:00", "08:00", "13:30", "16:00") : rec(d, "07:00", "16:00")));
  assert.equal(r2.employees[0].grade, "medio"); // 5,5hs afuera > 4
});

test("día con 3 marcas: alerta de registro faltante, y se resuelve con una marca manual", () => {
  const per = (d) => (d === 14 ? rec(d, "07:00", "12:00", "13:00") : rec(d, "07:00", "16:00"));
  const r = base({}, per);
  const a = r.alerts.find((x) => x.kind === "missing");
  assert.equal(a.days[0].date, "2026-07-14");
  assert.equal(a.days[0].suggestion, "salida");
  const fixed = base({ manual: [{ employeeId: 1, date: "2026-07-14", time: "16:00" }] }, per);
  assert.equal(fixed.alerts.filter((x) => x.kind === "missing").length, 0);
  assert.equal(fixed.employees[0].stats.exits, 1);
});

test("marca repetida (16:00 dos veces): alerta, y se resuelve ignorando una de las marcas", () => {
  const per = (d) => (d === 14 ? rec(d, "07:00", "16:00", "16:00") : rec(d, "07:00", "16:00"));
  assert.equal(base({}, per).alerts.filter((a) => a.kind === "missing").length, 1);
  const r = base({ ignoredMarks: ["1|2026-07-14|16:00"] }, per);
  assert.equal(r.alerts.filter((a) => a.kind === "missing").length, 0);
  assert.equal(r.employees[0].grade, "puntualidad");
  assert.equal(r.employees[0].stats.exits, 0);
});

test("día con una sola marca temprana sugiere salida faltante con horario estándar 16:00", () => {
  const r = base({}, (d) => (d === 3 ? rec(d, "06:50") : rec(d, "07:00", "16:00")));
  const a = r.alerts.find((x) => x.kind === "missing").days[0];
  assert.equal(a.suggestion, "salida");
  assert.equal(a.standardTime, "16:00");
});

test("ausencia de jornada completa: medio presentismo admite una; dos => sin presentismo; presentismo ninguna", () => {
  const abs = (n) => (d) => (WORK.slice(0, n).includes(d) ? [] : rec(d, "07:00", "16:00"));
  const r1 = base({}, abs(1));
  assert.equal(r1.employees[0].grade, "medio");
  assert.equal(r1.employees[0].planilla.hs, 180);
  assert.equal(base({}, abs(2)).employees[0].grade, "ninguno");
});

test("justificación de una ausencia: no cuenta como falta y suma las horas cargadas a mano", () => {
  const abs = (d) => (d === 14 ? [] : rec(d, "07:00", "16:00"));
  const r = base({ justifications: [{ employee_id: 1, reason_name: "Enfermedad", start_date: "2026-07-14", end_date: "2026-07-14", hours: 9 }] }, abs);
  const e = r.employees[0];
  assert.equal(e.grade, "puntualidad");
  assert.equal(e.planilla.hs, 180);
  assert.equal(e.planilla.enf, 9);
  assert.equal(e.planilla.total, 180 + 12 + 18 + 9);
});

test("justificación de una llegada tarde: no cuenta como tarde", () => {
  const r = base({ justifications: [{ employee_id: 1, reason_name: "Otro", start_date: "2026-07-14", end_date: null, hours: 0 }] },
    (d) => (d === 14 ? rec(d, "07:45", "16:00") : rec(d, "07:00", "16:00")));
  assert.equal(r.employees[0].grade, "puntualidad");
});

test("marcas en sábado/domingo o feriado no se computan y generan aviso", () => {
  const r = base({}, (d) => (d === 1 ? [...rec(1, "07:00", "16:00"), ...rec(4, "08:00", "12:00")] : rec(d, "07:00", "16:00")));
  assert.equal(r.employees[0].planilla.hs, 189);
  assert.ok(r.alerts.find((a) => a.kind === "nonWorkingMarks"));
});

test("empleado nuevo (no está en la base): frena el proceso", () => {
  const r = analyzeMonth({ monthKey: "2026-07", records: rec(1, "07:00", "16:00"), employees: [] });
  assert.equal(r.blocked, true);
  assert.equal(r.alerts[0].kind, "newEmployee");
});

test("horas extra: se muestran de a 0,5 y no suman al total salvo que se active el ajuste", () => {
  const per = (d) => rec(d, "06:30", "16:30");
  const r = base({}, per);
  assert.equal(r.employees[0].stats.extraHours, 21); // 1h por día
  assert.equal(r.employees[0].planilla.hs, 189);
  const r2 = base({ settings: { extras_in_total: true } }, per);
  assert.equal(r2.employees[0].planilla.hs, 210);
});

test("CSV real de muestra (julio 2026): parsea, limpia y procesa sin errores", () => {
  const p = "/mnt/user-data/uploads/Muestra_del_reloj.csv";
  if (!fs.existsSync(p)) return;
  const parsed = parseClockCsv(fs.readFileSync(p));
  assert.equal(parsed.monthKey, "2026-07");
  assert.equal(parsed.employees.length, 61);
  assert.equal(parsed.records.length, 2538);
  const emps = parsed.employees.map((e) => ({ id: e.id, name: e.name, dni: null }));
  const r = analyzeMonth({ monthKey: parsed.monthKey, records: parsed.records, employees: emps, holidays: ["2026-07-09", "2026-07-10"] });
  assert.equal(r.employees.length, 61);
  const html = buildPlanillaHtml(buildSummary(r));
  assert.match(html, /TANDILTA - JULIO 2026/);
  fs.writeFileSync("/home/claude/work/planilla_julio.html", html);
  fs.writeFileSync("/home/claude/work/analisis_julio.json", JSON.stringify(r, null, 1));
});
