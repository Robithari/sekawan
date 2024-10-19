import firebase from 'firebase/app';
import 'firebase/messaging';

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

const messaging = firebase.messaging();

const vapidPublicKey = 'BPAqQpY9sfUZKGfJVpq6HKFoQp4THJ-ESMjE94WnFEnOqp6H5VSEAGP1QzemeQ55Tj789flPvLAjeKOYC3U4yTI';

messaging.getToken({ vapidKey: vapidPublicKey }).then((currentToken) => {
    if (currentToken) {
        console.log('FCM Token:', currentToken);
        // Kirim token ke server Anda atau simpan di database
    } else {
        console.log('No registration token available.');
    }
}).catch((err) => {
    console.error('An error occurred while retrieving token. ', err);
});

// Menangani pesan masuk
messaging.onMessage((payload) => {
    console.log('Message received. ', payload);
    // Tampilkan notifikasi atau lakukan sesuatu dengan payload
});
