// Serves out/ under a sub-path the way GitHub Pages serves a project site (REQ-15):
//   /<prefix>/<path>      -> out/<path>, a folder answers with its index.html
//   /<prefix>/<folder>    -> 301 to /<prefix>/<folder>/ (as GitHub Pages does)
//   anything else         -> 404 with out/404.html
// No dependencies, read-only. Usage: node scripts/serve-subpath.js <port> <prefix> [dir]
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const [port = "4180", prefix = "/ai-history-timeline", dir = "out"] = process.argv.slice(2);
const root = path.resolve(dir);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".txt": "text/plain; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml",
  ".ico": "image/x-icon", ".woff2": "font/woff2", ".webp": "image/webp",
};

function send(res, status, file) {
  res.writeHead(status, { "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const notFound = () => send(res, 404, path.join(root, "404.html"));
    if (url.pathname !== prefix && !url.pathname.startsWith(`${prefix}/`)) return notFound();
    const rel = decodeURIComponent(url.pathname.slice(prefix.length)) || "/";
    const file = path.join(root, rel);
    if (!file.startsWith(root)) return notFound(); // no escaping the folder
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!url.pathname.endsWith("/")) {
        res.writeHead(301, { Location: `${url.pathname}/${url.search}` });
        return res.end();
      }
      const index = path.join(file, "index.html");
      return fs.existsSync(index) ? send(res, 200, index) : notFound();
    }
    return fs.existsSync(file) ? send(res, 200, file) : notFound();
  })
  .listen(Number(port), () => console.log(`serving ${root} at http://localhost:${port}${prefix}/`));
