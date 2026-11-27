// Server-side chatbot proxy for Dengue Guard.
// Why server-side: the API key never reaches the browser.
// Cost controls: question length cap, per-IP rate limit, answer cache, small output cap, timeout.
// Resilience: any failure (no key, 429, network, timeout) returns {ok:false} and the browser falls back to built-in answers.
const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const KEY = process.env.GEMINI_API_KEY || "";
const MAX_Q = 300, MAX_OUT_TOKENS = 250, TIMEOUT_MS = 8000;
const RATE_MAX = 8, RATE_WINDOW_MS = 60000;      // per IP per minute
const CACHE_MAX = 200, CACHE_TTL_MS = 6 * 3600e3;
const cache = new Map(), hits = new Map();

const SYSTEM = `You are the help assistant inside "Dengue Guard", a ward-level dengue early-warning dashboard for Bangladesh city corporations.
Help health officers and visitors use the dashboard and understand the forecasts. Be brief (max 4 sentences). Reply in the user's language (English or Bangla).
Facts about the app:
- Tabs: Risk board (tier counts, Response planner, ranked wards, treemap, heatmap, CSV download), Ward deep-dive (one ward's forecast, 80% range, weather drivers), What-if scenarios (change rainfall, temperature, humidity and see the forecast move), Model validation (test errors), How it works, Architecture.
- Sidebar: choose city corporation, the week the warning is issued, and the window (+2, +3 or +4 weeks ahead). A CSV with the required columns can be uploaded.
- Risk tiers Low/Medium/High/Critical come from expected weekly cases per ward, using thresholds calibrated on 2023 data.
- The model is gradient-boosted trees using rainfall lags 0-7 weeks, temperature and humidity lags, recent cases, ward vulnerability (density, water-logging, sanitation) and season. Rain affects cases 2-4 weeks later because mosquito eggs take 7-14 days to mature, then the virus incubates.
- Test results (2024-2025, +3 weeks): MAE about 1.0 cases per ward-week, 80% interval coverage about 94%.
- Coverage: 60 wards in Dhaka North (DNCC), Dhaka South (DSCC), Chattogram (CCC), Gazipur (GCC) and Narayanganj (NCC); weekly data 2016-2025 with weather (temperature, rainfall, humidity), ward vulnerability (population density, water-logging risk, sanitation score) and dengue cases.
- General dengue background you MAY answer: spread by Aedes mosquitoes that breed in stagnant water; prevention such as emptying containers, covering water storage, clearing drains, larvicide and community clean-up; warning signs mean seeing a doctor. Keep it short and non-clinical.
Scope: you are a friendly, helpful general assistant. Answer any question the user asks (general knowledge, everyday help, small talk), and gladly help with this dashboard and dengue. Keep answers short and kind.
Rules: for this app, it is decision support, not a diagnosis. Never give a personal medical diagnosis or treatment plan; for symptoms such as high fever, severe pain or bleeding, tell people to see a doctor or hospital. Use the live dashboard context if provided; never invent dashboard numbers.`;


function ip(req) { return (req.socket && req.socket.remoteAddress) || "x"; }
function limited(k) {
  const now = Date.now(), arr = (hits.get(k) || []).filter(t => now - t < RATE_WINDOW_MS);
  arr.push(now); hits.set(k, arr); return arr.length > RATE_MAX;
}
function send(res, code, obj) { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); }

async function ask(question, ctx) {
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM + (ctx ? "\nLive dashboard context: " + ctx : "") }] },
    contents: [{ role: "user", parts: [{ text: question }] }],
    generationConfig: { maxOutputTokens: MAX_OUT_TOKENS, temperature: 0.3 }
  };
  const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST", signal: ctrl.signal,
      headers: { "Content-Type": "application/json", "x-goog-api-key": KEY }, body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    const text = (((j.candidates || [])[0] || {}).content || {}).parts;
    const out = text && text.map(p => p.text || "").join("").trim();
    if (!out) throw new Error("empty answer");
    return out;
  } finally { clearTimeout(timer); }
}

exports.handle = function (req, res) {
  let raw = ""; let tooBig = false;
  req.on("data", c => { raw += c; if (raw.length > 4000) { tooBig = true; req.destroy(); } });
  req.on("end", async () => {
    if (tooBig) return;
    if (!KEY) return send(res, 200, { ok: false, reason: "no_key" });
    let q = "", ctx = "";
    try { const j = JSON.parse(raw); q = String(j.q || "").trim().slice(0, MAX_Q); ctx = String(j.ctx || "").slice(0, 400); } catch (e) { return send(res, 400, { ok: false, reason: "bad_request" }); }
    if (!q) return send(res, 400, { ok: false, reason: "empty" });
    if (limited(ip(req))) return send(res, 200, { ok: false, reason: "rate_limited" });
    const ck = q.toLowerCase().replace(/\s+/g, " ") + "|" + ctx;
    const c = cache.get(ck);
    if (c && Date.now() - c.t < CACHE_TTL_MS) return send(res, 200, { ok: true, answer: c.a, cached: true });
    try {
      const a = await ask(q, ctx);
      if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
      cache.set(ck, { a, t: Date.now() });
      send(res, 200, { ok: true, answer: a });
    } catch (e) { send(res, 200, { ok: false, reason: "upstream_error" }); }
  });
};
