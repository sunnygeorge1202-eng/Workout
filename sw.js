const CACHE = 'workout-v1';
const ASSETS = [
  '/Workout/',
  '/Workout/index.html',
  '/Workout/manifest.json',
  '/Workout/icon-192.svg',
  '/Workout/icon-512.svg',
  '/Workout/icon-180.svg',
  '/Workout/icon-152.svg',
  '/Workout/icon-120.svg',
];

// Install: cache everything
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first, fall back to network
self.addEventListener('fetch', e => {
  // Only handle same-origin and YouTube (let YT requests pass through)
  if (e.request.url.includes('youtube.com') ||
      e.request.url.includes('script.google.com')) {
    return; // Let network handle YT and Sheets sync
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (!resp || resp.status !== 200 || resp.type !== 'basic') return resp;
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      }).catch(() => caches.match('/Workout/'));
    })
  );
});
