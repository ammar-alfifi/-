const CACHE_NAME = 'offline-cache-v2';
const urlsToCache = [
  '/index.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, networkResponse));
          });
        
        return cachedResponse || fetchPromise;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => 
        !cacheWhitelist.includes(key) && caches.delete(key)
      ))
    )
  );
});