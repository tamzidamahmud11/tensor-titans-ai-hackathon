(function () {
  const { HORIZONS, TIERS, TIER_COLORS, ACTIONS, GROUPS, M } = DW;
  const EMOJI = Object.fromEntries(Object.entries(TIER_COLORS).map(([k, c]) => [k, `<span class="dot" style="--c:${c}"></span>`]));
  const $ = id => document.getElementById(id);
  const fmtDate = s => new Date(s + "T00:00:00Z").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
  const f1 = v => v.toFixed(1);
  const BG = { paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)", font: { color: "#12212b" } };
  const CFG = { displayModeBar: false, responsive: true };
  const plot = (el, data, layout) => {
    if (typeof layout.title === "string") layout = { ...layout, title: { text: layout.title, x: 0.01, font: { color: "#12212b", size: 15 } } };
    return Plotly.react(el, data, { ...BG, margin: { t: 36, l: 50, r: 20, b: 40 }, ...layout }, CFG);
  };
  const grid = { gridcolor: "#dfe6eb", zerolinecolor: "#dfe6eb" };
  const gy = { ...grid, type: "linear" };

  const S = { wards: [], origins: [], oi: 0, city: "All cities", h: 3, sortKey: "pred", sortDir: -1 };
  let rows = [], allRows = [];

  // ------------------------------------------------------------------ data
  function setData(wards, keepSettings) {
    S.wards = wards; S.origins = DW.originsOf(wards);
    const cities = [...new Set(wards.map(w => w.city))].sort();
    $("city").innerHTML = ["All cities", ...cities].map(c => `<option>${c}</option>`).join("");
    S.city = "All cities";
    $("origin").max = S.origins.length - 1;
    // default origin: peak citywide forecast (+3w) in the last ~14 months
    let best = -1, bi = S.origins.length - 1;
    for (let i = Math.max(0, S.origins.length - 60); i < S.origins.length; i++) {
      let s = 0; for (const w of wards) { const r = DW.forecast(w, S.origins[i], 3); if (r) s += r.pred; }
      if (s > best) { best = s; bi = i; }
    }
    S.oi = bi; $("origin").value = bi;
    $("dataLbl").textContent = `Model trained through ${M.trained_through} · ${wards.reduce((a, w) => a + w.dates.length, 0).toLocaleString()} rows · ${wards.length} wards`;
  }

  // ------------------------------------------------------------------ recompute for current selection
  function recompute() {
    const origin = S.origins[S.oi];
    allRows = S.wards.map(w => DW.forecast(w, origin, S.h)).filter(Boolean);
    rows = S.city === "All cities" ? allRows : allRows.filter(r => r.city === S.city);
    for (const r of rows) { r.contrib = DW.contributions(r.feats, S.h); r.driver = DW.topDriver(r.contrib); }
    const target = DW.addDays(origin, 7 * S.h);
    $("originLbl").textContent = fmtDate(origin);
    $("targetLbl").innerHTML = `Forecast target week: <b>${fmtDate(target)}</b>`;
    const held = target > "2023-12-31" && !M.full_refit && S.wards.length === 60 && window.__defaultData;
    $("heldOut").textContent = held ? "✅ Target week is in the held-out test period (model never saw it)."
      : "ℹ️ This week was inside the training window, so accuracy here is optimistic. See Model validation.";
    $("heroSub").textContent = `Weather lags + ward vulnerability → outbreak risk ${S.h} weeks ahead · ${[...new Set(S.wards.map(w => w.city))].join(" · ")}`;
    const wardOpts = rows.map(r => `<option>${r.ward_id}</option>`).join("");
    for (const id of ["w2", "w3"]) { const cur = $(id).value; $(id).innerHTML = wardOpts; if (rows.some(r => r.ward_id === cur)) $(id).value = cur; }
    renderAll();
  }
  function renderAll() { r1(); r2(); r3(); }

  // ------------------------------------------------------------------ TAB 1
  function r1() {
    const t = M.thresholds, origin = S.origins[S.oi];
    if (!rows.length) { $("kpis").innerHTML = ""; $("alert").innerHTML = `<div class="box err">No data for this selection.</div>`; return; }
    const cnt = Object.fromEntries(TIERS.map(x => [x, 0])); rows.forEach(r => cnt[r.tier]++);
    const total = rows.reduce((a, r) => a + r.pred, 0);
    $("kpis").innerHTML = [...TIERS].reverse().map(x => `<div class="kpi" style="--c:${TIER_COLORS[x]}"><div class="n">${cnt[x]}</div><div class="l">${EMOJI[x]} wards at <b>${x}</b> risk</div></div>`).join("")
      + `<div class="kpi" style="--c:#38bdf8"><div class="n">${total.toFixed(0)}</div><div class="l">expected cases / week (selection)</div></div>`;
    $("tierbar").innerHTML = TIERS.map(x => cnt[x] ? `<i style="width:${100 * cnt[x] / rows.length}%;background:${TIER_COLORS[x]}" title="${x}: ${cnt[x]}"></i>` : "").join("");
    $("tierlbl").textContent = TIERS.map(x => `${x} ${cnt[x]}`).join("  |  ") + `  (${rows.length} wards)`;
    const urgent = rows.filter(r => r.tier === "High" || r.tier === "Critical").sort((a, b) => b.pred - a.pred);
    $("alert").innerHTML = urgent.length
      ? `<div class="box err"><b>${urgent.length} ward(s) need action within the next ${S.h} weeks:</b> ${urgent.slice(0, 8).map(r => `${r.ward_id} (${r.tier})`).join(", ")}${urgent.length > 8 ? " …" : ""}</div>`
      : `<div class="box ok">No High/Critical wards for this week and window.</div>`;

      window.DG_CONTEXT = `City: ${S.city}; warning week: ${origin}; window: +${S.h} weeks; wards by tier: ${TIERS.map(x => x + " " + cnt[x]).join(", ")}.`;
    // response planner: allocate limited teams to the highest expected-case wards
    const nTeams = Math.max(1, Math.min(rows.length, parseInt($("teams").value, 10) || 1));
    const ranked = rows.slice().sort((a, b) => b.pred - a.pred);
    const picked = ranked.slice(0, nTeams);
    const share = total > 0 ? 100 * picked.reduce((s, r) => s + r.pred, 0) / total : 0;
    $("planOut").innerHTML = `<p><b>${nTeams}</b> team(s) sent to the top ${nTeams} ward(s) cover about <b>${share.toFixed(0)}%</b> of expected cases in this selection.</p>`
      + `<ol>${picked.map(r => `<li>${r.ward_id} (${r.city}): ${r.tier}, ~${f1(r.pred)} cases/wk. Main driver: ${r.driver}</li>`).join("")}</ol>`;
    $("teams").oninput = () => r1();

    // table
    const k = S.sortKey, d = S.sortDir;
    const sorted = rows.slice().sort((a, b) => {
      const va = k === "tier" ? TIERS.indexOf(a.tier) : a[k], vb = k === "tier" ? TIERS.indexOf(b.tier) : b[k];
      return (va < vb ? -1 : va > vb ? 1 : 0) * d;
    });
    const mx = Math.max(20, ...rows.map(r => r.pred));
    const th = (key, label) => `<th data-k="${key}">${label}${S.sortKey === key ? (S.sortDir > 0 ? " ▲" : " ▼") : ""}</th>`;
    $("tbl").innerHTML = `<thead><tr>${th("ward_id", "Ward")}${th("city", "City")}${th("tier", "Risk")}${th("pred", "Expected cases/wk")}<th>80% range</th>${th("driver", "Main driver")}</tr></thead><tbody>` +
      sorted.map(r => `<tr><td>${r.ward_id}</td><td>${r.city}</td><td>${EMOJI[r.tier]} ${r.tier}</td>
        <td><span class="bar" style="width:${Math.round(60 * r.pred / mx)}px"></span>${f1(r.pred)}</td><td>${f1(r.lo)} – ${f1(r.hi)}</td><td>${r.driver}</td></tr>`).join("") + "</tbody>";
    $("tbl").querySelectorAll("th[data-k]").forEach(el => el.onclick = () => {
      const key = el.dataset.k; S.sortDir = S.sortKey === key ? -S.sortDir : (key === "pred" || key === "tier" ? -1 : 1); S.sortKey = key; r1();
    });
    $("dl").onclick = () => {
      const csv = "ward_id,city,origin_date,target_date,tier,pred,lo,hi,top_driver\n" + sorted.map(r =>
        [r.ward_id, r.city, r.origin, r.target, r.tier, r.pred.toFixed(3), r.lo.toFixed(3), r.hi.toFixed(3), r.driver].join(",")).join("\n");
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      a.download = `dengue_forecast_${origin}_h${S.h}.csv`; a.click();
    };

    // treemap
    const cities = [...new Set(rows.map(r => r.city))];
    const ids = ["All wards", ...cities.map(c => "c:" + c), ...rows.map(r => "w:" + r.ward_id)];
    const labels = ["All wards", ...cities, ...rows.map(r => r.ward_id)];
    const parents = ["", ...cities.map(() => "All wards"), ...rows.map(r => "c:" + r.city)];
    const cv = cities.map(c => rows.filter(r => r.city === c).reduce((a, r) => a + r.dens, 0));
    const values = [cv.reduce((a, b) => a + b, 0), ...cv, ...rows.map(r => r.dens)];
    const colors = ["#c5d0d8", ...cities.map(() => "#c5d0d8"), ...rows.map(r => TIER_COLORS[r.tier])];
    const custom = [["", ""], ...cities.map(() => ["", ""]), ...rows.map(r => [r.tier, f1(r.pred)])];
    plot($("treemap"), [{ type: "treemap", ids, labels, parents, values, branchvalues: "total", marker: { colors, line: { width: 2, color: "#ffffff" } },
      customdata: custom, hovertemplate: "%{label}<br>%{customdata[0]} · %{customdata[1]} cases/wk<extra></extra>", textfont: { color: "#12212b" } }],
      { margin: { t: 10, l: 0, r: 0, b: 0 } });

    // heatmap
    $("hmTitle").textContent = `Ward × week heatmap — predicted cases at a ${S.h}-week horizon (last 26 warnings)`;
    const lo = Math.max(0, S.oi - 25), os = S.origins.slice(lo, S.oi + 1), ws = rows.map(r => r.ward);
    const z = ws.map(w => os.map(o => { const r = DW.forecast(w, o, S.h); return r ? r.pred : null; }));
    const zmax = Math.max(t[2] * 1.2, ...z.flat().filter(v => v !== null));
    const stops = [0, t[0] / zmax, t[0] / zmax, t[1] / zmax, t[1] / zmax, t[2] / zmax, t[2] / zmax, 1];
    const cs = stops.map((s, i) => [s, TIER_COLORS[TIERS[i >> 1]]]);
    plot($("heatmap"), [{ type: "heatmap", z, x: os.map(fmtDate), y: ws.map(w => w.id), colorscale: cs, zmin: 0, zmax,
      colorbar: { title: "cases/wk" }, hovertemplate: "%{y}<br>warning %{x}<br>%{z:.1f} cases/wk<extra></extra>" }],
      { height: Math.max(320, 14 * ws.length + 80), margin: { t: 10, l: 90, r: 10, b: 60 }, yaxis: { autorange: "reversed", type: "category" } });
    $("hmCap").textContent = `Colour bands = risk tiers: Low < ${f1(t[0])} ≤ Medium < ${f1(t[1])} ≤ High < ${f1(t[2])} ≤ Critical (expected cases per ward per week).`;
  }

  // ------------------------------------------------------------------ TAB 2
  function r2() {
    const el = $("w2"); if (!rows.length) return;
    const row = rows.find(r => r.ward_id === el.value) || rows[0], w = row.ward, t = row.tier, origin = row.origin;
    const pct = key => 100 * allRows.filter(r => r[key] <= row[key]).length / allRows.length;
    $("cards2").innerHTML =
      `<div class="card"><span class="pill" style="--c:${TIER_COLORS[t]}">${t.toUpperCase()} RISK</span><h2>${f1(row.pred)} <span class="small">cases / week</span></h2>
        <div class="small">80% range ${f1(row.lo)} – ${f1(row.hi)} · target week ${fmtDate(row.target)}</div></div>
       <div class="card"><b>Ward vulnerability</b><br>💧 Water-logging ${row.wl.toFixed(2)} <span class="small">(p${pct("wl").toFixed(0)})</span>
        <br>🧹 Sanitation ${row.san.toFixed(2)} <span class="small">(p${pct("san").toFixed(0)}, lower = worse)</span>
        <br>👥 Density ${Math.round(row.dens).toLocaleString()}/km² <span class="small">(p${pct("dens").toFixed(0)})</span></div>
       <div class="card"><b>Recommended action</b><br>${ACTIONS[t]}</div>`;

    const oi = w.idx.get(origin), a = Math.max(0, oi - 39), b = Math.min(w.dates.length - 1, oi + 4);
    const xs = w.dates.slice(a, b + 1), past = xs.map((_, k) => a + k <= oi);
    const data = [
      { type: "bar", x: xs, y: w.rain.slice(a, b + 1), name: "Rainfall (mm)", marker: { color: "rgba(56,189,248,.35)" }, yaxis: "y2" },
      { type: "scatter", x: xs.filter((_, k) => past[k]), y: w.cases.slice(a, oi + 1), name: "Reported cases", line: { color: "#12212b", width: 2.5 } },
    ];
    if (b > oi) data.push({ type: "scatter", x: w.dates.slice(oi, b + 1), y: w.cases.slice(oi, b + 1), name: "Actual (after warning)", line: { color: "#12212b", dash: "dot" } });
    for (const hh of HORIZONS) {
      const q = DW.forecast(w, origin, hh); if (!q) continue;
      data.push({ type: "scatter", mode: "markers", x: [q.target], y: [q.pred], name: `Forecast +${hh}w`,
        marker: { size: hh === S.h ? 13 : 8, symbol: "diamond", color: TIER_COLORS[q.tier], line: { width: 1, color: "white" } },
        error_y: { type: "data", symmetric: false, array: [q.hi - q.pred], arrayminus: [q.pred - q.lo], color: TIER_COLORS[q.tier] } });
    }
    plot($("p2a"), data, { margin: { t: 36, l: 50, r: 60, b: 40 }, title: `${w.id}: cases, rainfall and ${S.h}-week forecast`, legend: { orientation: "h", y: -0.15 },
      xaxis: grid, yaxis: { ...gy, title: "cases / week" }, yaxis2: { type: "linear", title: "rain mm", overlaying: "y", side: "right", showgrid: false },
      shapes: [{ type: "line", x0: origin, x1: origin, yref: "paper", y0: 0, y1: 1, line: { dash: "dash", color: "#94a3b8" } }],
      annotations: [{ x: origin, y: 1, yref: "paper", text: "warning issued", showarrow: false, yanchor: "bottom", font: { color: "#94a3b8" } }] });

    const c = Object.entries(row.contrib).sort((x, y) => x[1] - y[1]);
    plot($("p2b"), [{ type: "bar", orientation: "h", x: c.map(v => v[1]), y: c.map(v => v[0]), marker: { color: c.map(v => v[1] > 0 ? "#ef4444" : "#22c55e") } }],
      { title: "Main drivers of this forecast (cases/week vs. typical value)", margin: { t: 40, l: 160, r: 10, b: 40 }, xaxis: grid });
    const lags = [...Array(8).keys()].map(k => row.feats[`rain_lag${k}w`]);
    plot($("p2c"), [{ type: "bar", x: lags.map((_, k) => `t-${k}w`), y: lags, marker: { color: lags.map((_, k) => k < 4 ? "#38bdf8" : "#0ea5e9") } }],
      { title: "Vector breeding clock: weekly rainfall before the warning", yaxis: { ...gy, title: "mm" } });

    // temperature range + humidity (uses max_temp_c / min_temp_c when present)
    if (w.hasRange) plot($("p2d"), [
      { type: "scatter", x: xs, y: w.tmax.slice(a, b + 1), name: "Max °C", line: { color: "#e2762d", width: 1 } },
      { type: "scatter", x: xs, y: w.tmin.slice(a, b + 1), name: "Min °C", fill: "tonexty", fillcolor: "rgba(226,118,45,.18)", line: { color: "#3b82c4", width: 1 } },
      { type: "scatter", x: xs, y: w.temp.slice(a, b + 1), name: "Avg °C", line: { color: "#12212b", width: 2 } },
      { type: "scatter", x: xs, y: w.hum.slice(a, b + 1), name: "Humidity %", yaxis: "y2", line: { color: "#0b6e8a", dash: "dot" } }],
      { title: "Temperature range and humidity (mosquito activity)", legend: { orientation: "h", y: -0.2 }, margin: { t: 36, l: 50, r: 50, b: 40 },
        xaxis: grid, yaxis: { ...gy, title: "°C" }, yaxis2: { type: "linear", overlaying: "y", side: "right", showgrid: false, title: "%" } });
    else $("p2d").innerHTML = `<div class="info">Add max_temp_c and min_temp_c columns to see the temperature range.</div>`;
    // rain -> cases delay, high vs low water-logging wards (full history)
    if (S.lagFor !== S.wards) {
      const sw = S.wards.slice().sort((p, q) => p.wl - q.wl), h = sw.length >> 1;
      const corr = ws => [...Array(9).keys()].map(k => { let n = 0, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
        for (const x of ws) for (let i = k; i < x.cases.length; i++) { const u = x.rain[i - k], v = x.cases[i]; n++; sx += u; sy += v; sxx += u * u; syy += v * v; sxy += u * v; }
        return (n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy)); });
      S.lagFor = S.wards; S.lag = { hi: corr(sw.slice(h)), lo: corr(sw.slice(0, h)) };
    }
    const pk = S.lag.hi.indexOf(Math.max(...S.lag.hi)), lx = S.lag.hi.map((_, k) => `${k}w`);
    plot($("p2e"), [{ type: "scatter", mode: "lines+markers", x: lx, y: S.lag.hi, name: "High water-logging wards", line: { color: "#c8302f", width: 3 } },
      { type: "scatter", mode: "lines+markers", x: lx, y: S.lag.lo, name: "Low water-logging wards", line: { color: "#3b82c4", width: 3 } }],
      { title: `Cases follow rain by about ${pk} weeks (all history)`, legend: { orientation: "h", y: -0.2 }, xaxis: { ...grid, title: "weeks between rain and cases" }, yaxis: { ...gy, title: "correlation" } });
  }

  // ------------------------------------------------------------------ TAB 3
  function r3() {
    if (!rows.length) return;
    const row = rows.find(r => r.ward_id === $("w3").value) || rows[0], w = row.ward, origin = row.origin;
    const mult = +$("mult").value, dT = +$("dT").value, dH = +$("dH").value, win = $("win").value;
    $("mV").textContent = mult.toFixed(1); $("tV").textContent = dT; $("hV").textContent = dH;
    const base = HORIZONS.map(h => DW.forecast(w, origin, h));
    const scen = HORIZONS.map(h => DW.forecast(w, origin, h, DW.applyScenario(DW.originFeatures(w, w.idx.get(origin)), mult, dT, dH, win)));
    const xl = HORIZONS.map(h => `+${h}w`);
    plot($("p3"), [
      { type: "bar", x: xl, y: base.map(r => r.pred), name: "Baseline (actual weather)", marker: { color: "#64748b" } },
      { type: "bar", x: xl, y: scen.map(r => r.pred), name: "Scenario", marker: { color: "#22d3a5" },
        error_y: { type: "data", symmetric: false, array: scen.map(r => r.hi - r.pred), arrayminus: scen.map(r => r.pred - r.lo), color: "#12212b" } }],
      { barmode: "group", yaxis: { ...gy, title: "expected cases / week" }, margin: { t: 20, l: 50, r: 20, b: 40 } });
    $("m3").innerHTML = scen.map((s, i) => `<div class="metric"><div class="small">+${HORIZONS[i]} weeks</div><div class="v">${f1(s.pred)} <span class="small">cases/wk</span></div>
      <div class="small" style="color:${s.pred >= base[i].pred ? "#fb923c" : "#22c55e"}">${s.pred - base[i].pred >= 0 ? "+" : ""}${f1(s.pred - base[i].pred)} vs baseline</div>
      <div>${EMOJI[base[i].tier]} ${base[i].tier} → ${EMOJI[s.tier]} <b>${s.tier}</b></div></div>`).join("");
  }

  // ------------------------------------------------------------------ TAB 4 (static metrics from training run)
  function r4() {
    const X = window.METRICS, el = $("val");
    if (!X.horizons) { el.innerHTML = `<div class="info">Models were refit on all data, so no holdout remains.</div>`; return; }
    const H = X.horizons, hv = H[S.h], sp = X.split;
    el.innerHTML = `<p><b>Chronological split (never shuffled):</b> train <code>${sp.train}</code> → validation <code>${sp.validation}</code> (model selection, tier calibration) → test <code>${sp.test}</code>.
      Final model = refit on train+validation, scored once on the untouched test years.</p>
      <div class="grid2e"><div id="v1" class="plot" style="height:340px"></div><div id="v2" class="plot" style="height:340px"></div></div>
      <div class="metrics5">
        <div class="metric"><div class="small">R² (test)</div><div class="v">${hv.model.r2.toFixed(2)}</div></div>
        <div class="metric"><div class="small">80% interval coverage</div><div class="v">${(hv.interval_80_coverage * 100).toFixed(0)}%</div></div>
        <div class="metric"><div class="small">Tier accuracy</div><div class="v">${(hv.tier_accuracy * 100).toFixed(0)}%</div></div>
        <div class="metric"><div class="small">Within one tier</div><div class="v">${(hv.tier_within_one * 100).toFixed(0)}%</div></div>
        <div class="metric"><div class="small">High+ recall / precision</div><div class="v">${(hv.high_plus_recall * 100).toFixed(0)}% / ${(hv.high_plus_precision * 100).toFixed(0)}%</div></div></div>
      <div class="grid2e"><div id="v3" class="plot" style="height:360px"></div><div id="v4" class="plot" style="height:360px"></div></div>
      <div class="grid2e"><div id="v5" class="plot" style="height:340px"></div><div id="v6" class="plot" style="height:340px"></div></div>
      <div id="v7" class="plot" style="height:320px"></div>`;
    const models = [["model", "Gradient boosting (ours)", "#22d3a5"], ["ablation_no_weather", "Same, weather removed", "#a78bfa"],
      ["baseline_seasonal_ward_month", "Seasonal ward-month avg", "#facc15"], ["baseline_persistence", "Persistence (last week)", "#94a3b8"]];
    const hs = Object.keys(H);
    [["mae", "v1", "MAE"], ["rmse", "v2", "RMSE"]].forEach(([m, id, name]) =>
      plot($(id), models.map(([k, lab, col]) => ({ type: "bar", name: lab, x: hs.map(h => `+${h}w`), y: hs.map(h => H[h][k][m]), marker: { color: col } })),
        { barmode: "group", title: `Test-set ${name} (cases per ward-week, lower is better)`, legend: { orientation: "h", y: -0.2 }, yaxis: gy }));
    const mj = window.MONTHLY;
    plot($("v3"), [
      { x: mj.map(r => r.month), y: mj.map(r => r.hi), line: { width: 0 }, showlegend: false, type: "scatter" },
      { x: mj.map(r => r.month), y: mj.map(r => r.lo), fill: "tonexty", fillcolor: "rgba(34,211,165,.18)", line: { width: 0 }, name: "Σ 80% band", type: "scatter" },
      { x: mj.map(r => r.month), y: mj.map(r => r.actual), name: "Actual", line: { color: "#12212b", width: 3 }, type: "scatter" },
      { x: mj.map(r => r.month), y: mj.map(r => r.pred), name: "Predicted (+3w)", line: { color: "#22d3a5", width: 3, dash: "dash" }, type: "scatter" }],
      { title: "Held-out 2024-25: monthly total cases, all wards", xaxis: grid, yaxis: gy });
    plot($("v4"), [{ type: "heatmap", z: hv.confusion, x: TIERS, y: TIERS, colorscale: [[0, "#10241f"], [1, "#22d3a5"]], showscale: false,
      text: hv.confusion.map(r => r.map(String)), texttemplate: "%{text}", hovertemplate: "actual %{y}<br>predicted %{x}<br>%{z}<extra></extra>" }],
      { title: `Tier confusion matrix (+${S.h}w, test)`, xaxis: { title: "Predicted tier" }, yaxis: { title: "Actual tier", autorange: "reversed" } });
    const pg = Object.entries(X.perm_importance_groups_h3).sort((a, b) => a[1] - b[1]);
    plot($("v5"), [{ type: "bar", orientation: "h", x: pg.map(v => v[1]), y: pg.map(v => v[0]), marker: { color: "#22d3a5" } }],
      { title: "Global driver importance (MAE increase when shuffled, +3w)", margin: { t: 40, l: 160, r: 10, b: 40 }, xaxis: grid });
    const pr = Object.entries(X.perm_importance_rain_lags_h3);
    plot($("v6"), [{ type: "bar", x: pr.map(v => `t-${v[0][8]}w`), y: pr.map(v => v[1]), marker: { color: "#38bdf8" } }],
      { title: "Which rainfall lag matters? (single-lag shuffle, +3w)", yaxis: { ...gy, title: "MAE increase" } });
    const mw = Object.entries(hv.mae_by_ward).sort((a, b) => b[1] - a[1]).slice(0, 15);
    plot($("v7"), [{ type: "bar", x: mw.map(v => v[0]), y: mw.map(v => v[1]), marker: { color: "#fb923c" } }],
      { title: `Chronological validation error: 15 hardest wards (MAE, +${S.h}w, test)`, yaxis: gy });
  }

  // ------------------------------------------------------------------ TAB 5
  function r5() {
    const t = M.thresholds;
    $("how").innerHTML = `
      <h3 style="margin-top:0">ℹ️ How it works</h3>
      <p class="small">Dengue Guard looks at recent weather, recent cases and how vulnerable each ward is, and estimates how many dengue cases each ward is likely to see 2–4 weeks from now — early enough to clear breeding sites before an outbreak builds.</p>

      <div class="arch-section">
        <h4>From data to decision</h4>
        <div class="arch-diagram">
          <div class="arch-browser">
            <div class="arch-label">🌐 WHAT HAPPENS WHEN YOU OPEN A FORECAST</div>
            <div class="arch-grid">
              <div class="arch-node">📄 Ward records<br><span class="small">31,320 weekly records<br>60 wards · 2016–2025</span></div>
              <div class="arch-arrow">→</div>
              <div class="arch-node arch-center">⚙️ Forecast service<br><span class="small">Clean &amp; group data<br>Build weather-lag features<br>Predict cases per ward<br>Assign risk tier</span></div>
              <div class="arch-arrow">→</div>
              <div class="arch-node">🖥️ Dashboard<br><span class="small">Risk board<br>Ward deep-dive<br>What-if scenarios<br>Model validation</span></div>

              <div></div><div></div>
              <div class="arch-up"><div class="arch-arrow arch-arrow-up">↑</div><div class="arch-node">🌳 Trained models<br><span class="small">Decision-tree ensembles<br>9 models</span></div></div>
              <div></div>
              <div class="arch-up"><div class="arch-arrow arch-arrow-up">↑</div><div class="arch-node">📊 Validation results<br><span class="small">Test error &amp; alert accuracy<br>→ Model validation view</span></div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="arch-section">
        <h4>How the forecasting models are built <span class="small">(done in advance, before you open the dashboard)</span></h4>
        <div class="arch-flow">
          <div class="arch-step">📂 Historical records<br><span class="small">31,320 ward-weeks<br>60 wards · 2016–2025</span></div>
          <div class="arch-arrow-down">↓</div>
          <div class="arch-step">🔧 Feature engineering<br><span class="small">Rain lags 0–7w · Temp/Hum lags<br>Case trend · Ward vulnerability<br>Seasonality (sin/cos)</span></div>
          <div class="arch-arrow-down">↓</div>
          <div class="arch-step">✂️ Chronological split<br><span class="small">Train 2016–2022 · Val 2023 · <b>Test 2024–2025</b></span></div>
          <div class="arch-arrow-down">↓</div>
          <div class="arch-step">🌳 Gradient-boosted trees<br><span class="small">3 horizons (+2w / +3w / +4w)<br>× 3 outputs (mean · lo · hi)<br>= 9 models total</span></div>
          <div class="arch-arrow-down">↓</div>
          <div class="arch-step">📦 Packaged for the dashboard<br><span class="small">Models · records · accuracy results</span></div>
        </div>
      </div>

      <div class="arch-section">
        <h4>Feature Groups</h4>
        <table class="arch-table">
          <thead><tr><th>Group</th><th>What is measured</th><th>Window</th></tr></thead>
          <tbody>
            <tr><td>🌧️ Rainfall lags</td><td>Rain 0 to 7 weeks before the forecast origin</td><td>Week-by-week</td></tr>
            <tr><td>💧 Rainfall totals</td><td>2-, 4- and 8-week sums, plus weeks 4–7</td><td>Rolling totals</td></tr>
            <tr><td>🌡️ Temperature</td><td>0, 2 and 4 weeks back + 4-week mean</td><td>Lagged readings</td></tr>
            <tr><td>💦 Humidity</td><td>0, 2 and 4 weeks back + 4-week mean</td><td>Lagged readings</td></tr>
            <tr><td>📈 Case trend</td><td>Last 4 weeks of cases, 4-week mean, trend slope</td><td>Recent history</td></tr>
            <tr><td>🏘️ Ward vulnerability</td><td>Density, water-logging, sanitation, composite score</td><td>Fixed per ward</td></tr>
            <tr><td>📅 Seasonality</td><td>Time of year of the target week</td><td>Yearly cycle</td></tr>
          </tbody>
        </table>
      </div>

      <div class="arch-section">
        <h4>Chronological Validation Split</h4>
        <div class="arch-timeline">
          <div class="arch-tl-block" style="flex:7;background:#1e3a5f">
            <b>TRAIN</b><br><span class="small">2016–2022</span>
          </div>
          <div class="arch-tl-block" style="flex:1;background:#2d4a1e">
            <b>VAL</b><br><span class="small">2023</span>
          </div>
          <div class="arch-tl-block" style="flex:2;background:#4a1e1e">
            <b>TEST ← held-out</b><br><span class="small">2024–2025</span>
          </div>
        </div>
        <p class="small" style="margin-top:6px">Never shuffled. The model only ever sees past weeks when issuing a warning — matching real-world use.</p>
      </div>

      <div class="arch-section">
        <h4>Model Selection Rationale</h4>
        <table class="arch-table">
          <thead><tr><th>Factor</th><th>Choice</th><th>Reason</th></tr></thead>
          <tbody>
            <tr><td>Algorithm</td><td>Histogram gradient-boosted trees</td><td>Handles tabular lag data; no scaling needed; fast</td></tr>
            <tr><td>Loss (mean)</td><td>Poisson deviance</td><td>Counts are non-negative &amp; over-dispersed</td></tr>
            <tr><td>Loss (intervals)</td><td>Pinball at 10% / 90%</td><td>Calibrated 80% prediction bands</td></tr>
            <tr><td>Horizons</td><td>Direct (+2w, +3w, +4w)</td><td>No error compounding vs. step-by-step forecasting</td></tr>
            <tr><td>Risk tiers</td><td>Calibrated on 2023 validation</td><td>Thresholds match the validation distribution</td></tr>
          </tbody>
        </table>
      </div>

      <div class="arch-section">
        <h4>⚡ Speed &amp; Efficiency</h4>
        <ul>
          <li><b>No external API calls</b> — forecasts are computed from the stored tree models on your own device</li>
          <li><b>No AI-assistant calls</b> — no chatbot or language model is involved in the prediction</li>
          <li><b>No server computing</b> — adding more users adds no load</li>
          <li><b>&lt; 50 ms</b> — a full 60-ward forecast for one origin week on a mid-range laptop</li>
          <li><b>Efficient charts</b> — only changed chart elements are redrawn</li>
        </ul>
      </div>

      <p><b>Pipeline summary:</b> <code>weekly weather + ward data → grouped multi-week lags → 3 direct models (+2/+3/+4 wk) → risk tiers → dashboard</code></p>
      <ul>
        <li><b>Risk tiers</b> (expected cases/ward/week): Low &lt; ${f1(t[0])} ≤ Medium &lt; ${f1(t[1])} ≤ High &lt; ${f1(t[2])} ≤ Critical — calibrated on 2023 validation.</li>
        <li><b>Driver breakdown:</b> each factor group is replaced by its typical value; the drop in the forecast is its contribution.</li>
        <li><b>Private by design:</b> no account, no server, no external service — your data stays on your device.</li>
      </ul>`;
  }

  // ------------------------------------------------------------------ TAB 6 (architecture)
  function r6() {
    const box = (x, y, w, h, t, s, col) => `<rect class="box" x="${x}" y="${y}" width="${w}" height="${h}" rx="9" ${col ? `style="stroke:${col}"` : ""}/>
      <text class="t" x="${x + w / 2}" y="${y + 20}" text-anchor="middle">${t}</text>` +
      s.map((l, i) => `<text class="s" x="${x + w / 2}" y="${y + 37 + i * 14}" text-anchor="middle">${l}</text>`).join("");
    const badge = (x, y, n, c) => `<circle cx="${x}" cy="${y}" r="11" fill="${c}"/><text class="num" x="${x}" y="${y + 4}" text-anchor="middle">${n}</text>`;
    const U = "#f472b6", P = "#38bdf8", A = "#22d3a5", D = "#facc15", B = "#a78bfa";
    const lane = (y, h, c, label) => `<rect class="lane" x="10" y="${y}" width="980" height="${h}" rx="14" stroke="${c}"/><text class="h" x="26" y="${y + 22}" style="fill:${c}">${label}</text>`;
    const tabW = 176, tabX = i => 28 + i * 191;
    const cx = [28, 348, 668];
    $("archx").innerHTML = `
      <h3 style="margin-top:0">🏗️ Architecture</h3>
      <p class="small">Dengue Guard is a layered web application. Health teams work in an interactive <b>dashboard</b>; a <b>forecast service</b> turns weather history, recent cases and ward vulnerability into a risk level for every ward 2–4 weeks ahead; and a <b>data &amp; model layer</b> supplies versioned, read-only assets prepared in advance. The diagram follows one request from a click to a chart — numbered badges match the table below it.</p>
      <svg class="ax-svg" viewBox="0 0 1000 990" role="img" aria-label="Dengue Guard layered architecture diagram">
        <defs>
          <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#38bdf8"/></marker>
          <marker id="ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#22d3a5"/></marker>
          <marker id="ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#fb923c"/></marker>
        </defs>

        <!-- USERS -->
        ${lane(10, 100, U, "USERS · public-health teams on any device")}
        ${box(28, 42, 218, 54, "District health officer", ["Plans field response per ward"], U)}
        ${box(270, 42, 218, 54, "City corporation planner", ["Compares wards, plans clean-ups"], U)}
        ${box(512, 42, 218, 54, "Analyst / researcher", ["Tests scenarios, checks accuracy"], U)}
        ${box(754, 42, 218, 54, "Data manager", ["Adds the latest ward records"], U)}
        <path class="ln" d="M250 112V138"/><path class="ln" d="M750 138V112"/>
        <text class="s" x="260" y="130">choices, sliders, uploads</text><text class="s" x="760" y="130">forecasts, charts, reports</text>

        <!-- PRESENTATION -->
        ${lane(140, 190, P, "PRESENTATION LAYER · interactive dashboard in the browser")}
        ${box(tabX(0), 176, tabW, 74, "🗺️ Risk board", ["Ranked wards, KPIs,", "risk treemap, heatmap"], P)}
        ${box(tabX(1), 176, tabW, 74, "🔎 Ward deep-dive", ["History + forecast", "with 80% range"], P)}
        ${box(tabX(2), 176, tabW, 74, "🎛️ What-if scenarios", ["Rainfall, heat and", "humidity sliders"], P)}
        ${box(tabX(3), 176, tabW, 74, "📊 Model validation", ["Accuracy on held-out", "2024–25 weeks"], P)}
        ${box(tabX(4), 176, tabW, 74, "ℹ️ Guide &amp; design", ["How it works and", "this architecture"], P)}
        ${box(28, 262, 300, 56, "Control panel", ["City · origin week · horizon · ward"], P)}
        ${box(350, 262, 300, 56, "Interactive charts &amp; tables", ["Only the visible view is redrawn"], P)}
        ${box(672, 262, 300, 56, "Report export", ["Download the current forecast"], P)}
        ${badge(28, 262, 1, P)}${badge(350, 262, 9, P)}
        <path class="ln" d="M250 332V358"/><path class="ln" d="M750 358V332"/>
        <text class="s" x="260" y="350">user actions &amp; settings</text><text class="s" x="760" y="350">results to render</text>

        <!-- APPLICATION -->
        ${lane(360, 310, A, "APPLICATION LAYER · forecast service running on the user's device")}
        ${box(cx[0], 398, 290, 70, "Data intake &amp; validation", ["Checks required columns; accepts the", "built-in records or an uploaded file"], A)}
        ${box(cx[1], 398, 290, 70, "Ward preparation", ["Groups by ward, sorts by week,", "fills short gaps (up to 2 weeks)"], A)}
        ${box(cx[2], 398, 290, 70, "Feature builder", ["Weather lags, rolling totals, case trend,", "ward vulnerability, season of target week"], A)}
        ${box(cx[0], 500, 290, 70, "Prediction engine", ["Walks 9 tree ensembles: expected cases", "+ 80% range for +2 / +3 / +4 weeks"], A)}
        ${box(cx[1], 500, 290, 70, "Risk classifier", ["Expected cases → Low / Medium /", "High / Critical + recommended action"], A)}
        ${box(cx[2], 500, 290, 70, "Driver explainer", ["Shows what pushes risk up: rainfall,", "temperature, humidity, trend, season"], A)}
        ${box(28, 592, 290, 56, "Scenario simulator", ["Scales rain, shifts heat &amp; humidity, re-predicts"], A)}
        ${box(348, 592, 290, 56, "Session state", ["City · week · horizon · ward · scenario"], A)}
        ${box(668, 592, 290, 56, "Result packaging", ["Tables, charts and summaries for the UI"], A)}
        <path class="ln2" d="M318 433H346"/><path class="ln2" d="M638 433H666"/>
        <path class="ln2" d="M813 468V484H173V498"/>
        <path class="ln2" d="M318 535H346"/><path class="ln2" d="M638 535H666"/>
        <path class="ln2" d="M813 570V590"/><path class="ln2" d="M173 592V572"/>
        <path class="ln" d="M346 620H320"/><path class="ln" d="M638 620H666"/>
        ${badge(28, 398, 2, A)}${badge(348, 398, 3, A)}${badge(668, 398, 4, A)}${badge(28, 500, 5, A)}${badge(348, 500, 6, A)}${badge(668, 500, 7, A)}${badge(668, 592, 8, A)}${badge(28, 592, "W", A)}

        <!-- DATA & MODEL -->
        ${lane(700, 125, D, "DATA &amp; MODEL LAYER · versioned, read-only assets")}
        ${box(28, 736, 218, 74, "Historical ward records", ["31,320 weekly records", "60 wards · 2016–2025"], D)}
        ${box(270, 736, 218, 74, "Trained forecast models", ["9 tree ensembles", "3 horizons × mean / low / high"], D)}
        ${box(512, 736, 218, 74, "Validation results", ["Error, accuracy, alert hit-rate", "on held-out 2024–25"], D)}
        ${box(754, 736, 218, 74, "Risk thresholds", ["Low / Medium / High / Critical", "calibrated on 2023"], D)}
        <path class="ln3" d="M137 700V672"/><path class="ln3" d="M379 700V672"/><path class="ln3" d="M621 700V672"/><path class="ln3" d="M863 700V672"/>
        <text class="s" x="146" y="692">records</text><text class="s" x="388" y="692">models</text><text class="s" x="630" y="692">metrics</text><text class="s" x="872" y="692">thresholds</text>

        <!-- BUILD & DELIVERY -->
        ${lane(855, 125, B, "BUILD &amp; DELIVERY · prepared before users arrive")}
        ${box(28, 892, 170, 74, "Source data", ["Weekly cases, weather,", "ward vulnerability"], B)}
        ${box(218, 892, 170, 74, "Model training", ["Lagged weather features", "9 boosted-tree models"], B)}
        ${box(408, 892, 170, 74, "Evaluation", ["Train 2016–22 · Val 2023", "Test 2024–25 held out"], B)}
        ${box(598, 892, 170, 74, "Release package", ["Records, models, metrics", "and thresholds bundled"], B)}
        ${box(788, 892, 170, 74, "Static hosting + CDN", ["Served once, then", "cached by the browser"], B)}
        <path class="ln" d="M198 929H216"/><path class="ln" d="M388 929H406"/><path class="ln" d="M578 929H596"/><path class="ln" d="M768 929H786"/>
        <path class="ln3" d="M900 855V827"/><text class="s" x="890" y="846" text-anchor="end">published to the data layer</text>
      </svg>
      <div class="ax-legend">
        <span><i style="border-color:#38bdf8"></i>user actions and results</span>
        <span><i style="border-color:#22d3a5"></i>forecast pipeline</span>
        <span><i style="border-color:#fb923c;border-top-style:dashed"></i>data &amp; model assets loaded on demand</span>
        <span><i style="border-color:#a78bfa"></i>build &amp; delivery</span>
      </div>

      <h4 style="margin:22px 0 6px">Layers at a glance</h4>
      <table class="arch-table">
        <thead><tr><th>Layer</th><th>Responsibility</th><th>Main components</th></tr></thead>
        <tbody>
          <tr><td>Users</td><td>Decide where to send inspection and clean-up teams, and how early</td><td>Health officers, planners, analysts, data managers</td></tr>
          <tr><td>Presentation</td><td>Collect choices, show ranked risk, trends, scenarios and accuracy</td><td>Five dashboard views, control panel, charts, report export</td></tr>
          <tr><td>Application</td><td>Prepare data, build features, predict, classify and explain</td><td>Intake, ward preparation, feature builder, prediction engine, risk classifier, explainer, scenario simulator</td></tr>
          <tr><td>Data &amp; model</td><td>Hold the facts the forecast depends on, unchanged during a session</td><td>Ward records, trained models, validation results, risk thresholds</td></tr>
          <tr><td>Build &amp; delivery</td><td>Train, test, package and publish a new release</td><td>Training run, held-out evaluation, release package, static hosting with CDN</td></tr>
        </tbody>
      </table>

      <h4 style="margin:22px 0 6px">Life of a request — from click to chart</h4>
      <table class="arch-table">
        <thead><tr><th>#</th><th>Step</th><th>What happens</th></tr></thead>
        <tbody>
          <tr><td>1</td><td>User action</td><td>An officer picks a city, an origin week and a horizon (+2, +3 or +4 weeks), or drags a what-if slider. The session state is updated.</td></tr>
          <tr><td>2</td><td>Intake &amp; validation</td><td>The built-in weekly records — or a newly uploaded spreadsheet — are checked for the required columns and sensible values.</td></tr>
          <tr><td>3</td><td>Ward preparation</td><td>Rows are grouped per ward and sorted by week; gaps of up to 2 weeks are filled, otherwise the typical value is used.</td></tr>
          <tr><td>4</td><td>Feature building</td><td>For each ward, only data up to the origin week is used: rainfall lags 0–7 weeks, rolling totals, temperature and humidity lags, recent case trend, vulnerability and the season of the target week.</td></tr>
          <tr><td>5</td><td>Prediction</td><td>Three trained models (expected, low, high) for the chosen horizon are evaluated for all 60 wards, giving expected cases and an 80% range — typically in under 50 ms.</td></tr>
          <tr><td>6</td><td>Risk classification</td><td>Expected cases are compared with thresholds calibrated on 2023 data to give Low, Medium, High or Critical, each with a recommended action.</td></tr>
          <tr><td>7</td><td>Explanation</td><td>Each factor group (rainfall, temperature, humidity, case trend, vulnerability, season) is swapped for its typical value; the drop in forecast is that factor's contribution.</td></tr>
          <tr><td>W</td><td>What-if branch</td><td>On the What-if view, past rainfall is scaled and heat/humidity shifted, totals are recomputed and steps 4–7 re-run instantly for the chosen ward.</td></tr>
          <tr><td>8</td><td>Result packaging</td><td>Rankings, KPIs, tier counts, forecast bands and driver breakdowns are assembled for the views.</td></tr>
          <tr><td>9</td><td>Rendering</td><td>Only the visible view is redrawn; charts update in place, and the current forecast can be exported as a report.</td></tr>
        </tbody>
      </table>

      <h4 style="margin:22px 0 6px">Technology stack</h4>
      <table class="arch-table">
        <thead><tr><th>Concern</th><th>Choice</th><th>Why</th></tr></thead>
        <tbody>
          <tr><td>User interface</td><td>Responsive single-page web app with tabbed views</td><td>No installation; works on laptops, tablets and phones</td></tr>
          <tr><td>Charts</td><td>Interactive charting library, bundled with the app</td><td>Hover, zoom and heatmaps without external services</td></tr>
          <tr><td>Forecast model</td><td>Gradient-boosted decision trees: Poisson mean, 10% / 90% quantile bands</td><td>Suits count data and lagged tabular features; gives calibrated ranges</td></tr>
          <tr><td>Horizons</td><td>Separate model per horizon (+2, +3, +4 weeks)</td><td>Avoids error compounding from step-by-step forecasting</td></tr>
          <tr><td>Hosting</td><td>Static hosting behind a CDN</td><td>Cheap, fast and globally cacheable; no database or application server to run</td></tr>
        </tbody>
      </table>

      <h4 style="margin:22px 0 6px">Quality attributes</h4>
      <table class="arch-table">
        <thead><tr><th>Attribute</th><th>How the architecture delivers it</th></tr></thead>
        <tbody>
          <tr><td>Performance</td><td>Heavy learning is done once during build; at run time the service only looks up tree values, so a full 60-ward forecast takes well under 50 ms.</td></tr>
          <tr><td>Scalability</td><td>Each user's device does its own computing, so more users add no server load — the CDN simply serves the same files.</td></tr>
          <tr><td>Privacy &amp; security</td><td>No accounts, no credentials, no third-party calls. Uploaded ward records stay on the user's device and are never transmitted.</td></tr>
          <tr><td>Reliability</td><td>No backend, database or external API to fail. Once loaded, the dashboard keeps working through network drops.</td></tr>
          <tr><td>Trustworthy accuracy</td><td>Chronological train / validation / test split, never shuffled; results shown on the Model validation view are from weeks the models never saw.</td></tr>
          <tr><td>Explainability</td><td>Every forecast comes with an 80% range, a risk tier, a recommended action and a driver breakdown.</td></tr>
          <tr><td>Maintainability</td><td>Retraining produces a new release package; the interface and forecast service stay unchanged.</td></tr>
        </tbody>
      </table>`;
  }

  // ------------------------------------------------------------------ wiring
  function boot() {
    for (const h of HORIZONS) { const b = document.createElement("button"); b.textContent = `${h} wks`; b.dataset.h = h; $("hSeg").appendChild(b); }
    const syncSeg = () => $("hSeg").querySelectorAll("button").forEach(b => b.classList.toggle("on", +b.dataset.h === S.h));
    $("hSeg").onclick = e => { if (e.target.dataset.h) { S.h = +e.target.dataset.h; syncSeg(); recompute(); r4(); } };
    $("city").onchange = e => { S.city = e.target.value; recompute(); };
    $("origin").oninput = e => { S.oi = +e.target.value; recompute(); };
    $("w2").onchange = r2; $("w3").onchange = r3;
    ["mult", "dT", "dH", "win"].forEach(id => $(id).oninput = r3);
    $("tabs").onclick = e => {
      const t = e.target.dataset.t; if (!t) return;
      $("tabs").querySelectorAll("button").forEach(b => b.classList.toggle("on", b === e.target));
      document.querySelectorAll(".pane").forEach(p => p.hidden = p.id !== t);
      setTimeout(() => { window.dispatchEvent(new Event("resize")); renderAll(); if (t === "t4") r4(); }, 0);
    };
    $("upload").onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try {
        const wards = DW.buildWards(DW.parseCSV(await f.text()));
        if (!wards.length || DW.originsOf(wards).length < 1) throw new Error("need at least 8 weeks of data per ward");
        window.__defaultData = false; setData(wards); $("uploadMsg").textContent = `✅ Loaded ${f.name}`; syncSeg(); recompute();
      } catch (err) { $("uploadMsg").textContent = "⚠️ Could not read file: " + err.message; }
    };
    window.__defaultData = true;
    setData(DW.buildWards(DW.parseCSV(window.DATASET_CSV)));
    syncSeg(); r5(); r6(); recompute();
    $("loading").hidden = true; $("app").hidden = false;
    window.dispatchEvent(new Event("resize")); renderAll();
  }
  window.addEventListener("load", () => setTimeout(boot, 30));
})();
