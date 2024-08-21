// Mengimpor modul yang dibutuhkan dari Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.3/firebase-messaging.js');

// Konfigurasi Firebase untuk aplikasi Anda
const firebaseConfig = {
  apiKey: "AIzaSyDo2kyDl39c4t5DfxYycmmjHSbY5FXB9AA",
  authDomain: "sekawan-fc-427414.firebaseapp.com",
  projectId: "sekawan-fc-427414",
  storageBucket: "sekawan-fc-427414.appspot.com",
  messagingSenderId: "399174955835",
  appId: "1:399174955835:web:c681f8681c474420e8fd1e",
  measurementId: "G-CD0MHD1RBP"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);

// Dapatkan instance messaging
const messaging = firebase.messaging();

// Mencegah caching untuk semua file kecuali yang diperlukan
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );

  // Memaksa service worker baru untuk segera aktif
  self.skipWaiting();
});

// Memastikan semua tab yang terbuka menggunakan service worker yang baru
self.addEventListener('activate', (event) => {
  event.waitUntil(
    clients.claim()
  );
});

// Intercept fetch requests to control caching behavior
self.addEventListener('fetch', (event) => {
  // List of URLs to allow caching (add other files if necessary)
  const urlsToCache = [
    'https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js',
    'https://www.gstatic.com/firebasejs/10.12.3/firebase-messaging.js',
    '/firebase-messaging-sw.js'  // Service worker file
  ];

  // Prevent caching for all requests except the specified ones
  if (!urlsToCache.includes(event.request.url)) {
    event.respondWith(
      fetch(event.request).then((response) => {
        // Return response without caching it
        return response;
      })
    );
  }
});

// Mengelola pesan yang diterima saat aplikasi berada di background
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'  // Ganti dengan path ikon yang sesuai di aplikasi Anda
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
