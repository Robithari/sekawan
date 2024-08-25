importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging.js');

// Inisialisasi Firebase
firebase.initializeApp({
  apiKey: "AIzaSyDo2kyDl39c4t5DfxYycmmjHSbY5FXB9AA",
  authDomain: "sekawan-fc-427414.firebaseapp.com",
  projectId: "sekawan-fc-427414",
  storageBucket: "sekawan-fc-427414.appspot.com",
  messagingSenderId: "399174955835",
  appId: "1:399174955835:web:c681f8681c474420e8fd1e",
  measurementId: "G-CD0MHD1RBP"
});

// Mengelola pesan background
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'icon/android-icon-48x48.png'  // Sesuaikan path ikon Anda
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
