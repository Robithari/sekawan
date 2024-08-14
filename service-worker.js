const CACHE_NAME = 'cache-v1'; // Ubah versi cache untuk memaksa update

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll([
        '/',
        '/styles.css',
        '/script.js',
        // Tambahkan file lain yang perlu dicache
      ]);
    }).catch(function(error) {
      console.error('Failed to open cache:', error);
    })
  );
  self.skipWaiting(); // Memaksa service worker baru untuk segera aktif
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).catch(function(error) {
      console.error('Failed to delete old caches:', error);
    })
  );
  self.clients.claim(); // Memastikan semua tab yang terbuka menggunakan SW yang baru
});

self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) {
    // Bypass service worker for API requests
    event.respondWith(fetch(event.request));
  } else if (url.pathname === '/kas.html' || url.pathname === '/index.html') {
    // Always fetch the latest version from the network for specific files
    event.respondWith(
      fetch(event.request).then(function(networkResponse) {
        return networkResponse;
      }).catch(function(error) {
        console.error('Failed to fetch:', error);
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request).then(function(networkResponse) {
          return caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      }).catch(function(error) {
        console.error('Failed to fetch:', error);
      })
    );
  }
});
