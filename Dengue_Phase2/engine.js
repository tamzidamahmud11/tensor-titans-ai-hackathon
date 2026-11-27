/* Dengue Guard - in-browser engine: CSV loading, lag features, gradient-boosting inference, drivers, scenarios.
   JS port of the original Python pipeline (dengue-guard/*.py). No server, no network. */
(function () {
  const HORIZONS = [2, 3, 4];
  const TIERS = ["Low", "Medium", "High", "Critical"];
  const TIER_COLORS = { Low: "#22c55e", Medium: "#facc15", High: "#fb923c", Critical: "#ef4444" };
  const ACTIONS = {
    Low: "Routine surveillance. Keep weekly larvae checks and community awareness running.",
    Medium: "Pre-position larvicide and clear drains in this ward; brief clinics on case definition.",
    High: "Deploy larvicide + fogging teams within 7 days; reserve beds, saline and NS1/IgM test kits.",
    Critical: "Emergency response: door-to-door source reduction now, surge beds/saline, daily case reporting.",
  };
  const RAIN_COLS = [...Array(8).keys()].map(k => `rain_lag${k}w`).concat(["rain_sum_2w", "rain_sum_4w", "rain_sum_8w", "rain_sum_wk4_7"]);
  const GROUPS = {
    "Rainfall lags (1-8 wk)": RAIN_COLS,
    "Temperature": ["temp_lag0w", "temp_lag2w", "temp_lag4w", "temp_mean_4w"],
    "Humidity": ["hum_lag0w", "hum_lag2w", "hum_lag4w", "hum_mean_4w"],
    "Recent case trend": ["cases_t0", "cases_t1", "cases_t2", "cases_t3", "cases_mean_4w", "cases_trend"],
    "Ward vulnerability": ["population_density_sqkm", "water_logging_risk_index", "sanitation_score", "vulnerability_index"],
    "Seasonality": ["season_sin", "season_cos"],
  };
  const REQUIRED = ["date", "city", "ward_id", "population_density_sqkm", "water_logging_risk_index", "sanitation_score",
    "avg_temp_c", "rainfall_mm", "relative_humidity_pct", "dengue_cases"];
  const M = window.MODEL, FEAT = M.features, FIDX = Object.fromEntries(FEAT.map((f, i) => [f, i]));

  // ---------------------------------------------------------------- dates
  const DAY = 86400000;
  const toMs = s => Date.parse(s + "T00:00:00Z");
  const addDays = (s, n) => new Date(toMs(s) + n * DAY).toISOString().slice(0, 10);
  function dayOfYear(s) { const d = new Date(toMs(s)); return Math.floor((d - Date.UTC(d.getUTCFullYear(), 0, 0)) / DAY); }
  const median = a => { const b = a.filter(Number.isFinite).sort((x, y) => x - y); return b.length ? (b[b.length >> 1] + b[(b.length - 1) >> 1]) / 2 : 0; };

  // ---------------------------------------------------------------- CSV -> wards
  function parseCSV(text) {
    const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(l => l.trim());
    const head = lines[0].split(",").map(c => c.trim().toLowerCase());
    const miss = REQUIRED.filter(c => !head.includes(c));
    if (miss.length) throw new Error("Missing required columns: " + miss.join(", "));
    const ix = Object.fromEntries(head.map((c, i) => [c, i]));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const p = lines[i].split(",");
      const num = c => { const v = parseFloat(p[ix[c]]); return Number.isFinite(v) ? v : NaN; };
      rows.push({
        date: (p[ix.date] || "").trim().slice(0, 10), city: (p[ix.city] || "").trim(), ward: (p[ix.ward_id] || "").trim(),
        dens: num("population_density_sqkm"), wl: num("water_logging_risk_index"), san: num("sanitation_score"),
        temp: num("avg_temp_c"), tmax: num("max_temp_c"), tmin: num("min_temp_c"), rain: num("rainfall_mm"), hum: num("relative_humidity_pct"), cases: num("dengue_cases"),
      });
    }
    return rows;
  }
  function buildWards(rows) {
    const by = new Map();
    for (const r of rows) { if (!r.date || !r.ward) continue; if (!by.has(r.ward)) by.set(r.ward, new Map()); by.get(r.ward).set(r.date, r); }
    const wards = [];
    for (const [id, m] of by) {
      const rs = [...m.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
      const w = { id, city: rs[0].city, dens: rs[0].dens, wl: rs[0].wl, san: rs[0].san, dates: rs.map(r => r.date),
        rain: rs.map(r => r.rain), tmax: rs.map(r => r.tmax), tmin: rs.map(r => r.tmin), temp: rs.map(r => r.temp), hum: rs.map(r => r.hum), cases: rs.map(r => r.cases) };
      w.hasRange = w.tmax.some(Number.isFinite);
      for (const k of w.hasRange ? ["temp", "rain", "hum", "tmax", "tmin"] : ["temp", "rain", "hum"]) {           // ffill(limit=2) then median, like the Python loader
        const a = w[k], med = median(a); let run = 0;
        for (let i = 0; i < a.length; i++) {
          if (Number.isFinite(a[i])) run = 0; else if (i > 0 && run < 2 && Number.isFinite(a[i - 1])) { a[i] = a[i - 1]; run++; } else { run = 3; }
          if (!Number.isFinite(a[i])) a[i] = med;
        }
      }
      w.cases = w.cases.map(v => (Number.isFinite(v) ? v : 0));
      w.rain = w.rain.map(v => Math.max(0, v));
      w.idx = new Map(w.dates.map((d, i) => [d, i]));
      wards.push(w);
    }
    wards.sort((a, b) => (a.id < b.id ? -1 : 1));
    return wards;
  }

  // ---------------------------------------------------------------- features at origin index i (needs i >= 7)
  function originFeatures(w, i) {
    const f = {};
    for (let k = 0; k < 8; k++) f[`rain_lag${k}w`] = w.rain[i - k];
    const rs = (a, b) => { let s = 0; for (let k = a; k < b; k++) s += f[`rain_lag${k}w`]; return s; };
    f.rain_sum_2w = rs(0, 2); f.rain_sum_4w = rs(0, 4); f.rain_sum_8w = rs(0, 8); f.rain_sum_wk4_7 = rs(4, 8);
    for (const [tag, arr] of [["temp", w.temp], ["hum", w.hum]]) {
      for (const k of [0, 2, 4]) f[`${tag}_lag${k}w`] = arr[i - k];
      f[`${tag}_mean_4w`] = (arr[i] + arr[i - 1] + arr[i - 2] + arr[i - 3]) / 4;
    }
    for (let k = 0; k < 4; k++) f[`cases_t${k}`] = w.cases[i - k];
    f.cases_mean_4w = (f.cases_t0 + f.cases_t1 + f.cases_t2 + f.cases_t3) / 4;
    f.cases_trend = f.cases_t0 - f.cases_t3;
    f.population_density_sqkm = w.dens; f.water_logging_risk_index = w.wl; f.sanitation_score = w.san;
    f.vulnerability_index = 0.4 * w.wl + 0.3 * (1 - w.san) + 0.3 * Math.min(Math.max(w.dens / 75000, 0), 1);
    return f;
  }
  function withSeason(f, originDate, h) {
    const doy = dayOfYear(addDays(originDate, 7 * h)), g = { ...f };
    g.season_sin = Math.sin(2 * Math.PI * doy / 365.25); g.season_cos = Math.cos(2 * Math.PI * doy / 365.25);
    return g;
  }
  const toVec = f => FEAT.map(n => f[n]);

  // ---------------------------------------------------------------- tree inference
  function rawPredict(model, x) {
    let s = model.base;
    for (const t of model.trees) {
      let n = 0;
      while (!t.leaf[n]) n = x[t.f[n]] <= t.t[n] ? t.l[n] : t.r[n];
      s += t.v[n];
    }
    return model.poisson ? Math.exp(s) : s;
  }
  function predictVec(x, h) {
    const m = M.models[h], mean = Math.max(0, rawPredict(m.mean, x));
    const lo = Math.max(0, rawPredict(m.lo, x)), hi = Math.max(0, rawPredict(m.hi, x));
    return { pred: mean, lo: Math.min(lo, mean), hi: Math.max(hi, mean) };
  }
  const meanOnly = (x, h) => Math.max(0, rawPredict(M.models[h].mean, x));
  const tierOf = v => { let i = 0; for (const t of M.thresholds) if (v >= t) i++; return TIERS[i]; };

  // ---------------------------------------------------------------- forecasting API
  function forecast(w, origin, h, feats) {
    const i = w.idx.get(origin);
    if (i === undefined || i < 7) return null;
    const f = withSeason(feats || originFeatures(w, i), origin, h), p = predictVec(toVec(f), h);
    const target = addDays(origin, 7 * h), ti = w.idx.get(target);
    return { ward: w, ward_id: w.id, city: w.city, origin, target, h, feats: f, ...p, tier: tierOf(p.pred),
      actual: ti === undefined ? null : w.cases[ti], dens: w.dens, wl: w.wl, san: w.san };
  }
  function contributions(f, h) {
    const x = toVec(f), base = meanOnly(x, h), out = {};
    for (const [g, cols] of Object.entries(GROUPS)) {
      const y = x.slice(); for (const c of cols) y[FIDX[c]] = M.baseline[c];
      out[g] = base - meanOnly(y, h);
    }
    return out;
  }
  function topDriver(c) {
    let best = null, bv = -Infinity;
    for (const [g, v] of Object.entries(c)) if (v > bv) { bv = v; best = g; }
    return bv > 0.05 ? best : "Nothing notable";
  }
  function applyScenario(f, mult, dT, dH, win) {
    const z = { ...f }, ks = { all: [0, 8], recent: [0, 4], older: [4, 8] }[win];
    for (let k = ks[0]; k < ks[1]; k++) z[`rain_lag${k}w`] *= mult;
    const s = (a, b) => { let t = 0; for (let k = a; k < b; k++) t += z[`rain_lag${k}w`]; return t; };
    z.rain_sum_2w = s(0, 2); z.rain_sum_4w = s(0, 4); z.rain_sum_8w = s(0, 8); z.rain_sum_wk4_7 = s(4, 8);
    for (const c of ["temp_lag0w", "temp_lag2w", "temp_lag4w", "temp_mean_4w"]) z[c] += dT;
    for (const c of ["hum_lag0w", "hum_lag2w", "hum_lag4w", "hum_mean_4w"]) z[c] = Math.min(100, Math.max(0, z[c] + dH));
    return z;
  }
  function originsOf(wards) {
    const s = new Set();
    for (const w of wards) for (let i = 7; i < w.dates.length; i++) s.add(w.dates[i]);
    return [...s].sort();
  }

  window.DW = { HORIZONS, TIERS, TIER_COLORS, ACTIONS, GROUPS, M, addDays, parseCSV, buildWards, originFeatures,
    forecast, contributions, topDriver, applyScenario, originsOf, tierOf };
})();
