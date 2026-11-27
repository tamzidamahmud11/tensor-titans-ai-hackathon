/* Dengue Protirodh - Phase 2 operations engine (100% local, deterministic, no network).
   Turns the Phase 1 GBT forecasts (engine.js / window.DW) into:
     1. constrained supply allocation (saline, diagnostic kits, beds) under a regional stock limit
     2. spraying-crew assignment by marginal cases prevented (uses the simulator below)
     3. a "what-if" vector-control counterfactual run through the GBT models for +2/+3/+4 weeks
     4. intra-city hospital overflow routing
     5. template dispatch notices (SMS, WhatsApp, printable HTML brief)
   Runs unchanged in the browser and in Node (scripts/_load.js gives it a fake `window`). */
(function (root) {
  const DW = root.DW;

  // ------------------------------------------------------------------ planning assumptions (all in one place, all editable)
  const CONFIG = {
    // Demand basis: plan for the mean forecast plus part of the gap to the P90 upper band (GBT quantile model).
    safetyToP90: { Low: 0.0, Medium: 0.25, High: 0.5, Critical: 0.75 },
    admissionRate: 0.45,        // share of reported cases admitted (DGHS reports are mostly hospital-based)
    lengthOfStayDays: 4,        // average dengue admission
    salinePerAdmission: 8,      // 1 L bags: ~2 per day x 4 days of IV fluid
    salinePerOutpatient: 0.5,   // warning-sign outpatients given IV fluids in day care
    kitsPerCase: 2.5,           // NS1/IgM tests per confirmed case (most suspected cases test negative)
    // Priority weight for scarce stock = risk-tier weight x density factor.
    tierWeight: { Low: 1, Medium: 1.6, High: 2.6, Critical: 4 },
    densityFactorRange: [0.6, 1.4],  // least dense ward -> 0.6, most dense -> 1.4
    criticalFillBelow: 0.8,     // High/Critical ward filled below 80% => CRITICAL deficit
    severeFillBelow: 0.5,       // any ward filled below 50% => CRITICAL deficit
    minCriticalShortUnits: 3,   // ...but only if at least 3 units are missing (ignores 1-kit gaps in quiet weeks)
    // Hospital beds: dengue-designated beds per ward, calibrated on training-period history (no test leakage).
    capacityHistoryEnd: "2023-12-31",
    capacityQuantile: 0.95, capacityMargin: 1.2, capacityMinBeds: 2,
    receiverMaxUtil: 0.9,       // a receiving ward is filled to at most 90% of its beds (keeps its own surge buffer)
    // Vector control: crews cut effective breeding habitat (water-logging index) with diminishing returns.
    crewEfficacyMax: 0.6, crewHalfScale: 1.5, maxCrewsPerWard: 4,
    // Fogging kills adults at once, larvicide acts after one mosquito life cycle -> onset by horizon.
    onsetByHorizon: { 2: 0.6, 3: 1.0, 4: 0.9 },
    horizons: [2, 3, 4],
  };

  const TIERS = ["Low", "Medium", "High", "Critical"];
  const ceil = v => Math.ceil(v - 1e-9);
  const sum = (a, f = x => x) => a.reduce((s, x) => s + f(x), 0);
  const quantile = (a, q) => { const b = a.slice().sort((x, y) => x - y); if (!b.length) return 0; const i = (b.length - 1) * q, lo = Math.floor(i); return b[lo] + (b[Math.min(lo + 1, b.length - 1)] - b[lo]) * (i - lo); };

  // ------------------------------------------------------------------ 1a. demand per ward
  function bedsFromCases(cases, cfg = CONFIG) { return cases * cfg.admissionRate * cfg.lengthOfStayDays / 7; }
  function demandOf(r, cfg = CONFIG) {
    const s = cfg.safetyToP90[r.tier] || 0;
    const planCases = r.pred + s * Math.max(0, r.hi - r.pred);
    const adm = planCases * cfg.admissionRate;
    return {
      planCases,
      admissions: adm,
      saline_bags_needed: ceil(adm * cfg.salinePerAdmission + (planCases - adm) * cfg.salinePerOutpatient),
      diagnostic_kits_needed: ceil(planCases * cfg.kitsPerCase),
      hospital_beds_required: Math.round(bedsFromCases(planCases, cfg)),   // expected occupied beds (rounded)
    };
  }

  // ------------------------------------------------------------------ 1b. bed capacity per ward (cached per dataset)
  // City pool = margin x P95 of the city's weekly dengue bed load in the training period (no test-period leakage).
  // The pool is split across wards by population density (hospital beds follow population, not dengue risk),
  // so high-risk wards overflow while lower-burden wards in the same city keep headroom to receive them.
  const capCache = new WeakMap();
  function capacities(wards, cfg = CONFIG) {
    if (capCache.has(wards)) return capCache.get(wards);
    const out = {};
    for (const city of new Set(wards.map(w => w.city))) {
      const ws = wards.filter(w => w.city === city), byDate = new Map();
      for (const w of ws) w.dates.forEach((d, i) => byDate.set(d, (byDate.get(d) || 0) + bedsFromCases(w.cases[i], cfg)));
      let hist = [...byDate].filter(([d]) => d <= cfg.capacityHistoryEnd).map(([, v]) => v);
      if (hist.length < 26) hist = [...byDate.values()];               // uploaded recent-only data: use what exists
      const pool = Math.max(cfg.capacityMinBeds * ws.length, ceil(quantile(hist, cfg.capacityQuantile) * cfg.capacityMargin));
      const dens = ws.reduce((s, w) => s + w.dens, 0);
      // largest-remainder split so the ward beds add up exactly to the city pool
      const exact = ws.map(w => Math.max(cfg.capacityMinBeds, pool * w.dens / dens)), fl = exact.map(Math.floor);
      let left = pool - fl.reduce((a, b) => a + b, 0);
      [...ws.keys()].sort((a, b) => (exact[b] - fl[b]) - (exact[a] - fl[a])).forEach(i => { if (left > 0) { fl[i]++; left--; } });
      ws.forEach((w, i) => { out[w.id] = fl[i]; });
    }
    capCache.set(wards, out); return out;
  }

  // ------------------------------------------------------------------ 1c. priority-weighted water-filling with integer rounding
  // Each ward i has demand d_i and weight p_i. Fill ratio r_i = min(1, lambda * p_i); lambda found by bisection so that
  // sum(d_i * r_i) = stock. Higher-priority wards reach 100% first; nobody is starved to zero while stock remains.
  // Integers: floor, then hand out the leftover units by largest remainder (ties -> higher priority). Never exceeds d_i or stock.
  function waterFill(demands, weights, stock) {
    const n = demands.length, total = sum(demands);
    if (stock >= total) return demands.slice();
    if (stock <= 0) return demands.map(() => 0);
    const filled = lam => sum(demands.map((d, i) => d * Math.min(1, lam * weights[i])));
    let lo = 0, hi = 1 / Math.min(...weights.filter(w => w > 0));
    for (let it = 0; it < 100; it++) { const mid = (lo + hi) / 2; if (filled(mid) < stock) lo = mid; else hi = mid; }
    const exact = demands.map((d, i) => d * Math.min(1, lo * weights[i]));
    const out = exact.map(Math.floor);
    let left = Math.round(stock) - sum(out);
    const order = [...Array(n).keys()].sort((a, b) => (exact[b] - out[b]) - (exact[a] - out[a]) || weights[b] - weights[a]);
    for (const i of order) { if (left <= 0) break; if (out[i] < demands[i]) { out[i]++; left--; } }
    for (const i of [...Array(n).keys()].sort((a, b) => weights[b] - weights[a])) {   // bisection slack: top up highest priority
      while (left > 0 && out[i] < demands[i]) { out[i]++; left--; }
    }
    return out;
  }

  function priorityWeights(rows, cfg = CONFIG) {
    const ds = rows.map(r => r.dens), mn = Math.min(...ds), mx = Math.max(...ds), [a, b] = cfg.densityFactorRange;
    return rows.map(r => {
      const df = mx > mn ? a + (b - a) * (r.dens - mn) / (mx - mn) : 1;
      return { tierW: cfg.tierWeight[r.tier] || 1, densF: df, w: (cfg.tierWeight[r.tier] || 1) * df };
    });
  }

  // ------------------------------------------------------------------ 3. vector-control counterfactual through the GBT
  function crewEfficacy(crews, cfg = CONFIG) { return crews <= 0 ? 0 : cfg.crewEfficacyMax * (1 - Math.exp(-crews / cfg.crewHalfScale)); }
  function treatedFeatures(f, eff) {
    const g = { ...f };
    g.water_logging_risk_index = f.water_logging_risk_index * (1 - eff);
    g.vulnerability_index = 0.4 * g.water_logging_risk_index + 0.3 * (1 - g.sanitation_score) + 0.3 * Math.min(Math.max(g.population_density_sqkm / 75000, 0), 1);
    return g;
  }
  // Returns per-horizon baseline vs treated cases for one ward at one origin week.
  function simulateWard(w, origin, crews, cfg = CONFIG) {
    const i = w.idx.get(origin); if (i === undefined || i < 7) return null;
    const f = DW.originFeatures(w, i), out = { ward_id: w.id, city: w.city, crews, byH: {}, base: 0, treated: 0 };
    for (const h of cfg.horizons) {
      const b = DW.forecast(w, origin, h, f).pred;
      const eff = crewEfficacy(crews, cfg) * (cfg.onsetByHorizon[h] ?? 1);
      const t = crews > 0 ? Math.min(b, DW.forecast(w, origin, h, treatedFeatures(f, eff)).pred) : b;  // a crew never adds cases
      out.byH[h] = { base: b, treated: t, prevented: b - t, efficacy: eff };
      out.base += b; out.treated += t;
    }
    out.prevented = out.base - out.treated;
    out.bedsFreed = bedsFromCases(out.prevented, cfg) / cfg.horizons.length;      // average weekly beds over the window
    out.salineSaved = out.prevented * (cfg.admissionRate * cfg.salinePerAdmission + (1 - cfg.admissionRate) * cfg.salinePerOutpatient);
    out.roi = crews > 0 ? out.prevented / crews : 0;
    return out;
  }
  // Prevented-cases curve for 0..maxCrews crews (cached per ward+origin).
  const curveCache = new Map();
  function crewCurve(w, origin, cfg = CONFIG) {
    const key = w.id + "|" + origin + "|" + cfg.crewEfficacyMax + "|" + cfg.crewHalfScale;
    if (curveCache.has(key) && curveCache.get(key).w === w) return curveCache.get(key).c;
    const c = [];
    for (let k = 0; k <= cfg.maxCrewsPerWard; k++) c.push(simulateWard(w, origin, k, cfg));
    if (curveCache.size > 3000) curveCache.clear();
    curveCache.set(key, { w, c }); return c;
  }
  // Greedy marginal allocation: each crew goes where the next crew prevents the most (priority-weighted) cases.
  // Because the efficacy curve is concave, greedy is optimal for this separable problem.
  function assignCrews(rows, totalCrews, origin, cfg = CONFIG) {
    const pw = priorityWeights(rows, cfg), assign = Object.fromEntries(rows.map(r => [r.ward_id, 0]));
    const curves = rows.map(r => crewCurve(r.ward, origin, cfg));
    for (let k = 0; k < totalCrews; k++) {
      let best = -1, bv = 1e-6;
      rows.forEach((r, i) => {
        const c = assign[r.ward_id]; if (!curves[i] || c >= cfg.maxCrewsPerWard) return;
        const gain = (curves[i][c + 1].prevented - curves[i][c].prevented) * pw[i].densF;
        if (gain > bv) { bv = gain; best = i; }
      });
      if (best < 0) break;
      assign[rows[best].ward_id]++;
    }
    return assign;
  }
  // ROI table: cases prevented by the first crew in each ward (ranking for officers).
  function roiRanking(rows, origin, cfg = CONFIG) {
    return rows.map(r => { const c = crewCurve(r.ward, origin, cfg); return c ? { ward_id: r.ward_id, city: r.city, tier: r.tier, roi1: c[1].prevented, roi2: c[2].prevented / 2, curve: c } : null; })
      .filter(Boolean).sort((a, b) => b.roi1 - a.roi1);
  }

  // ------------------------------------------------------------------ 2. intra-city overflow routing
  function routeOverflow(items, cfg = CONFIG) {
    const transfers = [], cities = {};
    for (const city of [...new Set(items.map(x => x.city))].sort()) {
      const pool = items.filter(x => x.city === city);
      for (const x of pool) { x.overflow = Math.max(0, x.bedsReq - x.bedCap); x.received = 0; x.sent = 0; x.netDeficit = 0; }
      const room = x => Math.max(0, Math.floor(x.bedCap * cfg.receiverMaxUtil) - Math.min(x.bedsReq, x.bedCap) - x.received);
      const senders = pool.filter(x => x.overflow > 0).sort((a, b) => b.priority - a.priority || b.overflow - a.overflow);
      for (const s of senders) {
        let need = s.overflow;
        const receivers = pool.filter(x => x !== s && x.overflow === 0 && x.tier !== "Critical" && room(x) > 0)
          .sort((a, b) => TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier) || room(b) - room(a) || (a.ward_id < b.ward_id ? -1 : 1));
        for (const r of receivers) {
          if (need <= 0) break;
          const n = Math.min(need, room(r)); if (n <= 0) continue;
          r.received += n; s.sent += n; need -= n;
          transfers.push({ city, from: s.ward_id, to: r.ward_id, patients: n, toTier: r.tier });
        }
        s.netDeficit = need;
      }
      const cap = sum(pool, x => x.bedCap), req = sum(pool, x => x.bedsReq);
      const occupied = sum(pool, x => Math.min(x.bedsReq, x.bedCap) + x.received);
      cities[city] = { city, wards: pool.length, bedCap: cap, bedsReq: req, occupied, utilization: cap ? occupied / cap : 0,
        demandRatio: cap ? req / cap : 0, headroom: cap - occupied, overflow: sum(pool, x => x.overflow),
        routed: sum(pool, x => x.sent), unmet: sum(pool, x => x.netDeficit),
        overflowWards: pool.filter(x => x.overflow > 0).length };
    }
    return { transfers, cities };
  }

  // ------------------------------------------------------------------ full plan
  // rows: DW.forecast results (one per ward) for the selected origin & horizon.
  // opts: { stockPct 30..100, crews, bedScale (0.5..1.5), crewAssign (optional manual {ward_id: n}) }
  function plan(rows, opts = {}, cfg = CONFIG) {
    const stockPct = Math.min(100, Math.max(30, opts.stockPct ?? 100));
    const crews = Math.max(0, Math.round(opts.crews ?? 0)), bedScale = opts.bedScale ?? 1;
    if (!rows.length) return null;
    const origin = rows[0].origin, h = rows[0].h, target = rows[0].target;
    const pw = priorityWeights(rows, cfg), caps = capacities(opts.allWards || rows.map(r => r.ward), cfg);
    const items = rows.map((r, i) => {
      const d = demandOf(r, cfg);
      return { ward_id: r.ward_id, city: r.city, tier: r.tier, pred: r.pred, lo: r.lo, hi: r.hi, dens: r.dens, driver: r.driver,
        priority: pw[i].w, tierW: pw[i].tierW, densF: pw[i].densF, ...d,
        bedCap: Math.max(1, Math.round(caps[r.ward_id] * bedScale)), bedsReq: d.hospital_beds_required };
    });
    const stock = {}, resources = ["saline_bags_needed", "diagnostic_kits_needed"];
    for (const k of resources) {
      const dem = items.map(x => x[k]), total = sum(dem), avail = Math.floor(total * stockPct / 100);
      const alloc = waterFill(dem, items.map(x => x.priority), avail);
      const key = k.replace("_needed", "_allocated");
      items.forEach((x, i) => { x[key] = alloc[i]; });
      stock[k] = { required: total, available: avail, allocated: sum(alloc), unmet: total - sum(alloc) };
    }
    const route = routeOverflow(items, cfg);
    const assign = opts.crewAssign || assignCrews(rows, crews, origin, cfg);
    const sim = {};
    for (const r of rows) {
      const n = assign[r.ward_id] || 0;
      if (n > 0) { const c = crewCurve(r.ward, origin, cfg); sim[r.ward_id] = c ? c[Math.min(n, cfg.maxCrewsPerWard)] : null; }
    }
    for (const x of items) {
      x.crews = assign[x.ward_id] || 0;
      const crewNeed = { Low: 0, Medium: 1, High: 2, Critical: 3 }[x.tier] + (x.densF > 1.2 ? 1 : 0);
      x.crewsNeeded = Math.min(cfg.maxCrewsPerWard, crewNeed);
      x.casesPrevented = sim[x.ward_id] ? sim[x.ward_id].prevented : 0;
      x.salineFill = x.saline_bags_needed ? x.saline_bags_allocated / x.saline_bags_needed : 1;
      x.kitFill = x.diagnostic_kits_needed ? x.diagnostic_kits_allocated / x.diagnostic_kits_needed : 1;
      const worst = Math.min(x.salineFill, x.kitFill);
      const highRisk = x.tier === "High" || x.tier === "Critical";
      x.alerts = [];
      if (x.saline_bags_allocated < x.saline_bags_needed) x.alerts.push(`saline short ${x.saline_bags_needed - x.saline_bags_allocated}`);
      if (x.diagnostic_kits_allocated < x.diagnostic_kits_needed) x.alerts.push(`kits short ${x.diagnostic_kits_needed - x.diagnostic_kits_allocated}`);
      if (x.netDeficit > 0) x.alerts.push(`${x.netDeficit} bed(s) unplaced`);
      if (x.crews < x.crewsNeeded && highRisk) x.alerts.push(`crews ${x.crews}/${x.crewsNeeded}`);
      const shortUnits = Math.max(x.saline_bags_needed - x.saline_bags_allocated, x.diagnostic_kits_needed - x.diagnostic_kits_allocated);
      const supplyCrit = shortUnits >= cfg.minCriticalShortUnits && (worst < cfg.severeFillBelow || (highRisk && worst < cfg.criticalFillBelow));
      x.status = (supplyCrit || x.netDeficit > 0) ? "CRITICAL DEFICIT"
        : x.alerts.length ? "DEFICIT" : "OK";
    }
    items.sort((a, b) => b.priority - a.priority || b.pred - a.pred);
    const crewsUsed = sum(items, x => x.crews);
    return { origin, h, target, stockPct, crews, crewsUsed, bedScale, items, stock, transfers: route.transfers, cities: route.cities,
      totals: { cases: sum(items, x => x.pred), planCases: sum(items, x => x.planCases), prevented: sum(items, x => x.casesPrevented),
        critical: items.filter(x => x.status === "CRITICAL DEFICIT").length, deficit: items.filter(x => x.status !== "OK").length,
        bedsReq: sum(items, x => x.bedsReq), bedCap: sum(items, x => x.bedCap), unmetBeds: sum(items, x => x.netDeficit) },
      config: cfg };
  }

  // ------------------------------------------------------------------ 4. dispatch notice templates (deterministic, offline)
  const fmtD = s => { const d = new Date(s + "T00:00:00Z"); return d.getUTCDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getUTCMonth()]; };
  const short = id => id.replace(/_Ward_/, "-W");
  function transfersOf(p, id) { return { out: p.transfers.filter(t => t.from === id), in: p.transfers.filter(t => t.to === id) }; }

  function smsNotice(p, x) {               // GSM-7 safe ASCII, aim for a single 160-char segment
    const tr = transfersOf(p, x.ward_id);
    const parts = [
      `DENGUE ${x.tier.toUpperCase()} ${short(x.ward_id)} wk ${fmtD(p.target)}: ${Math.round(x.pred)} cases expected`,
      `Saline ${x.saline_bags_allocated}/${x.saline_bags_needed} Kits ${x.diagnostic_kits_allocated}/${x.diagnostic_kits_needed} Beds need ${x.bedsReq} have ${x.bedCap}`,
      tr.out.length ? `Send ${x.sent}pt to ${tr.out.map(t => short(t.to)).join(",")}` : tr.in.length ? `Recv ${x.received}pt` : "",
      `Crews ${x.crews}`,
      x.status !== "OK" ? (x.status === "CRITICAL DEFICIT" ? "CRIT DEFICIT" : "DEFICIT") + (x.alerts.length ? ": " + x.alerts.join(", ") : "") : "",
    ].filter(Boolean);
    let s = parts.join(". ");
    if (s.length > 160 && x.alerts.length > 1) { parts[parts.length - 1] = parts[parts.length - 1].split(":")[0] + ": " + x.alerts[0]; s = parts.join(". "); }
    if (s.length > 160) s = parts.filter((_, i) => i !== 2).join(". ");
    return s.length > 160 ? s.slice(0, 157) + "..." : s;
  }
  function whatsappNotice(p, x) {
    const tr = transfersOf(p, x.ward_id), ic = { Low: "🟢", Medium: "🟡", High: "🟠", Critical: "🔴" }[x.tier];
    const line = (lbl, a, n) => `• ${lbl}: *${a}* / ${n} ${a < n ? `⚠️ short ${n - a}` : "✅"}`;
    return [
      `${ic} *DENGUE DISPATCH — ${x.ward_id} (${x.city})*`,
      `Target week: ${fmtD(p.target)} (+${p.h} wk) · Risk: *${x.tier}*`,
      `Predicted cases: *${x.pred.toFixed(1)}*/wk (80% range ${x.lo.toFixed(1)}–${x.hi.toFixed(1)}); planning for ${x.planCases.toFixed(1)}`,
      ``,
      `*Supplies (allocated / required)*`,
      line("Saline bags", x.saline_bags_allocated, x.saline_bags_needed),
      line("Diagnostic kits", x.diagnostic_kits_allocated, x.diagnostic_kits_needed),
      `• Hospital beds: need *${x.bedsReq}*, local ${x.bedCap}` + (x.overflow ? ` → overflow ${x.overflow}` : " ✅"),
      ...tr.out.map(t => `  ↪ transfer *${t.patients}* patient(s) to ${t.to}`),
      ...tr.in.map(t => `  ↩ receive *${t.patients}* patient(s) from ${t.from}`),
      ...(x.netDeficit ? [`  ⛔ *${x.netDeficit} bed(s) unplaced in ${x.city}* — request referral / field ward`] : []),
      ``,
      `*Vector control*: ${x.crews} spraying crew(s) assigned (suggested ${x.crewsNeeded})` + (x.casesPrevented ? `, est. ${x.casesPrevented.toFixed(1)} cases prevented over 2–4 wk` : ""),
      x.status === "OK" ? `Status: ✅ fully supplied` : `Status: 🚨 *${x.status}* — ${x.alerts.join("; ")}`,
      `_Stock level ${p.stockPct}% · generated offline by Dengue Protirodh_`,
    ].join("\n");
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function briefHTML(p, opts = {}) {
    const title = opts.title || `Commissioner brief${opts.city ? " — " + opts.city : ""}`;
    const items = opts.city ? p.items.filter(x => x.city === opts.city) : p.items;
    const cities = Object.values(p.cities).filter(c => !opts.city || c.city === opts.city);
    const col = { Low: "#22c55e", Medium: "#eab308", High: "#f97316", Critical: "#ef4444" };
    const rowsHtml = items.map(x => {
      const tr = transfersOf(p, x.ward_id);
      return `<tr class="${x.status === "OK" ? "" : x.status === "CRITICAL DEFICIT" ? "crit" : "warn"}">
        <td><b>${esc(x.ward_id)}</b><br><small>${esc(x.city)}</small></td><td><span class="dot" style="background:${col[x.tier]}"></span>${x.tier}</td>
        <td>${x.pred.toFixed(1)}<br><small>${x.lo.toFixed(1)}–${x.hi.toFixed(1)}</small></td>
        <td>${x.saline_bags_allocated} / ${x.saline_bags_needed}</td><td>${x.diagnostic_kits_allocated} / ${x.diagnostic_kits_needed}</td>
        <td>${x.bedsReq} / ${x.bedCap}${tr.out.length ? `<br><small>→ ${tr.out.map(t => `${t.patients} to ${esc(t.to)}`).join(", ")}</small>` : ""}${tr.in.length ? `<br><small>← ${x.received} in</small>` : ""}${x.netDeficit ? `<br><small><b>${x.netDeficit} unplaced</b></small>` : ""}</td>
        <td>${x.crews}${x.crewsNeeded ? ` <small>(sugg. ${x.crewsNeeded})</small>` : ""}</td>
        <td>${x.status === "OK" ? "OK" : `<b>${x.status}</b><br><small>${esc(x.alerts.join("; "))}</small>`}</td></tr>`;
    }).join("");
    const cityHtml = cities.map(c => `<div class="c"><b>${esc(c.city)}</b><div>Beds ${c.occupied}/${c.bedCap} used (${Math.round(100 * c.utilization)}%)</div>
      <div>Demand ${c.bedsReq} · headroom ${c.headroom}</div><div>Routed ${c.routed} · <b>unmet ${c.unmet}</b></div></div>`).join("");
    const st = p.stock;
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>body{font:13px/1.45 "Segoe UI",system-ui,sans-serif;color:#12212b;margin:28px}h1{font-size:20px;margin:0}h2{font-size:15px;margin:18px 0 6px}
.meta{color:#556877;margin:4px 0 14px}.cs{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px}.c{border:1px solid #d9e1e7;border-radius:8px;padding:8px}
table{border-collapse:collapse;width:100%;margin-top:6px}th,td{border:1px solid #d9e1e7;padding:5px 6px;text-align:left;vertical-align:top}th{background:#eef3f6}
tr.crit td{background:#fde8e8}tr.warn td{background:#fff6e0}.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}
small{color:#556877}.k{display:flex;gap:18px;flex-wrap:wrap}.k div{border-left:4px solid #0b6e8a;padding-left:8px}.foot{margin-top:18px;color:#556877;font-size:11px}
@media print{body{margin:10mm}button{display:none}tr{page-break-inside:avoid}}</style></head><body>
<button onclick="window.print()" style="float:right;padding:6px 12px">Print / Save as PDF</button>
<h1>${esc(title)}</h1>
<div class="meta">Dengue Protirodh dispatch · warning issued week of ${p.origin} · target week ${p.target} (+${p.h} wk) · regional stock ${p.stockPct}% · ${p.crewsUsed}/${p.crews} spraying crews deployed · bed capacity ×${p.bedScale}</div>
<div class="k"><div><b>${items.length}</b> wards</div><div><b>${items.reduce((s, x) => s + x.pred, 0).toFixed(0)}</b> predicted cases/wk</div>
<div><b>${items.filter(x => x.status === "CRITICAL DEFICIT").length}</b> critical deficits</div>
<div>Saline <b>${st.saline_bags_needed.allocated}</b>/${st.saline_bags_needed.required}</div><div>Kits <b>${st.diagnostic_kits_needed.allocated}</b>/${st.diagnostic_kits_needed.required}</div>
<div><b>${items.reduce((s, x) => s + x.casesPrevented, 0).toFixed(1)}</b> cases prevented by crews (2–4 wk)</div></div>
<h2>City bed pools</h2><div class="cs">${cityHtml}</div>
<h2>Ward orders (priority order)</h2>
<table><thead><tr><th>Ward</th><th>Risk</th><th>Pred. cases/wk</th><th>Saline alloc/req</th><th>Kits alloc/req</th><th>Beds req/local</th><th>Crews</th><th>Status</th></tr></thead><tbody>${rowsHtml}</tbody></table>
<div class="foot">Generated locally and deterministically (no internet, no LLM). Supplies use the GBT forecast plus a tier-based buffer toward the P90 band; stock is shared by priority = risk tier × population density. Decision support only.</div>
</body></html>`;
  }
  function planCSV(p) {
    const cols = ["ward_id", "city", "tier", "pred", "planCases", "priority", "saline_bags_needed", "saline_bags_allocated", "diagnostic_kits_needed",
      "diagnostic_kits_allocated", "hospital_beds_required", "bedCap", "overflow", "sent", "received", "netDeficit", "crewsNeeded", "crews", "casesPrevented", "status"];
    return cols.join(",") + "\n" + p.items.map(x => cols.map(c => { const v = c === "hospital_beds_required" ? x.bedsReq : x[c]; return typeof v === "number" && !Number.isInteger(v) ? v.toFixed(3) : `"${String(v).replace(/"/g, '""')}"`.replace(/^"(-?\d+)"$/, "$1"); }).join(",")).join("\n");
  }
  function transfersCSV(p) { return "city,from_ward,to_ward,patients,receiver_tier\n" + p.transfers.map(t => [t.city, t.from, t.to, t.patients, t.toTier].join(",")).join("\n"); }

  root.OPS = { CONFIG, demandOf, capacities, waterFill, priorityWeights, crewEfficacy, simulateWard, crewCurve, assignCrews, roiRanking,
    routeOverflow, plan, smsNotice, whatsappNotice, briefHTML, planCSV, transfersCSV };
})(typeof window !== "undefined" ? window : globalThis);
