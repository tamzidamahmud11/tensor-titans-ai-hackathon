/* Dengue Protirodh - Phase 2 operations tabs (Supply allocation, Bed overflow, Vector simulator, Dispatch).
   Reads the current forecast from window.DG_STATE (set by app.js) and runs window.OPS locally. */
(function () {
  const $ = id => document.getElementById(id);
  const { TIER_COLORS } = DW;
  const OPS_TABS = ["t7", "t8", "t9", "t10"];
  const S = { stockPct: 70, crews: 20, bedScale: 1, manual: null, manualKey: "", dispatchChan: "whatsapp", dispatchFilter: "deficit" };
  let P = null, planKey = "";
  const CFG = { displayModeBar: false, responsive: true };
  const BG = { paper_bgcolor: "rgba(0,0,0,0)", plot_bgcolor: "rgba(0,0,0,0)", font: { color: "#12212b" } };
  const plot = (el, data, layout) => Plotly.react(el, data, { ...BG, margin: { t: 30, l: 50, r: 16, b: 70 }, ...layout }, CFG);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const dot = t => `<span class="dot" style="--c:${TIER_COLORS[t]}"></span>`;
  const pct = v => Math.round(100 * v) + "%";
  const badge = s => s === "OK" ? `<span class="st ok">OK</span>` : s === "CRITICAL DEFICIT" ? `<span class="st crit">CRITICAL</span>` : `<span class="st warn">DEFICIT</span>`;
  const download = (name, text, type = "text/plain") => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: type + ";charset=utf-8" })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };

  function state() { return window.DG_STATE; }
  function ctxKey() { const st = state(); return st ? `${st.origin}|${st.h}|${st.city}|${st.rows.length}` : ""; }
  function compute(force) {
    const st = state(); if (!st || !st.rows.length) { P = null; return null; }
    const key = ctxKey();
    if (S.manualKey !== key) { S.manual = null; S.manualKey = key; }
    const k = [key, S.stockPct, S.crews, S.bedScale, JSON.stringify(S.manual)].join("#");
    if (!force && k === planKey && P) return P;
    P = OPS.plan(st.rows, { stockPct: S.stockPct, crews: S.manual ? Object.values(S.manual).reduce((a, b) => a + b, 0) : S.crews, bedScale: S.bedScale,
      crewAssign: S.manual || undefined, allWards: st.wards });
    planKey = k; window.DG_PLAN = P;
    return P;
  }

  // ------------------------------------------------------------------ shared control bar
  function controls() {
    const box = $("opsCtl");
    box.innerHTML = `
      <div class="opsctl-grid">
        <label>Available regional stock <b id="stV">${S.stockPct}%</b>
          <input type="range" id="stock" min="30" max="100" step="5" value="${S.stockPct}"></label>
        <label>Total spraying crews <b id="crV">${S.manual ? "manual" : S.crews}</b>
          <input type="range" id="crews" min="0" max="60" step="1" value="${S.crews}" ${S.manual ? "disabled" : ""}></label>
        <label>Hospital bed capacity × <b id="bsV">${S.bedScale.toFixed(2)}</b>
          <input type="range" id="bedScale" min="0.5" max="1.5" step="0.05" value="${S.bedScale}"></label>
        <div class="opsctl-sum" id="opsSum"></div>
      </div>`;
    $("stock").oninput = e => { S.stockPct = +e.target.value; $("stV").textContent = S.stockPct + "%"; render(); };
    $("crews").oninput = e => { S.crews = +e.target.value; $("crV").textContent = S.crews; render(); };
    $("bedScale").oninput = e => { S.bedScale = +e.target.value; $("bsV").textContent = S.bedScale.toFixed(2); render(); };
  }
  function summary() {
    const st = state(), t = P.totals;
    $("opsSum").innerHTML = `<b>${esc(st.city)}</b> · warning ${P.origin} → target ${P.target} (+${P.h} wk)<br>
      ${t.critical ? `<span class="st crit">${t.critical} critical deficit ward(s)</span>` : `<span class="st ok">no critical deficits</span>`}
      ${t.deficit - t.critical > 0 ? `<span class="st warn">${t.deficit - t.critical} partial</span>` : ""}
      · crews ${P.crewsUsed}/${P.crews}`;
  }

  // ------------------------------------------------------------------ T7 supply allocation
  function r7() {
    const p = P, st = p.stock, t = p.totals;
    const kpi = (n, l, c) => `<div class="kpi" style="--c:${c}"><div class="n">${n}</div><div class="l">${l}</div></div>`;
    $("o7k").innerHTML = kpi(t.cases.toFixed(0), `predicted cases/wk (planning for ${t.planCases.toFixed(0)} incl. P90 buffer)`, "#38bdf8")
      + kpi(`${st.saline_bags_needed.allocated}<small>/${st.saline_bags_needed.required}</small>`, "saline bags allocated / required", st.saline_bags_needed.unmet ? "#ef4444" : "#22c55e")
      + kpi(`${st.diagnostic_kits_needed.allocated}<small>/${st.diagnostic_kits_needed.required}</small>`, "diagnostic kits allocated / required", st.diagnostic_kits_needed.unmet ? "#ef4444" : "#22c55e")
      + kpi(`${t.bedsReq}<small>/${t.bedCap}</small>`, "hospital beds required / local capacity", t.bedsReq > t.bedCap ? "#ef4444" : "#22c55e")
      + kpi(`${p.crewsUsed}`, `spraying crews assigned (${t.prevented.toFixed(0)} cases prevented, 2–4 wk)`, "#8b5cf6");
    const crit = p.items.filter(x => x.status === "CRITICAL DEFICIT");
    $("o7a").innerHTML = crit.length
      ? `<div class="box err"><b>🚨 Critical supply deficit in ${crit.length} ward(s):</b> ${crit.slice(0, 12).map(x => `${x.ward_id} (${x.alerts.join(", ")})`).join(" · ")}${crit.length > 12 ? " …" : ""}</div>`
      : p.totals.deficit ? `<div class="box warn">⚠️ ${p.totals.deficit} ward(s) partially supplied, none critical.</div>`
        : `<div class="box ok">✅ All ward demand is 100% fulfilled at ${p.stockPct}% stock.</div>`;
    const top = p.items.slice(0, 40), lab = top.map(x => x.ward_id.replace("_Ward_", "-"));
    plot($("o7p"), [
      { type: "bar", name: "Saline required", x: lab, y: top.map(x => x.saline_bags_needed), marker: { color: "#c5d0d8" } },
      { type: "bar", name: "Saline allocated", x: lab, y: top.map(x => x.saline_bags_allocated), marker: { color: top.map(x => x.saline_bags_allocated < x.saline_bags_needed ? "#ef4444" : "#0b6e8a") } },
      { type: "scatter", mode: "lines+markers", name: "Fill %", x: lab, y: top.map(x => 100 * x.salineFill), yaxis: "y2", line: { color: "#f59e0b" } }],
      { title: { text: "Saline: required vs allocated, wards in priority order (red = short)", x: 0.01, font: { size: 14 } }, barmode: "overlay",
        yaxis: { title: "bags", gridcolor: "#dfe6eb" }, yaxis2: { overlaying: "y", side: "right", range: [0, 105], title: "fill %" }, legend: { orientation: "h", y: 1.12 }, xaxis: { tickangle: -60 } });
    $("o7t").innerHTML = `<thead><tr><th>#</th><th>Ward</th><th>Risk</th><th>Density /km²</th><th>Priority</th><th>Pred. cases</th>
      <th>Saline alloc/req</th><th>Kits alloc/req</th><th>Beds req</th><th>Crews (sugg.)</th><th>Status</th></tr></thead><tbody>` +
      p.items.map((x, i) => `<tr class="${x.status === "CRITICAL DEFICIT" ? "rcrit" : x.status === "DEFICIT" ? "rwarn" : ""}"><td>${i + 1}</td><td>${x.ward_id}<br><small>${x.city}</small></td><td>${dot(x.tier)} ${x.tier}</td>
        <td>${x.dens.toLocaleString()}</td><td title="tier ${x.tierW} × density ${x.densF.toFixed(2)}">${x.priority.toFixed(2)}</td><td>${x.pred.toFixed(1)}</td>
        <td>${x.saline_bags_allocated}/${x.saline_bags_needed} <small>${pct(x.salineFill)}</small></td><td>${x.diagnostic_kits_allocated}/${x.diagnostic_kits_needed} <small>${pct(x.kitFill)}</small></td>
        <td>${x.bedsReq}</td><td>${x.crews} <small>(${x.crewsNeeded})</small></td><td>${badge(x.status)}${x.alerts.length ? `<br><small>${esc(x.alerts.join("; "))}</small>` : ""}</td></tr>`).join("") + "</tbody>";
    $("o7dl").onclick = () => download(`allocation_plan_${p.origin}_h${p.h}_stock${p.stockPct}.csv`, OPS.planCSV(p), "text/csv");
  }

  // ------------------------------------------------------------------ T8 overflow routing
  function r8() {
    const p = P, cs = Object.values(p.cities);
    $("o8c").innerHTML = cs.map(c => `<div class="card citycard ${c.unmet ? "bad" : c.routed ? "mid" : ""}"><h4>${c.city}</h4>
      <div class="util"><i style="width:${Math.min(100, 100 * c.utilization)}%"></i></div>
      <div><b>${pct(c.utilization)}</b> bed utilisation (${c.occupied}/${c.bedCap})</div>
      <div class="small">Demand ${c.bedsReq} beds (${pct(c.demandRatio)} of capacity) · ${c.overflowWards} ward(s) over capacity</div>
      <div class="small">Overflow ${c.overflow} → routed <b>${c.routed}</b> · remaining headroom <b>${c.headroom}</b></div>
      ${c.unmet ? `<div class="st crit">Net city deficit: ${c.unmet} bed(s)</div>` : `<div class="st ok">All patients placed in-city</div>`}</div>`).join("");
    if (p.transfers.length) {
      const nodes = [...new Set(p.transfers.flatMap(t => [t.from, t.to]))], ni = Object.fromEntries(nodes.map((n, i) => [n, i]));
      const tierOf = Object.fromEntries(p.items.map(x => [x.ward_id, x.tier]));
      plot($("o8s"), [{ type: "sankey", arrangement: "snap", node: { label: nodes, pad: 12, thickness: 14, color: nodes.map(n => TIER_COLORS[tierOf[n]] || "#999") },
        link: { source: p.transfers.map(t => ni[t.from]), target: p.transfers.map(t => ni[t.to]), value: p.transfers.map(t => t.patients), color: "rgba(11,110,138,.25)" } }],
        { title: { text: "Patient transfers (left = overflowing ward, right = receiving ward, same city only)", x: 0.01, font: { size: 14 } }, margin: { t: 34, l: 10, r: 10, b: 10 } });
    } else { Plotly.purge($("o8s")); $("o8s").innerHTML = `<div class="box info">No transfers needed or possible: ${p.totals.bedsReq <= p.totals.bedCap ? "every overflowing ward fits locally" : "receiving wards have no spare beds"}. Try a lower bed-capacity × or a peak week.</div>`; }
    $("o8t").innerHTML = `<thead><tr><th>City</th><th>From ward</th><th>To ward</th><th>Patients</th><th>Receiver risk</th></tr></thead><tbody>` +
      (p.transfers.map(t => `<tr><td>${t.city}</td><td>${t.from}</td><td>${t.to}</td><td><b>${t.patients}</b></td><td>${dot(t.toTier)} ${t.toTier}</td></tr>`).join("") || `<tr><td colspan="5">No transfers.</td></tr>`) + "</tbody>";
    const over = p.items.filter(x => x.overflow > 0 || x.received > 0).sort((a, b) => b.netDeficit - a.netDeficit || b.overflow - a.overflow);
    $("o8w").innerHTML = `<thead><tr><th>Ward</th><th>Risk</th><th>Beds required</th><th>Local beds</th><th>Overflow</th><th>Sent</th><th>Received</th><th>Net deficit</th></tr></thead><tbody>` +
      (over.map(x => `<tr class="${x.netDeficit ? "rcrit" : ""}"><td>${x.ward_id}<br><small>${x.city}</small></td><td>${dot(x.tier)} ${x.tier}</td><td>${x.bedsReq}</td><td>${x.bedCap}</td><td>${x.overflow}</td><td>${x.sent}</td><td>${x.received}</td><td><b>${x.netDeficit}</b></td></tr>`).join("") || `<tr><td colspan="8">No ward exceeds its bed capacity.</td></tr>`) + "</tbody>";
    $("o8dl").onclick = () => download(`overflow_transfers_${p.origin}_h${p.h}.csv`, OPS.transfersCSV(p), "text/csv");
  }

  // ------------------------------------------------------------------ T9 vector-control simulator
  function r9() {
    const p = P, st = state();
    const assign = Object.fromEntries(p.items.map(x => [x.ward_id, x.crews]));
    const ranking = OPS.roiRanking(st.rows, p.origin);
    const sims = st.rows.map(r => { const c = OPS.crewCurve(r.ward, p.origin); return c ? c[Math.min(assign[r.ward_id] || 0, OPS.CONFIG.maxCrewsPerWard)] : null; }).filter(Boolean);
    const H = OPS.CONFIG.horizons, base = H.map(h => sims.reduce((s, x) => s + x.byH[h].base, 0)), tr = H.map(h => sims.reduce((s, x) => s + x.byH[h].treated, 0));
    const prev = base.reduce((a, b) => a + b, 0) - tr.reduce((a, b) => a + b, 0), used = Object.values(assign).reduce((a, b) => a + b, 0);
    const beds = sims.reduce((s, x) => s + x.bedsFreed, 0), sal = sims.reduce((s, x) => s + x.salineSaved, 0);
    $("o9mode").innerHTML = S.manual ? `<b>Manual deployment</b> (${used} crews). <button class="btn sm" id="o9auto">↺ Back to auto-optimise</button>`
      : `<b>Auto-optimised</b>: ${used} crews placed one at a time where the next crew prevents the most cases (× density). Edit any number below to deploy manually.`;
    if ($("o9auto")) $("o9auto").onclick = () => { S.manual = null; render(); };
    const kpi = (n, l, c) => `<div class="kpi" style="--c:${c}"><div class="n">${n}</div><div class="l">${l}</div></div>`;
    $("o9k").innerHTML = kpi(prev.toFixed(1), "cases prevented over weeks +2…+4", "#22c55e") + kpi(used ? (prev / used).toFixed(2) : "–", "cases prevented per crew (ROI)", "#8b5cf6")
      + kpi(beds.toFixed(1), "hospital beds freed (avg / wk)", "#0b6e8a") + kpi(Math.round(sal), "saline bags saved", "#38bdf8");
    plot($("o9p"), [
      { type: "bar", name: "No intervention (GBT forecast)", x: H.map(h => `+${h} wk`), y: base, marker: { color: "#94a3b8" }, text: base.map(v => v.toFixed(0)), textposition: "outside" },
      { type: "bar", name: "With deployed crews (counterfactual)", x: H.map(h => `+${h} wk`), y: tr, marker: { color: "#22c55e" }, text: tr.map(v => v.toFixed(0)), textposition: "outside" }],
      { title: { text: "Projected cases in this selection, with vs without spraying", x: 0.01, font: { size: 14 } }, barmode: "group", yaxis: { title: "cases / week", gridcolor: "#dfe6eb" }, legend: { orientation: "h", y: -0.15 }, margin: { t: 34, l: 50, r: 16, b: 40 } });
    const top = ranking.slice(0, 15).reverse();
    plot($("o9r"), [{ type: "bar", orientation: "h", x: top.map(r => r.roi1), y: top.map(r => r.ward_id), marker: { color: top.map(r => TIER_COLORS[r.tier]) },
      text: top.map(r => r.roi1.toFixed(1)), textposition: "outside", hovertemplate: "%{y}: %{x:.2f} cases prevented by 1st crew<extra></extra>" }],
      { title: { text: "Intervention ROI: cases prevented by the first crew (top 15)", x: 0.01, font: { size: 14 } }, margin: { t: 34, l: 110, r: 30, b: 40 }, xaxis: { gridcolor: "#dfe6eb" } });
    $("o9t").innerHTML = `<thead><tr><th>ROI rank</th><th>Ward</th><th>Risk</th><th>Baseline cases (+2…+4)</th><th>1st crew</th><th>2nd</th><th>3rd</th><th>4th</th><th>Crews deployed</th><th>Prevented</th><th>ROI / crew</th></tr></thead><tbody>` +
      ranking.map((r, i) => {
        const c = r.curve, n = assign[r.ward_id] || 0, m = k => (c[k].prevented - c[k - 1].prevented).toFixed(2);
        return `<tr><td>${i + 1}</td><td>${r.ward_id}<br><small>${r.city}</small></td><td>${dot(r.tier)} ${r.tier}</td><td>${c[0].base.toFixed(1)}</td>
        <td>${m(1)}</td><td>${m(2)}</td><td>${m(3)}</td><td>${m(4)}</td>
        <td><input type="number" class="crewin" data-w="${r.ward_id}" min="0" max="${OPS.CONFIG.maxCrewsPerWard}" value="${n}"></td>
        <td>${c[n].prevented.toFixed(2)}</td><td>${n ? (c[n].prevented / n).toFixed(2) : "–"}</td></tr>`;
      }).join("") + "</tbody>";
    $("o9t").querySelectorAll(".crewin").forEach(el => el.onchange = () => {
      const m = S.manual || { ...assign };
      m[el.dataset.w] = Math.max(0, Math.min(OPS.CONFIG.maxCrewsPerWard, parseInt(el.value, 10) || 0));
      S.manual = m; render();
    });
  }

  // ------------------------------------------------------------------ T10 dispatch
  function r10() {
    const p = P;
    const pick = p.items.filter(x => S.dispatchFilter === "all" || (S.dispatchFilter === "deficit" ? x.status !== "OK" || x.crews > 0 : x.status === "CRITICAL DEFICIT"));
    const ch = S.dispatchChan;
    document.querySelectorAll("#o10ch button").forEach(b => b.classList.toggle("on", b.dataset.c === ch));
    $("o10f").value = S.dispatchFilter;
    $("o10n").textContent = `${pick.length} notice(s)`;
    if (ch === "brief") {
      $("o10l").innerHTML = `<iframe id="o10if" title="Commissioner brief preview" style="width:100%;height:720px;border:1px solid var(--line);border-radius:10px;background:#fff"></iframe>`;
      $("o10if").srcdoc = OPS.briefHTML({ ...p, items: pick }, { title: `Commissioner brief — ${state().city}` });
    } else {
      $("o10l").innerHTML = pick.map(x => {
        const txt = ch === "sms" ? OPS.smsNotice(p, x) : OPS.whatsappNotice(p, x);
        return `<div class="notice ${x.status === "CRITICAL DEFICIT" ? "crit" : x.status === "DEFICIT" ? "warn" : ""}"><div class="nh"><b>${x.ward_id}</b> · ${x.city} ${badge(x.status)}
          ${ch === "sms" ? `<span class="small">${txt.length}/160 chars</span>` : ""}<button class="btn sm cp">Copy</button></div><pre>${esc(txt)}</pre></div>`;
      }).join("") || `<div class="box ok">No wards match this filter.</div>`;
      $("o10l").querySelectorAll(".cp").forEach(b => b.onclick = () => {
        const t = b.closest(".notice").querySelector("pre").textContent;
        (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => { b.textContent = "Copied ✓"; }, () => { b.textContent = "Select & copy"; });
      });
    }
    const tag = `${p.origin}_h${p.h}`;
    $("o10sms").onclick = () => download(`sms_alerts_${tag}.txt`, pick.map(x => `[${x.ward_id}] ${OPS.smsNotice(p, x)}`).join("\n"));
    $("o10wa").onclick = () => download(`whatsapp_alerts_${tag}.txt`, pick.map(x => OPS.whatsappNotice(p, x)).join("\n\n----------\n\n"));
    $("o10html").onclick = () => download(`commissioner_brief_${tag}.html`, OPS.briefHTML({ ...p, items: pick }, { title: `Commissioner brief — ${state().city}` }), "text/html");
    $("o10pdf").onclick = () => {
      const w = window.open("", "_blank"); if (!w) return alert("Allow pop-ups to print, or use Download HTML brief.");
      w.document.write(OPS.briefHTML({ ...p, items: pick }, { title: `Commissioner brief — ${state().city}` })); w.document.close(); setTimeout(() => w.print(), 400);
    };
    $("o10json").onclick = () => download(`dispatch_${tag}.json`, JSON.stringify({ origin: p.origin, target: p.target, horizon_weeks: p.h, stock_pct: p.stockPct,
      wards: pick.map(x => ({ ward_id: x.ward_id, city: x.city, tier: x.tier, predicted_cases: +x.pred.toFixed(2), saline_bags_needed: x.saline_bags_needed, saline_bags_allocated: x.saline_bags_allocated,
        diagnostic_kits_needed: x.diagnostic_kits_needed, diagnostic_kits_allocated: x.diagnostic_kits_allocated, hospital_beds_required: x.bedsReq, local_beds: x.bedCap,
        transfers_out: p.transfers.filter(t => t.from === x.ward_id), net_bed_deficit: x.netDeficit, spraying_crews: x.crews, status: x.status, alerts: x.alerts,
        sms: OPS.smsNotice(p, x) })) }, null, 2), "application/json");
  }

  // ------------------------------------------------------------------ offline status
  function netStatus() {
    const el = $("netStat"); if (!el) return;
    const on = navigator.onLine;
    el.className = "netstat " + (on ? "on" : "off");
    el.innerHTML = `<b>${on ? "● Online" : "● OFFLINE"}</b> · forecasting, allocation, routing and dispatch all run in this browser${on ? "" : " — nothing is affected"}.`;
  }

  // ------------------------------------------------------------------ render
  function active() { const b = document.querySelector("#tabs button.on"); return b ? b.dataset.t : "t1"; }
  function render() {
    const t = active(), show = OPS_TABS.includes(t);
    $("opsCtl").hidden = !show;
    if (!show) return;
    if (!compute()) return;
    const crV = $("crV"), cr = $("crews");
    if (crV) { crV.textContent = S.manual ? "manual" : S.crews; cr.disabled = !!S.manual; }
    summary();
    try {
      if (t === "t7") r7(); else if (t === "t8") r8(); else if (t === "t9") r9(); else if (t === "t10") r10();
    } catch (e) { console.error(e); $(t).insertAdjacentHTML("afterbegin", `<div class="box err">Operations module error: ${esc(e.message)}</div>`); }
  }
  function init() {
    controls(); netStatus();
    window.addEventListener("online", netStatus); window.addEventListener("offline", netStatus);
    window.addEventListener("dg:recompute", render);
    $("tabs").addEventListener("click", () => setTimeout(render, 0));
    $("o10ch").onclick = e => { const c = e.target.dataset && e.target.dataset.c; if (c) { S.dispatchChan = c; render(); } };
    $("o10f").onchange = e => { S.dispatchFilter = e.target.value; render(); };
    render();
  }
  window.OPSUI = { render, state: S };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
