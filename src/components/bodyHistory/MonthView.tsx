import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./history.css";
import PlanillaPreview from "./PlanillaPreview";
import { call, local } from "../../api";
import { monthLabel } from "../../format";

export default function MonthView() {
  const { month = "" } = useParams();
  const navigate = useNavigate();
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    call<{ html: string }>("history:get", { month })
      .then((r) => setHtml(r.html))
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudo cargar el mes."));
  }, [month]);

  const open = async () => {
    if (!html) return;
    setBusy(true);
    try {
      const file = await local().savePdf(html, `Planilla ${month}.pdf`);
      await local().openPath(file);
    } catch {
      setError("No se pudo generar el PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="history">
      <h1 className="ctz-title">Historial</h1>
      <div className="w-100" style={{ maxWidth: 1050 }}>
        <div className="ctz-heading-orange">{/^\d{4}-\d{2}$/.test(month) ? monthLabel(month) : month}</div>
        {error && <p className="ctz-error">{error}</p>}
        {html && <PlanillaPreview html={html} height={540} />}
        <div className="d-flex justify-content-center gap-3 mt-4">
          <button className="btn button-transluce px-4" onClick={() => navigate("/historial")}>
            &lt; Volver
          </button>
          <button className="btn button-orange px-4" onClick={open} disabled={!html || busy}>
            {busy ? "Generando…" : "Abrir archivo"}
          </button>
        </div>
      </div>
    </div>
  );
}
