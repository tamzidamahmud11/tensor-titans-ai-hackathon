// Optional zero-dependency static server (needs only Node.js). Not required: you can also just open index.html.
const http = require("http"), fs = require("fs"), path = require("path"), { exec } = require("child_process");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".ico": "image/x-icon", ".webp": "image/webp", ".txt": "text/plain", ".md": "text/plain" };
// Tiny .env loader (no dependency). Real keys live in .env in this folder, which is git-ignored.
try { fs.readFileSync(path.join(__dirname, ".env"), "utf8").split(/\r?\n/).forEach(l => {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}); } catch (e) { /* no .env: chatbot falls back to built-in answers */ }
const chat = require("./chat-api.js");
const port = process.env.PORT || 8080;
http.createServer((req, res) => {
    if (req.method === "POST" && req.url.split("?")[0] === "/api/chat") return chat.handle(req, res);
  const p = path.join(__dirname, decodeURIComponent(req.url.split("?")[0]).replace(/\/$/, "/index.html"));
  if (!p.startsWith(__dirname)) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": types[path.extname(p)] || "application/octet-stream" }); res.end(d); });
}).listen(port, () => {
  const url = `http://localhost:${port}`; console.log("Dengue Guard running at " + url);
  exec((process.platform === "win32" ? "start " : process.platform === "darwin" ? "open " : "xdg-open ") + url);
});
