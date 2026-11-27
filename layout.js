/* Dashboard header layout (GitHub-style): top bar with menu button + brand + tools, a tab strip under it,
   and the forecast filters in a panel the menu button opens/closes. Only moves existing elements, so every id/handler keeps working. */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  function build() {
    const side = $("side"), tabs = $("tabs"), app = $("app");
    if (!side || !tabs || !app || $("ghbar")) return;
    const bar = document.createElement("header"); bar.id = "ghbar";
    const top = document.createElement("div"); top.className = "gh-top";
    const burger = document.createElement("button");
    burger.type = "button"; burger.className = "gh-burger"; burger.id = "ghBurger";
    burger.setAttribute("aria-controls", "side"); burger.setAttribute("aria-label", "Show or hide forecast filters"); burger.innerHTML = "&#9776;";
    top.appendChild(burger);
    const brand = side.querySelector("h2"); if (brand) { brand.classList.add("gh-brand"); top.appendChild(brand); }
    const sp = document.createElement("span"); sp.className = "gh-sp"; top.appendChild(sp);
    const back = side.querySelector("p.small"); if (back) { back.classList.add("gh-back"); top.appendChild(back); }
    const tools = side.querySelector(".nav-controls"); if (tools) { tools.removeAttribute("style"); tools.classList.add("gh-tools"); top.appendChild(tools); }
    bar.appendChild(top);
    tabs.classList.add("gh-tabs"); bar.appendChild(tabs);
    app.insertBefore(bar, side);
    side.classList.add("gh-filters");

    const mobile = () => window.innerWidth <= 1000;
    const set = open => { side.classList.toggle("closed", !open); burger.setAttribute("aria-expanded", open ? "true" : "false"); fit(); };
    burger.onclick = () => set(side.classList.contains("closed"));
    set(!mobile());

    function fit() { document.documentElement.style.setProperty("--ghh", bar.offsetHeight + "px"); }
    if (window.ResizeObserver) new ResizeObserver(fit).observe(bar); else window.addEventListener("resize", fit);
    fit();
    // keep the active tab in view in the horizontally scrollable strip
    tabs.addEventListener("click", () => setTimeout(() => { const b = tabs.querySelector("button.on"); if (b && b.scrollIntoView) b.scrollIntoView({ block: "nearest", inline: "nearest" }); }, 0));
  }
  // run after theme-lang.js / auth.js have created their controls (same DOMContentLoaded order as script order)
  function start() { build(); if (!$("ghbar")) return; if (!document.querySelector("#ghbar .gh-tools")) { const mo = new MutationObserver(() => { const t = document.querySelector("#side .nav-controls"); if (t) { t.removeAttribute("style"); t.classList.add("gh-tools"); document.querySelector("#ghbar .gh-sp").insertAdjacentElement("afterend", t); mo.disconnect(); } }); mo.observe($("side"), { childList: true }); } }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
