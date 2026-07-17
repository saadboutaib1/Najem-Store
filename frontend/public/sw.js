const CACHE_NAME = 'maghrib-oud-v2';
const APP_SHELL = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/brand/maghrib-oud-logo-transparent.png',
  '/brand/maghrib-oud-wordmark.png',
  '/pwa/icon-192.png',
  '/pwa/icon-512.png'
];

const STATIC_DESTINATIONS = new Set(['style', 'script', 'worker', 'image', 'font']);

function isHttpRequest(request) {
  return request.url.startsWith('http://') || request.url.startsWith('https://');
}

function isSensitiveRequest(url) {
  return (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.includes('/sanctum/')
  );
}

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled(
    APP_SHELL.map((url) =>
      cache.add(new Request(url, { cache: 'reload' }))
    )
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(cacheAppShell().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || !isHttpRequest(request)) {
    return;
  }

  const url = new URL(request.url);

  if (isSensitiveRequest(url)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  if (url.origin === self.location.origin && STATIC_DESTINATIONS.has(request.destination)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }

          return networkResponse;
        });
      })
    );
  }
});