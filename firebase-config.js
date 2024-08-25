// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging.js";

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

// Minta izin notifikasi kepada pengguna
messaging.requestPermission()
  .then(() => {
    console.log('Notification permission granted.');
    return getToken(messaging, { vapidKey: 'BPAqQpY9sfUZKGfJVpq6HKFoQp4THJ-ESMjE94WnFEnOqp6H5VSEAGP1QzemeQ55Tj789flPvLAjeKOYC3U4yTI' });
  })
  .then((token) => {
    console.log('FCM Token:', token);
    // Simpan token ini ke server untuk digunakan dalam mengirim pesan
  })
  .catch((err) => {
    console.error('Unable to get permission to notify.', err);
  });

// Menangani pesan yang diterima ketika aplikasi berjalan di latar depan
onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  // Tampilkan notifikasi atau perbarui UI
});
