// Inisialisasi Firebase CDN v8 (window.firebase)
if (!window.firebase || !window.firebase.apps || !window.firebase.apps.length) {
  window.firebase.initializeApp({
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
// window.firebase.firestore() dan window.firebase.auth() siap dipakai
