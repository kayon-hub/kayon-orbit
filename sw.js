const CACHE_NAME = 'orbit-v1';
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

self.addEventListener('fetch', () => {});
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  if (
    url.includes('script.google.com') ||
    url.includes('api.line.me') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('placeholder.com') ||
    e.request.method !== 'GET'
  ) {
    e.respondWith(fetch(e.request));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
