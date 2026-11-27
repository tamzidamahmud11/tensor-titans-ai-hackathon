(function () {
  const { HORIZONS, TIERS, TIER_COLORS, ACTIONS, GROUPS, M } = DW;
  const EMOJI = Object.fromEntries(Object.entries(TIER_COLORS).map(([k, c]) => [k, `<span class="dot" style="--c:${c}"></span>`]));
  const $ = id => document.getElementById(id);

  // Bilingual helpers
  const isBn = () => (window.DG_I18N ? window.DG_I18N.isBn() : localStorage.getItem("dg_lang") === "bn");
  const T = (en, bn) => (isBn() ? bn : en);
  const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  const D = s => isBn() ? String(s).replace(/[0-9]/g, c => BN_DIGITS[+c]) : String(s);

  const TIER_BN = { Low: "নিম্ন", Medium: "মাঝারি", High: "উচ্চ", Critical: "সংকটজনক" };
  const tierLabel = t => isBn() ? (TIER_BN[t] || t) : t;

  const ACTION_BN = {
    Low: "নিয়মিত নজরদারি। সাপ্তাহিক লার্ভা পরীক্ষা এবং কমিউনিটি সচেতনতা চালু রাখুন।",
    Medium: "এই ওয়ার্ডে লার্ভিসাইড মজুত রাখুন এবং ড্রেন পরিষ্কার করুন; ক্লিনিকগুলোকে কেস সংজ্ঞা দিন।",
    High: "৭ দিনের মধ্যে লার্ভিসাইড ও ফগিং দল মোতায়েন করুন; শয্যা, স্যালাইন ও NS1/IgM টেস্ট কিট সংরক্ষণ করুন।",
    Critical: "জরুরি প্রতিক্রিয়া: এখনই বাড়ি বাড়ি গিয়ে উৎস হ্রাস, অতিরিক্ত শয্যা ও স্যালাইন, দৈনিক কেস রিপোর্টিং।"
  };
  const actionLabel = t => isBn() ? (ACTION_BN[t] || ACTIONS[t]) : ACTIONS[t];

  const GROUP_BN = {
    "Rainfall lags (1-8 wk)": "বৃষ্টিপাতের বিলম্ব (১–৮ সপ্তাহ)",
    "Temperature": "তাপমাত্রা",
    "Humidity": "আর্দ্রতা",
    "Recent case trend": "সাম্প্রতিক রোগীর প্রবণতা",
    "Ward vulnerability": "ওয়ার্ডের ঝুঁকিপ্রবণতা",
    "Seasonality": "মৌসুমি প্রভাব",
    "Nothing notable": "উল্লেখযোগ্য কিছু নেই"
  };
  const groupLabel = g => isBn() ? (GROUP_BN[g] || g) : g;

  const CITY_BN = {
    "All cities": "সব শহর",
    "Chattogram": "চট্টগ্রাম",
    "Dhaka North": "ঢাকা উত্তর",
    "Dhaka South": "ঢাকা দক্ষিণ",
    "Gazipur": "গাজীপুর",
    "Khulna": "খুলনা",
    "Narayanganj": "নারায়ণগঞ্জ",
    "Rajshahi": "রাজশাহী"
  };
  const cityLabel = c => isBn() ? (CITY_BN[c] || c) : c;
  const wardLabel = w => isBn() ? D(String(w).replace(/_Ward_/i, " ওয়ার্ড ")) : String(w);

  const fmtDate = s => new Date(s + "T00:00:00Z").toLocaleDateString(isBn() ? "bn-BD" : "en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
  const f1 = v => v.toFixed(1);
  const f1d = v => D(v.toFixed(1));

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
  function updateCitySelect(keepVal) {
    const cities = [...new Set(S.wards.map(w => w.city))].sort();
    const list = ["All cities", ...cities];
    const prev = keepVal ? S.city : "All cities";
    $("city").innerHTML = list.map(c => `<option value="${c}">${cityLabel(c)}</option>`).join("");
    S.city = list.includes(prev) ? prev : "All cities";
    $("city").value = S.city;
  }

  function updateDataLabel() {
    if (!S.wards.length) return;
    const totalRows = S.wards.reduce((a, w) => a + w.dates.length, 0);
    $("dataLbl").textContent = isBn()
      ? `মডেল প্রশিক্ষিত ${D(M.trained_through)} পর্যন্ত · ${D(totalRows.toLocaleString())}টি সারি · ${D(S.wards.length)}টি ওয়ার্ড`
      : `Model trained through ${M.trained_through} · ${totalRows.toLocaleString()} rows · ${S.wards.length} wards`;
  }

  function setData(wards, keepSettings) {
    S.wards = wards; S.origins = DW.originsOf(wards);
    updateCitySelect(false);
    $("origin").max = S.origins.length - 1;
    let best = -1, bi = S.origins.length - 1;
    for (let i = Math.max(0, S.origins.length - 60); i < S.origins.length; i++) {
      let s = 0; for (const w of wards) { const r = DW.forecast(w, S.origins[i], 3); if (r) s += r.pred; }
      if (s > best) { best = s; bi = i; }
    }
    S.oi = bi; $("origin").value = bi;
    updateDataLabel();
  }

  // ------------------------------------------------------------------ recompute for current selection
  function recompute() {
    if (!S.wards.length) return;
    const origin = S.origins[S.oi];
    allRows = S.wards.map(w => DW.forecast(w, origin, S.h)).filter(Boolean);
    rows = S.city === "All cities" ? allRows : allRows.filter(r => r.city === S.city);
    for (const r of rows) { r.contrib = DW.contributions(r.feats, S.h); r.driver = DW.topDriver(r.contrib); }
    const target = DW.addDays(origin, 7 * S.h);
    $("originLbl").textContent = fmtDate(origin);
    $("targetLbl").innerHTML = T(`Forecast target week: <b>${fmtDate(target)}</b>`, `পূর্বাভাসের লক্ষ্য সপ্তাহ: <b>${fmtDate(target)}</b>`);
    const held = target > "2023-12-31" && !M.full_refit && S.wards.length === 60 && window.__defaultData;
    $("heldOut").textContent = held
      ? T("✅ Target week is in the held-out test period (model never saw it).", "✅ লক্ষ্য সপ্তাহটি অদেখা পরীক্ষার সময়ের মধ্যে (মডেল এটি কখনো দেখেনি)।")
      : T("ℹ️ This week was inside the training window, so accuracy here is optimistic. See Model validation.", "ℹ️ এই সপ্তাহটি প্রশিক্ষণ সময়কালের ভেতরে ছিল, তাই নির্ভুলতা আশাবাদী হতে পারে। মডেল যাচাইকরণ দেখুন।");
    const uniqueCities = [...new Set(S.wards.map(w => w.city))].map(cityLabel).join(" · ");
    $("heroSub").textContent = isBn()
      ? `আবহাওয়ার বিলম্ব + ওয়ার্ডের ঝুঁকিপ্রবণতা → ${D(S.h)} সপ্তাহ আগের প্রাদুর্ভাব ঝুঁকি · ${uniqueCities}`
      : `Weather lags + ward vulnerability → outbreak risk ${S.h} weeks ahead · ${uniqueCities}`;
    const wardOpts = rows.map(r => `<option value="${r.ward_id}">${wardLabel(r.ward_id)}</option>`).join("");
    for (const id of ["w2", "w3"]) { const cur = $(id).value; $(id).innerHTML = wardOpts; if (rows.some(r => r.ward_id === cur)) $(id).value = cur; }
    window.DG_STATE = { origin, h: S.h, city: S.city, rows, allRows, wards: S.wards };   // Phase 2 operations tabs read this
    renderAll();
    window.dispatchEvent(new Event("dg:recompute"));
  }
  function activeTab() {
    const btn = document.querySelector("#tabs button.on");
    return (btn && btn.dataset.t) || "t1";
  }
  function renderAll() {
    const t = activeTab();
    if (t === "t1") r1();
    else if (t === "t2") r2();
    else if (t === "t3") r3();
    else if (t === "t4") r4();
  }

  // ------------------------------------------------------------------ TAB 1
  function r1() {
    const t = M.thresholds, origin = S.origins[S.oi];
    if (!rows.length) { $("kpis").innerHTML = ""; $("alert").innerHTML = `<div class="box err">${T("No data for this selection.", "এই নির্বাচনের জন্য কোনো ডেটা নেই।")}</div>`; return; }
    const cnt = Object.fromEntries(TIERS.map(x => [x, 0])); rows.forEach(r => cnt[r.tier]++);
    const total = rows.reduce((a, r) => a + r.pred, 0);
    $("kpis").innerHTML = [...TIERS].reverse().map(x => `<div class="kpi" style="--c:${TIER_COLORS[x]}"><div class="n">${D(cnt[x])}</div><div class="l">${EMOJI[x]} ${isBn() ? `<b>${tierLabel(x)}</b> ঝুঁকির ওয়ার্ড` : `wards at <b>${x}</b> risk`}</div></div>`).join("")
      + `<div class="kpi" style="--c:#38bdf8"><div class="n">${D(total.toFixed(0))}</div><div class="l">${T("expected cases / week (selection)", "সম্ভাব্য রোগী / সপ্তাহ (নির্বাচিত)")}</div></div>`;
    $("tierbar").innerHTML = TIERS.map(x => cnt[x] ? `<i style="width:${100 * cnt[x] / rows.length}%;background:${TIER_COLORS[x]}" title="${tierLabel(x)}: ${D(cnt[x])}"></i>` : "").join("");
    $("tierlbl").textContent = TIERS.map(x => `${tierLabel(x)} ${D(cnt[x])}`).join("  |  ") + (isBn() ? `  (${D(rows.length)}টি ওয়ার্ড)` : `  (${rows.length} wards)`);
    const urgent = rows.filter(r => r.tier === "High" || r.tier === "Critical").sort((a, b) => b.pred - a.pred);
    $("alert").innerHTML = urgent.length
      ? `<div class="box err"><b>${isBn() ? `আগামী ${D(S.h)} সপ্তাহের মধ্যে ${D(urgent.length)}টি ওয়ার্ডে পদক্ষেপ প্রয়োজন:` : `${urgent.length} ward(s) need action within the next ${S.h} weeks:`}</b> ${urgent.slice(0, 8).map(r => `${wardLabel(r.ward_id)} (${tierLabel(r.tier)})`).join(", ")}${urgent.length > 8 ? " …" : ""}</div>`
      : `<div class="box ok">${T("No High/Critical wards for this week and window.", "এই সপ্তাহ ও সময়সীমায় কোনো উচ্চ/সংকটজনক ওয়ার্ড নেই।")}</div>`;

    window.DG_CONTEXT = `City: ${S.city}; warning week: ${origin}; window: +${S.h} weeks; wards by tier: ${TIERS.map(x => x + " " + cnt[x]).join(", ")}.`;

    const nTeams = Math.max(1, Math.min(rows.length, parseInt($("teams").value, 10) || 1));
    const ranked = rows.slice().sort((a, b) => b.pred - a.pred);
    const picked = ranked.slice(0, nTeams);
    const share = total > 0 ? 100 * picked.reduce((s, r) => s + r.pred, 0) / total : 0;
    $("planOut").innerHTML = (isBn()
      ? `<p>শীর্ষ ${D(nTeams)}টি ওয়ার্ডে <b>${D(nTeams)}</b>টি দল পাঠালে এই নির্বাচনের মোট সম্ভাব্য রোগীর প্রায় <b>${D(share.toFixed(0))}%</b> কভার হবে।</p>`
      : `<p><b>${nTeams}</b> team(s) sent to the top ${nTeams} ward(s) cover about <b>${share.toFixed(0)}%</b> of expected cases in this selection.</p>`)
      + `<ol>${picked.map(r => isBn()
        ? `<li>${wardLabel(r.ward_id)} (${cityLabel(r.city)}): ${tierLabel(r.tier)}, ~${f1d(r.pred)} রোগী/সপ্তাহ। প্রধান কারণ: ${groupLabel(r.driver)}</li>`
        : `<li>${r.ward_id} (${r.city}): ${r.tier}, ~${f1(r.pred)} cases/wk. Main driver: ${r.driver}</li>`).join("")}</ol>`;
    $("teams").oninput = () => r1();

    // table
    const k = S.sortKey, d = S.sortDir;
    const sorted = rows.slice().sort((a, b) => {
      const va = k === "tier" ? TIERS.indexOf(a.tier) : a[k], vb = k === "tier" ? TIERS.indexOf(b.tier) : b[k];
      return (va < vb ? -1 : va > vb ? 1 : 0) * d;
    });
    const mx = Math.max(20, ...rows.map(r => r.pred));
    const th = (key, label) => `<th data-k="${key}">${label}${S.sortKey === key ? (S.sortDir > 0 ? " ▲" : " ▼") : ""}</th>`;
    $("tbl").innerHTML = `<thead><tr>${th("ward_id", T("Ward", "ওয়ার্ড"))}${th("city", T("City", "শহর"))}${th("tier", T("Risk", "ঝুঁকি"))}${th("pred", T("Expected cases/wk", "সম্ভাব্য রোগী/সপ্তাহ"))}<th>${T("80% range", "৮০% সীমা")}</th>${th("driver", T("Main driver", "প্রধান কারণ"))}</tr></thead><tbody>` +
      sorted.map(r => `<tr><td>${wardLabel(r.ward_id)}</td><td>${cityLabel(r.city)}</td><td>${EMOJI[r.tier]} ${tierLabel(r.tier)}</td>
        <td><span class="bar" style="width:${Math.round(60 * r.pred / mx)}px"></span>${f1d(r.pred)}</td><td>${f1d(r.lo)} – ${f1d(r.hi)}</td><td>${groupLabel(r.driver)}</td></tr>`).join("") + "</tbody>";
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
    const rootLabel = T("All wards", "সব ওয়ার্ড");
    const ids = ["All wards", ...cities.map(c => "c:" + c), ...rows.map(r => "w:" + r.ward_id)];
    const labels = [rootLabel, ...cities.map(cityLabel), ...rows.map(r => wardLabel(r.ward_id))];
    const parents = ["", ...cities.map(() => "All wards"), ...rows.map(r => "c:" + r.city)];
    const cv = cities.map(c => rows.filter(r => r.city === c).reduce((a, r) => a + r.dens, 0));
    const values = [cv.reduce((a, b) => a + b, 0), ...cv, ...rows.map(r => r.dens)];
    const colors = ["#c5d0d8", ...cities.map(() => "#c5d0d8"), ...rows.map(r => TIER_COLORS[r.tier])];
    const custom = [["", ""], ...cities.map(() => ["", ""]), ...rows.map(r => [tierLabel(r.tier), f1d(r.pred)])];
    plot($("treemap"), [{ type: "treemap", ids, labels, parents, values, branchvalues: "total", marker: { colors, line: { width: 2, color: "#ffffff" } },
      customdata: custom, hovertemplate: T("%{label}<br>%{customdata[0]} · %{customdata[1]} cases/wk<extra></extra>", "%{label}<br>%{customdata[0]} · %{customdata[1]} রোগী/সপ্তাহ<extra></extra>"), textfont: { color: "#12212b" } }],
      { margin: { t: 10, l: 0, r: 0, b: 0 } });

    // heatmap
    $("hmTitle").textContent = isBn()
      ? `ওয়ার্ড × সপ্তাহ হিটম্যাপ — ${D(S.h)}-সপ্তাহ সময়সীমায় সম্ভাব্য রোগী (শেষ ২৬টি সতর্কতা)`
      : `Ward × week heatmap — predicted cases at a ${S.h}-week horizon (last 26 warnings)`;
    const lo = Math.max(0, S.oi - 25), os = S.origins.slice(lo, S.oi + 1), ws = rows.map(r => r.ward);
    const z = ws.map(w => os.map(o => { const r = DW.forecast(w, o, S.h); return r ? r.pred : null; }));
    const zmax = Math.max(t[2] * 1.2, ...z.flat().filter(v => v !== null));
    const stops = [0, t[0] / zmax, t[0] / zmax, t[1] / zmax, t[1] / zmax, t[2] / zmax, t[2] / zmax, 1];
    const cs = stops.map((s, i) => [s, TIER_COLORS[TIERS[i >> 1]]]);
    plot($("heatmap"), [{ type: "heatmap", z, x: os.map(fmtDate), y: ws.map(w => wardLabel(w.id)), colorscale: cs, zmin: 0, zmax,
      colorbar: { title: T("cases/wk", "রোগী/সপ্তাহ") },
      hovertemplate: T("%{y}<br>warning %{x}<br>%{z:.1f} cases/wk<extra></extra>", "%{y}<br>সতর্কতা %{x}<br>%{z:.1f} রোগী/সপ্তাহ<extra></extra>") }],
      { height: Math.max(320, 14 * ws.length + 80), margin: { t: 10, l: 100, r: 10, b: 60 }, yaxis: { autorange: "reversed", type: "category" } });
    $("hmCap").textContent = isBn()
      ? `রঙের ব্যান্ড = ঝুঁকির স্তর: নিম্ন < ${f1d(t[0])} ≤ মাঝারি < ${f1d(t[1])} ≤ উচ্চ < ${f1d(t[2])} ≤ সংকটজনক (প্রতি ওয়ার্ডে সাপ্তাহিক সম্ভাব্য রোগী)।`
      : `Colour bands = risk tiers: Low < ${f1(t[0])} ≤ Medium < ${f1(t[1])} ≤ High < ${f1(t[2])} ≤ Critical (expected cases per ward per week).`;
  }

  // ------------------------------------------------------------------ TAB 2
  function r2() {
    const el = $("w2"); if (!rows.length) return;
    const row = rows.find(r => r.ward_id === el.value) || rows[0], w = row.ward, t = row.tier, origin = row.origin;
    const pct = key => 100 * allRows.filter(r => r[key] <= row[key]).length / allRows.length;
    $("cards2").innerHTML =
      `<div class="card"><span class="pill" style="--c:${TIER_COLORS[t]}">${isBn() ? tierLabel(t) + " ঝুঁকি" : t.toUpperCase() + " RISK"}</span><h2>${f1d(row.pred)} <span class="small">${T("cases / week", "রোগী / সপ্তাহ")}</span></h2>
        <div class="small">${isBn() ? `৮০% সীমা ${f1d(row.lo)} – ${f1d(row.hi)} · লক্ষ্য সপ্তাহ ${fmtDate(row.target)}` : `80% range ${f1(row.lo)} – ${f1(row.hi)} · target week ${fmtDate(row.target)}`}</div></div>
       <div class="card"><b>${T("Ward vulnerability", "ওয়ার্ডের ঝুঁকিপ্রবণতা")}</b><br>💧 ${T("Water-logging", "জলাবদ্ধতা")} ${D(row.wl.toFixed(2))} <span class="small">(p${D(pct("wl").toFixed(0))})</span>
        <br>🧹 ${T("Sanitation", "স্যানিটেশন")} ${D(row.san.toFixed(2))} <span class="small">(p${D(pct("san").toFixed(0))}, ${T("lower = worse", "কম = খারাপ")})</span>
        <br>👥 ${T("Density", "জনঘনত্ব")} ${D(Math.round(row.dens).toLocaleString())}${T("/km²", "/বর্গকিমি")} <span class="small">(p${D(pct("dens").toFixed(0))})</span></div>
       <div class="card"><b>${T("Recommended action", "সুপারিশকৃত পদক্ষেপ")}</b><br>${actionLabel(t)}</div>`;

    const oi = w.idx.get(origin), a = Math.max(0, oi - 39), b = Math.min(w.dates.length - 1, oi + 4);
    const xs = w.dates.slice(a, b + 1), past = xs.map((_, k) => a + k <= oi);
    const data = [
      { type: "bar", x: xs, y: w.rain.slice(a, b + 1), name: T("Rainfall (mm)", "বৃষ্টিপাত (মিমি)"), marker: { color: "rgba(56,189,248,.35)" }, yaxis: "y2" },
      { type: "scatter", x: xs.filter((_, k) => past[k]), y: w.cases.slice(a, oi + 1), name: T("Reported cases", "রিপোর্টেড রোগী"), line: { color: "#12212b", width: 2.5 } },
    ];
    if (b > oi) data.push({ type: "scatter", x: w.dates.slice(oi, b + 1), y: w.cases.slice(oi, b + 1), name: T("Actual (after warning)", "প্রকৃত (সতর্কতার পরে)"), line: { color: "#12212b", dash: "dot" } });
    for (const hh of HORIZONS) {
      const q = DW.forecast(w, origin, hh); if (!q) continue;
      data.push({ type: "scatter", mode: "markers", x: [q.target], y: [q.pred], name: isBn() ? `পূর্বাভাস +${D(hh)}সপ্তাহ` : `Forecast +${hh}w`,
        marker: { size: hh === S.h ? 13 : 8, symbol: "diamond", color: TIER_COLORS[q.tier], line: { width: 1, color: "white" } },
        error_y: { type: "data", symmetric: false, array: [q.hi - q.pred], arrayminus: [q.pred - q.lo], color: TIER_COLORS[q.tier] } });
    }
    plot($("p2a"), data, { margin: { t: 36, l: 50, r: 60, b: 40 },
      title: isBn() ? `${wardLabel(w.id)}: রোগী, বৃষ্টিপাত এবং ${D(S.h)}-সপ্তাহের পূর্বাভাস` : `${w.id}: cases, rainfall and ${S.h}-week forecast`,
      legend: { orientation: "h", y: -0.15 },
      xaxis: grid, yaxis: { ...gy, title: T("cases / week", "রোগী / সপ্তাহ") }, yaxis2: { type: "linear", title: T("rain mm", "বৃষ্টি মিমি"), overlaying: "y", side: "right", showgrid: false },
      shapes: [{ type: "line", x0: origin, x1: origin, yref: "paper", y0: 0, y1: 1, line: { dash: "dash", color: "#94a3b8" } }],
      annotations: [{ x: origin, y: 1, yref: "paper", text: T("warning issued", "সতর্কতা জারি"), showarrow: false, yanchor: "bottom", font: { color: "#94a3b8" } }] });

    const c = Object.entries(row.contrib).sort((x, y) => x[1] - y[1]);
    plot($("p2b"), [{ type: "bar", orientation: "h", x: c.map(v => v[1]), y: c.map(v => groupLabel(v[0])), marker: { color: c.map(v => v[1] > 0 ? "#ef4444" : "#22c55e") } }],
      { title: T("Main drivers of this forecast (cases/week vs. typical value)", "এই পূর্বাভাসের প্রধান কারণসমূহ (সাধারণ মানের তুলনায় রোগী/সপ্তাহ)"), margin: { t: 40, l: 170, r: 10, b: 40 }, xaxis: grid });
    const lags = [...Array(8).keys()].map(k => row.feats[`rain_lag${k}w`]);
    plot($("p2c"), [{ type: "bar", x: lags.map((_, k) => isBn() ? `স-${D(k)}` : `t-${k}w`), y: lags, marker: { color: lags.map((_, k) => k < 4 ? "#38bdf8" : "#0ea5e9") } }],
      { title: T("Vector breeding clock: weekly rainfall before the warning", "মশার প্রজনন ঘড়ি: সতর্কতার আগের সাপ্তাহিক বৃষ্টিপাত"), xaxis: { ...grid, type: "category" }, yaxis: { ...gy, title: T("mm", "মিমি") } });

    if (w.hasRange) plot($("p2d"), [
      { type: "scatter", x: xs, y: w.tmax.slice(a, b + 1), name: T("Max °C", "সর্বোচ্চ °C"), line: { color: "#e2762d", width: 1 } },
      { type: "scatter", x: xs, y: w.tmin.slice(a, b + 1), name: T("Min °C", "সর্বনিম্ন °C"), fill: "tonexty", fillcolor: "rgba(226,118,45,.18)", line: { color: "#3b82c4", width: 1 } },
      { type: "scatter", x: xs, y: w.temp.slice(a, b + 1), name: T("Avg °C", "গড় °C"), line: { color: "#12212b", width: 2 } },
      { type: "scatter", x: xs, y: w.hum.slice(a, b + 1), name: T("Humidity %", "আর্দ্রতা %"), yaxis: "y2", line: { color: "#0b6e8a", dash: "dot" } }],
      { title: T("Temperature range and humidity (mosquito activity)", "তাপমাত্রার পরিসর ও আর্দ্রতা (মশার সক্রিয়তা)"), legend: { orientation: "h", y: -0.2 }, margin: { t: 36, l: 50, r: 50, b: 40 },
        xaxis: grid, yaxis: { ...gy, title: "°C" }, yaxis2: { type: "linear", overlaying: "y", side: "right", showgrid: false, title: "%" } });
    else $("p2d").innerHTML = `<div class="info">${T("Add max_temp_c and min_temp_c columns to see the temperature range.", "তাপমাত্রার পরিসর দেখতে max_temp_c ও min_temp_c কলাম যোগ করুন।")}</div>`;

    if (S.lagFor !== S.wards) {
      const sw = S.wards.slice().sort((p, q) => p.wl - q.wl), h = sw.length >> 1;
      const corr = ws => [...Array(9).keys()].map(k => { let n = 0, sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
        for (const x of ws) for (let i = k; i < x.cases.length; i++) { const u = x.rain[i - k], v = x.cases[i]; n++; sx += u; sy += v; sxx += u * u; syy += v * v; sxy += u * v; }
        return (n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy)); });
      S.lagFor = S.wards; S.lag = { hi: corr(sw.slice(h)), lo: corr(sw.slice(0, h)) };
    }
    const pk = S.lag.hi.indexOf(Math.max(...S.lag.hi)), lx = S.lag.hi.map((_, k) => isBn() ? `${D(k)}স` : `${k}w`);
    plot($("p2e"), [{ type: "scatter", mode: "lines+markers", x: lx, y: S.lag.hi, name: T("High water-logging wards", "অধিক জলাবদ্ধ ওয়ার্ড"), line: { color: "#c8302f", width: 3 } },
      { type: "scatter", mode: "lines+markers", x: lx, y: S.lag.lo, name: T("Low water-logging wards", "কম জলাবদ্ধ ওয়ার্ড"), line: { color: "#3b82c4", width: 3 } }],
      { title: isBn() ? `বৃষ্টির প্রায় ${D(pk)} সপ্তাহ পর রোগী বাড়ে (সম্পূর্ণ ইতিহাস)` : `Cases follow rain by about ${pk} weeks (all history)`,
        legend: { orientation: "h", y: -0.2 }, xaxis: { ...grid, type: "category", title: T("weeks between rain and cases", "বৃষ্টি ও রোগী বৃদ্ধির ব্যবধান (সপ্তাহ)") }, yaxis: { ...gy, title: T("correlation", "সহসম্পর্ক") } });
  }

  // ------------------------------------------------------------------ TAB 3
  function r3() {
    if (!rows.length) return;
    const row = rows.find(r => r.ward_id === $("w3").value) || rows[0], w = row.ward, origin = row.origin;
    const mult = +$("mult").value, dT = +$("dT").value, dH = +$("dH").value, win = $("win").value;
    $("mV").textContent = D(mult.toFixed(1)); $("tV").textContent = D(dT); $("hV").textContent = D(dH);
    const base = HORIZONS.map(h => DW.forecast(w, origin, h));
    const scen = HORIZONS.map(h => DW.forecast(w, origin, h, DW.applyScenario(DW.originFeatures(w, w.idx.get(origin)), mult, dT, dH, win)));
    const xl = HORIZONS.map(h => isBn() ? `+${D(h)}স` : `+${h}w`);
    plot($("p3"), [
      { type: "bar", x: xl, y: base.map(r => r.pred), name: T("Baseline (actual weather)", "মূল অবস্থা (প্রকৃত আবহাওয়া)"), marker: { color: "#64748b" } },
      { type: "bar", x: xl, y: scen.map(r => r.pred), name: T("Scenario", "সম্ভাব্য পরিস্থিতি"), marker: { color: "#22d3a5" },
        error_y: { type: "data", symmetric: false, array: scen.map(r => r.hi - r.pred), arrayminus: scen.map(r => r.pred - r.lo), color: "#12212b" } }],
      { barmode: "group", yaxis: { ...gy, title: T("expected cases / week", "সম্ভাব্য রোগী / সপ্তাহ") }, margin: { t: 20, l: 50, r: 20, b: 40 } });
    $("m3").innerHTML = scen.map((s, i) => `<div class="metric"><div class="small">+${D(HORIZONS[i])} ${T("weeks", "সপ্তাহ")}</div><div class="v">${f1d(s.pred)} <span class="small">${T("cases/wk", "রোগী/সপ্তাহ")}</span></div>
      <div class="small" style="color:${s.pred >= base[i].pred ? "#fb923c" : "#22c55e"}">${s.pred - base[i].pred >= 0 ? "+" : ""}${f1d(s.pred - base[i].pred)} ${T("vs baseline", "মূল অবস্থার তুলনায়")}</div>
      <div>${EMOJI[base[i].tier]} ${tierLabel(base[i].tier)} → ${EMOJI[s.tier]} <b>${tierLabel(s.tier)}</b></div></div>`).join("");
  }

  // ------------------------------------------------------------------ TAB 4
  function r4() {
    const X = window.METRICS, el = $("val");
    if (!X.horizons) { el.innerHTML = `<div class="info">${T("Models were refit on all data, so no holdout remains.", "সব ডেটায় মডেল পুনরায় প্রশিক্ষিত হয়েছে, তাই অদেখা পরীক্ষার ডেটা বাকি নেই।")}</div>`; return; }
    const H = X.horizons, hv = H[S.h], sp = X.split;
    const spTestBn = D(sp.test).replace("(held out)", "(অদেখা পরীক্ষা)");
    el.innerHTML = (isBn()
      ? `<p><b>কালানুক্রমিক বিভাজন (কখনো শাফল করা হয়নি):</b> প্রশিক্ষণ <code>${D(sp.train)}</code> → যাচাইকরণ <code>${D(sp.validation)}</code> (মডেল নির্বাচন ও স্তর নির্ধারণ) → পরীক্ষা <code>${spTestBn}</code>। চূড়ান্ত মডেল = প্রশিক্ষণ+যাচাই ডেটায় পুনঃপ্রশিক্ষিত, অদেখা পরীক্ষার বছরে একবার মূল্যায়িত।</p>`
      : `<p><b>Chronological split (never shuffled):</b> train <code>${sp.train}</code> → validation <code>${sp.validation}</code> (model selection, tier calibration) → test <code>${sp.test}</code>. Final model = refit on train+validation, scored once on the untouched test years.</p>`)
      + `<div class="grid2e"><div id="v1" class="plot" style="height:340px"></div><div id="v2" class="plot" style="height:340px"></div></div>
      <div class="metrics5">
        <div class="metric"><div class="small">${T("R² (test)", "R² (পরীক্ষা)")}</div><div class="v">${D(hv.model.r2.toFixed(2))}</div></div>
        <div class="metric"><div class="small">${T("80% interval coverage", "৮০% সীমা কভারেজ")}</div><div class="v">${D((hv.interval_80_coverage * 100).toFixed(0))}%</div></div>
        <div class="metric"><div class="small">${T("Tier accuracy", "স্তর নির্ভুলতা")}</div><div class="v">${D((hv.tier_accuracy * 100).toFixed(0))}%</div></div>
        <div class="metric"><div class="small">${T("Within one tier", "এক স্তরের মধ্যে")}</div><div class="v">${D((hv.tier_within_one * 100).toFixed(0))}%</div></div>
        <div class="metric"><div class="small">${T("High+ recall / precision", "উচ্চ+ রিকল / প্রিসিশন")}</div><div class="v">${D((hv.high_plus_recall * 100).toFixed(0))}% / ${D((hv.high_plus_precision * 100).toFixed(0))}%</div></div></div>
      <div class="grid2e"><div id="v3" class="plot" style="height:360px"></div><div id="v4" class="plot" style="height:360px"></div></div>
      <div class="grid2e"><div id="v5" class="plot" style="height:340px"></div><div id="v6" class="plot" style="height:340px"></div></div>
      <div id="v7" class="plot" style="height:320px"></div>`;
    const models = [
      ["model", T("Gradient boosting (ours)", "গ্র্যাডিয়েন্ট বুস্টিং (আমাদের)"), "#22d3a5"],
      ["ablation_no_weather", T("Same, weather removed", "একই, আবহাওয়া ছাড়া"), "#a78bfa"],
      ["baseline_seasonal_ward_month", T("Seasonal ward-month avg", "মৌসুমি ওয়ার্ড-মাস গড়"), "#facc15"],
      ["baseline_persistence", T("Persistence (last week)", "পারসিসটেন্স (গত সপ্তাহ)"), "#94a3b8"]
    ];
    const hs = Object.keys(H);
    [["mae", "v1", "MAE"], ["rmse", "v2", "RMSE"]].forEach(([m, id, name]) =>
      plot($(id), models.map(([k, lab, col]) => ({ type: "bar", name: lab, x: hs.map(h => isBn() ? `+${D(h)}স` : `+${h}w`), y: hs.map(h => H[h][k][m]), marker: { color: col } })),
        { barmode: "group", title: isBn() ? `টেস্ট-সেট ${name} (প্রতি ওয়ার্ড-সপ্তাহে রোগী, কম ভালো)` : `Test-set ${name} (cases per ward-week, lower is better)`, legend: { orientation: "h", y: -0.2 }, yaxis: gy }));
    const mj = window.MONTHLY;
    plot($("v3"), [
      { x: mj.map(r => r.month), y: mj.map(r => r.hi), line: { width: 0 }, showlegend: false, type: "scatter" },
      { x: mj.map(r => r.month), y: mj.map(r => r.lo), fill: "tonexty", fillcolor: "rgba(34,211,165,.18)", line: { width: 0 }, name: T("Σ 80% band", "Σ ৮০% সীমা"), type: "scatter" },
      { x: mj.map(r => r.month), y: mj.map(r => r.actual), name: T("Actual", "প্রকৃত"), line: { color: "#12212b", width: 3 }, type: "scatter" },
      { x: mj.map(r => r.month), y: mj.map(r => r.pred), name: T("Predicted (+3w)", "পূর্বাভাস (+৩সপ্তাহ)"), line: { color: "#22d3a5", width: 3, dash: "dash" }, type: "scatter" }],
      { title: T("Held-out 2024-25: monthly total cases, all wards", "অদেখা ২০২৪–২৫: মাসিক মোট রোগী, সব ওয়ার্ড"), xaxis: grid, yaxis: gy });
    const tierTicks = TIERS.map(tierLabel);
    plot($("v4"), [{ type: "heatmap", z: hv.confusion, x: tierTicks, y: tierTicks, colorscale: [[0, "#10241f"], [1, "#22d3a5"]], showscale: false,
      text: hv.confusion.map(r => r.map(String)), texttemplate: "%{text}", hovertemplate: T("actual %{y}<br>predicted %{x}<br>%{z}<extra></extra>", "প্রকৃত %{y}<br>পূর্বাভাস %{x}<br>%{z}<extra></extra>") }],
      { title: isBn() ? `স্তর কনফিউশন ম্যাট্রিক্স (+${D(S.h)}সপ্তাহ, পরীক্ষা)` : `Tier confusion matrix (+${S.h}w, test)`, xaxis: { title: T("Predicted tier", "পূর্বাভাস স্তর") }, yaxis: { title: T("Actual tier", "প্রকৃত স্তর"), autorange: "reversed" } });
    const pg = Object.entries(X.perm_importance_groups_h3).sort((a, b) => a[1] - b[1]);
    plot($("v5"), [{ type: "bar", orientation: "h", x: pg.map(v => v[1]), y: pg.map(v => groupLabel(v[0])), marker: { color: "#22d3a5" } }],
      { title: T("Global driver importance (MAE increase when shuffled, +3w)", "সামগ্রিক কারণের গুরুত্ব (শাফল করলে MAE বৃদ্ধি, +৩সপ্তাহ)"), margin: { t: 40, l: 170, r: 10, b: 40 }, xaxis: grid });
    const pr = Object.entries(X.perm_importance_rain_lags_h3);
    plot($("v6"), [{ type: "bar", x: pr.map(v => isBn() ? `স-${D(v[0][8])}` : `t-${v[0][8]}w`), y: pr.map(v => v[1]), marker: { color: "#38bdf8" } }],
      { title: T("Which rainfall lag matters? (single-lag shuffle, +3w)", "কোন বৃষ্টির বিলম্ব গুরুত্বপূর্ণ? (একক-ল্যাগ শাফল, +৩সপ্তাহ)"), yaxis: { ...gy, title: T("MAE increase", "MAE বৃদ্ধি") } });
    const mw = Object.entries(hv.mae_by_ward).sort((a, b) => b[1] - a[1]).slice(0, 15);
    plot($("v7"), [{ type: "bar", x: mw.map(v => wardLabel(v[0])), y: mw.map(v => v[1]), marker: { color: "#fb923c" } }],
      { title: isBn() ? `কালানুক্রমিক যাচাই ত্রুটি: ১৫টি কঠিনতম ওয়ার্ড (MAE, +${D(S.h)}সপ্তাহ, পরীক্ষা)` : `Chronological validation error: 15 hardest wards (MAE, +${S.h}w, test)`, yaxis: gy });
  }

  // ------------------------------------------------------------------ TAB 5
  function r5() {
    const t = M.thresholds;
    $("how").innerHTML = `
      <h3 style="margin-top:0">${T("ℹ️ How it works", "ℹ️ কীভাবে কাজ করে")}</h3>
      <p class="small">${T(
        "Dengue Protirodh looks at recent weather, recent cases and how vulnerable each ward is, and estimates how many dengue cases each ward is likely to see 2–4 weeks from now — early enough to clear breeding sites before an outbreak builds.",
        "ডেঙ্গু প্রতিরোধ সাম্প্রতিক আবহাওয়া, সাম্প্রতিক রোগীর সংখ্যা এবং প্রতিটি ওয়ার্ডের ঝুঁকিপ্রবণতা বিশ্লেষণ করে ২–৪ সপ্তাহ পর সম্ভাব্য ডেঙ্গু রোগীর সংখ্যা অনুমান করে — যাতে প্রাদুর্ভাব বাড়ার আগেই প্রজননস্থল ধ্বংস করা যায়।"
      )}</p>

      <div class="arch-section">
        <h4>${T("From data to decision", "ডেটা থেকে সিদ্ধান্ত")}</h4>
        <div class="arch-diagram">
          <div class="arch-browser">
            <div class="arch-label">${T("🌐 WHAT HAPPENS WHEN YOU OPEN A FORECAST", "🌐 পূর্বাভাস খুললে ভেতরে যা ঘটে")}</div>
            <div class="arch-grid">
              <div class="arch-node">${T("📄 Ward records", "📄 ওয়ার্ডের রেকর্ড")}<br><span class="small">${T("31,320 weekly records<br>60 wards · 2016–2025", "৩১,৩২০টি সাপ্তাহিক রেকর্ড<br>৬০টি ওয়ার্ড · ২০১৬–২০২৫")}</span></div>
              <div class="arch-arrow">→</div>
              <div class="arch-node arch-center">${T("⚙️ Forecast service", "⚙️ পূর্বাভাস সেবা")}<br><span class="small">${T("Clean &amp; group data<br>Build weather-lag features<br>Predict cases per ward<br>Assign risk tier", "ডেটা পরিষ্কার ও শ্রেণিবদ্ধকরণ<br>আবহাওয়ার বিলম্ব বৈশিষ্ট্য তৈরি<br>প্রতি ওয়ার্ডের রোগী অনুমান<br>ঝুঁকির স্তর নির্ধারণ")}</span></div>
              <div class="arch-arrow">→</div>
              <div class="arch-node">${T("🖥️ Dashboard", "🖥️ ড্যাশবোর্ড")}<br><span class="small">${T("Risk board<br>Ward deep-dive<br>What-if scenarios<br>Model validation", "ঝুঁকি বোর্ড<br>ওয়ার্ড বিশ্লেষণ<br>সম্ভাব্য পরিস্থিতি<br>মডেল যাচাইকরণ")}</span></div>

              <div></div><div></div>
              <div class="arch-up"><div class="arch-arrow arch-arrow-up">↑</div><div class="arch-node">${T("🌳 Trained models", "🌳 প্রশিক্ষিত মডেল")}<br><span class="small">${T("Decision-tree ensembles<br>9 models", "ডিসিশন-ট্রি এনসেম্বল<br>৯টি মডেল")}</span></div></div>
              <div></div>
              <div class="arch-up"><div class="arch-arrow arch-arrow-up">↑</div><div class="arch-node">${T("📊 Validation results", "📊 যাচাই ফলাফল")}<br><span class="small">${T("Test error &amp; alert accuracy<br>→ Model validation view", "পরীক্ষার ত্রুটি ও সতর্কতার নির্ভুলতা<br>→ মডেল যাচাইকরণ দৃশ্য")}</span></div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="arch-section">
        <h4>${T('How the forecasting models are built <span class="small">(done in advance, before you open the dashboard)</span>', 'পূর্বাভাস মডেল কীভাবে তৈরি হয় <span class="small">(ড্যাশবোর্ড খোলার আগেই সম্পন্ন)</span>')}</h4>
        <div class="arch-flow">
          <div class="arch-step">${T("📂 Historical records", "📂 ঐতিহাসিক রেকর্ড")}<br><span class="small">${T("31,320 ward-weeks<br>60 wards · 2016–2025", "৩১,৩২০টি ওয়ার্ড-সপ্তাহ<br>৬০টি ওয়ার্ড · ২০১৬–২০২৫")}</span></div>
          <div class="arch-arrow-down">↓</div>
          <div class="arch-step">${T("🔧 Feature engineering", "🔧 ফিচার ইঞ্জিনিয়ারিং")}<br><span class="small">${T("Rain lags 0–7w · Temp/Hum lags<br>Case trend · Ward vulnerability<br>Seasonality (sin/cos)", "বৃষ্টির বিলম্ব ০–৭স · তাপ/আর্দ্রতা বিলম্ব<br>রোগীর ধারা · ওয়ার্ডের ঝুঁকিপ্রবণতা<br>মৌসুমি চক্র (sin/cos)")}</span></div>
          <div class="arch-arrow-down">↓</div>
          <div class="arch-step">${T("✂️ Chronological split", "✂️ কালানুক্রমিক বিভাজন")}<br><span class="small">${T("Train 2016–2022 · Val 2023 · <b>Test 2024–2025</b>", "প্রশিক্ষণ ২০১৬–২২ · যাচাই ২০২৩ · <b>পরীক্ষা ২০২৪–২৫</b>")}</span></div>
          <div class="arch-arrow-down">↓</div>
          <div class="arch-step">${T("🌳 Gradient-boosted trees", "🌳 গ্র্যাডিয়েন্ট-বুস্টেড ট্রি")}<br><span class="small">${T("3 horizons (+2w / +3w / +4w)<br>× 3 outputs (mean · lo · hi)<br>= 9 models total", "৩ সময়সীমা (+২স / +৩স / +৪স)<br>× ৩ আউটপুট (গড় · নিম্ন · উচ্চ)<br>= মোট ৯টি মডেল")}</span></div>
          <div class="arch-arrow-down">↓</div>
          <div class="arch-step">${T("📦 Packaged for the dashboard", "📦 ড্যাশবোর্ডের জন্য প্যাকেজ")}<br><span class="small">${T("Models · records · accuracy results", "মডেল · রেকর্ড · নির্ভুলতার ফলাফল")}</span></div>
        </div>
      </div>

      <div class="arch-section">
        <h4>${T("Feature Groups", "বৈশিষ্ট্য গোষ্ঠী")}</h4>
        <table class="arch-table">
          <thead><tr><th>${T("Group", "গোষ্ঠী")}</th><th>${T("What is measured", "কী পরিমাপ করা হয়")}</th><th>${T("Window", "সময়সীমা")}</th></tr></thead>
          <tbody>
            <tr><td>${T("🌧️ Rainfall lags", "🌧️ বৃষ্টিপাতের বিলম্ব")}</td><td>${T("Rain 0 to 7 weeks before the forecast origin", "পূর্বাভাসের ০ থেকে ৭ সপ্তাহ আগের বৃষ্টি")}</td><td>${T("Week-by-week", "সপ্তাহ-ভিত্তিক")}</td></tr>
            <tr><td>${T("💧 Rainfall totals", "💧 মোট বৃষ্টিপাত")}</td><td>${T("2-, 4- and 8-week sums, plus weeks 4–7", "২, ৪ ও ৮ সপ্তাহের সমষ্টি, ও ৪–৭ সপ্তাহ")}</td><td>${T("Rolling totals", "চলমান সমষ্টি")}</td></tr>
            <tr><td>${T("🌡️ Temperature", "🌡️ তাপমাত্রা")}</td><td>${T("0, 2 and 4 weeks back + 4-week mean", "০, ২ ও ৪ সপ্তাহ আগে + ৪-সপ্তাহ গড়")}</td><td>${T("Lagged readings", "বিলম্বিত পাঠ")}</td></tr>
            <tr><td>${T("💦 Humidity", "💦 আর্দ্রতা")}</td><td>${T("0, 2 and 4 weeks back + 4-week mean", "০, ২ ও ৪ সপ্তাহ আগে + ৪-সপ্তাহ গড়")}</td><td>${T("Lagged readings", "বিলম্বিত পাঠ")}</td></tr>
            <tr><td>${T("📈 Case trend", "📈 রোগীর প্রবণতা")}</td><td>${T("Last 4 weeks of cases, 4-week mean, trend slope", "শেষ ৪ সপ্তাহের রোগী, গড় ও প্রবণতার ঢাল")}</td><td>${T("Recent history", "সাম্প্রতিক ইতিহাস")}</td></tr>
            <tr><td>${T("🏘️ Ward vulnerability", "🏘️ ওয়ার্ডের ঝুঁকিপ্রবণতা")}</td><td>${T("Density, water-logging, sanitation, composite score", "জনঘনত্ব, জলাবদ্ধতা, স্যানিটেশন ও সম্মিলিত স্কোর")}</td><td>${T("Fixed per ward", "ওয়ার্ড অনুযায়ী স্থির")}</td></tr>
            <tr><td>${T("📅 Seasonality", "📅 মৌসুমি প্রভাব")}</td><td>${T("Time of year of the target week", "লক্ষ্য সপ্তাহের বছরের সময়কাল")}</td><td>${T("Yearly cycle", "বার্ষিক চক্র")}</td></tr>
          </tbody>
        </table>
      </div>

      <div class="arch-section">
        <h4>${T("Chronological Validation Split", "কালানুক্রমিক যাচাইকরণ বিভাজন")}</h4>
        <div class="arch-timeline">
          <div class="arch-tl-block" style="flex:7;background:#1e3a5f">
            <b>${T("TRAIN", "প্রশিক্ষণ")}</b><br><span class="small">${D("2016–2022")}</span>
          </div>
          <div class="arch-tl-block" style="flex:1;background:#2d4a1e">
            <b>${T("VAL", "যাচাই")}</b><br><span class="small">${D("2023")}</span>
          </div>
          <div class="arch-tl-block" style="flex:2;background:#4a1e1e">
            <b>${T("TEST ← held-out", "পরীক্ষা ← অদেখা")}</b><br><span class="small">${D("2024–2025")}</span>
          </div>
        </div>
        <p class="small" style="margin-top:6px">${T("Never shuffled. The model only ever sees past weeks when issuing a warning — matching real-world use.", "কখনো শাফল করা হয়নি। বাস্তব ব্যবহারের মতোই সতর্কতা জারির সময় মডেল কেবল অতীত সপ্তাহের তথ্য দেখে।")}</p>
      </div>

      <div class="arch-section">
        <h4>${T("Model Selection Rationale", "মডেল নির্বাচনের যুক্তি")}</h4>
        <table class="arch-table">
          <thead><tr><th>${T("Factor", "বিষয়")}</th><th>${T("Choice", "পছন্দ")}</th><th>${T("Reason", "কারণ")}</th></tr></thead>
          <tbody>
            <tr><td>${T("Algorithm", "অ্যালগরিদম")}</td><td>${T("Histogram gradient-boosted trees", "হিস্টোগ্রাম গ্র্যাডিয়েন্ট-বুস্টেড ট্রি")}</td><td>${T("Handles tabular lag data; no scaling needed; fast", "ট্যাবুলার বিলম্ব ডেটা সামলায়; স্কেলিং লাগে না; দ্রুত")}</td></tr>
            <tr><td>${T("Loss (mean)", "লস (গড়)")}</td><td>${T("Poisson deviance", "পয়সন ডেভিয়েন্স")}</td><td>${T("Counts are non-negative &amp; over-dispersed", "রোগীর সংখ্যা অঋণাত্মক ও অতি-বিস্তৃত")}</td></tr>
            <tr><td>${T("Loss (intervals)", "লস (সীমা)")}</td><td>${T("Pinball at 10% / 90%", "১০% / ৯০% পিনবল")}</td><td>${T("Calibrated 80% prediction bands", "ক্যালিব্রেটেড ৮০% পূর্বাভাস সীমা")}</td></tr>
            <tr><td>${T("Horizons", "সময়সীমা")}</td><td>${T("Direct (+2w, +3w, +4w)", "সরাসরি (+২স, +৩স, +৪স)")}</td><td>${T("No error compounding vs. step-by-step forecasting", "ধাপে ধাপে পূর্বাভাসের মতো ত্রুটি জমা হয় না")}</td></tr>
            <tr><td>${T("Risk tiers", "ঝুঁকির স্তর")}</td><td>${T("Calibrated on 2023 validation", "২০২৩ যাচাই ডেটায় নির্ধারিত")}</td><td>${T("Thresholds match the validation distribution", "সীমাগুলো যাচাই বিন্যাসের সাথে সামঞ্জস্যপূর্ণ")}</td></tr>
          </tbody>
        </table>
      </div>

      <div class="arch-section">
        <h4>${T("⚡ Edge Speed, Privacy &amp; Community Ecosystem", "⚡ এজ গতি, গোপনীয়তা ও কমিউনিটি ব্যবস্থা")}</h4>
        <ul class="ilist">
          <li><span class="bi" style="--bc:#ef4444"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18M2 9a15 15 0 0 1 5-3M22 9a15 15 0 0 0-7-3.7M5 12.5a10 10 0 0 1 3-2M19 12.5a10 10 0 0 0-3-2M8.5 16a5 5 0 0 1 4-1.5M12 20h.01"/></svg></span>${T("<b>Zero external API calls</b> — all 9 tree ensembles execute locally in client memory using pure JavaScript", "<b>কোনো বাহ্যিক API কল নেই</b> — ৯টি ট্রি মডেল খাঁটি জাভাস্ক্রিপ্টে স্থানীয়ভাবে চলে")}</li>
          <li><span class="bi" style="--bc:#0ea5e9"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M9 5.2A6 6 0 0 1 17.5 9h.5a4 4 0 0 1 3 6.6M18 18H7a4.5 4.5 0 0 1-1.5-8.7"/></svg></span>${T("<b>No cloud data transfer</b> — your uploaded weekly CSVs, sliders, and ward searches never leave your computer", "<b>কোনো ক্লাউড ডেটা স্থানান্তর নয়</b> — আপনার আপলোড করা CSV, স্লাইডার ও অনুসন্ধান কখনো আপনার কম্পিউটার ছেড়ে যায় না")}</li>
          <li><span class="bi" style="--bc:#f59e0b"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg></span>${T("<b>&lt; 50 ms response time</b> — instant real-time computation of 60-ward forecasts across +2, +3 and +4 week horizons", "<b>&lt; ৫০ মিলিসেকেন্ড প্রতিক্রিয়া সময়</b> — +২, +৩ ও +৪ সপ্তাহে ৬০টি ওয়ার্ডের তাৎক্ষণিক পূর্বাভাস")}</li>
          <li><span class="bi" style="--bc:#ec4899"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.3"/><path d="M17 14c2.5 0 4 2 4 5"/></svg></span>${T("<b>Linked Community Action</b> — seamlessly transitions predictive warnings to field cleanup drives, free fever screening camps, expert webinars, and survivor support", "<b>যুক্ত কমিউনিটি পদক্ষেপ</b> — সতর্কবার্তাকে সরাসরি পরিচ্ছন্নতা অভিযান, ফ্রি স্ক্রিনিং ক্যাম্প, ওয়েবিনার ও কমিউনিটি সহায়তার সাথে যুক্ত করে")}</li>
          <li><span class="bi" style="--bc:#3b82f6"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></svg></span>${T("<b>Bilingual &amp; Adaptive</b> — full English/Bengali support and light/dark theme toggle for field operations at night", "<b>দ্বিভাষিক ও অভিযোজনযোগ্য</b> — পূর্ণ ইংরেজি/বাংলা সমর্থন এবং রাতের মাঠ কাজের জন্য লাইট/ডার্ক থিম")}</li>
        </ul>
      </div>

      <p><b>${T("Pipeline summary:", "পাইপলাইন সারসংক্ষেপ:")}</b> <code>${T("weekly weather + ward vulnerability → grouped multi-week lags (0–7w) → 3 direct GBT horizons (+2/+3/+4 wk) → Poisson expected cases &amp; 80% prediction intervals → risk tier classification → field intervention mobilization", "সাপ্তাহিক আবহাওয়া + ওয়ার্ড ঝুঁকি → বহু-সপ্তাহ বিলম্ব (০–৭স) → ৩ সরাসরি GBT সময়সীমা (+২/+৩/+৪ সপ্তাহ) → পয়সন সম্ভাব্য রোগী ও ৮০% সীমা → ঝুঁকির স্তর নির্ধারণ → মাঠপর্যায়ের পদক্ষেপ")}</code></p>
      <ul class="ilist">
        <li><span class="bi" style="--bc:#6366f1"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/></svg></span>${isBn() ? `<b>ঝুঁকির স্তর</b> (রোগী/ওয়ার্ড/সপ্তাহ): নিম্ন &lt; ${f1d(t[0])} ≤ মাঝারি &lt; ${f1d(t[1])} ≤ উচ্চ &lt; ${f1d(t[2])} ≤ সংকটজনক — ২০২৩ যাচাইয়ে নির্ধারিত।` : `<b>Risk tiers</b> (expected cases/ward/week): Low &lt; ${f1(t[0])} ≤ Medium &lt; ${f1(t[1])} ≤ High &lt; ${f1(t[2])} ≤ Critical — calibrated on 2023 validation.`}</li>
        <li><span class="bi" style="--bc:#14b8a6"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v9h9a9 9 0 1 1-9-9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15V3.5z"/></svg></span>${T("<b>Driver breakdown:</b> each factor group is replaced by its typical value; the drop in the forecast is its contribution.", "<b>কারণ বিশ্লেষণ:</b> প্রতিটি উপাদান গোষ্ঠীকে তার সাধারণ মান দিয়ে প্রতিস্থাপন করলে পূর্বাভাসে যে পতন হয়, সেটিই তার অবদান।")}</li>
        <li><span class="bi" style="--bc:#10b981"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></span>${T("<b>Private by design:</b> no account, no server, no external service — your data stays on your device.", "<b>নকশা থেকেই ব্যক্তিগত:</b> কোনো অ্যাকাউন্ট, সার্ভার বা বাহ্যিক সেবা নেই — আপনার ডেটা আপনার ডিভাইসেই থাকে।")}</li>
      </ul>`;
  }

  // ------------------------------------------------------------------ TAB 6 (architecture)
  function r6() {
    const box = (x, y, w, h, t, s, col) => `<rect class="box" x="${x}" y="${y}" width="${w}" height="${h}" rx="9" ${col ? `style="stroke:${col}"` : ""}/>
      <text class="t" x="${x + w / 2}" y="${y + 20}" text-anchor="middle">${t}</text>` +
      s.map((l, i) => `<text class="s" x="${x + w / 2}" y="${y + 37 + i * 14}" text-anchor="middle">${l}</text>`).join("");
    const badge = (x, y, n, c) => `<circle cx="${x}" cy="${y}" r="11" fill="${c}"/><text class="num" x="${x}" y="${y + 4}" text-anchor="middle">${n}</text>`;
    const U = "#f472b6", P = "#38bdf8", A = "#22d3a5", B = "#a78bfa";
    const lane = (y, h, c, label) => `<rect class="lane" x="10" y="${y}" width="980" height="${h}" rx="14" stroke="${c}"/><text class="h" x="26" y="${y + 22}" style="fill:${c}">${label}</text>`;
    const tabW = 176, tabX = i => 28 + i * 191;
    const cx = [28, 348, 668];
    $("archx").innerHTML = `
      <h3 style="margin-top:0">${T("🏗️ Architecture", "🏗️ আর্কিটেকচার")}</h3>
      <p class="small">${T(
        "Dengue Protirodh is a layered web application. Health teams work in an interactive <b>dashboard</b>; a <b>forecast service</b> turns weather history, recent cases and ward vulnerability into a risk level for every ward 2–4 weeks ahead; and a <b>data &amp; model layer</b> supplies versioned, read-only assets prepared in advance. The diagram follows one request from a click to a chart — numbered badges match the table below it.",
        "ডেঙ্গু প্রতিরোধ একটি স্তরবিন্যস্ত ওয়েব অ্যাপ্লিকেশন। স্বাস্থ্য দলগুলো একটি ইন্টারেক্টিভ <b>ড্যাশবোর্ডে</b> কাজ করে; একটি <b>পূর্বাভাস সেবা</b> আবহাওয়ার ইতিহাস, সাম্প্রতিক রোগী ও ওয়ার্ডের ঝুঁকিকে ২–৪ সপ্তাহ আগাম ঝুঁকির স্তরে রূপান্তর করে; এবং একটি <b>ডেটা ও মডেল স্তর</b> আগে থেকে প্রস্তুত সংস্করণকৃত সম্পদ সরবরাহ করে। ডায়াগ্রামে একটি ক্লিক থেকে চার্ট পর্যন্ত প্রবাহ দেখানো হয়েছে।"
      )}</p>
      <svg class="ax-svg" viewBox="0 0 1000 990" role="img" aria-label="${T("Dengue Protirodh layered architecture diagram", "ডেঙ্গু প্রতিরোধ স্তরবিন্যস্ত আর্কিটেকচার ডায়াগ্রাম")}">
        <defs>
          <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#38bdf8"/></marker>
          <marker id="ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#22d3a5"/></marker>
          <marker id="ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#fb923c"/></marker>
        </defs>

        ${lane(10, 100, U, T("USERS · public-health teams on any device", "ব্যবহারকারী · যেকোনো ডিভাইসে জনস্বাস্থ্য দল"))}
        ${box(28, 42, 218, 54, T("District health officer", "জেলা স্বাস্থ্য কর্মকর্তা"), [T("Plans field response per ward", "ওয়ার্ড অনুযায়ী মাঠ পদক্ষেপ পরিকল্পনা")], U)}
        ${box(270, 42, 218, 54, T("City corporation planner", "সিটি কর্পোরেশন পরিকল্পক"), [T("Compares wards, plans clean-ups", "ওয়ার্ড তুলনা ও পরিচ্ছন্নতা পরিকল্পনা")], U)}
        ${box(512, 42, 218, 54, T("Analyst / researcher", "বিশ্লেষক / গবেষক"), [T("Tests scenarios, checks accuracy", "পরিস্থিতি ও নির্ভুলতা যাচাই")], U)}
        ${box(754, 42, 218, 54, T("Data manager", "ডেটা ব্যবস্থাপক"), [T("Adds the latest ward records", "সর্বশেষ ওয়ার্ড রেকর্ড যুক্ত করে")], U)}
        <path class="ln" d="M250 112V138"/><path class="ln" d="M750 138V112"/>
        <text class="s" x="260" y="130">${T("choices, sliders, uploads", "পছন্দ, স্লাইডার, আপলোড")}</text><text class="s" x="760" y="130">${T("forecasts, charts, reports", "পূর্বাভাস, চার্ট, প্রতিবেদন")}</text>

        ${lane(140, 190, P, T("PRESENTATION LAYER · interactive dashboard in the browser", "উপস্থাপনা স্তর · ব্রাউজারে ইন্টারেক্টিভ ড্যাশবোর্ড"))}
        ${box(tabX(0), 176, tabW, 74, T("🗺️ Risk board", "🗺️ ঝুঁকি বোর্ড"), [T("Ranked wards, KPIs,", "র‍্যাংক করা ওয়ার্ড, KPI,"), T("risk treemap, heatmap", "ঝুঁকি ট্রিম্যাপ, হিটম্যাপ")], P)}
        ${box(tabX(1), 176, tabW, 74, T("🔎 Ward deep-dive", "🔎 ওয়ার্ড বিশ্লেষণ"), [T("History + forecast", "ইতিহাস + পূর্বাভাস"), T("with 80% range", "৮০% সীমাসহ")], P)}
        ${box(tabX(2), 176, tabW, 74, T("🎛️ What-if scenarios", "🎛️ সম্ভাব্য পরিস্থিতি"), [T("Rainfall, heat and", "বৃষ্টি, তাপ ও"), T("humidity sliders", "আর্দ্রতার স্লাইডার")], P)}
        ${box(tabX(3), 176, tabW, 74, T("📊 Model validation", "📊 মডেল যাচাই"), [T("Accuracy on held-out", "অদেখা ২০২৪–২৫ সপ্তাহে"), T("2024–25 weeks", "মডেলের নির্ভুলতা")], P)}
        ${box(tabX(4), 176, tabW, 74, T("ℹ️ Guide &amp; design", "ℹ️ গাইড ও নকশা"), [T("How it works and", "কীভাবে কাজ করে ও"), T("this architecture", "এই আর্কিটেকচার")], P)}
        ${box(28, 262, 300, 56, T("Control panel", "কন্ট্রোল প্যানেল"), [T("City · origin week · horizon · ward", "শহর · সপ্তাহ · সময়সীমা · ওয়ার্ড")], P)}
        ${box(350, 262, 300, 56, T("Interactive charts &amp; tables", "ইন্টারেক্টিভ চার্ট ও সারণি"), [T("Only the visible view is redrawn", "কেবল দৃশ্যমান অংশ পুনরায় আঁকা হয়")], P)}
        ${box(672, 262, 300, 56, T("Report export", "প্রতিবেদন এক্সপোর্ট"), [T("Download the current forecast", "বর্তমান পূর্বাভাস ডাউনলোড")], P)}
        ${badge(28, 262, D(1), P)}${badge(350, 262, D(9), P)}
        <path class="ln" d="M250 332V358"/><path class="ln" d="M750 358V332"/>
        <text class="s" x="260" y="350">${T("user actions &amp; settings", "ব্যবহারকারীর পদক্ষেপ ও সেটিংস")}</text><text class="s" x="760" y="350">${T("results to render", "প্রদর্শনের ফলাফল")}</text>

        ${lane(360, 310, A, T("APPLICATION LAYER · forecast service running on the user's device", "অ্যাপ্লিকেশন স্তর · ব্যবহারকারীর ডিভাইসে চলমান পূর্বাভাস সেবা"))}
        ${box(cx[0], 398, 290, 70, T("Data intake &amp; validation", "ডেটা গ্রহণ ও যাচাই"), [T("Checks required columns; accepts the", "প্রয়োজনীয় কলাম যাচাই; বিল্ট-ইন"), T("built-in records or an uploaded file", "বা আপলোড করা ফাইল গ্রহণ")], A)}
        ${box(cx[1], 398, 290, 70, T("Ward preparation", "ওয়ার্ড প্রস্তুতি"), [T("Groups by ward, sorts by week,", "ওয়ার্ডে ভাগ ও সপ্তাহে সাজানো,"), T("fills short gaps (up to 2 weeks)", "ছোট শূন্যতা পূরণ (সর্বোচ্চ ২ সপ্তাহ)")], A)}
        ${box(cx[2], 398, 290, 70, T("Feature builder", "ফিচার নির্মাতা"), [T("Weather lags, rolling totals, case trend,", "আবহাওয়ার বিলম্ব, চলমান সমষ্টি, ধারা,"), T("ward vulnerability, season of target week", "ওয়ার্ড ঝুঁকি ও লক্ষ্য সপ্তাহের মৌসুম")], A)}
        ${box(cx[0], 500, 290, 70, T("Prediction engine", "পূর্বাভাস ইঞ্জিন"), [T("Walks 9 tree ensembles: expected cases", "৯টি ট্রি মডেল: সম্ভাব্য রোগী"), T("+ 80% range for +2 / +3 / +4 weeks", "+২ / +৩ / +৪ সপ্তাহে ৮০% সীমা")], A)}
        ${box(cx[1], 500, 290, 70, T("Risk classifier", "ঝুঁকি শ্রেণিবিন্যাসকারী"), [T("Expected cases → Low / Medium /", "সম্ভাব্য রোগী → নিম্ন / মাঝারি /"), T("High / Critical + recommended action", "উচ্চ / সংকটজনক + পদক্ষেপ")], A)}
        ${box(cx[2], 500, 290, 70, T("Driver explainer", "কারণ ব্যাখ্যাকারী"), [T("Shows what pushes risk up: rainfall,", "ঝুঁকি কী বাড়াচ্ছে: বৃষ্টি,"), T("temperature, humidity, trend, season", "তাপমাত্রা, আর্দ্রতা, ধারা, মৌসুম")], A)}
        ${box(28, 592, 290, 56, T("Scenario simulator", "পরিস্থিতি সিমুলেটর"), [T("Scales rain, shifts heat &amp; humidity, re-predicts", "বৃষ্টি/তাপ/আর্দ্রতা বদলে পুনরায় গণনা")], A)}
        ${box(348, 592, 290, 56, T("Session state", "সেশন অবস্থা"), [T("City · week · horizon · ward · scenario", "শহর · সপ্তাহ · সময়সীমা · ওয়ার্ড · পরিস্থিতি")], A)}
        ${box(668, 592, 290, 56, T("Result packaging", "ফলাফল বিন্যাস"), [T("Tables, charts and summaries for the UI", "UI-এর জন্য সারণি, চার্ট ও সারসংক্ষেপ")], A)}
        <path class="ln2" d="M318 433H346"/><path class="ln2" d="M638 433H666"/>
        <path class="ln2" d="M813 468V484H173V498"/>
        <path class="ln2" d="M318 535H346"/><path class="ln2" d="M638 535H666"/>
        <path class="ln2" d="M813 570V590"/><path class="ln2" d="M173 592V572"/>
        <path class="ln" d="M346 620H320"/><path class="ln" d="M638 620H666"/>
        ${badge(28, 398, D(2), A)}${badge(348, 398, D(3), A)}${badge(668, 398, D(4), A)}${badge(28, 500, D(5), A)}${badge(348, 500, D(6), A)}${badge(668, 500, D(7), A)}${badge(668, 592, D(8), A)}${badge(28, 592, T("W", "স"), A)}

        ${lane(700, 125, D_col(), T("DATA &amp; MODEL LAYER · versioned, read-only assets", "ডেটা ও মডেল স্তর · সংস্করণকৃত, কেবল-পঠনযোগ্য সম্পদ"))}
        ${box(28, 736, 218, 74, T("Historical ward records", "ঐতিহাসিক ওয়ার্ড রেকর্ড"), [T("31,320 weekly records", "৩১,৩২০ সাপ্তাহিক রেকর্ড"), T("60 wards · 2016–2025", "৬০টি ওয়ার্ড · ২০১৬–২০২৫")], D_col())}
        ${box(270, 736, 218, 74, T("Trained forecast models", "প্রশিক্ষিত পূর্বাভাস মডেল"), [T("9 tree ensembles", "৯টি ট্রি এনসেম্বল"), T("3 horizons × mean / low / high", "৩ সময়সীমা × গড় / নিম্ন / উচ্চ")], D_col())}
        ${box(512, 736, 218, 74, T("Validation results", "যাচাই ফলাফল"), [T("Error, accuracy, alert hit-rate", "ত্রুটি, নির্ভুলতা ও সতর্কতা হার"), T("on held-out 2024–25", "অদেখা ২০২৪–২৫ ডেটায়")], D_col())}
        ${box(754, 736, 218, 74, T("Risk thresholds", "ঝুঁকির সীমা"), [T("Low / Medium / High / Critical", "নিম্ন / মাঝারি / উচ্চ / সংকটজনক"), T("calibrated on 2023", "২০২৩ ডেটায় ক্যালিব্রেটেড")], D_col())}
        <path class="ln3" d="M137 700V672"/><path class="ln3" d="M379 700V672"/><path class="ln3" d="M621 700V672"/><path class="ln3" d="M863 700V672"/>
        <text class="s" x="146" y="692">${T("records", "রেকর্ড")}</text><text class="s" x="388" y="692">${T("models", "মডেল")}</text><text class="s" x="630" y="692">${T("metrics", "মেট্রিক্স")}</text><text class="s" x="872" y="692">${T("thresholds", "সীমা")}</text>

        ${lane(855, 125, B, T("BUILD &amp; DELIVERY · prepared before users arrive", "নির্মাণ ও সরবরাহ · ব্যবহারকারী আসার আগেই প্রস্তুত"))}
        ${box(28, 892, 170, 74, T("Source data", "মূল ডেটা"), [T("Weekly cases, weather,", "সাপ্তাহিক রোগী, আবহাওয়া,"), T("ward vulnerability", "ওয়ার্ড ঝুঁকিপ্রবণতা")], B)}
        ${box(218, 892, 170, 74, T("Model training", "মডেল প্রশিক্ষণ"), [T("Lagged weather features", "বিলম্বিত আবহাওয়া বৈশিষ্ট্য"), T("9 boosted-tree models", "৯টি বুস্টেড-ট্রি মডেল")], B)}
        ${box(408, 892, 170, 74, T("Evaluation", "মূল্যায়ন"), [T("Train 2016–22 · Val 2023", "প্রশিক্ষণ ১৬–২২ · যাচাই ২৩"), T("Test 2024–25 held out", "পরীক্ষা ২৪–২৫ অদেখা")], B)}
        ${box(598, 892, 170, 74, T("Release package", "রিলিজ প্যাকেজ"), [T("Records, models, metrics", "রেকর্ড, মডেল, মেট্রিক্স"), T("and thresholds bundled", "এবং সীমা সংযুক্ত")], B)}
        ${box(788, 892, 170, 74, T("Static hosting + CDN", "স্ট্যাটিক হোস্টিং + CDN"), [T("Served once, then", "একবার লোড হয়, এরপর"), T("cached by the browser", "ব্রাউজারে ক্যাশ থাকে")], B)}
        <path class="ln" d="M198 929H216"/><path class="ln" d="M388 929H406"/><path class="ln" d="M578 929H596"/><path class="ln" d="M768 929H786"/>
        <path class="ln3" d="M900 855V827"/><text class="s" x="890" y="846" text-anchor="end">${T("published to the data layer", "ডেটা স্তরে প্রকাশিত")}</text>
      </svg>
      <div class="ax-legend">
        <span><i style="border-color:#38bdf8"></i>${T("user actions and results", "ব্যবহারকারীর পদক্ষেপ ও ফলাফল")}</span>
        <span><i style="border-color:#22d3a5"></i>${T("forecast pipeline", "পূর্বাভাস পাইপলাইন")}</span>
        <span><i style="border-color:#fb923c;border-top-style:dashed"></i>${T("data &amp; model assets loaded on demand", "চাহিদা অনুযায়ী ডেটা ও মডেল লোড")}</span>
        <span><i style="border-color:#a78bfa"></i>${T("build &amp; delivery", "নির্মাণ ও সরবরাহ")}</span>
      </div>

      <h4 style="margin:22px 0 6px">${T("System Layers &amp; Responsibilities", "সিস্টেমের স্তর ও দায়িত্ব")}</h4>
      <table class="arch-table">
        <thead><tr><th>${T("Layer", "স্তর")}</th><th>${T("Responsibility", "দায়িত্ব")}</th><th>${T("Main components", "প্রধান উপাদান")}</th></tr></thead>
        <tbody>
          <tr><td>${T("Users", "ব্যবহারকারী")}</td><td>${T("Decide where to deploy field teams, order IV fluid reserves, and mobilize ward cleanups", "কোথায় মাঠ দল পাঠাবেন, স্যালাইন মজুত ও ওয়ার্ড পরিষ্কারের সিদ্ধান্ত")}</td><td>${T("Health officers, municipal engineers, hospital triage directors, community volunteers", "স্বাস্থ্য কর্মকর্তা, পৌর প্রকৌশলী, হাসপাতাল পরিচালক, স্বেচ্ছাসেবক")}</td></tr>
          <tr><td>${T("Presentation", "উপস্থাপনা")}</td><td>${T("Deliver bilingual (EN/BN), dark/light responsive GIS views, ranked tables and action hubs", "দ্বিভাষিক (EN/BN), ডার্ক/লাইট রেসপন্সিভ চার্ট, র‍্যাংক করা সারণি ও অ্যাকশন হাব")}</td><td>${T("Risk board, Ward deep-dive, Scenarios, Validation, Events, Webinars, Community Forum", "ঝুঁকি বোর্ড, ওয়ার্ড বিশ্লেষণ, পরিস্থিতি, যাচাই, ইভেন্টস, ওয়েবিনার, ফোরাম")}</td></tr>
          <tr><td>${T("Application", "অ্যাপ্লিকেশন")}</td><td>${T("Edge ML engine: validates input data, builds weather lags, predicts cases, calculates drivers", "এজ এমএল ইঞ্জিন: ডেটা যাচাই, বিলম্ব তৈরি, রোগী পূর্বাভাস, কারণ বিশ্লেষণ")}</td><td>${T("Intake validator, ward lag processor, GBT inference engine, Poisson/Quantile evaluator, scenario simulator", "ইনটেক ভ্যালিডেটর, ল্যাগ প্রসেসর, GBT ইঞ্জিন, পয়সন/কোয়ান্টাইল মূল্যায়নকারী, সিমুলেটর")}</td></tr>
          <tr><td>${T("Data &amp; model", "ডেটা ও মডেল")}</td><td>${T("Supplies versioned, tamper-proof offline models, historical records, and calibrated thresholds", "সংস্করণকৃত অফলাইন মডেল, ঐতিহাসিক রেকর্ড ও ক্যালিব্রেটেড সীমা সরবরাহ")}</td><td>${T("31,320 ward-week dataset, 9 tree ensembles, held-out validation metrics, risk cutoffs", "৩১,৩২০টি সারি, ৯টি ট্রি এনসেম্বল, অদেখা যাচাই মেট্রিক্স, ঝুঁকির সীমা")}</td></tr>
          <tr><td>${T("Build &amp; delivery", "নির্মাণ ও সরবরাহ")}</td><td>${T("Offline model training, strict chronological evaluation, and static asset distribution", "অফলাইন মডেল প্রশিক্ষণ, কঠোর কালানুক্রমিক মূল্যায়ন ও স্ট্যাটিক ফাইল বিতরণ")}</td><td>${T("Scikit-learn pipeline, train/val/test splitter, release packager, zero-dependency hosting", "Scikit-learn পাইপলাইন, ট্রেন/ভ্যাল/টেস্ট বিভাজন, রিলিজ প্যাকেজার, স্ট্যাটিক হোস্টিং")}</td></tr>
        </tbody>
      </table>

      <h4 style="margin:22px 0 6px">${T("Life of a request — from click to chart", "একটি অনুরোধের জীবনচক্র — ক্লিক থেকে চার্ট")}</h4>
      <table class="arch-table">
        <thead><tr><th>#</th><th>${T("Step", "ধাপ")}</th><th>${T("What happens", "কী ঘটে")}</th></tr></thead>
        <tbody>
          <tr><td>${D(1)}</td><td>${T("User action", "ব্যবহারকারীর পদক্ষেপ")}</td><td>${T("An officer picks a city, an origin week and a horizon (+2, +3 or +4 weeks), or drags a what-if slider. The session state is updated.", "একজন কর্মকর্তা শহর, সপ্তাহ ও সময়সীমা (+২, +৩ বা +৪ সপ্তাহ) বেছে নেন বা স্লাইডার টানেন।")}</td></tr>
          <tr><td>${D(2)}</td><td>${T("Intake &amp; validation", "গ্রহণ ও যাচাই")}</td><td>${T("The built-in weekly records — or a newly uploaded spreadsheet — are checked for the required columns and sensible values.", "বিল্ট-ইন রেকর্ড বা আপলোড করা স্প্রেডশিটে প্রয়োজনীয় কলাম ও সঠিক মান যাচাই হয়।")}</td></tr>
          <tr><td>${D(3)}</td><td>${T("Ward preparation", "ওয়ার্ড প্রস্তুতি")}</td><td>${T("Rows are grouped per ward and sorted by week; gaps of up to 2 weeks are filled, otherwise the typical value is used.", "সারিগুলো ওয়ার্ড অনুযায়ী সাজানো হয়; ২ সপ্তাহ পর্যন্ত শূন্যতা পূরণ করা হয়।")}</td></tr>
          <tr><td>${D(4)}</td><td>${T("Feature building", "বৈশিষ্ট্য তৈরি")}</td><td>${T("For each ward, only data up to the origin week is used: rainfall lags 0–7 weeks, rolling totals, temperature and humidity lags, recent case trend, vulnerability and the season of the target week.", "প্রতিটি ওয়ার্ডের জন্য সতর্কতার সপ্তাহ পর্যন্ত তথ্য ব্যবহার করে ০–৭ সপ্তাহের বৃষ্টির বিলম্ব, তাপমাত্রা, আর্দ্রতা, রোগীর ধারা, ঝুঁকি ও মৌসুম তৈরি হয়।")}</td></tr>
          <tr><td>${D(5)}</td><td>${T("Prediction", "পূর্বাভাস")}</td><td>${T("Three trained models (expected, low, high) for the chosen horizon are evaluated for all 60 wards, giving expected cases and an 80% range — typically in under 50 ms.", "সব ৬০টি ওয়ার্ডের জন্য ৩টি প্রশিক্ষিত মডেল (গড়, নিম্ন, উচ্চ) ৫০ মিলিসেকেন্ডের কমে ৮০% সীমাসহ পূর্বাভাস দেয়।")}</td></tr>
          <tr><td>${D(6)}</td><td>${T("Risk classification", "ঝুঁকি শ্রেণিবিন্যাস")}</td><td>${T("Expected cases are compared with thresholds calibrated on 2023 data to give Low, Medium, High or Critical, each with a recommended action.", "সম্ভাব্য রোগীকে ২০২৩ ডেটায় নির্ধারিত সীমার সাথে তুলনা করে নিম্ন, মাঝারি, উচ্চ বা সংকটজনক স্তর ও পদক্ষেপ দেওয়া হয়।")}</td></tr>
          <tr><td>${D(7)}</td><td>${T("Explanation", "ব্যাখ্যা")}</td><td>${T("Each factor group (rainfall, temperature, humidity, case trend, vulnerability, season) is swapped for its typical value; the drop in forecast is that factor's contribution.", "প্রতিটি উপাদান গোষ্ঠীকে সাধারণ মানে বদলে পূর্বাভাসে যে পরিবর্তন হয় তা থেকে কারণগুলোর অবদান নির্ণয় করা হয়।")}</td></tr>
          <tr><td>${T("W", "স")}</td><td>${T("What-if branch", "সম্ভাব্য পরিস্থিতি শাখা")}</td><td>${T("On the What-if view, past rainfall is scaled and heat/humidity shifted, totals are recomputed and steps 4–7 re-run instantly for the chosen ward.", "সম্ভাব্য পরিস্থিতি ট্যাবে বৃষ্টি, তাপ ও আর্দ্রতা বদলে ধাপ ৪–৭ তাৎক্ষণিকভাবে পুনরায় চলে।")}</td></tr>
          <tr><td>${D(8)}</td><td>${T("Result packaging", "ফলাফল বিন্যাস")}</td><td>${T("Rankings, KPIs, tier counts, forecast bands and driver breakdowns are assembled for the views.", "র‍্যাংকিং, KPI, স্তরের সংখ্যা, পূর্বাভাস সীমা ও কারণ বিশ্লেষণ সাজানো হয়।")}</td></tr>
          <tr><td>${D(9)}</td><td>${T("Rendering", "প্রদর্শন")}</td><td>${T("Only the visible view is redrawn; charts update in place, and the current forecast can be exported as a report.", "কেবল দৃশ্যমান ট্যাবটি পুনরায় আঁকা হয় এবং বর্তমান পূর্বাভাস প্রতিবেদন হিসেবে ডাউনলোড করা যায়।")}</td></tr>
        </tbody>
      </table>

      <h4 style="margin:22px 0 6px">${T("Technology stack", "প্রযুক্তি স্ট্যাক")}</h4>
      <table class="arch-table">
        <thead><tr><th>${T("Concern", "ক্ষেত্র")}</th><th>${T("Choice", "পছন্দ")}</th><th>${T("Why", "কারণ")}</th></tr></thead>
        <tbody>
          <tr><td>${T("User interface", "ব্যবহারকারী ইন্টারফেস")}</td><td>${T("Responsive single-page web app with tabbed views", "ট্যাবযুক্ত রেসপন্সিভ সিঙ্গেল-পেজ ওয়েব অ্যাপ")}</td><td>${T("No installation; works on laptops, tablets and phones", "ইনস্টলেশন লাগে না; ল্যাপটপ, ট্যাবলেট ও ফোনে চলে")}</td></tr>
          <tr><td>${T("Charts", "চার্ট")}</td><td>${T("Interactive charting library, bundled with the app", "অ্যাপের সাথে যুক্ত ইন্টারেক্টিভ চার্ট লাইব্রেরি")}</td><td>${T("Hover, zoom and heatmaps without external services", "বাহ্যিক সেবা ছাড়াই হোভার, জুম ও হিটম্যাপ")}</td></tr>
          <tr><td>${T("Forecast model", "পূর্বাভাস মডেল")}</td><td>${T("Gradient-boosted decision trees: Poisson mean, 10% / 90% quantile bands", "গ্র্যাডিয়েন্ট-বুস্টেড ডিসিশন ট্রি: পয়সন গড়, ১০% / ৯০% কোয়ান্টাইল সীমা")}</td><td>${T("Suits count data and lagged tabular features; gives calibrated ranges", "রোগীর সংখ্যা ও বিলম্বিত ডেটার উপযোগী; নির্ভুল সীমা দেয়")}</td></tr>
          <tr><td>${T("Horizons", "সময়সীমা")}</td><td>${T("Separate model per horizon (+2, +3, +4 weeks)", "প্রতিটি সময়সীমার (+২, +৩, +৪ সপ্তাহ) জন্য আলাদা মডেল")}</td><td>${T("Avoids error compounding from step-by-step forecasting", "ধাপে ধাপে পূর্বাভাসের ত্রুটি জমা হওয়া এড়ায়")}</td></tr>
          <tr><td>${T("Hosting", "হোস্টিং")}</td><td>${T("Static hosting behind a CDN", "CDN-এর অধীনে স্ট্যাটিক হোস্টিং")}</td><td>${T("Cheap, fast and globally cacheable; no database or application server to run", "সাশ্রয়ী, দ্রুত ও ক্যাশযোগ্য; কোনো ডাটাবেস বা সার্ভার লাগে না")}</td></tr>
        </tbody>
      </table>

      <h4 style="margin:22px 0 6px">${T("Quality attributes", "গুণগত বৈশিষ্ট্য")}</h4>
      <table class="arch-table">
        <thead><tr><th>${T("Attribute", "বৈশিষ্ট্য")}</th><th>${T("How the architecture delivers it", "আর্কিটেকচার কীভাবে এটি নিশ্চিত করে")}</th></tr></thead>
        <tbody>
          <tr><td>${T("Performance", "কর্মক্ষমতা")}</td><td>${T("Heavy learning is done once during build; at run time the service only looks up tree values, so a full 60-ward forecast takes well under 50 ms.", "ভারী প্রশিক্ষণ বিল্ড সময়ে একবারই হয়; চালানোর সময় কেবল ট্রি মান দেখা হয়, তাই ৬০টি ওয়ার্ডের পূর্বাভাসে ৫০ মিলিসেকেন্ডের কম লাগে।")}</td></tr>
          <tr><td>${T("Scalability", "স্কেলেবিলিটি")}</td><td>${T("Each user's device does its own computing, so more users add no server load — the CDN simply serves the same files.", "প্রতিটি ব্যবহারকারীর ডিভাইস নিজেই গণনা করে, তাই বেশি ব্যবহারকারীতেও সার্ভারে চাপ পড়ে না।")}</td></tr>
          <tr><td>${T("Privacy &amp; security", "গোপনীয়তা ও নিরাপত্তা")}</td><td>${T("No accounts, no credentials, no third-party calls. Uploaded ward records stay on the user's device and are never transmitted.", "কোনো অ্যাকাউন্ট বা তৃতীয়-পক্ষের কল নেই। আপলোড করা রেকর্ড ডিভাইসেই থাকে।")}</td></tr>
          <tr><td>${T("Reliability", "নির্ভরযোগ্যতা")}</td><td>${T("No backend, database or external API to fail. Once loaded, the dashboard keeps working through network drops.", "কোনো ব্যাকএন্ড বা বাহ্যিক API নেই। একবার লোড হলে ইন্টারনেট না থাকলেও কাজ করে।")}</td></tr>
          <tr><td>${T("Trustworthy accuracy", "বিশ্বাসযোগ্য নির্ভুলতা")}</td><td>${T("Chronological train / validation / test split, never shuffled; results shown on the Model validation view are from weeks the models never saw.", "কালানুক্রমিক প্রশিক্ষণ / যাচাই / পরীক্ষা বিভাজন; মডেল যাচাইকরণে প্রদর্শিত ফলাফল অদেখা সপ্তাহের ওপর ভিত্তি করে।")}</td></tr>
          <tr><td>${T("Explainability", "ব্যাখ্যাযোগ্যতা")}</td><td>${T("Every forecast comes with an 80% range, a risk tier, a recommended action and a driver breakdown.", "প্রতিটি পূর্বাভাসের সাথে ৮০% সীমা, ঝুঁকির স্তর, প্রস্তাবিত পদক্ষেপ ও কারণের বিশ্লেষণ থাকে।")}</td></tr>
          <tr><td>${T("Maintainability", "রক্ষণাবেক্ষণযোগ্যতা")}</td><td>${T("Retraining produces a new release package; the interface and forecast service stay unchanged.", "পুনরায় প্রশিক্ষণে কেবল নতুন রিলিজ প্যাকেজ তৈরি হয়; ইন্টারফেস ও সেবা অপরিবর্তিত থাকে।")}</td></tr>
        </tbody>
      </table>`;
    function D_col() { return D_HEX; }
  }
  const D_HEX = "#facc15";

  // ------------------------------------------------------------------ ward search (dropdown)
  function initSearch() {
    const inp = $("wsearch"), dd = $("wsearchDd"), box = $("wsearchBox");
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const norm = s => String(s).toLowerCase().replace(/[_\s-]+/g, " ").trim();
    let hits = [], active = -1;

    const hl = (text, q) => {
      if (!q) return esc(text);
      const i = norm(text).indexOf(q); if (i < 0 || norm(text).length !== String(text).length) return esc(text);
      return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
    };
    const find = q => {
      q = norm(q);
      const pool = allRows.slice().sort((a, b) => b.pred - a.pred);
      if (!q) return { list: pool.slice(0, 8), q, top: true };
      const terms = q.split(" ");
      const list = pool.filter(r => {
        const hay = norm(r.ward_id + " " + wardLabel(r.ward_id) + " " + r.city + " " + cityLabel(r.city) + " " + r.tier + " " + tierLabel(r.tier));
        return terms.every(t => hay.includes(t));
      });
      list.sort((a, b) => (norm(b.ward_id).startsWith(q) - norm(a.ward_id).startsWith(q)));
      return { list: list.slice(0, 12), q, total: list.length };
    };
    const close = () => { dd.hidden = true; inp.setAttribute("aria-expanded", "false"); active = -1; inp.removeAttribute("aria-activedescendant"); };
    const setActive = i => {
      const opts = dd.querySelectorAll(".opt"); if (!opts.length) return;
      active = (i + opts.length) % opts.length;
      opts.forEach((o, k) => o.classList.toggle("on", k === active));
      opts[active].scrollIntoView({ block: "nearest" }); inp.setAttribute("aria-activedescendant", opts[active].id);
    };
    const render = () => {
      if (!inp.value.trim()) { close(); hits = []; dd.innerHTML = ""; return; }
      const res = find(inp.value); hits = res.list;
      let h = res.top ? `<li class="hd" role="presentation">${T("Highest risk this week", "এই সপ্তাহের সর্বোচ্চ ঝুঁকি")}</li>` : "";
      if (!hits.length) h += `<li class="empty" role="presentation">${T(`No ward matches “${esc(inp.value.trim())}”`, `“${esc(inp.value.trim())}” কোনো ওয়ার্ডের সাথে মেলেনি`)}</li>`;
      h += hits.map((r, i) => `<li class="opt" role="option" id="wopt${i}" data-i="${i}">${EMOJI[r.tier]}<span class="nm">${hl(wardLabel(r.ward_id), res.q)}</span><span class="small">${hl(cityLabel(r.city), res.q)}</span><span class="meta">${tierLabel(r.tier)} · ${f1d(r.pred)}${T("/wk", "/স")}</span></li>`).join("");
      if (res.total > hits.length) h += `<li class="hd" role="presentation">${isBn() ? `${D(res.total)}টির মধ্যে ${D(hits.length)}টি দেখাচ্ছে। সংকুচিত করতে টাইপ করুন` : `Showing ${hits.length} of ${res.total}. Keep typing to narrow down`}</li>`;
      dd.innerHTML = h; dd.hidden = false; inp.setAttribute("aria-expanded", "true"); active = -1;
    };
    const pick = i => {
      const r = hits[i]; if (!r) return;
      if (S.city !== "All cities" && r.city !== S.city) { S.city = r.city; $("city").value = r.city; recompute(); }
      for (const id of ["w2", "w3"]) $(id).value = r.ward_id;
      inp.value = wardLabel(r.ward_id); close();
      const tab = document.querySelector('#tabs button[data-t="t2"]'); if (tab) tab.click();
      r2(); r3(); inp.blur();
    };

    inp.addEventListener("input", render);
    inp.addEventListener("keydown", e => {
      if (e.key === "ArrowDown") { e.preventDefault(); if (dd.hidden) render(); if (dd.hidden) return; setActive(active + 1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (dd.hidden) render(); if (dd.hidden) return; setActive(active - 1); }
      else if (e.key === "Enter") { e.preventDefault(); if (!dd.hidden && hits.length) pick(active >= 0 ? active : 0); }
      else if (e.key === "Escape") { if (!dd.hidden) close(); else inp.value = ""; }
    });
    dd.addEventListener("mousedown", e => { const li = e.target.closest(".opt"); if (li) { e.preventDefault(); pick(+li.dataset.i); } });
    dd.addEventListener("mousemove", e => { const li = e.target.closest(".opt"); if (li) { const opts = [...dd.querySelectorAll(".opt")]; active = opts.indexOf(li); opts.forEach((o, k) => o.classList.toggle("on", k === active)); } });
    document.addEventListener("mousedown", e => { if (!box.contains(e.target)) close(); });
  }

  // ------------------------------------------------------------------ wiring
  function renderHorizonButtons() {
    const seg = $("hSeg");
    seg.innerHTML = "";
    for (const h of HORIZONS) {
      const b = document.createElement("button");
      b.textContent = isBn() ? `${D(h)} সপ্তাহ` : `${h} wks`;
      b.dataset.h = h;
      b.classList.toggle("on", h === S.h);
      seg.appendChild(b);
    }
  }

  function boot() {
    renderHorizonButtons();
    const syncSeg = () => $("hSeg").querySelectorAll("button").forEach(b => b.classList.toggle("on", +b.dataset.h === S.h));
    $("hSeg").onclick = e => { if (e.target.dataset.h) { S.h = +e.target.dataset.h; syncSeg(); recompute(); if (activeTab() === "t4") r4(); } };
    $("city").onchange = e => { S.city = e.target.value; recompute(); };
    $("origin").oninput = e => { S.oi = +e.target.value; recompute(); };
    $("w2").onchange = r2; $("w3").onchange = r3;
    initSearch();
    ["mult", "dT", "dH", "win"].forEach(id => $(id).oninput = r3);
    $("tabs").onclick = e => {
      const btn = e.target.closest("button"); const t = btn && btn.dataset.t; if (!t) return;
      $("tabs").querySelectorAll("button").forEach(b => b.classList.toggle("on", b === btn));
      document.querySelectorAll(".pane").forEach(p => p.hidden = p.id !== t);
      renderAll();
      window.dispatchEvent(new Event("resize"));
    };
    let uploadedFileName = "";
    function syncUploadUI() {
      const btn = $("uploadBtn"), nameEl = $("uploadName");
      if (btn) btn.textContent = T("Choose File", "ফাইল বাছাই করুন");
      if (nameEl) {
        nameEl.textContent = uploadedFileName || T("No file chosen", "কোনো ফাইল নির্বাচিত হয়নি");
        nameEl.title = uploadedFileName || "";
      }
    }
    if ($("uploadBtn")) $("uploadBtn").onclick = () => $("upload").click();
    $("upload").onchange = async e => {
      const f = e.target.files[0];
      uploadedFileName = f ? f.name : "";
      syncUploadUI();
      if (!f) return;
      try {
        const wards = DW.buildWards(DW.parseCSV(await f.text()));
        if (!wards.length || DW.originsOf(wards).length < 1) throw new Error(T("need at least 8 weeks of data per ward", "প্রতি ওয়ার্ডের জন্য কমপক্ষে ৮ সপ্তাহের ডেটা প্রয়োজন"));
        window.__defaultData = false; setData(wards);
        $("uploadMsg").textContent = isBn() ? `✅ লোড হয়েছে ${f.name}` : `✅ Loaded ${f.name}`;
        syncSeg(); recompute();
      } catch (err) { $("uploadMsg").textContent = T("⚠️ Could not read file: ", "⚠️ ফাইল পড়া যায়নি: ") + err.message; }
    };
    window.__defaultData = true;
    setData(DW.buildWards(DW.parseCSV(window.DATASET_CSV)));
    $("loading").hidden = true; $("app").hidden = false;
    syncUploadUI(); syncSeg(); r5(); r6(); recompute();
    window.dispatchEvent(new Event("resize"));

    window.addEventListener("dg:langchange", () => {
      renderHorizonButtons();
      updateCitySelect(true);
      updateDataLabel();
      syncUploadUI();
      r5();
      r6();
      recompute();
      window.dispatchEvent(new Event("resize"));
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
