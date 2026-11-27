// Offline cache for the dashboard: once loaded over http(s), the app keeps working with Wi-Fi switched off.
// Stale-while-revalidate: answer from cache first, refresh the cache in the background when online.
const CACHE = "dengue-protirodh-v7";
const CORE = ["app.html", "app.js?v=7", "engine.js", "ops.js?v=1", "ops-ui.js?v=1", "ops.css?v=1", "layout.js?v=1", "layout.css?v=3", "style.css?v=3", "chat.css?v=2", "cookies.css",
  "chat.js?v=4", "cookies.js?v=4", "i18n-bn.js?v=7", "theme-lang.js?v=7", "lib/plotly.min.js", "data/model.js", "data/dataset.js", "data/metrics.js", "logo.svg",
  "index.html", "site.css?v=4"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api/")) return;   // chatbot API is never cached
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request);
    const net = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
