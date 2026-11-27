// News page: builds share buttons for each article and hides images that fail to load.
// Share links only open when the visitor clicks them; nothing is sent from this page on load.
(function () {
  const toast = msg => {
    const t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2200);
  };
  const link = (label, href) => {
    const a = document.createElement("a"); a.textContent = label; a.href = href;
    a.target = "_blank"; a.rel = "noopener noreferrer"; a.setAttribute("aria-label", "Share on " + label); return a;
  };
  const copy = async url => {
    try { await navigator.clipboard.writeText(url); toast("Link copied"); }
    catch (e) { const i = document.createElement("input"); i.value = url; document.body.appendChild(i); i.select();
      try { document.execCommand("copy"); toast("Link copied"); } catch (_) { prompt("Copy this link:", url); } i.remove(); }
  };
  document.querySelectorAll("article.news").forEach(card => {
    const url = card.dataset.url, title = card.dataset.title, box = card.querySelector("[data-share]");
    if (!box) return;
    const u = encodeURIComponent(url), t = encodeURIComponent(title + " — via Dengue Guard");
    const lbl = document.createElement("span"); lbl.className = "lbl"; lbl.textContent = "Share:"; box.appendChild(lbl);
    if (navigator.share) {
      const b = document.createElement("button"); b.type = "button"; b.textContent = "Share…";
      b.addEventListener("click", () => navigator.share({ title, url }).catch(() => {})); box.appendChild(b);
    }
    box.appendChild(link("WhatsApp", "https://wa.me/?text=" + t + "%20" + u));
    box.appendChild(link("Facebook", "https://www.facebook.com/sharer/sharer.php?u=" + u));
    box.appendChild(link("X", "https://twitter.com/intent/tweet?text=" + t + "&url=" + u));
    box.appendChild(link("LinkedIn", "https://www.linkedin.com/sharing/share-offsite/?url=" + u));
    box.appendChild(link("Email", "mailto:?subject=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(url)));
    const c = document.createElement("button"); c.type = "button"; c.textContent = "Copy link";
    c.addEventListener("click", () => copy(url)); box.appendChild(c);
  });
  // If a publisher blocks or breaks an image, drop it so the tinted fallback tile shows.
  const drop = img => img.remove();
  document.querySelectorAll(".news .thumb img").forEach(img => {
    img.addEventListener("error", () => drop(img));
    if (img.complete && img.naturalWidth === 0 && img.src) drop(img);
  });
})();
