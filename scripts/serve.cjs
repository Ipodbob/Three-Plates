const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
};
function createServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost"),
      pathname = url.pathname;
    if (pathname === "/preview") {
      const width = Number(url.searchParams.get("width") || 390),
        route = url.searchParams.get("page") || "choose";
      if (
        ![320, 390, 430, 1280].includes(width) ||
        !["choose", "batch", "plan", "shop", "pantry", "you"].includes(route)
      ) {
        res.writeHead(400);
        res.end("Choose a supported preview width and page.");
        return;
      }
      res.writeHead(200, {
        "Content-Type": "text/html",
        "Cache-Control": "no-store",
      });
      res.end(
        `<!doctype html><html lang="en"><meta charset="utf-8"><title>Three Plates responsive preview</title><style>body{margin:0;background:#e5e5e5;font:16px system-ui}header{padding:12px}iframe{display:block;width:${width}px;height:844px;border:0;background:white;margin:0 auto}</style><header>Local preview · ${width}px · ${route}</header><iframe title="Three Plates ${width}px preview" src="/Three-Plates/#${route}"></iframe></html>`,
      );
      return;
    }
    const name =
      pathname === "/Three-Plates/"
        ? "index.html"
        : pathname.startsWith("/Three-Plates/")
          ? pathname.slice(14)
          : "";
    const allowed =
      /^[a-zA-Z0-9.-]+$/.test(name) ||
      /^vendor\/[a-zA-Z0-9.-]+\.js$/.test(name);
    if (!allowed || name.startsWith(".") || !types[path.extname(name)]) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    fs.readFile(path.join(root, name), (err, data) => {
      res.writeHead(err ? 404 : 200, {
        "Content-Type": types[path.extname(name)],
        "Cache-Control": "no-store",
      });
      res.end(err ? "Not found" : data);
    });
  });
}
if (require.main === module) {
  const port = Number(process.env.PORT || 4173);
  createServer().listen(port, "127.0.0.1", () =>
    console.log(`Three Plates: http://127.0.0.1:${port}/Three-Plates/`),
  );
}
module.exports = { createServer };
