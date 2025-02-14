import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging.js";

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
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Gunakan VAPID key (Public Key) untuk mendapatkan token
getToken(messaging, { vapidKey: "BPAqQpY9sfUZKGfJVpq6HKFoQp4THJ-ESMjE94WnFEnOqp6H5VSEAGP1QzemeQ55Tj789flPvLAjeK" }).then((currentToken) => {
  if (currentToken) {
    console.log('Token didapatkan:', currentToken);
    // Kirim token ke server backend untuk menyimpan langganan push
  } else {
    console.warn('Tidak ada token yang tersedia. Mohon perbolehkan notifikasi.');
  }
}).catch((err) => {
  console.error('Error saat mendapatkan token:', err);
});

// Handle pesan foreground
onMessage(messaging, (payload) => {
  console.log('Pesan diterima saat aplikasi foreground:', payload);
  // Tambahkan logika untuk menampilkan notifikasi atau menangani payload
});
