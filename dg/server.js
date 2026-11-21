// Optional zero-dependency static server (needs only Node.js). Not required: you can also just open index.html.
const http = require("http"), fs = require("fs"), path = require("path"), { exec } = require("child_process");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
const port = process.env.PORT || 8080;
http.createServer((req, res) => {
  const p = path.join(__dirname, decodeURIComponent(req.url.split("?")[0]).replace(/\/$/, "/index.html"));
  if (!p.startsWith(__dirname)) { res.writeHead(403); return res.end(); }
  fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": types[path.extname(p)] || "application/octet-stream" }); res.end(d); });
}).listen(port, () => {
  const url = `http://localhost:${port}`; console.log("Dengue Guard running at " + url);
  exec((process.platform === "win32" ? "start " : process.platform === "darwin" ? "open " : "xdg-open ") + url);
});
