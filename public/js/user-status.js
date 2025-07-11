// Mendapatkan nama user dari Firestore dan menampilkannya di halaman utama
// Pastikan Firebase sudah diinisialisasi di firebase-config.js

window.addEventListener('DOMContentLoaded', function () {
    const userStatusEl = document.getElementById('user-status');
    if (!userStatusEl) return;


    // Gunakan instance firebase yang sudah diinisialisasi oleh cek-login.js
    let auth, db;
    if (window.firebase && firebase.auth && firebase.firestore) {
        auth = firebase.auth();
        db = firebase.firestore();
    } else if (window.db && window.auth) {
        // fallback jika ada inisialisasi lain
        auth = window.auth;
        db = window.db;
    } else {
        userStatusEl.textContent = 'Firebase belum siap';
        return;
    }

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            try {
                // Ambil field name dari dokumen users yang UID-nya sama dengan user yang login
                const userDoc = await db.collection('users').doc(user.uid).get();
                let userName = '';
                if (userDoc.exists && userDoc.data().name && userDoc.data().name.trim() !== '') {
                    userName = userDoc.data().name;
                }
                if (userName && userName.trim() !== '') {
                    userStatusEl.textContent = `Selamat datang, ${userName}`;
                } else {
                    userStatusEl.textContent = 'Akun Anda belum terdaftar di database, silakan hubungi admin.';
                }
            } catch (err) {
                userStatusEl.textContent = 'Gagal mengambil data user';
                console.error('Error Firestore:', err);
            }
        } else {
            userStatusEl.textContent = 'Anda masih belum login';
        }
    });
});
