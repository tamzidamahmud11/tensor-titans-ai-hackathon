// News page: builds share buttons for each article and hides images that fail to load.
// Bilingual reactive to dg:langchange.
(function () {
  const isBn = () => (window.DG_I18N ? window.DG_I18N.isBn() : localStorage.getItem("dg_lang") === "bn");
  const T = (en, bn) => (isBn() ? bn : en);

  const toast = msg => {
    const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2200);
  };
  const link = (label, href) => {
    const a = document.createElement("a"); a.textContent = label; a.href = href;
    a.target = "_blank"; a.rel = "noopener noreferrer"; a.setAttribute("aria-label", T("Share on " + label, label + "-এ শেয়ার করুন")); return a;
  };
  const copy = async url => {
    try { await navigator.clipboard.writeText(url); toast(T("Link copied", "লিংক কপি হয়েছে")); }
    catch (e) { const i = document.createElement("input"); i.value = url; document.body.appendChild(i); i.select();
      try { document.execCommand("copy"); toast(T("Link copied", "লিংক কপি হয়েছে")); } catch (_) { prompt(T("Copy this link:", "এই লিংকটি কপি করুন:"), url); } i.remove(); }
  };

  function buildShareBoxes() {
    document.querySelectorAll("article.news").forEach(card => {
      const url = card.dataset.url, title = card.dataset.title, box = card.querySelector("[data-share]");
      if (!box) return;
      box.innerHTML = "";
      const lbl = document.createElement("span"); lbl.className = "lbl"; lbl.textContent = T("Share:", "শেয়ার:"); box.appendChild(lbl);
      if (navigator.share) {
        const b = document.createElement("button"); b.type = "button"; b.textContent = T("Share…", "শেয়ার…");
        b.addEventListener("click", () => navigator.share({ title, url }).catch(() => {})); box.appendChild(b);
      }
      box.appendChild(link(T("Email", "ইমেইল"), "mailto:?subject=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(url)));
      const c = document.createElement("button"); c.type = "button"; c.textContent = T("Copy link", "লিংক কপি");
      c.addEventListener("click", () => copy(url)); box.appendChild(c);
    });
  }

  buildShareBoxes();
  window.addEventListener("dg:langchange", buildShareBoxes);

  // If a publisher blocks or breaks an image, drop it so the tinted fallback tile shows.
  const drop = img => img.remove();
  document.querySelectorAll(".news .thumb img").forEach(img => {
    img.addEventListener("error", () => drop(img));
    if (img.complete && img.naturalWidth === 0 && img.src) drop(img);
  });
})();
