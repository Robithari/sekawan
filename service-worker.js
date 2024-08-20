self.addEventListener('install', function(event) {
  // Tidak ada file yang dicache selama proses instalasi
  self.skipWaiting(); // Memaksa service worker baru untuk segera aktif
});

self.addEventListener('activate', function(event) {
  // Menghapus semua cache yang ada kecuali cache tertentu
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
  // Mengecualikan firebase-messaging-sw.js dari proses caching
  if (event.request.url.includes('firebase-messaging-sw.js')) {
    return;
  }

  // Proses permintaan fetch normal
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
