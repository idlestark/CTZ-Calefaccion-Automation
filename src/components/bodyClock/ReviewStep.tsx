import { useMemo, useState } from "react";
import EmployeeCardSimple from "../ui/EmployeeCardSimple";
import EmployeeDetail from "../ui/EmployeeDetail";
import type { Analysis, EmployeeResult } from "../../types";

type Props = { analysis: Analysis; busy: boolean; error: string | null; onBack: () => void; onFinish: () => void };

export default function ReviewStep({ analysis, busy, error, onBack, onFinish }: Props) {
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<EmployeeResult | null>(null);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return analysis.employees;
    return analysis.employees.filter((e) => e.name.toLowerCase().includes(t) || String(e.id) === t);
  }, [analysis.employees, q]);

  return (
    <>
      <p className="wiz-text">Último vistazo</p>
      <div className="d-flex justify-content-between align-items-center mb-3 gap-3">
        <span className="ctz-muted">
          Ordenar por: <strong style={{ color: "var(--c-fg)" }}>grado de presentismo</strong>
        </span>
        <input className="form-control searchBar" style={{ maxWidth: 420 }} placeholder="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="row row-cols-1 row-cols-lg-2 row-cols-xl-3 g-3">
        {list.map((e) => (
          <EmployeeCardSimple key={e.id} employee={e} onDetails={() => setDetail(e)} />
        ))}
      </div>
      {list.length === 0 && <p className="ctz-muted text-center mt-4">No hay empleados que coincidan.</p>}
      {error && <p className="ctz-error text-center mt-3">{error}</p>}
      <div className="wiz-actions">
        <button className="btn button-transluce" onClick={onBack}>
          &lt; Volver
        </button>
        <button className="btn button-orange" onClick={onFinish} disabled={busy}>
          {busy ? "Guardando…" : "Finalizar >"}
        </button>
      </div>
      {detail && <EmployeeDetail employee={detail} onClose={() => setDetail(null)} />}
    </>
  );
}
