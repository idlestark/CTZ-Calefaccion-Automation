import { useEffect, useState } from "react";
import { local } from "../../api";
import type { LocalInfo } from "../../types";

/**
 * Conexión entre las dos PCs (opción A):
 *  - Principal: guarda la base de datos y atiende a la otra PC por la red local.
 *  - Secundaria: se conecta a la principal (no guarda datos propios).
 */
export default function ConnectionSettings({ onClose }: { onClose?: () => void }) {
  const [info, setInfo] = useState<LocalInfo | null>(null);
  const [mode, setMode] = useState<"host" | "client">("host");
  const [url, setUrl] = useState("");
  const [port, setPort] = useState(3737);
  const [test, setTest] = useState<"" | "ok" | "fail" | "testing">("");

  useEffect(() => {
    local()
      .info()
      .then((i) => {
        setInfo(i);
        setMode(i.mode);
        setUrl(i.hostUrl);
        setPort(i.port);
      });
  }, []);

  if (!info) return <p className="ctz-muted">Cargando…</p>;

  const changed = mode !== info.mode || (mode === "client" && url.trim() !== info.hostUrl) || (mode === "host" && port !== info.port);

  const probe = async () => {
    setTest("testing");
    const r = await local().testConnection(url);
    setTest(r.ok ? "ok" : "fail");
  };

  return (
    <div>
      <div className="d-flex gap-2 mb-3">
        <button type="button" className={`btn ${mode === "host" ? "button-orange" : "button-transluce"}`} onClick={() => setMode("host")}>
          PC principal
        </button>
        <button type="button" className={`btn ${mode === "client" ? "button-orange" : "button-transluce"}`} onClick={() => setMode("client")}>
          PC secundaria
        </button>
      </div>

      {mode === "host" ? (
        <>
          <p className="ctz-muted mb-2">Esta computadora guarda la base de datos. La PC secundaria debe contecarse mediante la misma red a la siguiente dirección:</p>
          <p className="fs-5 mb-2">{info.address ? `http://${info.address}:${port}` : "No se detectó una red local."}</p>
          <label className="form-label">Puerto</label>
          <input type="number" className="form-control mb-2" value={port} onChange={(e) => setPort(Number(e.target.value))} />
          {info.serverError && <p className="ctz-error">{info.serverError} La otra PC no podrá conectarse.</p>}
          <p className="ctz-muted small">
            La aplicación debe estar abierta para que la PC secundaria pueda conectarse.
          </p>
        </>
      ) : (
        <>
          <p className="ctz-muted mb-2">Ingresá la dirección de la PC principal (por ejemplo: http://192.168.0.10:3737).</p>
          <div className="d-flex gap-2">
            <input className="form-control" placeholder="http://192.168.0.10:3737" value={url} onChange={(e) => { setUrl(e.target.value); setTest(""); }} />
            <button type="button" className="btn button-transluce" onClick={probe} disabled={!url.trim() || test === "testing"}>
              Probar conexión
            </button>
          </div>
          {test === "ok" && <p className="mt-2 mb-0" style={{ color: "#7bd957" }}>Conexión correcta.</p>}
          {test === "fail" && <p className="ctz-error mt-2 mb-0">No se pudo conectar. Revisá la dirección y que la PC principal esté habilitada.</p>}
        </>
      )}

      <div className="ctz-actions">
        <button
          type="button"
          className="btn button-orange mt-3"
          disabled={!changed || (mode === "client" && !url.trim())}
          onClick={() => local().saveConfig({ mode, hostUrl: url, port })}
        >
          Guardar y reiniciar
        </button>
        {onClose && (
          <button type="button" className="btn btn-soft" onClick={onClose}>
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}
