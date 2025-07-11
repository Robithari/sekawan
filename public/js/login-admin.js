import { db } from '../../firebase-config.js';
// Semua operasi Firebase harus menggunakan window.firebase (CDN v8)
// Pastikan firebase-app.js, firebase-firestore.js sudah di-load di index.ejs

const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Mencegah reload halaman
    const adminCodeInput = document.getElementById('adminCode').value;

    // Mendapatkan kode admin dari Firestore
    const docRef = doc(db, "adminCodes", "admin"); // Ganti dengan ID dokumen yang Anda buat
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const adminCode = docSnap.data().code;

        // Cek apakah kode admin yang dimasukkan sesuai
        if (adminCodeInput === adminCode) {
            loginMessage.textContent = "Login berhasil!";
            loginMessage.className = "text-success";

            // Tampilkan konten lain setelah login
            document.getElementById('login-section').classList.add('d-none');
            document.querySelectorAll('section').forEach(section => {
                if (section.id !== 'login-section') {
                    section.classList.remove('d-none');
                }
            });
        } else {
            loginMessage.textContent = "Kode admin salah.";
            loginMessage.className = "text-danger";
        }
    } else {
        loginMessage.textContent = "Kode admin tidak ditemukan.";
        loginMessage.className = "text-danger";
    }
});
