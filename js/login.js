<!DOCTYPE html>
<html lang="en" translate="no">

<head>
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-CD0MHD1RBP"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            dataLayer.push(arguments);
        }
        gtag('js', new Date());
        gtag('config', 'G-CD0MHD1RBP');
    </script>

    <!-- link preview -->
    <meta property="og:title" content="Kas Sekawan FC" />
    <meta property="og:description" content="Laporan Kas Sekawan FC Realtime" />
    <meta property="og:image" content="https://sekawanfc.fun/img/kas-sekawan-fc.jpg" />
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <!-- link preview -->

    <!-- Cache Control -->
    <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="-5">

    <!-- Viewport and Meta -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="google" content="notranslate">

    <!-- Bootstrap and Styles -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="css/loading.css">
    <link rel="stylesheet" href="css/kas.css">

    <!-- Icons -->
    <link rel="apple-touch-icon" sizes="57x57" href="icon/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="icon/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="icon/apple-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="icon/apple-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="icon/apple-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="icon/apple-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="icon/apple-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="icon/apple-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="icon/apple-icon-180x180.png">
    <link rel="icon" type="image/png" sizes="192x192" href="icon/android-icon-192x192.png">
    <link rel="icon" type="image/png" sizes="32x32" href="icon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="96x96" href="icon/favicon-96x96.png">
    <link rel="icon" type="image/png" sizes="16x16" href="icon/favicon-16x16.png">
    <link rel="manifest" href="manifest.json">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="msapplication-TileImage" content="icon/ms-icon-144x144.png">
    <meta name="theme-color" content="#ffffff">

    <title>Kas-Sekawan FC</title>
</head>

<body>
    <div class="mobile-only">
        <div class="content-wrapper">
            <div class="wrapper">
                <!-- LOADING SCREEN -->
                <div id="loading-screen" class="background">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <img class="loading-logo" src="SekawanFC.jpg" alt="Loading...">
                    <img class="loading-wait" src="img/loading4.gif" alt="Loading...">
                </div>
                <!-- END LOADING SCREEN -->

                <div id="main-content" style="display: none;">
                    <!-- Navbar -->
                    <nav class="navbar navbar-expand-lg custom-navbar">
                        <div class="container-fluid">
                            <a class="navbar-brand text-white fw-bold" href="index.html">
                                <div class="d-flex align-items-center">
                                    <img src="SekawanFC.jpg" alt="Icon" class="icon-img" width="40" height="40">
                                    <span class="ms-2">SEKAWAN FC</span>
                                </div>
                            </a>
                            <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                                aria-expanded="false" aria-label="Toggle navigation">
                                <span class="navbar-toggler-icon"></span>
                            </button>
                            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                                    <li class="nav-item">
                                        <a class="nav-link active text-white" aria-current="page"
                                            href="index.html">Home</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link text-white" href="profil.html">Profil</a>
                                    </li>
                                    <li class="nav-item dropdown">
                                        <a class="nav-link dropdown-toggle text-white" href="#" role="button"
                                            data-bs-toggle="dropdown" aria-expanded="false">Informasi</a>
                                        <ul class="dropdown-menu">
                                            <li><a class="dropdown-item text-dark" href="proses.html">Berita</a></li>
                                            <li><a class="dropdown-item text-dark" href="proses.html">Artikel</a></li>
                                        </ul>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link disabled text-white" aria-disabled="true">Contact</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>
                    <!-- End Navbar -->
                </div>

                <!-- Data Kas -->
                <div class="container-kas">
                    <h5>DATA KAS</h5>
                    <div class="table-container">
                        <table id="data-table">
                            <thead>
                                <tr>
                                    <th>TANGGAL</th>
                                    <th>KETERANGAN</th>
                                    <th>PEMASUKAN</th>
                                    <th>PENGELUARAN</th>
                                    <th>SALDO/SISA</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Data akan ditampilkan di sini -->
                            </tbody>
                        </table>
                    </div>
                </div>
                <!-- End Data Kas -->

                <!-- FOOTER -->
                <footer class="custom-footer">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h6>Ikuti Kami</h6>
                            <div class="social-icons">
                                <a href="proses.html" class="social-icon" target="_blank">
                                    <img src="https://w7.pngwing.com/pngs/670/159/png-transparent-facebook-logo-social-media-facebook-computer-icons-linkedin-logo-facebook-icon-media-internet-facebook-icon.png"
                                        alt="Ikon Facebook" class="icon-image">
                                </a>
                                <a href="proses.html" class="social-icon" target="_blank">
                                    <img src="https://cdn.pixabay.com/photo/2016/08/09/17/52/instagram-1581266_1280.jpg"
                                        alt="Ikon Instagram" class="icon-image">
                                </a>
                            </div>
                        </div>
                        <div class="footer-section">
                            <h6>Hubungi Kami</h6>
                            <p class="footer-email">Email: <a class="footer-email-link"
                                    href="mailto:admin@sekawanfc.com">admin@sekawanfc.com</a></p>
                            <p class="footer-telephone">Telepon: +62 813 363 06253</p>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p class="footer-bottom-copyright">Copyright &copy; 2024 SekawanFC, All rights reserved</p>
                        <p class="footer-bottom-dibuat">Dibuat oleh BithDev</p>
                    </div>
                </footer>
                <!-- END FOOTER -->
            </div>
            <!-- SCRIPTS -->
            <div class="container-js">
                <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
                    integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
                    crossorigin="anonymous"></script>
                <script src="js/pencarian.js"></script>
                <script src="js/hapus-cookie.js"></script>
                <script src="js/splas-screen-start.js"></script>
                <script src="js/kunci-layar.js"></script>
                <script src="js/nootifikasi.js"></script>
                <script src="js/kas.js"></script>
                <script type="module" src="firebase-config.js"></script>

                <!-- Firebase SDK -->
                <script src="https://www.gstatic.com/firebasejs/8.6.8/firebase-app.js"></script>
                <script src="https://www.gstatic.com/firebasejs/8.6.8/firebase-auth.js"></script>
                <script src="https://www.gstatic.com/firebasejs/8.6.8/firebase-firestore.js"></script>

                <script>
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

                    // Cek apakah Firebase sudah diinisialisasi sebelumnya
                    if (!firebase.apps.length) {
                        firebase.initializeApp(firebaseConfig);
                    }

                    var auth = firebase.auth();
                    var db = firebase.firestore();

                    // Fungsi untuk memeriksa apakah pengguna terdaftar
                    auth.onAuthStateChanged(async function (user) {
                        if (!user) {
                            // Jika pengguna belum login, tampilkan pesan dan alihkan ke login
                            document.body.innerHTML = '<div class="container text-center mt-5"><h3>Halaman ini hanya untuk anggota yang terdaftar. Silakan <a href="login.html">login</a>.</h3></div>';
                        } else {
                            try {
                                // Cek apakah user ada di koleksi Firestore
                                var userDoc = await db.collection('users').doc(user.uid).get();
                                if (!userDoc.exists) {
                                    // Jika user tidak terdaftar, tampilkan pesan dan alihkan ke login
                                    document.body.innerHTML = '<div class="container text-center mt-5"><h3>Anda tidak terdaftar sebagai anggota. Silakan <a href="login.html">login</a>.</h3></div>';
                                } else {
                                    // Jika pengguna terdaftar, tampilkan konten halaman
                                    document.getElementById('main-content').style.display = 'block';
                                    document.getElementById('loading-screen').style.display = 'none';
                                }
                            } catch (error) {
                                console.error('Error checking user:', error);
                            }
                        }
                    });
                </script>

            </div>
            <!-- END SCRIPTS -->

            <!-- Service Worker -->
            <script>
                if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function () {
                        navigator.serviceWorker.register('/service-worker.js').then(function (registration) {
                            console.log('Service Worker registered with scope:', registration.scope);
                        }, function (error) {
                            console.error('Service Worker registration failed:', error);
                        });
                    });
                }
            </script>
            <!-- END Service Worker -->
        </div>
    </div>
</body>

</html>
