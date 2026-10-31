import Dialog from "./Dialog";
import GradeBadge from "./GradeBadge";
import type { EmployeeResult } from "../../types";
import { dniFmt, hhmm, num, pad2id, dm } from "../../format";

/** Carta de empleado detallada (Figma): resumen del mes + día por día con cada marca. */
export default function EmployeeDetail({ employee: e, onClose }: { employee: EmployeeResult; onClose: () => void }) {
  const s = e.stats;
  return (
    <Dialog width={760} onClose={onClose}>
      <div className="d-flex justify-content-between align-items-start gap-3">
        <div>
          <h3 className="mb-0">
            {pad2id(e.id)} | {e.name}
          </h3>
          <div className="ctz-muted">{e.dni ? `DNI ${dniFmt(e.dni)}` : "Sin DNI cargado"}</div>
        </div>
        <GradeBadge grade={e.grade} className="px-4 py-3" />
      </div>

      <div className="d-flex justify-content-between flex-wrap mt-3 mb-3" style={{ fontSize: ".95rem" }}>
        <div>
          Horas totales trabajadas: {num(s.hoursWorked)}
          <br />
          Horas extra: {num(s.extraHours)}
          <br />
          Llegadas tarde: {s.late}
        </div>
        <div className="text-end">
          Salidas intermedias: {s.exits}
          {s.exits > 0 ? ` (${num(s.exitHours)}hs)` : ""}
          <br />
          Ausencias de media jornada: {s.halfAbs}
          <br />
          Ausencias de jornada completa: {s.fullAbs}
        </div>
      </div>

      <div className="ctz-dialog-body detail-days">
        {e.days.map((d) => (
          <div key={d.date}>
            <div className="detail-day-head">
              {d.label}
              {d.status === "absent" && " | Ausente"}
              {d.status === "justified" && d.justification && ` | Justificado (${d.justification.reason})`}
              {d.status === "missing" && !d.reviewed && " | Falta un registro"}
              {d.status === "missing" && d.reviewed && " | Registro faltante (revisado)"}
              {d.hours !== null && d.status !== "absent" && ` | ${num(d.hours)}hs`}
            </div>
            {d.marks.map((m, i) => (
              <div key={i} className="detail-mark">
                {dm(d.date)} | {hhmm(m.time)} | {m.kind}
                {m.manual && <span className="ctz-muted"> (cargado a mano)</span>}
              </div>
            ))}
          </div>
        ))}
        {e.days.length === 0 && <p className="ctz-muted text-center">Sin registros en el mes.</p>}
      </div>

      <div className="ctz-actions">
        <button className="btn btn-soft px-4" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </Dialog>
  );
}
