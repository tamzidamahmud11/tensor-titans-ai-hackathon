(function () {
  // Built-in answers: checked FIRST, so common questions cost zero API calls and work offline.
  const FAQ = [
    { k: ["tier", "low", "medium", "high", "critical", "risk level", "colour", "color"], a: "Risk tiers (Low, Medium, High, Critical) come from the expected weekly cases per ward. The cut-offs were calibrated on 2023 data and are shown under the heatmap on the Risk board. High and Critical wards need action first." },
    { k: ["start", "begin", "how do i use", "how to use", "get started", "help me use"], a: "Start in the sidebar: pick a city corporation, the week the warning is issued, and the window (+2, +3 or +4 weeks). Then read the Risk board: tier counts at the top, ranked wards in the table, and the Response planner to see where teams should go first." },
    { k: ["planner", "team", "spray", "teams"], a: "The Response planner (Risk board) lets you enter how many spraying teams you have. It sends them to the wards with the most expected cases and shows what share of expected cases that covers." },
    { k: ["lag", "why rain", "rain", "delay", "week ago"], a: "Rain does not cause cases the next day. Eggs take 7-14 days to become adult mosquitoes, then the virus incubates, so rain 2-6 weeks back drives today's warning. The model uses rainfall from the past 0-7 weeks for each ward." },
    { k: ["driver", "main driver", "why is this ward", "why high"], a: "The Main driver column shows which group of inputs (rainfall, temperature, humidity, recent case trend, ward vulnerability or season) changes the forecast most. Open the Ward deep-dive tab for the charts behind it." },
    { k: ["what if", "what-if", "scenario", "slider"], a: "On the What-if scenarios tab, pick a ward and change rainfall, temperature or humidity. The forecast updates instantly in your browser so you can stress-test a ward." },
    { k: ["accurate", "accuracy", "error", "mae", "rmse", "validation", "trust", "reliable"], a: "On held-out 2024-2025 data, the 3-week forecast is off by about 1 case per ward per week on average, and the 80% range contains the real value about 94% of the time. See the Model validation tab for details. It supports decisions; it is not a diagnosis." },
    { k: ["download", "export", "csv"], a: "Use the 'Download this forecast (CSV)' button under the ranked table on the Risk board. To use your own data, upload a CSV in the sidebar with the required columns listed in the README." },
    { k: ["upload", "my own data", "own data"], a: "Upload a weekly CSV in the sidebar with: date, city, ward_id, population_density_sqkm, water_logging_risk_index, sanitation_score, avg_temp_c, rainfall_mm, relative_humidity_pct, dengue_cases. Each ward needs at least 8 weeks of data." },
    { k: ["symptom", "fever", "treatment", "medicine", "sick", "doctor"], a: "This tool predicts area-level outbreak risk only. It cannot diagnose or advise on treatment. If someone has high fever, severe pain or bleeding, they should go to a doctor or hospital right away." }
  ];
  // Guided tour and "take me there" navigation: pure browser code, zero API calls.
  const TOUR = [
    { tab: "t1", text: "1/6 Risk board: start here. The coloured boxes count wards by risk tier, the table ranks wards by expected weekly cases, and the Response planner shows where limited spraying teams should go first." },
    { tab: "t2", text: "2/6 Ward deep-dive: pick one ward from the dropdown to see its forecast, the 80% range and the rainfall, temperature and humidity behind it." },
    { tab: "t3", text: "3/6 What-if scenarios: change rainfall, temperature or humidity for a ward and watch the forecast move instantly." },
    { tab: "t4", text: "4/6 Model validation: how accurate the model was on 2024-2025 data it never saw during training." },
    { tab: "t5", text: "5/6 How it works: a plain-language explanation of the rain-to-cases delay and the model." },
    { tab: "t6", text: "6/6 Architecture: the data flow and design choices. That is the whole dashboard. Use the sidebar on the left to change city, week and warning window at any time." }
  ];
  const NAV = [
    { k: ["heatmap", "treemap", "ranked", "table", "risk board", "planner"], tab: "t1", label: "Open Risk board" },
    { k: ["deep-dive", "deep dive", "one ward", "single ward", "ward chart"], tab: "t2", label: "Open Ward deep-dive" },
    { k: ["what if", "what-if", "scenario", "slider"], tab: "t3", label: "Open What-if scenarios" },
    { k: ["validation", "accuracy", "accurate", "mae", "rmse", "trust"], tab: "t4", label: "Open Model validation" },
    { k: ["how it works", "explain the model", "lag", "why rain", "delay"], tab: "t5", label: "Open How it works" },
    { k: ["architecture", "data flow"], tab: "t6", label: "Open Architecture" }
  ];
  const goTab = id => { const b = document.querySelector(`#tabs button[data-t="${id}"]`); if (b) b.click(); };
  const navFor = q => { const t = q.toLowerCase(); return NAV.find(n => n.k.some(k => t.includes(k))); };
  const LOST = ["lost", "confus", "don't understand", "dont understand", "tour", "walk me", "guide me", "show me around", "overview", "whole site", "everything", "where do i"];
  let step = 0;
  function tourStep() {
    const s = TOUR[step]; goTab(s.tab);
    const last = step === TOUR.length - 1;
    say(s.text, "bot", { label: last ? "Finish tour" : "Next", fn: () => { if (last) { say("Tour finished. Ask me anything else, or tap a suggestion.", "bot"); } else { step++; tourStep(); } } });
  }
  function startTour() { step = 0; say("Let's take a quick tour. I will switch tabs for you.", "bot"); tourStep(); }

  const norm = s => s.toLowerCase();
  function faq(q) {
    const t = norm(q); let best = null, bs = 0;
    FAQ.forEach(f => { const s = f.k.filter(k => t.includes(k)).length; if (s > bs) { bs = s; best = f; } });
    return best ? best.a : null;
  }
  const $ = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x) e.textContent = x; return e; };
  const box = $("div", "dgc"), btn = $("button", "dgc-fab", "Ask for help"), panel = $("div", "dgc-panel");
  panel.hidden = true;
  const head = $("div", "dgc-head", "Dengue Guard help"), close = $("button", "dgc-x", "×"); head.appendChild(close);
  const log = $("div", "dgc-log"), form = $("form", "dgc-form"), inp = $("input"), go = $("button", "", "Send");
  inp.placeholder = "Ask how to use the dashboard..."; inp.maxLength = 300; go.type = "submit";
  form.append(inp, go);
  const chips = $("div", "dgc-chips");
  [["Take a tour", () => startTour()], ["How do I start?"], ["What do the risk tiers mean?"], ["Why does rain matter?"], ["How accurate is it?"]].forEach(([t, fn]) => {
    const b = $("button", "", t); b.type = "button"; b.onclick = fn || (() => ask(t)); chips.appendChild(b);
  });
  panel.append(head, log, chips, form); box.append(panel, btn); document.body.appendChild(box);
  const say = (t, who, action) => {
    const m = $("div", "dgc-m " + who, t);
    if (action) { const b = $("button", "dgc-act", action.label); b.type = "button"; b.onclick = () => { b.disabled = true; action.fn(); }; m.appendChild(b); }
    log.appendChild(m); log.scrollTop = log.scrollHeight; return m;
  };
  say("Hi! I can help you use this dashboard and understand the forecasts. I cannot give medical advice.", "bot");
  btn.onclick = () => { panel.hidden = !panel.hidden; if (!panel.hidden) inp.focus(); };
  close.onclick = () => { panel.hidden = true; };
  let busy = false;
  async function ask(q) {
    q = q.trim(); if (!q || busy) return; busy = true; say(q, "me"); inp.value = "";
    if (LOST.some(k => q.toLowerCase().includes(k))) { startTour(); busy = false; return; }   // 0 API calls
    const local = faq(q), nav = navFor(q);
    const act = nav ? { label: nav.label, fn: () => goTab(nav.tab) } : null;
    if (local) { say(local, "bot", act); busy = false; return; }     // 0 API calls
    const wait = say("Thinking...", "bot");
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q, ctx: window.DG_CONTEXT || "" }) });
      const j = await r.json();
      wait.textContent = j.ok ? j.answer : (j.reason === "rate_limited" ? "You are asking very quickly. Please wait a moment and try again." : "I can't reach the AI helper right now. Try one of the suggested questions above, or see the 'How it works' tab.");
      if (j.ok && act) { const b = $("button", "dgc-act", act.label); b.type = "button"; b.onclick = act.fn; wait.appendChild(b); }
    } catch (e) { wait.textContent = "I'm offline right now. Try one of the suggested questions above, or see the 'How it works' tab."; }
    busy = false;
  }
  form.onsubmit = e => { e.preventDefault(); ask(inp.value); };
})();
