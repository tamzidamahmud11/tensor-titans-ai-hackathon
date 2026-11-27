// Cookie consent: banner on first visit + settings dialog (reopen via any [data-cookie-settings] link).
// Bilingual (English / Bengali) reactive to dg:langchange.
(function () {
  const KEY = "dg_consent", VER = 1, DAYS = 180;
  const isBn = () => (window.DG_I18N ? window.DG_I18N.isBn() : localStorage.getItem("dg_lang") === "bn");
  const T = (en, bn) => (isBn() ? bn : en);

  const CATS = [
    { id: "necessary",
      name: () => T("Strictly necessary", "অবশ্যই প্রয়োজনীয়"),
      locked: true,
      text: () => T("Remembers your cookie choice so this box does not keep appearing. Always on.", "আপনার কুকি পছন্দ মনে রাখে যাতে এই বক্স বারবার না আসে। সর্বদা চালু।") },
    { id: "preferences",
      name: () => T("Preferences", "পছন্দসমূহ"),
      text: () => T("Would remember display choices such as the selected city or warning window.", "নির্বাচিত শহর বা সতর্কবার্তার সময়সীমার মতো প্রদর্শন পছন্দ মনে রাখবে।") },
    { id: "analytics",
      name: () => T("Analytics", "অ্যানালিটিক্স"),
      text: () => T("Would measure how the site is used so we can improve it. Never includes ward or patient data.", "সাইট কীভাবে ব্যবহৃত হয় তা পরিমাপ করবে যাতে আমরা উন্নতি করতে পারি। কখনো ওয়ার্ড বা রোগীর তথ্য নেয় না।") }
  ];
  const listeners = [];
  const read = () => {
    let raw = null;
    try { const m = document.cookie.match(/(?:^|;\s*)dg_consent=([^;]*)/); if (m) raw = decodeURIComponent(m[1]); } catch (e) {}
    if (!raw) try { raw = localStorage.getItem(KEY); } catch (e) {}
    try { const c = JSON.parse(raw); return c && c.v === VER ? c : null; } catch (e) { return null; }
  };
  const write = c => {
    const v = JSON.stringify(c);
    try { document.cookie = `${KEY}=${encodeURIComponent(v)}; max-age=${DAYS * 86400}; path=/; SameSite=Lax` + (location.protocol === "https:" ? "; Secure" : ""); } catch (e) {}
    try { localStorage.setItem(KEY, v); } catch (e) {}
  };
  let state = read();
  const api = window.DGConsent = {
    get: () => state ? { ...state } : null,
    has: id => id === "necessary" ? true : !!(state && state[id]),
    onChange: fn => listeners.push(fn),
    open: () => openSettings()
  };
  const save = (prefs) => {
    state = { v: VER, necessary: true, preferences: !!prefs.preferences, analytics: !!prefs.analytics, ts: new Date().toISOString() };
    write(state); hideBanner(); closeSettings(true);
    listeners.forEach(fn => { try { fn(api.get()); } catch (e) {} });
  };

  const el = (tag, cls, txt, attrs) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

  // ---------------------------------------------------------------- banner
  let banner = null;
  function showBanner() {
    if (banner) return;
    banner = el("div", "dgk-banner", null, { role: "region", "aria-label": T("Cookie notice", "কুকি বিজ্ঞপ্তি") });
    const t = el("div", "dgk-text");
    t.append(
      el("b", "", T("We value your privacy", "আমরা আপনার গোপনীয়তাকে মূল্য দিই")),
      el("p", "", T("Dengue Protirodh sets one small cookie to remember your choice. Optional cookies stay off unless you allow them.", "ডেঙ্গু প্রতিরোধ আপনার পছন্দ মনে রাখতে একটি ছোট কুকি সংরক্ষণ করে। আপনি অনুমতি না দিলে ঐচ্ছিক কুকি বন্ধ থাকে।"))
    );
    const more = el("a", "", T("Privacy Policy", "গোপনীয়তা নীতি"), { href: (document.getElementById("privacy") ? "#privacy" : "index.html#privacy") });
    t.lastChild.append(" ", more, T(".", "।"));
    const row = el("div", "dgk-actions");
    const rej = el("button", "dgk-btn", T("Reject optional", "ঐচ্ছিক বাতিল"), { type: "button" });
    const set = el("button", "dgk-btn", T("Cookie settings", "কুকি সেটিংস"), { type: "button" });
    const acc = el("button", "dgk-btn dgk-primary", T("Accept all", "সব গ্রহণ করুন"), { type: "button" });
    rej.onclick = () => save({}); acc.onclick = () => save({ preferences: true, analytics: true }); set.onclick = () => openSettings();
    row.append(rej, set, acc); banner.append(t, row); document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add("on"));
  }
  function hideBanner() { if (banner) { banner.remove(); banner = null; } }

  // ---------------------------------------------------------------- settings dialog
  let overlay = null, opener = null;
  function openSettings() {
    if (overlay) return;
    opener = document.activeElement;
    overlay = el("div", "dgk-overlay");
    const dlg = el("div", "dgk-dialog", null, { role: "dialog", "aria-modal": "true", "aria-labelledby": "dgk-title" });
    const head = el("div", "dgk-head");
    const h = el("h2", "", T("Cookie settings", "কুকি সেটিংস"), { id: "dgk-title" });
    const x = el("button", "dgk-x", "×", { type: "button", "aria-label": T("Close cookie settings", "কুকি সেটিংস বন্ধ করুন") });
    x.onclick = () => closeSettings();
    head.append(h, x);
    const intro = el("p", "dgk-intro", T(
      "Choose which cookies you allow. Dengue Protirodh does not currently set optional cookies; your choice is saved so that any we add later stay off unless you agree.",
      "কোন কুকিগুলো অনুমতি দেবেন তা বেছে নিন। ডেঙ্গু প্রতিরোধ বর্তমানে কোনো ঐচ্ছিক কুকি সেট করে না; আপনার পছন্দ সংরক্ষিত থাকে যাতে ভবিষ্যতে কোনো কুকি যোগ হলেও আপনার সম্মতি ছাড়া তা চালু না হয়।"
    ));
    const body = el("div", "dgk-body"); const cur = state || {}; const boxes = {};
    CATS.forEach(c => {
      const row = el("div", "dgk-row"), txt = el("div", "dgk-rt");
      txt.append(el("b", "", c.name()), el("span", "", c.text()));
      const lab = el("label", "dgk-sw"); const inp = el("input", "", null, { type: "checkbox", role: "switch", "aria-label": c.name() });
      inp.checked = c.locked ? true : !!cur[c.id]; inp.disabled = !!c.locked; boxes[c.id] = inp;
      lab.append(inp, el("i")); row.append(txt, lab); body.appendChild(row);
    });
    const foot = el("div", "dgk-foot");
    const rej = el("button", "dgk-btn", T("Reject optional", "ঐচ্ছিক বাতিল"), { type: "button" });
    const sv = el("button", "dgk-btn", T("Save my choices", "পছন্দ সংরক্ষণ করুন"), { type: "button" });
    const acc = el("button", "dgk-btn dgk-primary", T("Accept all", "সব গ্রহণ করুন"), { type: "button" });
    rej.onclick = () => save({}); acc.onclick = () => save({ preferences: true, analytics: true });
    sv.onclick = () => save({ preferences: boxes.preferences.checked, analytics: boxes.analytics.checked });
    foot.append(rej, sv, acc);
    dlg.append(head, intro, body, foot); overlay.appendChild(dlg); document.body.appendChild(overlay);
    document.body.classList.add("dgk-lock");
    overlay.addEventListener("mousedown", e => { if (e.target === overlay) closeSettings(); });
    overlay.addEventListener("keydown", e => {
      if (e.key === "Escape") { e.stopPropagation(); closeSettings(); }
      if (e.key === "Tab") {
        const f = [...dlg.querySelectorAll("button,input:not([disabled])")]; if (!f.length) return;
        const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    (boxes.preferences || x).focus();
  }
  function closeSettings(saved) {
    if (!overlay) return; overlay.remove(); overlay = null; document.body.classList.remove("dgk-lock");
    if (!saved && opener && opener.focus && document.contains(opener)) opener.focus();
    if (!saved && !state) showBanner();
  }

  window.addEventListener("dg:langchange", () => {
    if (banner) { hideBanner(); showBanner(); }
    if (overlay) {
      const prevPref = overlay.querySelectorAll('input[type="checkbox"]')[1]?.checked;
      const prevAna = overlay.querySelectorAll('input[type="checkbox"]')[2]?.checked;
      overlay.remove(); overlay = null; document.body.classList.remove("dgk-lock");
      openSettings();
      const chks = overlay?.querySelectorAll('input[type="checkbox"]');
      if (chks && chks[1]) chks[1].checked = !!prevPref;
      if (chks && chks[2]) chks[2].checked = !!prevAna;
    }
  });

  document.addEventListener("click", e => {
    const a = e.target.closest("[data-cookie-settings]"); if (a) { e.preventDefault(); openSettings(); }
  });
  const start = () => {
    if (document.body.hasAttribute("data-cookie-popup")) {
      try {
        if (!sessionStorage.getItem("dg_cookie_shown")) {
          sessionStorage.setItem("dg_cookie_shown", "1");
          openSettings();
        }
      } catch { openSettings(); }
    } else if (!state) showBanner();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
