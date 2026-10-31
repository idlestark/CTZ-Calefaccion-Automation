// Servidor HTTP de la PC principal: permite que la PC secundaria use la misma base
// de datos por la red local (sin internet). Mismas operaciones que el IPC local.
const http = require("http");

function startServer(dispatch, { port = 3737, host = "0.0.0.0" } = {}) {
  const server = http.createServer((req, res) => {
    const send = (status, body) => {
      res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(body));
    };
    if (req.method === "GET" && req.url === "/ping") return send(200, { ok: true, app: "ctz" });

    const m = /^\/api\/(.+)$/.exec(req.url || "");
    if (req.method !== "POST" || !m) return send(404, { ok: false, error: "No encontrado." });

    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > 50 * 1024 * 1024) {
        send(413, { ok: false, error: "Solicitud demasiado grande." });
        req.destroy();
      } else chunks.push(c);
    });
    req.on("end", () => {
      try {
        const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
        const data = dispatch(decodeURIComponent(m[1]), body.args, body.token);
        send(200, { ok: true, data });
      } catch (e) {
        send(200, { ok: false, error: e.message || "Error inesperado.", code: e.code || 500 });
      }
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => resolve(server));
  });
}

module.exports = { startServer };
