// Inisialisasi Firebase App untuk window.firebase (CDN) agar FCM dan Auth berjalan normal
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyDo2kyDl39c4t5DfxYycmmjHSbY5FXB9AA",
    authDomain: "sekawan-fc-427414.firebaseapp.com",
    projectId: "sekawan-fc-427414",
    storageBucket: "sekawan-fc-427414.appspot.com",
    messagingSenderId: "399174955835",
    appId: "1:399174955835:web:c681f8681c474420e8fd1e",
    measurementId: "G-CD0MHD1RBP",
    databaseURL: "https://sekawan-fc-427414-default-rtdb.firebaseio.com/"
  });
}
// Jangan gunakan kode apapun di bawah ini! File ini hanya untuk inisialisasi firebase CDN.



