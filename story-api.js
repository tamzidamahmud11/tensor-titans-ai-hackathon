// "Submit your story" API for Dengue Protirodh (zero dependencies).
//   POST /api/story    -> validates a submission and appends it to submissions/pending.jsonl (never shown publicly)
//   GET  /api/stories  -> returns stories a human has approved (submissions/approved.json)
// Moderation is manual: review pending.jsonl, then copy acceptable entries into approved.json
// as {"name","place","role","story"} objects. Nothing is published automatically.
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "submissions");
const PENDING = path.join(DIR, "pending.jsonl"), APPROVED = path.join(DIR, "approved.json");
const MAX_BODY = 12 * 1024, MIN_STORY = 40, MAX_STORY = 2000;
const RATE_MAX = 3, RATE_WINDOW_MS = 3600e3;           // 3 submissions per IP per hour
const ROLES = ["patient", "family", "health-worker", "other"];
const hits = new Map();

function send(res, code, obj) { res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store" }); res.end(JSON.stringify(obj)); }
// only successful saves count towards the limit, so typos do not lock people out
function recent(k) { const now = Date.now(), arr = (hits.get(k) || []).filter(t => now - t < RATE_WINDOW_MS); hits.set(k, arr); return arr; }
const limited = k => recent(k).length >= RATE_MAX;
const record = k => recent(k).push(Date.now());
// strip control characters, collapse spaces, cap length
const clean = (v, max, multiline) => String(v == null ? "" : v)
  .replace(multiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, "")
  .replace(multiline ? /[ \t]+/g : /\s+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, max);

function submit(req, res) {
  const ip = (req.socket && req.socket.remoteAddress) || "x";
  if (limited(ip)) return send(res, 429, { ok: false, error: "Too many submissions. Please try again later." });
  let size = 0; const chunks = [];
  req.on("data", c => { size += c.length; if (size > MAX_BODY) { send(res, 413, { ok: false, error: "Submission too large." }); req.destroy(); } else chunks.push(c); });
  req.on("end", () => {
    if (size > MAX_BODY) return;
    let b; try { b = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch (e) { return send(res, 400, { ok: false, error: "Invalid request." }); }
    if (b && b.website) return send(res, 200, { ok: true });            // honeypot: pretend success to bots
    const story = clean(b.story, MAX_STORY, true);
    if (story.length < MIN_STORY) return send(res, 400, { ok: false, error: "Please write at least a few sentences (" + MIN_STORY + " characters)." });
    if (b.consent !== true) return send(res, 400, { ok: false, error: "Please confirm you agree to the terms to share your story." });
    const email = clean(b.email, 120);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return send(res, 400, { ok: false, error: "That email address does not look right." });
    const rec = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), at: new Date().toISOString(),
      name: clean(b.name, 60), place: clean(b.place, 80), role: ROLES.includes(b.role) ? b.role : "other", email, story, status: "pending" };
    try { fs.mkdirSync(DIR, { recursive: true }); fs.appendFileSync(PENDING, JSON.stringify(rec) + "\n"); }
    catch (e) { return send(res, 500, { ok: false, error: "Could not save your story right now." }); }
    record(ip); send(res, 200, { ok: true });
  });
}

function approved(req, res) {
  let list = [];
  try { list = JSON.parse(fs.readFileSync(APPROVED, "utf8")); } catch (e) { /* none yet */ }
  const out = (Array.isArray(list) ? list : []).slice(0, 50).map(s => ({
    name: clean(s.name, 60), place: clean(s.place, 80), role: ROLES.includes(s.role) ? s.role : "other", story: clean(s.story, MAX_STORY, true) })).filter(s => s.story);
  send(res, 200, { ok: true, stories: out });
}
module.exports = { submit, approved };
