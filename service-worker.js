// service-worker.js

const CACHE_NAME = 'cache-v3'; // Ubah versi cache untuk memaksa update

// Event 'install'
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/script.js',
        // Tambahkan file lain yang perlu dicache
      ]);
    }).catch(function(error) {
      console.error('Failed to open cache:', error);
    })
  );
});

// Event 'activate'
self.addEventListener('activate', function(event) {
  var cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Hapus cache yang tidak ada dalam whitelist
            return caches.delete(cacheName);
          }
        })
      );
    }).catch(function(error) {
      console.error('Failed to delete old caches:', error);
    })
  );
});

// Event 'fetch'
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // Jika ada di cache, kembalikan dari cache
      // Jika tidak ada di cache, ambil dari jaringan dan simpan ke cache
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
});
