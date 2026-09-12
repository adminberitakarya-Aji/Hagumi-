/* ==============================================================================
 * HAGUMI Service Worker — PWA offline shell (Revisi 6, prioritas P1)
 * Tanpa dependensi (hand-rolled; runtime caching, bukan precache manifest):
 *   - Navigasi halaman  : network-first, fallback ke shell ter-cache (offline)
 *   - Aset statis hashed: cache-first + isi runtime cache saat pertama diminta
 *   - /api/kitsune/*    : SELALU jaringan (respons AI personal & ber-rate-limit)
 *   - activate          : hapus cache versi lama; skipWaiting + clients.claim
 * Naikkan CACHE_VERSION setiap ingin memaksa refresh cache lama.
 * ============================================================================== */
const CACHE_VERSION = 'hagumi-v1';
const PRECACHE_URLS = ['/', '/manifest.json', '/favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) =>
        // Pre-cache toleran: kegagalan satu URL tidak membatalkan instalasi
        Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)))
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // font Google dll: biarkan jaringan
  if (url.pathname.startsWith('/api/')) return; // AI endpoints: selalu jaringan

  // Navigasi halaman: network-first, fallback ke shell ter-cache saat offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches
            .open(CACHE_VERSION)
            .then((cache) => cache.put('/', copy))
            .catch(() => {});
          return response;
        })
        .catch(() => caches.match('/').then((cached) => cached || Response.error()))
    );
    return;
  }

  // Aset statis (chunk JS/CSS/WebP/ikon): cache-first + runtime caching
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches
            .open(CACHE_VERSION)
            .then((cache) => cache.put(request, copy))
            .catch(() => {});
        }
        return response;
      });
    })
  );
});
