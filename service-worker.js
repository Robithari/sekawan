// service-worker.js

// Event 'install'
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('cache-v1').then(function(cache) {
      return cache.addAll([
        '/',
        // Daftar file lain yang perlu disimpan dalam cache
        // Misalnya: '/index.html', '/styles.css', '/script.js'
      ]);
    }).catch(function(error) {
      console.error('Failed to open cache:', error);
    })
  );
});

// Event 'activate'
self.addEventListener('activate', function(event) {
  var cacheWhitelist = ['cache-v1'];
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Event 'fetch'
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    }).catch(function(error) {
      console.error('Failed to fetch:', error);
    })
  );
});
