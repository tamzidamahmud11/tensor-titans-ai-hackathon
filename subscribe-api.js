// "Stay in the Know" email subscription API for Dengue Protirodh (zero dependencies).
//   POST /api/subscribe        -> validates an email and appends it to submissions/subscribers.jsonl (private)
//   GET  /api/unsubscribe?t=.. -> marks the subscriber with that private token as unsubscribed
// The list is an append-only log: the latest line for an email wins ("active" or "unsubscribed").
// The submissions/ folder is git-ignored and never served over HTTP (see server.js).
// This app does not send email itself: export the active addresses and use your own mail tool.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const DIR = path.join(__dirname, "submissions"), FILE = path.join(DIR, "subscribers.jsonl");
const MAX_BODY = 2 * 1024, MAX_FILE = 5 * 1024 * 1024;
const RATE_MAX = 5, RATE_WINDOW_MS = 3600e3;               // 5 sign-ups per IP per hour
const EMAIL_RE = /^[^\s@<>"',;:()\[\]\\]+@[^\s@<>"',;:()\[\]\\]+\.[^\s@<>"',;:()\[\]\\]{2,}$/;
const hits = new Map();

function send(res, code, obj) { res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store" }); res.end(JSON.stringify(obj)); }
function page(res, code, title, text) {
  res.writeHead(code, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  res.end(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>` +
    `<body style="font:16px/1.6 system-ui,sans-serif;max-width:32em;margin:12vh auto;padding:0 20px;color:#12212b"><h1 style="font-size:1.5rem">${title}</h1><p>${text}</p><p><a href="/" style="color:#0b6e8a">Back to Dengue Protirodh</a></p></body>`);
}
function recent(k) { const now = Date.now(), arr = (hits.get(k) || []).filter(t => now - t < RATE_WINDOW_MS); hits.set(k, arr); return arr; }
function readLog() {
  const latest = new Map();                                   // email -> latest record
  let txt = ""; try { txt = fs.readFileSync(FILE, "utf8"); } catch (e) { return latest; }
  txt.split("\n").forEach(l => { if (!l) return; try { const r = JSON.parse(l); if (r && r.email) latest.set(r.email, r); } catch (e) { /* skip bad line */ } });
  return latest;
}

function subscribe(req, res) {
  const ip = (req.socket && req.socket.remoteAddress) || "x";
  if (recent(ip).length >= RATE_MAX) return send(res, 429, { ok: false, error: "Too many attempts. Please try again later." });
  let size = 0; const chunks = [];
  req.on("data", c => { size += c.length; if (size > MAX_BODY) { send(res, 413, { ok: false, error: "Request too large." }); req.destroy(); } else chunks.push(c); });
  req.on("end", () => {
    if (size > MAX_BODY) return;
    let b; try { b = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch (e) { return send(res, 400, { ok: false, error: "Invalid request." }); }
    if (!b || typeof b !== "object") return send(res, 400, { ok: false, error: "Invalid request." });
    if (b.website) return send(res, 200, { ok: true });                          // honeypot: pretend success to bots
    const email = String(b.email == null ? "" : b.email).replace(/[\u0000-\u001F\u007F]/g, "").trim().toLowerCase();
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) return send(res, 400, { ok: false, error: "That email address does not look right." });
    if (b.consent !== true) return send(res, 400, { ok: false, error: "Please tick the box to agree to receive emails." });
    try {
      fs.mkdirSync(DIR, { recursive: true });
      let big = false; try { big = fs.statSync(FILE).size > MAX_FILE; } catch (e) { /* no file yet */ }
      if (big) return send(res, 503, { ok: false, error: "Sign-ups are paused right now. Please try again later." });
      const prev = readLog().get(email);
      // Same reply whether or not the address was already on the list, so the form cannot be used to probe who subscribed.
      if (!prev || prev.status !== "active") {
        const token = (prev && prev.token) || crypto.randomBytes(16).toString("hex");
        fs.appendFileSync(FILE, JSON.stringify({ at: new Date().toISOString(), email, token, status: "active" }) + "\n");
      }
    } catch (e) { return send(res, 500, { ok: false, error: "Could not save your subscription right now." }); }
    recent(ip).push(Date.now());
    send(res, 200, { ok: true });
  });
}

function unsubscribe(req, res) {
  const t = (new URL(req.url, "http://x").searchParams.get("t") || "").trim();
  if (!/^[0-9a-f]{32}$/.test(t)) return page(res, 400, "Link not valid", "This unsubscribe link is not valid. Email team@dengueguard.example and we will remove you.");
  let rec = null; readLog().forEach(r => { if (r.token === t) rec = r; });
  if (!rec) return page(res, 404, "Link not found", "We could not find that subscription. Email team@dengueguard.example and we will remove you.");
  if (rec.status === "active") {
    try { fs.appendFileSync(FILE, JSON.stringify({ at: new Date().toISOString(), email: rec.email, token: t, status: "unsubscribed" }) + "\n"); }
    catch (e) { return page(res, 500, "Something went wrong", "Please try again later or email team@dengueguard.example."); }
  }
  page(res, 200, "You are unsubscribed", "You will no longer receive Stay in the Know emails from Dengue Protirodh.");
}
module.exports = { subscribe, unsubscribe };
