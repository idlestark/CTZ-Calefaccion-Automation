// Planilla mensual (HTML). El mismo HTML se usa para la vista previa y para generar el PDF.

function fmtNum(n, dec, blankZero) {
  n = Number(n) || 0;
  if (blankZero && n === 0) return "";
  const [i, d] = Math.abs(n).toFixed(dec).split(".");
  const withDots = i.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (n < 0 ? "-" : "") + withDots + (d ? "," + d : "");
}
const fmtHours = (n, blankZero) => {
  n = Number(n) || 0;
  if (blankZero && n === 0) return "";
  return Number.isInteger(n) ? String(n) : fmtNum(n, 1);
};
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function buildPlanillaHtml(summary) {
  const rows = summary.employees
    .slice()
    .sort((a, b) => a.id - b.id)
    .map((e, i) => {
      const p = e.planilla;
      return `<tr>
  <td class="c">${i + 1}</td>
  <td class="c">${p.id}</td>
  <td class="n">${esc(p.name.toUpperCase())}</td>
  <td class="r">${fmtHours(p.hs)}</td>
  <td class="c">${fmtHours(p.comp)}</td>
  <td class="c">${fmtHours(p.fer, true)}</td>
  <td class="r">${p.enf ? fmtNum(p.enf, 1) : ""}</td>
  <td class="r">${fmtHours(p.art, true)}</td>
  <td class="r">${fmtHours(p.lic, true)}</td>
  <td class="r">${fmtHours(p.otro, true)}</td>
  <td class="r">${fmtNum(p.total, 2)}</td>
  <td class="r">${fmtNum(p.bonus, 2)}</td>
  <td class="r"></td>
</tr>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>${esc(summary.title)}</title>
<style>
  @page { size: A4 portrait; margin: 10mm 8mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #000; margin: 0; background: #fff; }
  h1 { font-size: 15px; text-align: center; text-decoration: underline; margin: 0 0 6px; letter-spacing: .3px; }
  table { border-collapse: collapse; width: 100%; font-size: 9.5px; }
  th, td { border: 1px solid #000; padding: 1.5px 4px; height: 15px; white-space: nowrap; }
  th { font-weight: 700; font-size: 8.5px; text-align: center; }
  td.c { text-align: center; } td.r { text-align: right; } td.n { text-align: left; width: 100%; }
  thead { display: table-header-group; } tr { page-break-inside: avoid; }
</style></head>
<body>
<h1>${esc(summary.title)}</h1>
<table>
<thead><tr>
  <th style="width:22px"></th><th style="width:30px"></th><th>NOMBRE Y APELLIDO</th>
  <th>Hs</th><th>Comp</th><th>Hs.Fer.</th><th>Enf</th><th>ART</th><th>Lic</th><th>Otro</th><th>Total</th><th>Present</th><th>Desc.</th>
</tr></thead>
<tbody>
${rows}
</tbody></table>
</body></html>`;
}

module.exports = { buildPlanillaHtml, fmtNum, fmtHours };
