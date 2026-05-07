self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through to avoid the no-op warning while maintaining PWA installability
  event.respondWith(fetch(event.request));
});
