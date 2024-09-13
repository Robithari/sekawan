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

// Fungsi untuk mendapatkan lokasi user menggunakan Geolocation API
async function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    let lat = position.coords.latitude;
                    let lon = position.coords.longitude;

                    // Menggunakan API Geolocation pihak ketiga (misal, OpenCage)
                    let response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=02766051551448e196808914cc70a154`);
                    let data = await response.json();
                    let result = data.results[0];
                    
                    // Mengambil nama kota, alamat lengkap, dan koordinat
                    let city = result.components.city || result.components.town;
                    let formattedAddress = result.formatted;
                    let latitude = result.geometry.lat;
                    let longitude = result.geometry.lng;

                    resolve({
                        city: city,
                        formattedAddress: formattedAddress,
                        latitude: latitude,
                        longitude: longitude
                    });
                } catch (error) {
                    reject("Tidak dapat mengambil lokasi.");
                }
            }, (error) => {
                reject("Geolocation tidak diizinkan.");
            });
        } else {
            reject("Geolocation tidak didukung oleh browser.");
        }
    });
}

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

    // Validasi Kode Keanggotaan dari Firestore
    try {
        var membershipDoc = await db.collection('membershipCodes').doc(membershipCode).get();
        if (!membershipDoc.exists) {
            alert('Kode Keanggotaan yang Anda masukkan salah. Silakan masukkan kode yang benar.');
            return; // Batalkan pendaftaran
        }
    } catch (error) {
        alert('Terjadi kesalahan saat memverifikasi kode keanggotaan: ' + error.message);
        return;
    }

    // Proses pendaftaran pengguna
    if (name && phone && email && password) {
        try {
            var userCredential = await auth.createUserWithEmailAndPassword(email, password);
            var user = userCredential.user;

            // Ambil waktu server dan lokasi user
            var signupTimestamp = firebase.firestore.FieldValue.serverTimestamp();
            var userLocation = await getUserLocation();

            // Simpan informasi pengguna ke Firestore
            await db.collection('users').doc(user.uid).set({
                name: name,
                phone: phone,
                email: email,
                signupTimestamp: signupTimestamp, // Waktu pendaftaran otomatis dari server Firebase
                city: userLocation.city, // Kota otomatis berdasarkan lokasi user
                formattedAddress: userLocation.formattedAddress, // Alamat lengkap
                latitude: userLocation.latitude, // Latitude
                longitude: userLocation.longitude // Longitude
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
