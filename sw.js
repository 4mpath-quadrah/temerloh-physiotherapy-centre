const CACHE = 'tpc-static-v3';
const ASSETS = [
  './', './index.html', './about.html', './gallery.html', './pricing.html', './contact.html', './404.html',
  './styles.css', './script.js', './manifest.webmanifest', './assets/logo.png', './assets/icon-192.png', './assets/icon-512.png',
  './assets/pricing.png', './assets/contact%20us/wan.png', './assets/contact%20us/jalal.png',
  './assets/rawatan/510403275_10046086162107886_2781992413205960055_n.jpg',
  './assets/rawatan/511194736_10046085848774584_1730816810134494993_n.jpg',
  './assets/rawatan/511307496_10059841260732376_9049811842972159095_n.jpg',
  './assets/rawatan/512174256_10048316555218180_4013995129703564226_n.jpg',
  './assets/rawatan/512558428_10059841294065706_4417200922916871392_n.jpg',
  './assets/rawatan/512640722_10057279760988526_2784250271222986956_n.jpg',
  './assets/promotion/510979028_10047194758663693_2333601577600703565_n.jpg',
  './assets/promotion/512291030_10047196245330211_3268875042788217892_n.jpg'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  // Never intercept document/navigation requests. This prevents Safari/Cloudflare redirect issues.
  if (event.request.mode === 'navigate' || event.request.destination === 'document') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok && new URL(event.request.url).origin === self.location.origin) {
      const copy = response.clone(); caches.open(CACHE).then(c => c.put(event.request, copy));
    }
    return response;
  })));
});
