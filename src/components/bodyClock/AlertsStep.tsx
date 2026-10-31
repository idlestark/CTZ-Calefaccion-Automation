import { useEffect, useState } from "react";
import Dialog from "../ui/Dialog";
import IndexForm from "../bodyEmployee/IndexForm";
import { call } from "../../api";
import type { Alert, Analysis, ManualMark, MissingDay, Reason } from "../../types";
import { dm, hhmm, pad2id } from "../../format";

export type Patch = { manual?: ManualMark[]; dismissed?: string[]; ignored?: string[] };

type Props = {
  analysis: Analysis;
  manual: ManualMark[];
  dismissed: string[];
  ignored: string[];
  busy: boolean;
  error: string | null;
  onApply: (p: Patch) => void; // agrega a lo ya cargado y recalcula
  onRefresh: () => void; // recalcula (después de altas o justificaciones)
  onBack: () => void;
  onNext: () => void;
};

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const listDates = (dates: string[]) => (dates.length <= 3 ? dates.map(dm).join(", ") : `${dates.slice(0, 2).map(dm).join(", ")} y ${dates.length - 2} más`);

function rowOf(a: Alert) {
  switch (a.kind) {
    case "newEmployee":
      return { cls: "red", tag: "Empleado nuevo" };
    case "missing":
      return { cls: "red", tag: `Registro faltante (${listDates(a.days.map((d) => d.date))})` };
    case "near":
      return { cls: "yellow", tag: `Verificar ${a.targetLabel.toLowerCase()}` };
    case "nonWorkingMarks":
      return { cls: "yellow", tag: `Marcas en día no laboral (${listDates(a.dates)})` };
  }
}

export default function AlertsStep({ analysis, manual, dismissed, ignored, busy, error, onApply, onRefresh, onBack, onNext }: Props) {
  const [open, setOpen] = useState<{ kind: Alert["kind"]; id: number } | null>(null);
  const alerts = analysis.alerts;
  const newOnes = alerts.filter((a) => a.kind === "newEmployee") as Extract<Alert, { kind: "newEmployee" }>[];
  const hasMissing = alerts.some((a) => a.kind === "missing");
  const current = open ? alerts.find((a) => a.kind === open.kind && a.employeeId === open.id) : undefined;

  // si la alerta abierta ya no existe (se resolvió), simplemente deja de mostrarse
  const canContinue = !analysis.blocked && !hasMissing;

  return (
    <>
      <p className="wiz-text">Revisá las alertas o datos faltantes</p>
      <div className="ctz-heading-orange">{new Date(Date.UTC(analysis.year, analysis.month - 1, 1)).toLocaleDateString("es-AR", { month: "long", year: "numeric", timeZone: "UTC" }).replace(/^./, (c) => c.toUpperCase())}</div>

      {newOnes.length > 1 && (
        <div className="mb-3">
          <button
            className="btn button-orange px-3"
            disabled={busy}
            onClick={async () => {
              for (const n of newOnes) await call("employee:quickAdd", { id: n.employeeId, name: n.name });
              onRefresh();
            }}
          >
            Agregar los {newOnes.length} empleados nuevos
          </button>
          <span className="ctz-muted ms-3">Se cargan con el nombre del reloj; el DNI se puede completar después en Empleados.</span>
        </div>
      )}

      <div className="alert-list">
        {alerts.length === 0 && <p className="ctz-muted text-center my-5 fs-5">No hay alertas. Todo en orden.</p>}
        {alerts.map((a) => {
          const r = rowOf(a);
          return (
            <button key={`${a.kind}-${a.employeeId}`} className={`ctz-row ${r.cls}`} onClick={() => setOpen({ kind: a.kind, id: a.employeeId })}>
              <span>
                {pad2id(a.employeeId)} | {a.name}
              </span>
              <span className="tag">{r.tag}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="ctz-error text-center mt-3">{error}</p>}
      {!canContinue && (
        <p className="ctz-muted text-center mt-4 mb-0">
          {analysis.blocked ? "Dá de alta a los empleados nuevos para poder continuar." : "Resolvé o dá por revisados los registros faltantes para poder continuar."}
        </p>
      )}
      <div className="wiz-actions">
        <button className="btn button-transluce" onClick={onBack}>
          &lt; Volver
        </button>
        <button className="btn button-orange" onClick={onNext} disabled={!canContinue || busy}>
          Continuar &gt;
        </button>
      </div>

      {current?.kind === "newEmployee" && (
        <Dialog width={440} onClose={() => setOpen(null)}>
          <IndexForm
            initial={{ id: current.employeeId, name: current.name }}
            onClose={() => setOpen(null)}
            onCreate={async (d) => {
              try {
                await call("employee:quickAdd", d);
                setOpen(null);
                onRefresh();
                return null;
              } catch (e) {
                return e instanceof Error ? e.message : "Error";
              }
            }}
          />
        </Dialog>
      )}

      {current?.kind === "missing" && (
        <MissingDialog
          alert={current}
          manual={manual}
          dismissed={dismissed}
          ignored={ignored}
          onApply={onApply}
          onClose={() => setOpen(null)}
        />
      )}

      {current?.kind === "near" && <NearDialog alert={current} onDone={() => { setOpen(null); onRefresh(); }} onClose={() => setOpen(null)} />}

      {current?.kind === "nonWorkingMarks" && (
        <Dialog width={460} onClose={() => setOpen(null)}>
          <h3>
            {pad2id(current.employeeId)} | {current.name}
          </h3>
          <p>
            Hay marcas del reloj en días no laborales ({current.dates.map(dm).join(", ")}). Esas marcas <strong>no se tienen en cuenta</strong> para las horas ni el presentismo. Si ese día sí se trabajó, volvé al paso anterior y quitá la marca de no laboral.
          </p>
          <div className="ctz-actions">
            <button className="btn btn-soft px-4" onClick={() => setOpen(null)}>
              Entendido
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}

// ---------------------------------------------------------------- registro faltante
function MissingDialog({
  alert, manual, dismissed, ignored, onApply, onClose,
}: {
  alert: Extract<Alert, { kind: "missing" }>;
  manual: ManualMark[]; dismissed: string[]; ignored: string[];
  onApply: (p: Patch) => void; onClose: () => void;
}) {
  const id = alert.employeeId;
  const [times, setTimes] = useState<Record<string, string>>({});
  const key = (d: MissingDay) => `${id}|${d.date}`;

  const addMark = (d: MissingDay, time: string, note?: string) => {
    if (!time) return;
    onApply({ manual: [...manual, { employeeId: id, date: d.date, time, note }] });
  };
  const ignoreMark = (d: MissingDay, t: string) => onApply({ ignored: [...ignored, `${id}|${d.date}|${t}`] });
  const dismissDay = (d: MissingDay) => onApply({ dismissed: [...dismissed, key(d)] });

  // marcas repetidas (misma hora o con 1 minuto de diferencia): se ignora la repetida
  const repeated = alert.days.flatMap((d) => d.marks.filter((t, i) => i > 0 && toMin(t) - toMin(d.marks[i - 1]) <= 1).map((t) => ({ d, t })));
  const standard = alert.days.filter((d) => d.standardTime);

  return (
    <Dialog width={680} onClose={onClose}>
      <h3>
        {pad2id(id)} | {alert.name}
      </h3>
      <p className="ctz-muted mb-2">
        El reloj no distingue entradas de salidas: se toman en orden (1.ª entrada, 2.ª salida…). Estos días tienen una cantidad impar de marcas. Podés agregar la marca que falta, ignorar una marca de más, o dar el día por revisado (se calcula solo con los pares completos).
      </p>

      <div className="d-flex flex-wrap gap-2 mb-2">
        {repeated.length > 0 && (
          <button className="btn btn-soft btn-sm" onClick={() => onApply({ ignored: [...ignored, ...repeated.map((r) => `${id}|${r.d.date}|${r.t}`)] })}>
            Ignorar marcas repetidas ({repeated.length})
          </button>
        )}
        {standard.length > 0 && (
          <button
            className="btn btn-soft btn-sm"
            onClick={() => onApply({ manual: [...manual, ...standard.map((d) => ({ employeeId: id, date: d.date, time: d.standardTime!, note: "Completado con el horario estándar" }))] })}
          >
            Completar con horario estándar ({standard.length})
          </button>
        )}
        {alert.days.length > 1 && (
          <button className="btn btn-soft btn-sm" onClick={() => onApply({ dismissed: [...dismissed, ...alert.days.map(key)] })}>
            Dar todos por revisados
          </button>
        )}
      </div>

      <div className="ctz-dialog-body">
        {alert.days.map((d) => (
          <div key={d.date} className="fix-day">
            <div className="d-flex justify-content-between flex-wrap gap-2 align-items-center">
              <strong>{dm(d.date)}</strong>
              <span className="ctz-muted small">Parece faltar una {d.suggestion}</span>
            </div>
            <div className="my-2">
              {d.marks.map((t, i) => (
                <span key={`${t}-${i}`} className="time-chip">
                  {hhmm(t)} <span className="ctz-muted small">{i % 2 === 0 ? "Ingreso" : "Egreso"}</span>
                  <button title="Ignorar esta marca" onClick={() => ignoreMark(d, t)}>
                    <i className="bi bi-x-lg"></i>
                  </button>
                </span>
              ))}
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <input type="time" className="form-control" style={{ width: 130 }} value={times[d.date] ?? ""} onChange={(e) => setTimes((p) => ({ ...p, [d.date]: e.target.value }))} />
              <button className="btn button-orange btn-sm" style={{ height: 38 }} disabled={!times[d.date]} onClick={() => addMark(d, times[d.date], "Cargado a mano en la revisión")}>
                Agregar marca
              </button>
              <button className="btn button-transluce btn-sm" onClick={() => dismissDay(d)}>
                Dar por revisado
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="ctz-actions">
        <button className="btn btn-soft px-4" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </Dialog>
  );
}

// ---------------------------------------------------------------- casi llega al grado
function NearDialog({ alert, onDone, onClose }: { alert: Extract<Alert, { kind: "near" }>; onDone: () => void; onClose: () => void }) {
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [reasonId, setReasonId] = useState<number>(0);
  const [date, setDate] = useState(alert.dates[0]);
  const [note, setNote] = useState("");
  const [hours, setHours] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    call<Reason[]>("reason:getAll").then((r) => {
      setReasons(r);
      setReasonId(r.find((x) => x.name === "Otro")?.id ?? r[0]?.id ?? 0);
    });
  }, []);

  const what = alert.incident === "arrival" ? `la llegada del ${dm(date)} (${alert.minutes} min después de las 7:00)` : `la salida intermedia del ${dm(date)} (${alert.minutes} min)`;

  const justify = async () => {
    setBusy(true);
    setError(null);
    try {
      await call("justification:create", { employee_id: alert.employeeId, reason_id: reasonId, description: note || "Justificada durante la revisión del reloj", start_date: date, end_date: date, hours: Number(hours) || 0 });
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
      setBusy(false);
    }
  };

  return (
    <Dialog width={520} onClose={onClose}>
      <h3>
        {pad2id(alert.employeeId)} | {alert.name}
      </h3>
      <p>
        Este empleado está muy cerca de <strong>{alert.targetLabel.toLowerCase()}</strong>: si se justifica {what}, pasaría a ese grado.
      </p>
      <p className="ctz-muted small">Si querés perdonarlo, cargá una justificación para ese día (queda registrada en Justificaciones). Si no, cerrá esta ventana y se mantiene el grado calculado.</p>
      {alert.dates.length > 1 && (
        <div className="mb-2">
          <label className="form-label">Día a justificar</label>
          <select className="form-select" value={date} onChange={(e) => setDate(e.target.value)}>
            {alert.dates.map((d) => (
              <option key={d} value={d}>
                {dm(d)}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="row g-2">
        <div className="col-7">
          <label className="form-label">Motivo</label>
          <select className="form-select" value={reasonId} onChange={(e) => setReasonId(Number(e.target.value))}>
            {reasons.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-5">
          <label className="form-label">Horas a sumar</label>
          <input type="number" min="0" step="0.5" className="form-control" value={hours} onChange={(e) => setHours(e.target.value)} />
        </div>
      </div>
      <label className="form-label mt-2">Nota al pie</label>
      <input className="form-control" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej.: se le pinchó la rueda de la bicicleta" maxLength={255} />
      {error && <p className="ctz-error mt-2 mb-0">{error}</p>}
      <div className="ctz-actions">
        <button className="btn button-orange" onClick={justify} disabled={busy || !reasonId}>
          Justificar y recalcular
        </button>
        <button className="btn btn-soft" onClick={onClose}>
          Dejar como está
        </button>
      </div>
    </Dialog>
  );
}
