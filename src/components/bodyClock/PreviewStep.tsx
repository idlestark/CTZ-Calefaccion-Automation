import { useState } from "react";
import PlanillaPreview from "../bodyHistory/PlanillaPreview";
import { local } from "../../api";

type Props = { html: string; monthKey: string; backup: string | null; onClose: () => void };

export default function PreviewStep({ html, monthKey, backup, onClose }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const open = async () => {
    setBusy(true);
    setError(null);
    try {
      const file = await local().savePdf(html, `Planilla ${monthKey}.pdf`);
      setSaved(file);
      await local().openPath(file);
    } catch {
      setError("No se pudo generar el PDF.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <p className="wiz-text mt-4">Vista previa del resumen mensual</p>
      <PlanillaPreview html={html} height={520} />
      <p className="ctz-muted text-center mt-3 mb-0">
        El resumen quedó guardado en el Historial.
        {backup && <> Se creó una copia de seguridad en la PC principal: <span style={{ wordBreak: "break-all" }}>{backup}</span></>}
      </p>
      {saved && <p className="ctz-muted text-center mb-0" style={{ wordBreak: "break-all" }}>PDF guardado en: {saved}</p>}
      {error && <p className="ctz-error text-center mt-2">{error}</p>}
      <div className="wiz-actions">
        <button className="btn button-transluce" onClick={onClose}>
          Cerrar
        </button>
        <button className="btn button-orange" onClick={open} disabled={busy}>
          {busy ? "Generando…" : "Abrir archivo"}
        </button>
      </div>
    </>
  );
}
