const CACHE_VERSION = 'gtw-v1';
const CORE_CACHE = `guess-the-word-core-${CACHE_VERSION}`;
const RUNTIME_CACHE = `guess-the-word-runtime-${CACHE_VERSION}`;

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.png',
  './apple-touch-icon.png',
  './pwa-192x192.png',
  './pwa-512x512.png',
  './pwa-maskable-512x512.png',
  './assets/aistudio/image_daaf8fcb.png',
];

const STATIC_EXTENSIONS = /\.(?:js|mjs|css|html|png|jpg|jpeg|svg|webp|ico|woff2?|ttf|mp3|wav|ogg|glb|gltf|bin|json)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CORE_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  const allowedCaches = new Set([CORE_CACHE, RUNTIME_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (!allowedCaches.has(key)) {
              return caches.delete(key);
            }
            return Promise.resolve(false);
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept live multiplayer API calls or WebSocket upgrades
  if (url.origin === self.location.origin && (url.pathname.startsWith('/api/') || url.pathname === '/ws')) {
    return;
  }

  // Navigation requests: network-first, falling back to cached shell when offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CORE_CACHE).then((cache) => cache.put('./index.html', copy));
          }
          return response;
        })
        .catch(() => caches.match('./index.html').then((cached) => cached || caches.match('./')))
    );
    return;
  }

  // Google Fonts & external CDN assets: cache-first for fast offline loading
  const isExternalFont =
    url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  if (isExternalFont) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response && (response.ok || response.type === 'opaque')) {
              cache.put(request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // Static game assets (JS, CSS, images, audio, .glb models, textures): stale-while-revalidate
  if (url.origin === self.location.origin && STATIC_EXTENSIONS.test(url.pathname)) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const networkPromise = fetch(request)
            .then((response) => {
              if (response && response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cached);

          return cached || networkPromise;
        })
      )
    );
  }
});
