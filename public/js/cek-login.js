// Pastikan bahwa DOM sudah siap sebelum mengakses elemen
document.addEventListener('DOMContentLoaded', function () {
    // Konfigurasi Firebase
    var firebaseConfig = {
        apiKey: "AIzaSyDo2kyDl39c4t5DfxYycmmjHSbY5FXB9AA",
        authDomain: "sekawan-fc-427414.firebaseapp.com",
        projectId: "sekawan-fc-427414",
        storageBucket: "sekawan-fc-427414.appspot.com",
        messagingSenderId: "399174955835",
        appId: "1:399174955835:web:c681f8681c474420e8fd1e",
        measurementId: "G-CD0MHD1RBP"
    };

    // Inisialisasi Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    var auth = firebase.auth();

    // Cek status login pengguna
    auth.onAuthStateChanged(function (user) {
        var loginLogoutLink = document.getElementById('login-logout-link');

        if (loginLogoutLink) {  // Pastikan elemen ada sebelum mengakses
            if (user) {
                // Jika sudah login, ubah teks menjadi Logout dan tambahkan fungsi logout
                loginLogoutLink.textContent = 'Logout';
                loginLogoutLink.href = '#'; // Disable href default
                loginLogoutLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    auth.signOut().then(function () {
                        window.location.href = 'index.html'; // Arahkan ke halaman utama setelah logout
                    }).catch(function (error) {
                        console.error('Error during logout:', error);
                    });
                });
            } else {
                // Jika belum login, ubah teks menjadi Login / Signup
                loginLogoutLink.textContent = 'Login / Signup';
                loginLogoutLink.href = '/login'; // Arahkan ke halaman login
            }
        } else {
            console.error('Element with id "login-logout-link" not found.');
        }
    });
});
