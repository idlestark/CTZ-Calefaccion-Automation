// Lectura del CSV exportado por el reloj electrónico.
// Solo sirven: ID de persona, Nombre y Hora. El resto de las columnas se descarta.

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') q = false;
      else cur += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

const norm = (s) =>
  String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

/**
 * @param {Buffer|string} input  contenido del archivo (el reloj exporta en ISO-8859-1)
 */
function parseClockCsv(input) {
  const text = Buffer.isBuffer(input) ? input.toString("latin1") : String(input);
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) throw new Error("El archivo está vacío o no tiene registros.");

  const header = splitCsvLine(lines[0]).map(norm);
  let iId = header.findIndex((h) => h.startsWith("id de persona") || h === "id");
  let iName = header.findIndex((h) => h === "nombre");
  let iTime = header.findIndex((h) => h === "hora");
  if (iId < 0) iId = 0;
  if (iName < 0) iName = 1;
  if (iTime < 0) iTime = 3;

  const rows = [];
  const invalid = [];
  const dtRe = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/;
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const id = Number(String(cols[iId] || "").replace(/[^0-9]/g, ""));
    const name = String(cols[iName] || "").trim();
    const m = dtRe.exec(String(cols[iTime] || "").trim());
    if (!id || !m) {
      invalid.push(i + 1);
      continue;
    }
    rows.push({
      employeeId: id,
      name,
      date: `${m[1]}-${m[2]}-${m[3]}`,
      time: `${m[4]}:${m[5]}:${m[6] || "00"}`,
    });
  }
  if (!rows.length) throw new Error("No se encontró ningún registro válido en el archivo.");

  // Mes dominante (el archivo debería traer un único mes)
  const perMonth = {};
  for (const r of rows) {
    const k = r.date.slice(0, 7);
    perMonth[k] = (perMonth[k] || 0) + 1;
  }
  const monthKey = Object.keys(perMonth).sort((a, b) => perMonth[b] - perMonth[a])[0];
  const records = rows.filter((r) => r.date.startsWith(monthKey));
  const droppedOtherMonths = rows.length - records.length;

  records.sort((a, b) =>
    a.employeeId - b.employeeId || (a.date + a.time).localeCompare(b.date + b.time),
  );

  const names = {};
  for (const r of records) if (!names[r.employeeId]) names[r.employeeId] = r.name;

  return {
    monthKey,
    year: Number(monthKey.slice(0, 4)),
    month: Number(monthKey.slice(5, 7)),
    records,
    employees: Object.entries(names).map(([id, name]) => ({ id: Number(id), name })),
    invalidRows: invalid.length,
    droppedOtherMonths,
  };
}

module.exports = { parseClockCsv, splitCsvLine };
