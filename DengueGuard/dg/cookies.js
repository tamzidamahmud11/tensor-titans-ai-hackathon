// Cookie consent: banner on first visit + settings dialog (reopen via any [data-cookie-settings] link).
// The choice is stored in one first-party cookie (dg_consent, 180 days) with a localStorage copy as fallback.
// Other scripts can respect it:  DGConsent.has("analytics")  /  DGConsent.onChange(fn)
(function () {
  const KEY = "dg_consent", VER = 1, DAYS = 180;
  const CATS = [
    { id: "necessary", name: "Strictly necessary", locked: true,
      text: "Remembers your cookie choice so this box does not keep appearing. Always on." },
    { id: "preferences", name: "Preferences",
      text: "Would remember display choices such as the selected city or warning window." },
    { id: "analytics", name: "Analytics",
      text: "Would measure how the site is used so we can improve it. Never includes ward or patient data." }
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
    banner = el("div", "dgk-banner", null, { role: "region", "aria-label": "Cookie notice" });
    const t = el("div", "dgk-text");
    t.append(el("b", "", "We value your privacy"), el("p", "", "Dengue Guard sets one small cookie to remember your choice. Optional cookies stay off unless you allow them."));
    const more = el("a", "", "Privacy Policy", { href: (document.getElementById("privacy") ? "#privacy" : "index.html#privacy") });
    t.lastChild.append(" ", more, ".");
    const row = el("div", "dgk-actions");
    const rej = el("button", "dgk-btn", "Reject optional", { type: "button" });
    const set = el("button", "dgk-btn", "Cookie settings", { type: "button" });
    const acc = el("button", "dgk-btn dgk-primary", "Accept all", { type: "button" });
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
    const head = el("div", "dgk-head"); const h = el("h2", "", "Cookie settings", { id: "dgk-title" });
    const x = el("button", "dgk-x", "×", { type: "button", "aria-label": "Close cookie settings" }); x.onclick = () => closeSettings();
    head.append(h, x);
    const intro = el("p", "dgk-intro", "Choose which cookies you allow. Dengue Guard does not currently set optional cookies; your choice is saved so that any we add later stay off unless you agree.");
    const body = el("div", "dgk-body"); const cur = state || {}; const boxes = {};
    CATS.forEach(c => {
      const row = el("div", "dgk-row"), txt = el("div", "dgk-rt");
      txt.append(el("b", "", c.name), el("span", "", c.text));
      const lab = el("label", "dgk-sw"); const inp = el("input", "", null, { type: "checkbox", role: "switch", "aria-label": c.name });
      inp.checked = c.locked ? true : !!cur[c.id]; inp.disabled = !!c.locked; boxes[c.id] = inp;
      lab.append(inp, el("i")); row.append(txt, lab); body.appendChild(row);
    });
    const foot = el("div", "dgk-foot");
    const rej = el("button", "dgk-btn", "Reject optional", { type: "button" });
    const sv = el("button", "dgk-btn", "Save my choices", { type: "button" });
    const acc = el("button", "dgk-btn dgk-primary", "Accept all", { type: "button" });
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
  }

  document.addEventListener("click", e => {
    const a = e.target.closest("[data-cookie-settings]"); if (a) { e.preventDefault(); openSettings(); }
  });
  const start = () => { if (!state) showBanner(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
