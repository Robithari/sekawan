const CACHE_NAME = 'cache-v3'; // Versi cache, sesuaikan jika diperlukan

self.addEventListener('install', function(event) {
  // Tidak ada file yang dicache selama proses instalasi
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
  // Always fetch the latest version from the network for all files
  event.respondWith(
    fetch(event.request)
      .then(function(networkResponse) {
        return networkResponse;
      })
      .catch(function(error) {
        console.error('Failed to fetch:', error);
      })
  );
});
