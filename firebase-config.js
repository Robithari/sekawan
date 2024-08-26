import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js";

// Konfigurasi Firebase Anda
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
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);

      // Dapatkan token setelah Service Worker terdaftar
      return getToken(messaging, {
        vapidKey: 'BPAqQpY9sfUZKGfJVpq6HKFoQp4THJ-ESMjE94WnFEnOqp6H5VSEAGP1QzemeQ55Tj789flPvLAjeKOYC3U4yTI',
        serviceWorkerRegistration: registration
      });
    })
    .then((token) => {
      console.log('FCM Token:', token);
      // Kirim token ke server Anda jika diperlukan
    })
    .catch((err) => {
      console.error('Failed to register Service Worker or get token:', err);
    });
} else {
  console.warn('Service Worker is not supported in this browser.');
}

// Menangani pesan saat aplikasi berada di latar depan
onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  // Tampilkan notifikasi atau perbarui UI sesuai kebutuhan
});
