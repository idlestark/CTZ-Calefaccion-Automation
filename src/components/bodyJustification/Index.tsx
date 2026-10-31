import "./just.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import Dialog from "../ui/Dialog";
import { call } from "../../api";
import type { Employee, Justification, Reason } from "../../types";
import { currentMonthKey, dniFmt, dm, dmy, monthLabel, num, pad2id } from "../../format";

const rangeText = (j: Justification) => (j.end_date && j.end_date !== j.start_date ? `${dm(j.start_date)} - ${dm(j.end_date)}` : dm(j.start_date));

export default function Justifications() {
  const [month, setMonth] = useState(currentMonthKey());
  const [months, setMonths] = useState<string[]>([]);
  const [list, setList] = useState<Justification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [detail, setDetail] = useState<Justification | null>(null);

  const load = useCallback(async () => {
    try {
      setList(await call<Justification[]>("justification:list", { month }));
      setMonths(await call<string[]>("justification:months"));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar.");
    }
  }, [month]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const options = useMemo(() => [...new Set([currentMonthKey(), month, ...months])].sort().reverse(), [months, month]);

  return (
    <div className="just-page">
      <div className="d-flex justify-content-between align-items-end mt-5">
        <div className="ctz-heading-orange mb-0">{monthLabel(month)}</div>
        <select className="form-select" style={{ width: 220 }} value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Mes">
          {options.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="ctz-error mt-3">{error}</p>}
      <div className="d-flex flex-column gap-3 mt-3 just-list">
        {list.length === 0 && !error && <p className="ctz-muted text-center my-5">No hay justificaciones en este mes.</p>}
        {list.map((j) => (
          <button key={j.id} className="ctz-row" onClick={() => setDetail(j)}>
            <span>
              {pad2id(j.employee_id)} | {j.employee_name}
            </span>
            <strong>
              {j.reason_name} ({rangeText(j)})
            </strong>
          </button>
        ))}
      </div>

      <div className="just-new">
        <button className="btn button-orange px-4 py-2 fs-5" style={{ height: "auto" }} onClick={() => setShowNew(true)}>
          Nueva justificación
        </button>
      </div>

      {showNew && (
        <NewDialog
          onClose={() => setShowNew(false)}
          onSaved={(startMonth) => {
            setShowNew(false);
            if (startMonth !== month) setMonth(startMonth);
            else load();
          }}
        />
      )}
      {detail && <DetailDialog j={detail} onClose={() => setDetail(null)} onDeleted={() => { setDetail(null); load(); }} />}
    </div>
  );
}

function NewDialog({ onClose, onSaved }: { onClose: () => void; onSaved: (month: string) => void }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [f, setF] = useState({ employee_id: "", reason_id: "", start_date: "", end_date: "", hours: "", description: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    call<Employee[]>("employee:getAll").then(setEmployees);
    call<Reason[]>("reason:getAll").then(setReasons);
  }, []);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const valid = f.employee_id && f.reason_id && f.start_date && f.hours !== "" && Number(f.hours) >= 0 && (!f.end_date || f.end_date >= f.start_date);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await call("justification:create", { ...f, employee_id: Number(f.employee_id), reason_id: Number(f.reason_id), hours: Number(f.hours), end_date: f.end_date || null });
      onSaved(f.start_date.slice(0, 7));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setBusy(false);
    }
  };

  return (
    <Dialog width={560} onClose={onClose}>
      <h3>Nueva justificación</h3>
      <div className="ctz-dialog-body">
        <label className="form-label">Empleado</label>
        <select className="form-select mb-2" value={f.employee_id} onChange={set("employee_id")}>
          <option value="">Seleccionar</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {pad2id(e.id)} | {e.name}
            </option>
          ))}
        </select>
        <label className="form-label">Motivo</label>
        <select className="form-select mb-2" value={f.reason_id} onChange={set("reason_id")}>
          <option value="">Seleccionar</option>
          {reasons.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <div className="row g-2 mb-2">
          <div className="col-6">
            <label className="form-label">Desde</label>
            <input type="date" className="form-control" value={f.start_date} onChange={set("start_date")} />
          </div>
          <div className="col-6">
            <label className="form-label">Hasta (opcional)</label>
            <input type="date" className="form-control" value={f.end_date} min={f.start_date} onChange={set("end_date")} />
          </div>
        </div>

        <label className="form-label">Horas cubiertas</label>
        <input type="number" min="0" step="0.5" className="form-control mb-2" value={f.hours} onChange={set("hours")} />

        <label className="form-label">Nota al pie</label>
        <input className="form-control" maxLength={255} value={f.description} onChange={set("description")} />
        {error && <p className="ctz-error mt-2 mb-0">{error}</p>}
      </div>
      <div className="ctz-actions">
        <button className="btn button-orange px-4" onClick={save} disabled={!valid || busy}>
          Guardar
        </button>
        <button className="btn btn-soft px-4" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </Dialog>
  );
}

function DetailDialog({ j, onClose, onDeleted }: { j: Justification; onClose: () => void; onDeleted: () => void }) {
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const range = j.end_date && j.end_date !== j.start_date ? `Del ${dmy(j.start_date)} al ${dmy(j.end_date)}` : dmy(j.start_date);

  return (
    <Dialog width={560} onClose={onClose}>
      <div className="d-flex justify-content-between align-items-start gap-3">
        <div>
          <h3 className="mb-0">
            {pad2id(j.employee_id)} | {j.employee_name}
          </h3>
          <div className="ctz-muted">DNI {dniFmt(j.employee_dni)}</div>
        </div>
        <div className="grade-badge px-4 py-3" style={{ background: "#555", color: "#eee" }}>
          {j.reason_name}
        </div>
      </div>
      <div className="mt-3">
        <div className="mb-2">Nota al pie</div>
        <div className="ctz-muted mb-3" style={{ minHeight: 24 }}>
          {j.description || "—"}
        </div>
        <div className="text-center">
          {range} - {num(j.hours)} {j.hours === 1 ? "hora" : "horas"}
        </div>
      </div>
      {error && <p className="ctz-error mt-2 mb-0">{error}</p>}
      <div className="ctz-actions">
        {!confirm ? (
          <button className="btn button-transluce px-4" onClick={() => setConfirm(true)}>
            Eliminar
          </button>
        ) : (
          <button
            className="btn btn-danger px-4"
            onClick={async () => {
              try {
                await call("justification:delete", { id: j.id });
                onDeleted();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Error");
              }
            }}
          >
            Confirmar eliminación
          </button>
        )}
        <button className="btn btn-soft px-4" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </Dialog>
  );
}
