// ============================================================
// sw.js — KAYON ORBIT Service Worker
// ============================================================

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

  // ✅ 這幾個關鍵來源直接放行，由網路直接讀取，不快取、不攔截
  if (
    url.includes('script.google.com') || 
    url.includes('api.line.me') || 
    url.includes('via.placeholder.com') || 
    url.includes('fonts.googleapis.com') || 
    e.request.method !== 'GET'
  ) {
    e.respondWith(fetch(e.request));
    return;
  }

  // 靜態資源（網頁本身、CSS、圖片等）才走本機快取
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
