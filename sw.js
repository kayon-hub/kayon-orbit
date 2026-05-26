const CACHE_NAME = 'orbit-v5';
const STATIC_ASSETS = [
  '/kayon-orbit/',
  '/kayon-orbit/index.html',
  '/kayon-orbit/app.html',
  '/kayon-orbit/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // 這些請求直接走網路，不快取
  if (
    url.includes('script.google.com') ||
    url.includes('api.line.me') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('accounts.google.com') ||
    e.request.method !== 'GET'
  ) {
    e.respondWith(fetch(e.request));
    return;
  }

  // quotation.html 永遠走網路，確保客戶拿到最新版
  if (url.includes('quotation.html')) {
    e.respondWith(fetch(e.request));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
