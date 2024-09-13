// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDo2kyDl39c4t5DfxYycmmjHSbY5FXB9AA",
    authDomain: "sekawan-fc-427414.firebaseapp.com",
    projectId: "sekawan-fc-427414",
    storageBucket: "sekawan-fc-427414.appspot.com",
    messagingSenderId: "399174955835",
    appId: "1:399174955835:web:c681f8681c474420e8fd1e",
    measurementId: "G-CD0MHD1RBP"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
var auth = firebase.auth();

// Fungsi untuk mengelola tampilan antara login dan signup
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

// Fungsi Login
async function handleLogin(event) {
    event.preventDefault(); // Hindari pengiriman formulir secara default
    var email = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    try {
        await auth.signInWithEmailAndPassword(email, password);
        document.getElementById('login-success-message').style.display = 'block';
        setTimeout(function () {
            window.location.href = 'index.html'; // Arahkan ke halaman beranda
        }, 3000);
    } catch (error) {
        alert('Login gagal: ' + error.message);
    }
}

// Fungsi Sign Up
async function handleSignup(event) {
    event.preventDefault(); // Hindari pengiriman formulir secara default
    var name = document.getElementById('signup-name').value;
    var phone = document.getElementById('signup-phone').value;
    var email = document.getElementById('signup-email').value;
    var password = document.getElementById('signup-password').value;
    var membershipCode = document.getElementById('signup-membership-code').value;

    // Validasi Kode Keanggotaan dari Firestore
    try {
        var membershipDoc = await db.collection('membershipCodes').doc(membershipCode).get();
        if (!membershipDoc.exists) {
            alert('Kode Keanggotaan salah. Masukkan kode yang benar.');
            return;
        }
    } catch (error) {
        alert('Gagal memverifikasi kode keanggotaan: ' + error.message);
        return;
    }

    // Proses Pendaftaran
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        document.getElementById('success-message').style.display = 'block';
        setTimeout(function () {
            window.location.href = 'login.html'; // Arahkan ke halaman login
        }, 3000);
    } catch (error) {
        alert('Pendaftaran gagal: ' + error.message);
    }
}

// Fungsi untuk lupa password
async function handleForgotPassword(event) {
    event.preventDefault();
    var email = document.getElementById('username').value;
    if (email) {
        try {
            await auth.sendPasswordResetEmail(email);
            alert('Email reset password telah dikirim!');
        } catch (error) {
            alert('Gagal mengirim email: ' + error.message);
        }
    } else {
        alert('Harap masukkan alamat email.');
    }
}

// Pasang event listener untuk form login dan signup
document.getElementById('login-form').addEventListener('submit', handleLogin);
document.getElementById('signup-form').addEventListener('submit', handleSignup);
document.getElementById('forgot-password').addEventListener('click', handleForgotPassword);

// Logout
document.getElementById('logout-button').addEventListener('click', function () {
    auth.signOut().then(function () {
        window.location.reload();
    }).catch(function (error) {
        console.error('Error logging out:', error);
    });
});
