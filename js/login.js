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
firebase.initializeApp(firebaseConfig);

// Referensi ke layanan autentikasi dan Firestore
var auth = firebase.auth();
var db = firebase.firestore();

// Fungsi login
async function handleLogin(event) {
    event.preventDefault(); // Menghindari pengiriman formulir secara default

    var email = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        localStorage.setItem('loggedIn', 'true');
        document.getElementById('login-success-message').style.display = 'block';

        setTimeout(function () {
            document.getElementById('login-success-message').style.display = 'none';
            window.location.href = 'index.html'; // Redirect ke halaman beranda
        }, 3000);
    } catch (error) {
        alert('Login gagal! Kesalahan: ' + error.message);
    }
}

// Fungsi signup dengan async/await
async function handleSignup(event) {
    event.preventDefault(); // Menghindari pengiriman formulir secara default

    var name = document.getElementById('signup-name').value;
    var phone = document.getElementById('signup-phone').value;
    var email = document.getElementById('signup-email').value;
    var password = document.getElementById('signup-password').value;
    var membershipCode = document.getElementById('signup-membership-code').value;

    // Cek Kode Keanggotaan
    if (membershipCode !== 'sekawanfcguyub') {
        alert('Kode Keanggotaan yang Anda masukkan salah. Silakan masukkan kode yang benar.');
        return; // Batalkan pendaftaran
    }

    if (name && phone && email && password) {
        try {
            var userCredential = await auth.createUserWithEmailAndPassword(email, password);
            var user = userCredential.user;

            // Simpan informasi pengguna ke Firestore
            await db.collection('users').doc(user.uid).set({
                name: name,
                phone: phone,
                email: email
            });

            // Tampilkan notifikasi sukses
            document.getElementById('success-message').innerHTML = "Anda berhasil mendaftar, silakan login";
            document.getElementById('success-message').style.display = 'block';

            // Tunggu 3 detik, lalu arahkan ke halaman login secara otomatis
            setTimeout(function() {
                window.location.href = 'login.html'; // Arahkan ke halaman login
            }, 3000);

        } catch (error) {
            console.error("Error pada pendaftaran:", error.code, error.message);
            alert('Error: ' + error.message);
        }
    } else {
        alert('Please fill in all fields.');
    }
}

// Fungsi untuk lupa password
async function handleForgotPassword(event) {
    event.preventDefault(); // Menghindari pengiriman formulir secara default

    var email = document.getElementById('username').value;
    if (email) {
        try {
            await auth.sendPasswordResetEmail(email);
            alert('Password reset email sent! Please check your inbox.');
        } catch (error) {
            alert('Error: ' + error.message);
        }
    } else {
        alert('Please enter your email address.');
    }
}

// Fungsi untuk beralih antara form login dan signup
document.getElementById('signup-link').addEventListener('click', function (event) {
    event.preventDefault();
    document.getElementById('form-title').innerText = 'Sign Up'; // Ubah judul jadi Sign Up
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
});

document.getElementById('back-to-login').addEventListener('click', function (event) {
    event.preventDefault();
    document.getElementById('form-title').innerText = 'Login'; // Kembalikan judul jadi Login
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
});

document.getElementById('forgot-password').addEventListener('click', handleForgotPassword);
document.getElementById('login-form').addEventListener('submit', handleLogin);
document.getElementById('signup-form').addEventListener('submit', handleSignup);

// Menangani klik pada tombol "Go to Login"
document.getElementById('go-to-login').addEventListener('click', function () {
    window.location.href = 'login.html'; // Arahkan ke halaman login
});
