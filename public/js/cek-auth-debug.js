// Versi debug dari cek-auth.js dengan logging tambahan untuk troubleshooting

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

const pagesToProtect = [
    "/profil",
    "/kas",
    "/inventaris",
    "/",
    "/rangkuman-berita",
    "/rangkuman-artikel",
];

function getCurrentPath() {
    return window.location.pathname;
}

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM loaded, mulai inisialisasi Firebase dan cek autentikasi");

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase diinisialisasi");
    } else {
        console.log("Firebase sudah diinisialisasi sebelumnya");
    }

    const auth = firebase.auth();
    const currentPath = getCurrentPath();

    if (pagesToProtect.includes(currentPath)) {
        auth.onAuthStateChanged(function (user) {
            console.log("onAuthStateChanged dipanggil, user:", user);
            if (!user) {
                console.log("User belum login, redirect ke /login");
                window.location.href = '/login';
            } else {
                console.log("User sudah login, tetap di halaman ini");
            }
        });
    }

    const loginLogoutLink = document.getElementById('login-logout-link');

    if (loginLogoutLink) {
        console.log("Elemen login-logout-link ditemukan");
        auth.onAuthStateChanged(function (user) {
            console.log("onAuthStateChanged untuk navbar, user:", user);
            if (user) {
                loginLogoutLink.textContent = 'Logout';
                loginLogoutLink.href = '#';
                loginLogoutLink.onclick = function (e) {
                    e.preventDefault();
                    console.log("Logout diklik, proses sign out");
                    auth.signOut().then(function () {
                        console.log("Logout berhasil, redirect ke /");
                        window.location.href = '/';
                    }).catch(function (error) {
                        console.error('Error during logout:', error);
                    });
                };
            } else {
                loginLogoutLink.textContent = 'Login / Signup';
                loginLogoutLink.href = '/login';
            }
        });
    } else {
        console.error('Element with id "login-logout-link" not found.');
    }
});
