// Núcleo de cálculo: marcas del reloj -> horas, incidencias, grado de presentismo y planilla.
// Función pura (sin base de datos ni Electron) para poder probarla de forma aislada.
const { mergeSettings, timeToMin, GRADE_LABELS, GRADE_KEYS } = require("./settings.cjs");

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

const pad = (n) => String(n).padStart(2, "0");
const fmtHM = (m) => `${pad(Math.floor(m / 60))}:${pad(Math.floor(m % 60))}`;
const roundHalf = (x) => Math.round(x * 2) / 2;
const round1 = (x) => Math.round(x * 10) / 10;

function daysOfMonth(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  const n = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const out = [];
  for (let d = 1; d <= n; d++) {
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    out.push({ date: `${monthKey}-${pad(d)}`, day: d, dow });
  }
  return out;
}

const dayLabel = (date, dow) => `${DAYS_ES[dow]} ${date.slice(8, 10)}/${date.slice(5, 7)}`;

// ---------------------------------------------------------------- un día
function analyzeDay(marks, cfg) {
  const { S, E, tol } = cfg;
  const m = marks.map((x) => x.m);
  const n = m.length;
  const pairs = [];
  for (let i = 0; i + 1 < n; i += 2) pairs.push([m[i], m[i + 1]]);

  let worked = 0;
  let extra = 0;
  let raw = 0;
  pairs.forEach(([a, b], idx) => {
    raw += b - a;
    // dentro de la tolerancia no se descuenta la demora de la primera entrada
    let aa = a;
    if (idx === 0 && a > S && a <= S + tol) aa = S;
    const lo = Math.max(aa, S);
    const hi = Math.min(b, E);
    if (hi > lo) worked += hi - lo;
    if (aa < S) extra += Math.min(b, S) - aa;
    if (b > E) extra += b - Math.max(aa, E);
  });

  const exits = [];
  for (let i = 1; i + 1 < n; i += 2) exits.push({ from: m[i], to: m[i + 1], minutes: m[i + 1] - m[i] });

  const lastExit = pairs.length ? pairs[pairs.length - 1][1] : null;
  return {
    n,
    odd: n % 2 === 1,
    absent: pairs.length === 0,
    worked,
    extra,
    raw,
    exits,
    arrivalDelay: n ? m[0] - S : 0,
    earlyExit: lastExit !== null && lastExit < E ? E - lastExit : 0,
  };
}

// ------------------------------------------------------- incidencias -> grado
function statsFromIncidents(inc, tol) {
  const arrivals = inc.filter((i) => i.type === "arrival");
  const exits = inc.filter((i) => i.type === "exit");
  return {
    late: arrivals.filter((i) => i.minutes > tol).length,
    arrivalsAfterStart: arrivals.length,
    exits: exits.length,
    exitHours: round1(exits.reduce((s, i) => s + i.minutes, 0) / 60),
    exitHoursRaw: exits.reduce((s, i) => s + i.minutes, 0) / 60,
    halfAbs: 0, // pendiente de definir con el cliente (se ignora por ahora)
    fullAbs: inc.filter((i) => i.type === "absence").length,
  };
}

function gradeOf(st, s) {
  const ok = (p) =>
    st.exits <= s[p + "_max_exits"] &&
    st.exitHoursRaw <= s[p + "_max_exit_hours"] + 1e-9 &&
    st.late <= s[p + "_max_late"] &&
    st.halfAbs <= s[p + "_max_half_abs"] &&
    st.fullAbs <= s[p + "_max_full_abs"];
  if (ok("pres") && st.arrivalsAfterStart === 0) return 3;
  if (ok("pres")) return 2;
  if (ok("med")) return 1;
  return 0;
}

/** Busca si quitando UN solo incidente menor el empleado subiría de grado. */
function nearMiss(inc, grade, s) {
  if (grade >= 3) return null;
  let best = null;
  inc.forEach((it, idx) => {
    const minor =
      (it.type === "arrival" && it.minutes <= s.tolerance_min + s.near_miss_min) ||
      (it.type === "exit" && it.minutes <= s.near_miss_min);
    if (!minor) return;
    const rest = inc.filter((_, j) => j !== idx);
    const g = gradeOf(statsFromIncidents(rest, s.tolerance_min), s);
    if (g > grade && (!best || g > best.target)) {
      best = { target: g, dates: [it.date], minutes: it.minutes, type: it.type };
    } else if (best && g === best.target && !best.dates.includes(it.date)) {
      best.dates.push(it.date);
    }
  });
  return best;
}

// --------------------------------------------------------------- el mes
/**
 * @param {object} input
 *  monthKey 'YYYY-MM'; records [{employeeId,name,date,time}]; manual [{employeeId,date,time,note}]
 *  dismissed ['id|date']; ignoredMarks ['id|date|HH:MM']; holidays ['YYYY-MM-DD'] (días no laborales marcados, además de sáb/dom)
 *  employees [{id,name,dni}] (los de la base); justifications [{employee_id,reason_name,start_date,end_date,hours}]
 *  settings (parcial; se completa con los valores por defecto)
 */
function analyzeMonth(input) {
  const s = mergeSettings(input.settings);
  const cfg = { S: timeToMin(s.work_start), E: timeToMin(s.work_end), tol: Number(s.tolerance_min) };
  const dayHours = (cfg.E - cfg.S) / 60;
  const monthKey = input.monthKey;
  const [year, month] = monthKey.split("-").map(Number);
  const calendar = daysOfMonth(monthKey);
  const holidays = new Set((input.holidays || []).filter((d) => d.startsWith(monthKey)));
  const isWeekend = (c) => c.dow === 0 || c.dow === 6;
  const isNonWorking = (c) => isWeekend(c) || holidays.has(c.date);
  const workingDays = calendar.filter((c) => !isNonWorking(c));
  const saturdays = calendar.filter((c) => c.dow === 6).length;
  const holidayWeekdays = calendar.filter((c) => !isWeekend(c) && holidays.has(c.date)).length;
  const dismissed = new Set(input.dismissed || []);
  // marcas que la contadora decidió ignorar ('id|YYYY-MM-DD|HH:MM'; si se repite la clave se ignoran varias)
  const ignoreCount = new Map();
  (input.ignoredMarks || []).forEach((k) => ignoreCount.set(k, (ignoreCount.get(k) || 0) + 1));
  const dbEmployees = new Map((input.employees || []).map((e) => [e.id, e]));

  // --- marcas agrupadas por empleado y día
  const byEmp = new Map();
  const names = new Map();
  const add = (r, manual) => {
    const [hh, mm] = r.time.split(":").map(Number);
    const mark = { m: hh * 60 + mm, time: `${pad(hh)}:${pad(mm)}`, manual: !!manual, note: r.note || null };
    if (!byEmp.has(r.employeeId)) byEmp.set(r.employeeId, new Map());
    const days = byEmp.get(r.employeeId);
    if (!days.has(r.date)) days.set(r.date, []);
    days.get(r.date).push(mark);
    if (r.name && !names.has(r.employeeId)) names.set(r.employeeId, r.name);
  };
  (input.records || []).forEach((r) => add(r, false));
  (input.manual || []).forEach((r) => add(r, true));

  const alerts = [];
  const newEmployees = [...byEmp.keys()].filter((id) => !dbEmployees.has(id));
  newEmployees.forEach((id) => alerts.push({ kind: "newEmployee", employeeId: id, name: names.get(id) || `ID ${id}` }));

  const result = { monthKey, year, month, title: `${s.company_name} - ${MONTHS_ES[month - 1].toUpperCase()} ${year}` , employees: [], alerts, blocked: newEmployees.length > 0, settings: s, holidays: [...holidays].sort() };
  if (newEmployees.length) return result; // se frena hasta dar de alta a los empleados nuevos

  const justAll = input.justifications || [];

  for (const [empId, daysMap] of [...byEmp.entries()].sort((a, b) => a[0] - b[0])) {
    const emp = dbEmployees.get(empId);
    const just = justAll.filter((j) => j.employee_id === empId);
    const justifiedOn = (date) =>
      just.find((j) => date >= j.start_date && date <= (j.end_date || j.start_date));

    const incidents = [];
    const dayRows = [];
    const missing = [];
    const nonWorkingMarks = [];
    let workedMin = 0;
    let extraMin = 0;
    let earlyExits = 0;

    for (const c of calendar) {
      let marks = (daysMap.get(c.date) || []).slice().sort((a, b) => a.m - b.m);
      if (isNonWorking(c)) {
        if (marks.length) nonWorkingMarks.push(c.date);
        continue; // las marcas en días no laborales no se computan
      }
      if (ignoreCount.size) {
        marks = marks.filter((mk) => {
          const k = `${empId}|${c.date}|${mk.time}`;
          const left = ignoreCount.get(k) || 0;
          if (left > 0) {
            ignoreCount.set(k, left - 1);
            return false;
          }
          return true;
        });
      }
      // marcas seguidas: por defecto NO se ignoran (duplicate_min = 0)
      if (s.duplicate_min > 0) {
        const kept = [];
        for (const mk of marks) {
          if (kept.length && mk.m - kept[kept.length - 1].m <= s.duplicate_min) continue;
          kept.push(mk);
        }
        marks = kept;
      }
      const j = justifiedOn(c.date);
      const d = analyzeDay(marks, cfg);
      const key = `${empId}|${c.date}`;
      const reviewed = dismissed.has(key);

      if (d.odd && !reviewed) {
        const last = marks[marks.length - 1].m;
        // si la última marca parece una salida (cerca del fin de jornada) falta una entrada; si no, falta la salida
        const suggestion = last >= cfg.E - 60 ? "entrada" : "salida";
        missing.push({
          date: c.date,
          marks: marks.map((x) => x.time),
          suggestion,
          standardTime: d.n === 1 ? (suggestion === "salida" ? s.work_end : s.work_start) : null,
        });
      }

      workedMin += d.worked;
      extraMin += d.extra;
      if (d.earlyExit && !d.absent) earlyExits++;

      const row = {
        date: c.date,
        label: dayLabel(c.date, c.dow),
        hours: d.n ? round1(d.raw / 60) : null,
        status: d.absent ? "absent" : d.odd ? "missing" : "ok",
        reviewed: d.odd && reviewed,
        marks: marks.map((x, i) => ({ time: x.time, kind: i % 2 === 0 ? "Ingreso" : "Egreso", manual: x.manual })),
        justification: j ? { reason: j.reason_name, hours: j.hours } : null,
      };
      if (j) row.status = "justified";
      dayRows.push(row);

      if (j) continue; // un día justificado no genera incidencias
      if (d.absent) incidents.push({ type: "absence", date: c.date, minutes: cfg.E - cfg.S });
      else {
        if (d.arrivalDelay > 0) incidents.push({ type: "arrival", date: c.date, minutes: d.arrivalDelay });
        d.exits.forEach((x) => incidents.push({ type: "exit", date: c.date, minutes: x.minutes }));
      }
    }

    // --- horas
    const hoursWorked = roundHalf(workedMin / 60);
    const extraHours = roundHalf(extraMin / 60);
    const hs = hoursWorked + (s.extras_in_total ? extraHours : 0);
    const sumBy = (re) =>
      just
        .filter((j) => j.start_date.startsWith(monthKey) && re.test(j.reason_name))
        .reduce((t, j) => t + Number(j.hours || 0), 0);
    const enf = sumBy(/^enfermedad$/i);
    const art = sumBy(/^art$/i);
    const lic = sumBy(/^licencia$/i);
    const otro = just
      .filter((j) => j.start_date.startsWith(monthKey))
      .filter((j) => !/^(enfermedad|art|licencia)$/i.test(j.reason_name))
      .reduce((t, j) => t + Number(j.hours || 0), 0);
    const comp = s.comp_hours_per_saturday * saturdays;
    const fer = holidayWeekdays * dayHours;
    const total = hs + comp + fer + enf + art + lic + otro;

    // --- grado
    const stats = statsFromIncidents(incidents, cfg.tol);
    const grade = gradeOf(stats, s);
    const bonus = grade === 3 ? s.bonus_puntualidad : grade === 2 ? s.bonus_presentismo : grade === 1 ? s.bonus_medio : 0;

    const nm = nearMiss(incidents, grade, s);
    const name = emp.name || names.get(empId);

    if (missing.length) alerts.push({ kind: "missing", employeeId: empId, name, days: missing });
    if (nm)
      alerts.push({
        kind: "near",
        employeeId: empId,
        name,
        target: GRADE_KEYS[nm.target],
        targetLabel: GRADE_LABELS[nm.target],
        dates: nm.dates,
        minutes: nm.minutes,
        incident: nm.type,
      });
    if (nonWorkingMarks.length) alerts.push({ kind: "nonWorkingMarks", employeeId: empId, name, dates: nonWorkingMarks });

    result.employees.push({
      id: empId,
      name,
      dni: emp.dni ?? null,
      grade: GRADE_KEYS[grade],
      gradeLevel: grade,
      gradeLabel: GRADE_LABELS[grade],
      stats: {
        hoursWorked,
        extraHours,
        late: stats.late,
        exits: stats.exits,
        exitHours: stats.exitHours,
        halfAbs: stats.halfAbs,
        fullAbs: stats.fullAbs,
        earlyExits,
      },
      planilla: { id: empId, name, hs, comp, fer, enf, art, lic, otro, total, bonus },
      days: dayRows,
    });
  }

  const order = { newEmployee: 0, missing: 1, near: 2, nonWorkingMarks: 3 };
  alerts.sort((a, b) => order[a.kind] - order[b.kind] || a.employeeId - b.employeeId);
  result.employees.sort((a, b) => b.gradeLevel - a.gradeLevel || a.id - b.id);
  return result;
}

/** Resumen persistible (lo que se guarda en el historial al finalizar). */
function buildSummary(analysis) {
  const s = analysis.settings;
  const rows = analysis.employees.slice().sort((a, b) => a.id - b.id);
  return {
    monthKey: analysis.monthKey,
    year: analysis.year,
    month: analysis.month,
    monthName: MONTHS_ES[analysis.month - 1],
    title: analysis.title,
    generatedAt: new Date().toISOString(),
    holidays: analysis.holidays,
    params: {
      work_start: s.work_start, work_end: s.work_end, tolerance_min: s.tolerance_min,
      comp_hours_per_saturday: s.comp_hours_per_saturday,
      bonus_puntualidad: s.bonus_puntualidad, bonus_presentismo: s.bonus_presentismo, bonus_medio: s.bonus_medio,
    },
    employees: rows,
  };
}

module.exports = { analyzeMonth, analyzeDay, gradeOf, statsFromIncidents, buildSummary, daysOfMonth, MONTHS_ES, DAYS_ES, roundHalf };
