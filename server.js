// Optional zero-dependency static server (needs only Node.js). Not required: you can also just open index.html.
const http = require("http"), fs = require("fs"), path = require("path"), zlib = require("zlib"), { exec } = require("child_process");
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".ico": "image/x-icon", ".webp": "image/webp", ".txt": "text/plain; charset=utf-8", ".md": "text/plain; charset=utf-8" };
// Tiny .env loader (no dependency). Real keys live in .env in this folder, which is git-ignored.
try { fs.readFileSync(path.join(__dirname, ".env"), "utf8").split(/\r?\n/).forEach(l => {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}); } catch (e) { /* no .env: chatbot falls back to built-in answers */ }
const chat = require("./chat-api.js");
const story = require("./story-api.js");
const sub = require("./subscribe-api.js");
const port = process.env.PORT || 8080, gz = {};
http.createServer((req, res) => {
    const route = req.url.split("?")[0];
  if (req.method === "POST" && route === "/api/chat") return chat.handle(req, res);
  if (req.method === "POST" && route === "/api/story") return story.submit(req, res);
  if (req.method === "GET" && route === "/api/stories") return story.approved(req, res);
  if (req.method === "POST" && route === "/api/subscribe") return sub.subscribe(req, res);
  if (req.method === "GET" && route === "/api/unsubscribe") return sub.unsubscribe(req, res);
  const p = path.join(__dirname, decodeURIComponent(req.url.split("?")[0]).replace(/\/$/, "/index.html"));
  // never serve secrets or submitted stories (.env, dotfiles, submissions/)
  if (!p.startsWith(__dirname) || /(^|[\\/])(\.[^\\/]*|submissions)([\\/]|$)/.test(path.relative(__dirname, p))) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); return res.end("Not found"); }
    const ext = path.extname(p), h = { "Content-Type": types[ext] || "application/octet-stream" };
    // gzip text assets (plotly/model/dataset are ~10 MB raw); compressed copies are cached in memory
    if (/gzip/.test(req.headers["accept-encoding"] || "") && /\.(html|js|css|json|svg|txt|md)$/.test(ext)) {
      if (!gz[p] || gz[p].src !== d.length) gz[p] = { src: d.length, buf: zlib.gzipSync(d, { level: 9 }) };
      h["Content-Encoding"] = "gzip"; h["Vary"] = "Accept-Encoding"; d = gz[p].buf;
    }
    res.writeHead(200, h); res.end(d); });
}).listen(port, () => {
  const url = `http://localhost:${port}`; console.log("Dengue Guard running at " + url);
  if (!process.env.RENDER && !process.env.CI) exec((process.platform === "win32" ? "start " : process.platform === "darwin" ? "open " : "xdg-open ") + url);
});
