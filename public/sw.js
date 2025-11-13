/* Simple service worker for offline caching */
const STATIC_CACHE = 'weather-static-v1';
const RUNTIME_CACHE = 'weather-runtime-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/vite.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

const isAPI = (url) => {
  try {
    const u = new URL(url);
    return (
      u.hostname.endsWith('open-meteo.com') ||
      u.hostname.endsWith('geocoding-api.open-meteo.com') ||
      u.pathname.includes('/v1/forecast') ||
      u.pathname.includes('/v1/search') ||
      u.pathname.includes('/v1/reverse')
    );
  } catch (_) { return false; }
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = request.url;

  // Navigation requests: network-first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(RUNTIME_CACHE).then((c) => c.put('/', copy));
        return res;
      }).catch(() => caches.match(request).then((m) => m || caches.match('/index.html')))
    );
    return;
  }

  // API calls (Open‑Meteo): network-first, fallback to cache
  if (isAPI(url)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const resClone = res.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(request, resClone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((res) => {
          const resClone = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(request, resClone));
          return res;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

