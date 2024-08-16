self.addEventListener('install', function(event) {
  // Tidak ada file yang dicache selama proses instalasi
  self.skipWaiting(); // Memaksa service worker baru untuk segera aktif
});

self.addEventListener('activate', function(event) {
  // Menghapus semua cache yang ada
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    }).catch(function(error) {
      console.error('Failed to delete caches:', error);
    })
  );
  self.clients.claim(); // Memastikan semua tab yang terbuka menggunakan SW yang baru
});

self.addEventListener('fetch', function(event) {
  // Always fetch the latest version from the network for all requests
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
