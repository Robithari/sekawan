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
        firebase.initializeApp(firebaseConfig);

        var auth = firebase.auth();
        var db = firebase.firestore();

        // Fungsi untuk menampilkan profil pengguna
        function showUserProfile(user) {
            var userDocRef = db.collection('users').doc(user.uid);

            userDocRef.get().then((doc) => {
                if (doc.exists) {
                    var userData = doc.data();
                    document.getElementById('user-name').textContent = userData.name || 'Nama tidak tersedia';
                    document.getElementById('user-phone').textContent = userData.phone || 'No HP/WA tidak tersedia';
                    document.getElementById('user-email').textContent = userData.email || 'Email tidak tersedia';
                } else {
                    console.log("Data pengguna tidak ditemukan.");
                }
            }).catch((error) => {
                console.log("Error mendapatkan data pengguna:", error);
            });
        }

        // Mengecek apakah pengguna sudah login dan menampilkan data
        auth.onAuthStateChanged((user) => {
            if (user) {
                // Pengguna sudah login, tampilkan profil
                showUserProfile(user);
            } else {
                // Pengguna belum login, arahkan ke halaman login
                window.location.href = 'login.html';
            }
        });

        // Fungsi untuk logout
        document.getElementById('logout-btn').addEventListener('click', function() {
            auth.signOut().then(() => {
                window.location.href = 'login.html'; // Redirect ke halaman login setelah logout
            }).catch((error) => {
                console.error('Error saat logout:', error);
            });
        });