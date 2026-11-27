// Dark/Light Theme, Collapsible Sidebar & Complete English/Bengali Localization Controller
(function () {
  const THEME_KEY = "dg_theme";
  const LANG_KEY = "dg_lang";

  // Keyed translations (used by data-i18n attributes)
  const I18N = {
    en: {
      nav_home: "Home",
      nav_why: "Why it matters",
      nav_features: "Features",
      nav_how: "How it works",
      nav_prevention: "Prevention",
      nav_validation: "Validation",
      nav_news: "News",
      nav_videos: "Videos",
      nav_blogs: "Blogs",
      nav_events: "Events",
      nav_webinars: "Webinars",
      nav_community: "Community",
      nav_multimedia: "Multimedia",
      nav_about: "About us",
      nav_faq: "FAQ",
      nav_contact: "Contact",
      nav_dashboard: "Open the dashboard",
      nav_subscribe: "Subscribe",
      nav_references: "References",
      nav_github: "GitHub Repo",
      nav_story: "Story submission",
      sidebar_menu: "Menu",
      hero_tag: "Early warning for Bangladesh city corporations",
      hero_title: "See dengue outbreaks weeks before they peak.",
      hero_lead: "Dengue Protirodh forecasts risk for every ward 2–4 weeks ahead, using weather lags, ward vulnerability and gradient-boosted trees — so health teams can act while there is still time to clear breeding sites.",
      hero_cta: "Open the dashboard →",
      btn_subscribe: "Subscribe",
      stay_heading: "Stay in the Know",
      stay_desc: "Get dengue risk updates, upcoming community cleanups, and prevention tips from Dengue Protirodh by email. Occasional messages only, and you can unsubscribe at any time."
    },
    bn: {
      nav_home: "হোম",
      nav_why: "কেন এটি জরুরি",
      nav_features: "বৈশিষ্ট্যসমূহ",
      nav_how: "কীভাবে কাজ করে",
      nav_prevention: "প্রতিরোধ",
      nav_validation: "যাচাইকরণ",
      nav_news: "সংবাদ",
      nav_videos: "ভিডিও",
      nav_blogs: "ব্লগ",
      nav_events: "ইভেন্টস",
      nav_webinars: "ওয়েবিনার",
      nav_community: "কমিউনিটি",
      nav_multimedia: "মাল্টিমিডিয়া",
      nav_about: "আমাদের সম্পর্কে",
      nav_faq: "প্রশ্নোত্তর",
      nav_contact: "যোগাযোগ",
      nav_dashboard: "ড্যাশবোর্ড খুলুন",
      nav_subscribe: "সাবস্ক্রাইব",
      nav_references: "তথ্যসূত্র",
      nav_github: "গিটহাব রেপো",
      nav_story: "গল্প জমা দিন",
      sidebar_menu: "মেনু",
      hero_tag: "বাংলাদেশ সিটি কর্পোরেশনের জন্য আগাম সতর্কবার্তা",
      hero_title: "ডেঙ্গুর প্রাদুর্ভাব তীব্র হওয়ার আগেই পূর্বাভাস দেখুন।",
      hero_lead: "ডেঙ্গু প্রতিরোধ আবহাওয়ার বিলম্ব, ওয়ার্ডের ঝুঁকি এবং গ্র্যাডিয়েন্ট-বুস্টেড ট্রি মডেল ব্যবহার করে ২-৪ সপ্তাহ আগেই প্রতিটি ওয়ার্ডের ঝুঁকি পূর্বাভাস দেয় — যাতে হাসপাতাল ভর্তি বাড়ার আগেই লার্ভা নিধন শুরু করা যায়।",
      hero_cta: "ড্যাশবোর্ড খুলুন →",
      btn_subscribe: "সাবস্ক্রাইব করুন",
      stay_heading: "সর্বশেষ তথ্যের সাথে থাকুন",
      stay_desc: "ইমেইলে ডেঙ্গু সতর্কবার্তা, নতুন ফিচার এবং প্রতিরোধ নির্দেশিকা পান। যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।"
    }
  };

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || "light";
  }

  function getLang() {
    return localStorage.getItem(LANG_KEY) === "bn" ? "bn" : "en";
  }

  function updateThemeButtons(theme, lang) {
    const isBn = (lang || getLang()) === "bn";
    document.querySelectorAll(".theme-toggle-btn").forEach(btn => {
      if (theme === "dark") {
        btn.innerHTML = `<span aria-hidden="true">☀️</span> <span class="theme-text">${isBn ? "লাইট" : "Light"}</span>`;
        btn.setAttribute("aria-label", isBn ? "লাইট মোডে যান" : "Switch to light mode");
      } else {
        btn.innerHTML = `<span aria-hidden="true">🌙</span> <span class="theme-text">${isBn ? "ডার্ক" : "Dark"}</span>`;
        btn.setAttribute("aria-label", isBn ? "ডার্ক মোডে যান" : "Switch to dark mode");
      }
    });
  }

  function updateLangButtons(lang) {
    document.querySelectorAll(".lang-toggle-btn").forEach(btn => {
      btn.innerHTML = lang === "bn" ? "🌐 English" : "🌐 বাংলা";
      btn.setAttribute("aria-label", lang === "bn" ? "Switch to English" : "বাংলায় দেখুন");
    });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    updateThemeButtons(theme, getLang());
  }

  // Bengali numeral helper
  const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  function toBnDigits(s) {
    return String(s).replace(/[0-9]/g, d => BN_DIGITS[+d]);
  }
  const BN_MONTHS = {
    Jan: "জানু", Feb: "ফেব", Mar: "মার্চ", Apr: "এপ্রিল", May: "মে", Jun: "জুন",
    Jul: "জুলাই", Aug: "আগস্ট", Sep: "সেপ্টে", Oct: "অক্টো", Nov: "নভে", Dec: "ডিসে"
  };

  const origTextMap = new WeakMap();
  let origTitle = null;
  let domObserver = null;
  let isApplying = false;

  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "SVG"]);
  const TRANSLATABLE_ATTRS = ["placeholder", "title", "aria-label", "alt"];

  function normalizeText(str) {
    return String(str || "").replace(/\s+/g, " ").trim();
  }

  function hasHandledAncestor(node) {
    let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (el) {
      if (el.nodeType === Node.ELEMENT_NODE && (el.hasAttribute("data-bn") || el.hasAttribute("data-i18n"))) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  function shouldSkipNode(node, lang) {
    let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (el) {
      if (SKIP_TAGS.has(el.tagName)) return true;
      if (el.classList && (el.classList.contains("lang-toggle-btn") || el.classList.contains("theme-toggle-btn"))) {
        return true;
      }
      el = el.parentElement;
    }
    // Skip text nodes inside elements managed directly by data-bn / data-i18n
    if (node.nodeType === Node.TEXT_NODE && hasHandledAncestor(node)) {
      return true;
    }
    return false;
  }

  function lookupBn(norm, bnDict) {
    if (!norm) return null;
    if (bnDict && bnDict[norm]) return bnDict[norm];

    // Brand aliasing: Dengue Protirodh <-> Dengue Guard
    if (bnDict) {
      if (norm.includes("Dengue Protirodh")) {
        const alt = norm.replace(/Dengue Protirodh/g, "Dengue Guard");
        if (bnDict[alt]) {
          return bnDict[alt].replace(/ডেঙ্গু গার্ড/g, "ডেঙ্গু প্রতিরোধ");
        }
      }
      if (norm.includes("Dengue Guard")) {
        const alt = norm.replace(/Dengue Guard/g, "Dengue Protirodh");
        if (bnDict[alt]) {
          return bnDict[alt].replace(/ডেঙ্গু প্রতিরোধ/g, "ডেঙ্গু গার্ড");
        }
      }
    }

    // Dynamic patterns
    let m = norm.match(/^Showing (\d+) of (\d+) dengue prevention events$/);
    if (m) return `${toBnDigits(m[2])}টি ডেঙ্গু প্রতিরোধ ইভেন্টের মধ্যে ${toBnDigits(m[1])}টি দেখাচ্ছে`;

    m = norm.match(/^(\d+) chars?$/);
    if (m) return `${toBnDigits(m[1])} অক্ষর`;

    m = norm.match(/^(\d+) \/ (\d+)$/);
    if (m) return `${toBnDigits(m[1])} / ${toBnDigits(m[2])}`;

    m = norm.match(/^(\d+) registered \((\d+) spots open\)$/);
    if (m) return `${toBnDigits(m[1])} জন নিবন্ধিত (${toBnDigits(m[2])}টি আসন বাকি)`;

    // Common blog/news dates like "19 Nov 2026", ", 25 Jul 2025.", "· 7 Sep 2026 ·"
    m = norm.match(/^0?(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (20\d{2})$/);
    if (m) return `${toBnDigits(m[1])} ${BN_MONTHS[m[2]]} ${toBnDigits(m[3])}`;

    m = norm.match(/^,\s*0?(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (20\d{2})\.?$/);
    if (m) return `, ${toBnDigits(m[1])} ${BN_MONTHS[m[2]]} ${toBnDigits(m[3])}।`;

    m = norm.match(/^·\s*0?(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (20\d{2})\s*·$/);
    if (m) return `· ${toBnDigits(m[1])} ${BN_MONTHS[m[2]]} ${toBnDigits(m[3])} ·`;

    // Accessed dates like "(accessed 25 Nov 2026)"
    m = norm.match(/^\(accessed 0?(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (20\d{2})\)$/);
    if (m) return `(সংগ্রহ: ${toBnDigits(m[1])} ${BN_MONTHS[m[2]]} ${toBnDigits(m[3])})`;

    // Video button aria-label "Play video: X"
    m = norm.match(/^Play video:\s*(.+)$/);
    if (m) {
      const inner = lookupBn(m[1], bnDict) || m[1];
      return `ভিডিও চালান: ${inner}`;
    }

    return null;
  }

  function translateTextNode(node, lang, bnDict) {
    if (shouldSkipNode(node, lang)) return;
    const curVal = node.nodeValue;
    if (!origTextMap.has(node)) {
      origTextMap.set(node, curVal);
    } else if (lang === "bn") {
      const prevOrig = origTextMap.get(node);
      const prevTrans = lookupBn(normalizeText(prevOrig), bnDict);
      const lead = (prevOrig.match(/^\s*/) || [""])[0];
      const trail = (prevOrig.match(/\s*$/) || [""])[0];
      if (curVal !== prevOrig && (!prevTrans || curVal !== lead + prevTrans + trail)) {
        origTextMap.set(node, curVal);
      }
    }
    const orig = origTextMap.get(node);
    if (lang !== "bn") {
      if (node.nodeValue !== orig) node.nodeValue = orig;
      return;
    }
    const norm = normalizeText(orig);
    if (!norm) return;
    const translated = lookupBn(norm, bnDict);
    if (translated) {
      const lead = (orig.match(/^\s*/) || [""])[0];
      const trail = (orig.match(/\s*$/) || [""])[0];
      const nextVal = lead + translated + trail;
      if (node.nodeValue !== nextVal) node.nodeValue = nextVal;
    }
  }

  function translateElementAttrs(el, lang, bnDict) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return;
    if (SKIP_TAGS.has(el.tagName)) return;
    if (el.classList && (el.classList.contains("lang-toggle-btn") || el.classList.contains("theme-toggle-btn"))) return;

    TRANSLATABLE_ATTRS.forEach(attr => {
      const bnAttr = attr === "aria-label" ? "data-bn-label" : ("data-bn-" + attr);
      if (el.hasAttribute(bnAttr)) {
        const enAttr = attr === "aria-label" ? "data-en-label" : ("data-en-" + attr);
        if (!el.hasAttribute(enAttr) && el.hasAttribute(attr)) {
          el.setAttribute(enAttr, el.getAttribute(attr));
        }
        if (lang === "bn") {
          el.setAttribute(attr, el.getAttribute(bnAttr));
        } else if (el.hasAttribute(enAttr)) {
          el.setAttribute(attr, el.getAttribute(enAttr));
        }
        return;
      }
      if (!el.hasAttribute(attr)) return;
      const origAttr = "data-orig-" + attr;
      if (!el.hasAttribute(origAttr)) {
        el.setAttribute(origAttr, el.getAttribute(attr));
      }
      const orig = el.getAttribute(origAttr);
      if (lang !== "bn") {
        if (el.getAttribute(attr) !== orig) el.setAttribute(attr, orig);
        return;
      }
      const norm = normalizeText(orig);
      const translated = lookupBn(norm, bnDict);
      if (translated) {
        el.setAttribute(attr, translated);
      }
    });
  }

  function walkAndTranslate(root, lang, bnDict) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root, lang, bnDict);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null);
    let node = walker.currentNode;
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        translateTextNode(node, lang, bnDict);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        translateElementAttrs(node, lang, bnDict);
      }
      node = walker.nextNode();
    }
  }

  function ensureObserver() {
    if (domObserver || !document.body) return;
    domObserver = new MutationObserver(mutations => {
      if (isApplying || getLang() !== "bn") return;
      const bnDict = window.DG_EN_TO_BN || {};
      isApplying = true;
      try {
        mutations.forEach(m => {
          if (m.type === "characterData") {
            translateTextNode(m.target, "bn", bnDict);
          } else {
            m.addedNodes.forEach(n => {
              if (n.nodeType === Node.ELEMENT_NODE) {
                applyExplicitBnInSubtree(n, "bn");
              }
              walkAndTranslate(n, "bn", bnDict);
            });
          }
        });
      } finally {
        isApplying = false;
      }
    });
    domObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function applyExplicitBnInSubtree(root, lang) {
    if (!root || !root.querySelectorAll) return;
    const list = [];
    if (root.hasAttribute && root.hasAttribute("data-bn")) list.push(root);
    root.querySelectorAll("[data-bn]").forEach(el => list.push(el));
    list.forEach(el => {
      if (lang === "bn") {
        if (!el.hasAttribute("data-en")) {
          el.setAttribute("data-en", el.innerHTML);
        }
        const target = el.getAttribute("data-bn");
        if (el.innerHTML !== target) el.innerHTML = target;
      } else {
        const orig = el.getAttribute("data-en");
        if (orig !== null && el.innerHTML !== orig) el.innerHTML = orig;
      }
    });
  }

  function applyTranslations(lang) {
    isApplying = true;
    try {
      document.documentElement.setAttribute("lang", lang);

      // 1. data-i18n keyed elements (preserving original English label if it differs from I18N.en)
      const dict = I18N[lang] || I18N.en;
      document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (!el.hasAttribute("data-i18n-en")) {
          if (el.tagName === "INPUT" && el.hasAttribute("placeholder")) {
            el.setAttribute("data-i18n-en", el.placeholder);
          } else {
            el.setAttribute("data-i18n-en", el.textContent);
          }
        }
        const val = lang === "bn" ? dict[key] : (el.getAttribute("data-i18n-en") || I18N.en[key]);
        if (val) {
          if (el.tagName === "INPUT" && el.hasAttribute("placeholder")) {
            if (el.placeholder !== val) el.placeholder = val;
          } else {
            if (el.textContent !== val) el.textContent = val;
          }
        }
      });

      // 2. Explicit data-bn attributes
      if (document.body) {
        applyExplicitBnInSubtree(document.body, lang);
      }

      // 3. Dictionary TreeWalker fallback for all remaining text + attributes
      const bnDict = window.DG_EN_TO_BN || {};
      if (origTitle === null) origTitle = document.title;
      const titleTrans = lookupBn(normalizeText(origTitle), bnDict);
      if (lang === "bn" && titleTrans) {
        document.title = titleTrans;
      } else if (lang !== "bn" && origTitle !== null) {
        document.title = origTitle;
      }

      if (document.body) {
        walkAndTranslate(document.body, lang, bnDict);
        ensureObserver();
      }
    } finally {
      isApplying = false;
    }

    updateLangButtons(lang);
    updateThemeButtons(getTheme(), lang);
  }

  function setLang(lang) {
    const clean = lang === "bn" ? "bn" : "en";
    localStorage.setItem(LANG_KEY, clean);
    applyTranslations(clean);
    window.dispatchEvent(new CustomEvent("dg:langchange", { detail: { lang: clean } }));
  }

  // Expose helper API for dynamic modules (app.js, events.js, community.js, webinars.js, chat.js, cookies.js, etc.)
  window.DG_I18N = {
    getLang,
    setLang,
    isBn: () => getLang() === "bn",
    t: (en, bn) => (getLang() === "bn" ? bn : en),
    tr: (str) => {
      if (getLang() !== "bn") return str;
      const bnDict = window.DG_EN_TO_BN || {};
      return lookupBn(normalizeText(str), bnDict) || str;
    },
    toBnDigits,
    translateRoot: (el) => {
      if (!el) return;
      const lang = getLang();
      const bnDict = window.DG_EN_TO_BN || {};
      const was = isApplying;
      isApplying = true;
      try {
        applyExplicitBnInSubtree(el, lang);
        walkAndTranslate(el, lang, bnDict);
      } finally {
        isApplying = was;
      }
    }
  };

  function ensureLeftSidebar() {
    if (!document.body || !document.body.classList.contains("has-left-sidebar")) return;
    if (document.querySelector(".left-sidebar")) return;
    const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    const items = [
      ["index.html#why", "Why it matters", "nav_why"],
      ["index.html#features", "Features", "nav_features"],
      ["index.html#how", "How it works", "nav_how"],
      ["index.html#prevention", "Prevention", "nav_prevention"],
      ["index.html#proof", "Validation", "nav_validation"],
      ["index.html#faq", "FAQ", "nav_faq"],
      ["index.html#subscribe", "Subscribe", "nav_subscribe"],
      ["index.html#references", "References", "nav_references"],
      ["#social-media", "GitHub Repo", "nav_github"],
      ["videos.html", "Videos", "nav_videos"],
      ["webinars.html", "Webinars", "nav_webinars"],
      ["multimedia.html", "Multimedia", "nav_multimedia"],
      ["story.html", "Story submission", "nav_story"]
    ];
    const aside = document.createElement("aside");
    aside.className = "left-sidebar";
    aside.setAttribute("aria-label", "Page sections and resources");
    const title = document.createElement("div");
    title.className = "left-sidebar-title";
    title.setAttribute("role", "button");
    title.setAttribute("tabindex", "0");
    title.setAttribute("aria-expanded", "true");
    title.setAttribute("data-i18n", "sidebar_menu");
    title.textContent = "Menu";
    const ul = document.createElement("ul");
    items.forEach(item => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = item[0];
      a.textContent = item[1];
      if (item[2]) a.setAttribute("data-i18n", item[2]);
      if (item[0].toLowerCase() === page) a.setAttribute("aria-current", "page");
      li.appendChild(a);
      ul.appendChild(li);
    });
    aside.appendChild(title);
    aside.appendChild(ul);
    const main = document.querySelector("main");
    if (main && main.parentNode) main.parentNode.insertBefore(aside, main);
    else document.body.insertBefore(aside, document.body.firstChild);
  }

  function syncSidebarTop() {
    const header = document.querySelector("header.nav");
    const sidebar = document.querySelector(".left-sidebar");
    if (header && sidebar) sidebar.style.top = header.offsetHeight + "px";
  }

  function buildControls() {
    const controls = document.createElement("div");
    controls.className = "nav-controls";

    const themeBtn = document.createElement("button");
    themeBtn.type = "button";
    themeBtn.className = "theme-toggle-btn";
    themeBtn.addEventListener("click", () => setTheme(getTheme() === "dark" ? "light" : "dark"));

    const langBtn = document.createElement("button");
    langBtn.type = "button";
    langBtn.className = "lang-toggle-btn";
    langBtn.addEventListener("click", () => setLang(getLang() === "bn" ? "en" : "bn"));

    controls.appendChild(themeBtn);
    controls.appendChild(langBtn);
    return controls;
  }

  function initControls() {
    ensureLeftSidebar();
    syncSidebarTop();

    const nav = document.querySelector("header.nav nav");
    if (nav) {
      if (!nav.querySelector(".nav-controls")) {
        const controls = buildControls();
        const dashBtn = nav.querySelector("a.btn");
        if (dashBtn) nav.insertBefore(controls, dashBtn);
        else nav.appendChild(controls);
      }
    } else {
      const side = document.getElementById("side");
      if (side && !side.querySelector(".nav-controls")) {
        const controls = buildControls();
        controls.style.cssText = "display:flex;gap:8px;margin:8px 0 12px;flex-wrap:wrap";
        const backLink = side.querySelector("p.small");
        if (backLink && backLink.nextSibling) side.insertBefore(controls, backLink.nextSibling);
        else side.appendChild(controls);
      }
    }

    setTheme(getTheme());
    setLang(getLang());
  }

  // Immediate theme & lang attributes to avoid flash
  document.documentElement.setAttribute("data-theme", localStorage.getItem(THEME_KEY) || "light");
  document.documentElement.setAttribute("lang", getLang());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initControls);
  } else {
    initControls();
  }
  window.addEventListener("resize", syncSidebarTop);

  function toggleMenuTitle(menuTitle) {
    const sidebar = menuTitle.closest(".left-sidebar");
    if (sidebar) {
      const listCollapsed = sidebar.classList.toggle("list-collapsed");
      menuTitle.setAttribute("aria-expanded", listCollapsed ? "false" : "true");
    }
  }

  document.addEventListener("click", e => {
    const btn = e.target.closest(".sidebar-toggle");
    if (btn) {
      const isMobile = window.innerWidth <= 960;
      if (isMobile) {
        const open = document.body.classList.toggle("sidebar-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      } else {
        const collapsed = document.body.classList.toggle("sidebar-collapsed");
        btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
      }
      return;
    }
    const menuTitle = e.target.closest(".left-sidebar-title");
    if (menuTitle) toggleMenuTitle(menuTitle);
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      const menuTitle = e.target.closest && e.target.closest(".left-sidebar-title");
      if (menuTitle) {
        e.preventDefault();
        toggleMenuTitle(menuTitle);
      }
    }
  });
})();
