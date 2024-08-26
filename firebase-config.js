// firebase-config.js
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

// Inisialisasi Messaging
const messaging = getMessaging(app);

// Minta izin notifikasi dan dapatkan token FCM
function requestNotificationPermission() {
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      return getToken(messaging, {
        vapidKey: 'BPAqQpY9sfUZKGfJVpq6HKFoQp4THJ-ESMjE94WnFEnOqp6H5VSEAGP1QzemeQ55Tj789flPvLAjeKOYC3U4yTI'
      });
    } else {
      console.error('Notification permission not granted.');
      throw new Error('Notification permission not granted');
    }
  }).then((token) => {
    console.log('FCM Token:', token);
    // Simpan token ke server untuk pengiriman pesan
  }).catch((err) => {
    console.error('Unable to get permission to notify or get token:', err);
  });
}

// Panggil fungsi ini ketika halaman dimuat
requestNotificationPermission();

// Menangani pesan saat aplikasi berada di latar depan
onMessage(messaging, (payload) => {
  console.log('Message received. ', payload);
  // Tampilkan notifikasi atau perbarui UI sesuai kebutuhan
});
