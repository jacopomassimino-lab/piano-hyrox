// Piano Hyrox · service worker: l'app si apre anche senza rete; la pagina si aggiorna dalla rete quando c'è.
const V = "hyrox-2f111e7aa2";
const CORE = ["./", "index.html", "supabase.js", "manifest.webmanifest", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "favicon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== "hyrox-fonts").map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin === self.location.origin){
    if (r.mode === "navigate" || u.pathname === "/" || u.pathname.endsWith("/index.html")){
      e.respondWith(fetch(r).then(res => { if (res.ok){ const cp = res.clone(); caches.open(V).then(c => c.put("index.html", cp)); } return res; })
        .catch(() => caches.match("index.html").then(m => m || caches.match("./"))));
      return;
    }
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok){ const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })));
    return;
  }
  if (u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com"){
    e.respondWith(caches.open("hyrox-fonts").then(c => c.match(r).then(m => {
      const net = fetch(r).then(res => { c.put(r, res.clone()); return res; }).catch(() => m);
      return m || net;
    })));
  }
});
