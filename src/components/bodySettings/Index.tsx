import { useEffect, useState } from "react";
import Dialog from "../ui/Dialog";
import ConnectionSettings from "../ui/ConnectionSettings";
import { call, local } from "../../api";
import { useAuth } from "../../auth";
import { FONT_SIZES, getFontPx, getTheme, setFontPx, setTheme } from "../../appearance";
import type { Theme } from "../../appearance";
import type { LocalInfo, Settings } from "../../types";

type Tab = "apariencia" | "parametros" | "db" | "conexion";

export default function SettingsPage() {
  const { user } = useAuth();
  const admin = user?.role === "admin";
  const [tab, setTab] = useState<Tab>("apariencia");
  const tabs: { key: Tab; label: string; admin?: boolean }[] = [
    { key: "apariencia", label: "Apariencia" },
    { key: "parametros", label: "Parámetros", admin: true },
    { key: "db", label: "Base de datos", admin: true },
    { key: "conexion", label: "Conexión", admin: true },
  ];

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <h1 className="ctz-title">Ajustes</h1>
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {tabs
          .filter((t) => !t.admin || admin)
          .map((t) => (
            <button key={t.key} className={`btn ${tab === t.key ? "button-orange" : "button-transluce"}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
      </div>
      {tab === "apariencia" && <Appearance />}
      {admin && tab === "parametros" && <Parameters />}
      {admin && tab === "db" && <Database />}
      {admin && tab === "conexion" && <ConnectionSettings />}
    </div>
  );
}

// ------------------------------------------------------------------ apariencia
function Appearance() {
  const [theme, setT] = useState<Theme>(getTheme());
  const [px, setPx] = useState(getFontPx());
  return (
    <div className="card border-0 rounded-4">
      <div className="card-body p-4 text-start">
        <h5 className="mb-3" style={{ color: "var(--c-fg) !important" }}>Modo</h5>
        <div className="d-flex gap-2 mb-4">
          {(["dark", "light"] as Theme[]).map((t) => (
            <button
              key={t}
              className={`btn ${theme === t ? "button-orange" : "button-transluce"}`}
              onClick={() => {
                setTheme(t);
                setT(t);
              }}
            >
              {t === "dark" ? "Oscuro" : "Claro"}
            </button>
          ))}
        </div>
        <h5 className="mb-3" style={{ color: "var(--c-fg) !important" }}>Tamaño de fuente</h5>
        <div className="d-flex gap-2 flex-wrap">
          {FONT_SIZES.map((f) => (
            <button
              key={f.px}
              className={`btn ${px === f.px ? "button-orange" : "button-transluce"}`}
              onClick={() => {
                setFontPx(f.px);
                setPx(f.px);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ parámetros
type FieldDef = { key: string; label: string; type?: "time" | "number" | "text" | "bool"; step?: string; hint?: string };

const GROUPS: { title: string; fields: FieldDef[] }[] = [
  {
    title: "Jornada laboral",
    fields: [
      { key: "work_start", label: "Inicio de jornada", type: "time" },
      { key: "work_end", label: "Fin de jornada", type: "time" },
      { key: "tolerance_min", label: "Tolerancia de llegada tarde (en minutos)" },
      { key: "comp_hours_per_saturday", label: "Horas complementarias por sábado", step: "0.5" },
    ],
  },
  {
    title: "Bonos por presentismo",
    fields: [
      { key: "bonus_puntualidad", label: "Puntualidad" },
      { key: "bonus_presentismo", label: "Presentismo" },
      { key: "bonus_medio", label: "Medio presentismo" },
    ],
  },
  {
    title: "Requisitos para presetismo y puntualidad",
    fields: [
      { key: "pres_max_exits", label: "Salidas intermedias" },
      { key: "pres_max_exit_hours", label: "Horas totales de salidas intermedias", step: "0.5" },
      { key: "pres_max_late", label: "Llegadas tarde" },
      { key: "pres_max_half_abs", label: "Ausencias de media jornada" },
      { key: "pres_max_full_abs", label: "Ausencias de jornada completa" },
    ],
  },
  {
    title: "Requisitos para medio presentismo",
    fields: [
      { key: "med_max_exits", label: "Salidas intermedias" },
      { key: "med_max_exit_hours", label: "Horas totales de salidas intermedias", step: "0.5" },
      { key: "med_max_late", label: "Llegadas tarde" },
      { key: "med_max_half_abs", label: "Ausencias de media jornada" },
      { key: "med_max_full_abs", label: "Ausencias de jornada completa" },
    ],
  },
  {
    title: "Alertas y otras opciones",
    fields: [
      { key: "near_miss_min", label: "Margen de alerta cercana al presentismo (en minutos)", hint: "La cantidad de minutos excedidos para 'perdonar' un grado de presentismo." },
      { key: "duplicate_min", label: "Margen de tiempo para ignorar registros (en minutos)", hint: "Ignora cuando se tiene un registro del reloj seguido de otro en un margen de X minutos. Si se deja en 0, no se ignora ninguno." },
      { key: "extras_in_total", label: "Sumar las horas extra a las horas trabajadas de la planilla", type: "bool" },
      { key: "company_name", label: "Nombre en el título de la planilla", type: "text" },
    ],
  },
];

function Parameters() {
  const [orig, setOrig] = useState<Settings | null>(null);
  const [vals, setVals] = useState<Settings>({});
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [askPin, setAskPin] = useState(false);
  const [changePin, setChangePin] = useState(false);

  const load = () =>
    call<Settings>("settings:get")
      .then((s) => {
        setOrig(s);
        setVals(s);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  useEffect(() => {
    load();
  }, []);

  if (!orig) return error ? <p className="ctz-error">{error}</p> : <p className="ctz-muted">Cargando…</p>;

  const dirty = JSON.stringify(orig) !== JSON.stringify(vals);
  const set = (k: string, v: string | number | boolean) => {
    setOk(false);
    setVals((p) => ({ ...p, [k]: v }));
  };

  return (
    <div>
      <p className="ctz-muted">
        Para guardar los cambios se requiere ingresar el PIN de seguridad.
      </p>
      {GROUPS.map((g) => (
        <div key={g.title} className="card border-0 rounded-4 mb-3">
          <div className="card-body p-4 text-start">
            <h5 className="mb-3" style={{ color: "var(--c-fg) !important" }}>{g.title}</h5>
            <div className="row g-3">
              {g.fields.map((f) => (
                <div key={f.key} className={f.type === "bool" ? "col-12" : "col-md-6"}>
                  {f.type === "bool" ? (
                    <label className="d-flex align-items-center gap-2">
                      <input type="checkbox" className="form-check-input m-0" checked={!!vals[f.key]} onChange={(e) => set(f.key, e.target.checked)} />
                      {f.label}
                    </label>
                  ) : (
                    <>
                      <label className="form-label">{f.label}</label>
                      <input
                        className="form-control"
                        type={f.type === "time" ? "time" : f.type === "text" ? "text" : "number"}
                        min={f.type === "number" || !f.type ? 0 : undefined}
                        step={f.step}
                        value={String(vals[f.key] ?? "")}
                        onChange={(e) => set(f.key, f.type === "time" || f.type === "text" ? e.target.value : e.target.value === "" ? "" : Number(e.target.value))}
                      />
                      {f.hint && <div className="ctz-muted small mt-1">{f.hint}</div>}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      {error && <p className="ctz-error">{error}</p>}
      {ok && <p style={{ color: "#7bd957" }}>Cambios guardados.</p>}
      <div className="d-flex gap-2 mb-5 flex-wrap">
        <button className="btn button-orange px-4" disabled={!dirty} onClick={() => setAskPin(true)}>
          Guardar
        </button>
        <button className="btn button-transluce" disabled={!dirty} onClick={() => setVals(orig)}>
          Descartar cambios
        </button>
        <button className="btn button-transluce ms-auto" onClick={() => setChangePin(true)}>
          Cambiar PIN de seguridad
        </button>
      </div>

      {askPin && (
        <PinDialog
          title="Confirmar con PIN"
          onClose={() => setAskPin(false)}
          onConfirm={async (pin) => {
            await call("settings:save", { values: vals, pin });
            setAskPin(false);
            setOk(true);
            setError(null);
            await load();
          }}
        />
      )}
      {changePin && <ChangePinDialog onClose={() => setChangePin(false)} />}
    </div>
  );
}

function PinDialog({ title, onConfirm, onClose, extra }: { title: string; onConfirm: (pin: string) => Promise<void>; onClose: () => void; extra?: string }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onConfirm(pin);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setBusy(false);
    }
  };
  return (
    <Dialog width={400} onClose={onClose}>
      <form onSubmit={go}>
        <h3>{title}</h3>
        {extra && <p>{extra}</p>}
        <label className="form-label">PIN de seguridad</label>
        <input type="password" inputMode="numeric" className="form-control" autoFocus value={pin} onChange={(e) => setPin(e.target.value)} />
        {error && <p className="ctz-error mt-2 mb-0">{error}</p>}
        <div className="ctz-actions">
          <button type="submit" className="btn button-orange px-4" disabled={!pin || busy}>
            Confirmar
          </button>
          <button type="button" className="btn btn-soft px-4" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function ChangePinDialog({ onClose }: { onClose: () => void }) {
  const [cur, setCur] = useState("");
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const valid = cur && /^\d{4,10}$/.test(n1) && n1 === n2;
  return (
    <Dialog width={420} onClose={onClose}>
      <h3>Cambiar PIN</h3>
      {done ? (
        <p>El PIN se cambió correctamente.</p>
      ) : (
        <>
          <label className="form-label">PIN actual</label>
          <input type="password" inputMode="numeric" className="form-control mb-2" value={cur} onChange={(e) => setCur(e.target.value)} />
          <label className="form-label">PIN nuevo (4 a 10 números)</label>
          <input type="password" inputMode="numeric" className="form-control mb-2" value={n1} onChange={(e) => setN1(e.target.value)} />
          <label className="form-label">Repetir PIN nuevo</label>
          <input type="password" inputMode="numeric" className="form-control" value={n2} onChange={(e) => setN2(e.target.value)} />
          {error && <p className="ctz-error mt-2 mb-0">{error}</p>}
        </>
      )}
      <div className="ctz-actions">
        {!done && (
          <button
            className="btn button-orange px-4"
            disabled={!valid}
            onClick={async () => {
              try {
                await call("settings:changePin", { pin: cur, newPin: n1 });
                setDone(true);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Error");
              }
            }}
          >
            Cambiar
          </button>
        )}
        <button className="btn btn-soft px-4" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </Dialog>
  );
}

// ------------------------------------------------------------------ base de datos
function Database() {
  const [info, setInfo] = useState<LocalInfo | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clear, setClear] = useState(false);
  const [confirmImport, setConfirmImport] = useState(false);

  useEffect(() => {
    local().info().then(setInfo);
    call<Settings>("settings:get").then((s) => setEnabled(!!s.backup_enabled));
  }, []);

  const wrap = async (fn: () => Promise<void>) => {
    setMsg(null);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  };
  const isHost = info?.mode === "host";

  return (
    <div className="card border-0 rounded-4">
      <div className="card-body p-4 text-start">
        <h5 style={{ color: "var(--c-fg) !important" }}>Copias de seguridad</h5>
        <label className="d-flex align-items-center gap-2 mb-2">
          <input
            type="checkbox"
            className="form-check-input m-0"
            checked={enabled}
            onChange={(e) =>
              wrap(async () => {
                await call("settings:setBackup", { enabled: e.target.checked });
                setEnabled(e.target.checked);
              })
            }
          />
          Guardar una copia de seguridad automáticamente al finalizar un procesamiento del reloj
        </label>
        <p className="ctz-muted small">
          La copia se guarda en la PC principal{info ? ` (${info.backupsDir})` : ""}.
        </p>
        <div className="d-flex flex-wrap gap-2 mb-3">
          <button
            className="btn button-orange"
            onClick={() =>
              wrap(async () => {
                const r = await call<{ path: string }>("db:backupNow");
                setMsg(`Copia creada en la PC principal: ${r.path}`);
              })
            }
          >
            Crear copia ahora
          </button>
          {isHost && (
            <button className="btn button-transluce" onClick={() => info && local().openPath(info.backupsDir)}>
              Abrir carpeta de copias
            </button>
          )}
          {isHost && (
            <button className="btn button-transluce" onClick={() => setConfirmImport(true)}>
              Importar copia
            </button>
          )}
        </div>
        {info && !isHost && <p className="ctz-muted small">Importar una copia solo se puede hacer desde la PC principal.</p>}

        <hr style={{ borderColor: "var(--c-card-border)" }} />
        <h5 style={{ color: "var(--c-fg) !important" }}>Limpiar registros</h5>
        <p className="ctz-muted small">Borra todos los registros del reloj, las justificaciones y el historial de cada mes. Los empleados y los ajustes se conservan.</p>
        <button className="btn btn-danger" onClick={() => setClear(true)}>
          Limpiar todos los registros
        </button>

        {msg && <p className="mt-3 mb-0" style={{ color: "#7bd957", wordBreak: "break-all" }}>{msg}</p>}
        {error && <p className="ctz-error mt-3 mb-0">{error}</p>}
      </div>

      {clear && (
        <PinDialog
          title="Limpiar todos los registros"
          extra="Esta acción no se puede deshacer. Te recomendamos crear una copia antes."
          onClose={() => setClear(false)}
          onConfirm={async (pin) => {
            await call("db:clear", { pin });
            setClear(false);
            setMsg("Registros eliminados.");
          }}
        />
      )}

      {confirmImport && (
        <Dialog width={460} onClose={() => setConfirmImport(false)}>
          <h3>Importar copia</h3>
          <p>Se va a reemplazar toda la información actual por la de la copia elegida. Antes se guarda automáticamente una copia de lo actual.</p>
          <div className="ctz-actions">
            <button
              className="btn button-orange px-4"
              onClick={() => {
                setConfirmImport(false);
                wrap(async () => {
                  const r = await local().importBackup();
                  if (r.ok) setMsg("Copia importada correctamente.");
                  else if (!r.canceled) throw new Error(r.error || "No se pudo importar.");
                });
              }}
            >
              Elegir archivo
            </button>
            <button className="btn btn-soft px-4" onClick={() => setConfirmImport(false)}>
              Cancelar
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
