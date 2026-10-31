import type { ParsedClock } from "../../types";

const HEAD = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

type Props = {
  parsed: ParsedClock;
  holidays: string[];
  onToggle: (date: string) => void;
  onBack: () => void;
  onNext: () => void;
  busy: boolean;
  error: string | null;
};

export default function CalendarStep({ parsed, holidays, onToggle, onBack, onNext, busy, error }: Props) {
  const { year, month } = parsed;
  const first = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7; // lunes = 0
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const iso = (d: number) => `${parsed.monthKey}-${String(d).padStart(2, "0")}`;

  return (
    <>
      <p className="wiz-text">Seleccioná los días no laborales del mes</p>
      <div className="ctz-heading-orange">{parsed.monthLabel}</div>
      {parsed.alreadyProcessed && (
        <p className="ctz-error">Este mes ya fue procesado. Si continuás y finalizás, el resumen anterior se va a reemplazar.</p>
      )}
      <div className="cal">
        <div className="cal-grid">
          {HEAD.map((h) => (
            <div key={h} className="cal-head">
              {h}
            </div>
          ))}
          {cells.map((d, i) => {
            if (d === null) return <div key={`e${i}`} />;
            const weekend = i % 7 >= 5; // sábado y domingo no son laborales
            const sel = holidays.includes(iso(d));
            return (
              <button
                key={d}
                type="button"
                disabled={weekend}
                className={`cal-day ${weekend ? "off" : "pick"} ${sel ? "sel" : ""}`}
                onClick={() => onToggle(iso(d))}
                aria-pressed={sel}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>
      <p className="ctz-muted text-center mt-3 mb-0">Los sábados y domingos ya se consideran no laborales. Marcá feriados u otros días sin actividad.</p>
      {error && <p className="ctz-error text-center mt-2">{error}</p>}
      <div className="wiz-actions">
        <button className="btn button-transluce" onClick={onBack}>
          &lt; Volver
        </button>
        <button className="btn button-orange" onClick={onNext} disabled={busy}>
          {busy ? "Procesando…" : "Continuar >"}
        </button>
      </div>
    </>
  );
}
