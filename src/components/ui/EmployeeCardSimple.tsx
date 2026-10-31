import GradeBadge from "./GradeBadge";
import type { EmployeeResult } from "../../types";
import { dniFmt, num, pad2id } from "../../format";

/** Carta de empleado simple (Figma). */
export default function EmployeeCardSimple({ employee: e, onDetails }: { employee: EmployeeResult; onDetails: () => void }) {
  const s = e.stats;
  return (
    <div className="col">
      <div className="card border-0 rounded-4 h-100">
        <div className="card-body d-flex flex-column rounded-4" style={{ gap: 14 }}>
          <div className="d-flex justify-content-between align-items-baseline gap-2 text-start">
            <span className="fs-5">
              {pad2id(e.id)} | {e.name}
            </span>
            <span className="ctz-muted">{dniFmt(e.dni)}</span>
          </div>
          <GradeBadge grade={e.grade} />
          <div className="d-flex justify-content-between text-start flex-wrap" style={{ fontSize: ".8rem" }}>
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
          <div className="mt-auto">
            <button className="btn btn-soft" onClick={onDetails}>
              Ver detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
