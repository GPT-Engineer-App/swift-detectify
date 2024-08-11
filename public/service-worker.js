const CACHE_NAME = 'recycling-object-counter-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/yolov8n.onnx',
  // Add other static assets and routes here
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
