import "./history.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { call } from "../../api";

type M = { month: string; year: number; monthName: string };

/** Historial: lista de meses procesados, agrupados por año. */
export default function MonthHistory() {
  const [months, setMonths] = useState<M[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    call<M[]>("history:months")
      .then(setMonths)
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar el historial."));
  }, []);

  const years = months ? [...new Set(months.map((m) => m.year))] : [];

  return (
    <div className="history">
      <h1 className="ctz-title">Historial</h1>
      {error && <p className="ctz-error">{error}</p>}
      {months && months.length === 0 && <p className="ctz-muted mt-4">Todavía no hay meses procesados.</p>}
      <div className="history-list">
        {years.map((y) => (
          <div key={y}>
            <div className="ctz-heading-orange">{y}</div>
            <div className="history-list">
              {months!
                .filter((m) => m.year === y)
                .map((m) => (
                  <div key={m.month} className="month rounded-3">
                    <span className="month-name">{m.monthName}</span>
                    <button type="button" className="btn button-orange" onClick={() => navigate(`/historial/${m.month}`)}>
                      Ver más
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
