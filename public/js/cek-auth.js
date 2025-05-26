// Versi modifikasi cek-auth.js untuk menambahkan loading screen agar user belum login tidak melihat konten halaman sebentar

// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDo2kyDl39c4t5DfxYycmmjHSbY5FXB9AA",
    authDomain: "sekawan-fc-427414.firebaseapp.com",
    projectId: "sekawan-fc-427414",
    storageBucket: "sekawan-fc-427414.appspot.com",
    messagingSenderId: "399174955835",
    appId: "1:399174955835:web:c681f8681c474420e8fd1e",
    measurementId: "G-CD0MHD1RBP"
};

// Daftar path halaman yang perlu dicek autentikasi
const pagesToProtect = [
    "/profil",
    "/kas",
    "/inventaris",
    "/",
    "/rangkuman-berita",
    "/rangkuman-artikel",
];

// Fungsi untuk mendapatkan path halaman saat ini tanpa query string
function getCurrentPath() {
    return window.location.pathname;
}

// Fungsi untuk menampilkan loading sebelum pengecekan auth selesai
function showLoadingScreen() {
    const body = document.querySelector('body');
    if (body) {
        body.style.visibility = 'hidden';
    }
}

// Fungsi untuk menyembunyikan loading setelah pengecekan auth selesai
function hideLoadingScreen() {
    const body = document.querySelector('body');
    if (body) {
        body.style.visibility = 'visible';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    // Inisialisasi Firebase jika belum ada
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const auth = firebase.auth();

    const currentPath = getCurrentPath();

    // Cek apakah halaman saat ini perlu proteksi
    if (pagesToProtect.includes(currentPath)) {
        showLoadingScreen(); // Sembunyikan konten sebelum pengecekan

        auth.onAuthStateChanged(function (user) {
            if (!user) {
                // Jika belum login, arahkan ke halaman /login
                window.location.href = '/login';
            } else {
                // Jika sudah login, tampilkan konten
                hideLoadingScreen();
            }
        });
    }

    // Mengatur tampilan dan fungsi link login/logout pada navbar
    const loginLogoutLink = document.getElementById('login-logout-link');

    if (loginLogoutLink) {  // Pastikan elemen ada sebelum mengakses
        auth.onAuthStateChanged(function (user) {
            if (user) {
                // Jika sudah login, ubah teks menjadi Logout dan tambahkan fungsi logout
                loginLogoutLink.textContent = 'Logout';
                loginLogoutLink.href = '#'; // Disable href default
                loginLogoutLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    auth.signOut().then(function () {
                        window.location.href = '/'; // Arahkan ke halaman utama setelah logout
                    }).catch(function (error) {
                        console.error('Error during logout:', error);
                    });
                });
            } else {
                // Jika belum login, ubah teks menjadi Login / Signup
                loginLogoutLink.textContent = 'Login / Signup';
                loginLogoutLink.href = '/login'; // Arahkan ke halaman login
            }
        });
    } else {
        console.error('Element with id "login-logout-link" not found.');
    }
});
