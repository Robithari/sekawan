self.addEventListener('install', function (event) {
  console.log('Service Worker diinstal.');
  self.skipWaiting(); // Memaksa SW untuk langsung aktif
});

self.addEventListener('activate', function (event) {
  console.log('Service Worker diaktifkan.');

  // Menghapus cache lama jika ada
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          return caches.delete(cacheName);
        })
      );
    }).catch(function (error) {
      console.error('Gagal menghapus cache:', error);
    })
  );

  self.clients.claim(); // Memastikan semua tab menggunakan SW baru
});

// Mendengarkan permintaan fetch dan mengelola respons
self.addEventListener('fetch', function (event) {
  event.respondWith(
    fetch(event.request)
      .then(function (networkResponse) {
        return networkResponse;
      })
      .catch(function (error) {
        console.error('Gagal memuat dari jaringan:', error);
        // Tambahkan fallback respons jika diperlukan
        return new Response('Konten tidak tersedia saat ini.', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
  );
});

// Menjaga koneksi agar tetap aktif saat aplikasi di latar belakang
self.addEventListener('message', (event) => {
  if (event.data === 'keepalive') {
    console.log('Menerima pesan keep-alive dari klien.');
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage('keepalive-response');
        });
      })
    );
  }
});
