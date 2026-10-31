import { useRef, useState } from "react";
import { call } from "../../api";
import type { ParsedClock } from "../../types";

async function toBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

export default function UploadStep({ onParsed }: { onParsed: (p: ParsedClock) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async (file: File | undefined | null) => {
    if (!file) return;
    if (!/\.csv$/i.test(file.name)) {
      setError("El archivo tiene que ser un CSV exportado del reloj.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onParsed(await call<ParsedClock>("clock:parse", { base64: await toBase64(file) }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo leer el archivo.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <>
      <div
          className={`drop-zone m-auto ${over ? "over" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            handle(e.dataTransfer.files?.[0]);
          }}
      >
        <h2>{busy ? "Leyendo archivo…" : "Cargá los registros del reloj en formato CSV para comenzar"}</h2>
        <p className="wiz-text">Seleccioná o arrastrá el archivo acá</p>
        <button className="btn button-orange px-4 py-2 fs-5" style={{height: "auto"}} disabled={busy}
                onClick={() => input.current?.click()}>
          Cargar registro
        </button>
        <input ref={input} type="file" accept=".csv,text/csv" hidden onChange={(e) => handle(e.target.files?.[0])}/>
        {error && <p className="ctz-error mb-0">{error}</p>}
      </div>
    </>
  );
}
