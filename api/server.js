// api/server.js

const express = require('express');
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where } = require("firebase/firestore");

// Inisialisasi aplikasi Express
const app = express();

// Konfigurasi Firebase menggunakan Environment Variables
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID // Ini opsional
};

// Inisialisasi Firebase
initializeApp(firebaseConfig);
const db = getFirestore();

// Rute untuk mendapatkan artikel
app.get('/artikel-home.html', async (req, res) => {
    const slug = req.query.slug;

    try {
        const q = query(collection(db, "articles"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        const article = querySnapshot.empty ? null : querySnapshot.docs[0].data();

        if (article) {
            // Meta tags OG yang dihasilkan di server
            const metaTags = `
                <meta property="og:title" content="${article.title}" />
                <meta property="og:description" content="${article.titleKeterangan}" />
                <meta property="og:image" content="${article.photoUrl}" />
                <meta property="og:type" content="article" />
                <meta property="og:url" content="https://sekawan.vercel.app/artikel-home.html?slug=${slug}" />
            `;

            // Mengirimkan HTML yang berisi meta tag OG
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    ${metaTags}
                    <title>${article.title}</title>
                </head>
<body>
    <div class="mobile-only">
        <div class="content-wrapper">
            <!-- Tambahkan wrapper di sini -->
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
                                        <a class="nav-link" style="color: white;" aria-current="page"
                                            href="index.html">Home</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" style="color: white;" href="profil.html">Profil</a>
                                    </li>
                                    <li class="nav-item dropdown">
                                        <a class="nav-link dropdown-toggle" href="#" role="button"
                                            data-bs-toggle="dropdown" aria-expanded="false"
                                            style="color: white;">Informasi</a>
                                        <ul class="dropdown-menu">
                                            <li><a class="dropdown-item disabled text-black"
                                                    href="proses.html">Berita</a></li>
                                            <li><a class="dropdown-item disabled text-black"
                                                    href="proses.html">Artikel</a></li>
                                        </ul>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link" id="login-logout-link" style="color: white;"
                                            href="login.html">Masuk /
                                            Daftar</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>
                    <!-- End Navbar -->
                </div>


                <!-- Artikel -->
                <div class="judul-halaman">
                    <h1 id="title" class="detail-title"></h1>
                    <div class="title-keterangan">
                        <p id="titleKeterangan"></p>
                        <p id="tanggalPembuatan"></p>
                    </div>
                </div>
                <div class="container-foto">
                    <img id="photoUrl" class="custom-foto" alt="Foto Artikel">
                </div>
                <p id="caption" class="keterangan-foto"></p>
                <div class="isi-halaman">
                    <div id="articles"></div>
                </div>
                <!-- End Artikel -->

                <!-- Tombol tautan -->
                <div class="container-tautan">
                    <!-- Ikon untuk Salin Tautan menggunakan gambar -->
                    <span id="copyLink" class="link-icon">
                        <img src="img/icon-link.png" alt="Ikon Share Link" class="icon-link">
                        Share Link
                    </span>
                    <!-- Pesan Notifikasi -->
                    <div id="tautan-notification" class="tautan-notification">
                        Tautan sudah di copi dan siap di paste, silahkan share
                    </div>
                </div>
                <!-- End Tombol tautan -->

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
                <script type="module" src="firebase-config.js"></script>
                <script src="js/share-link.js"></script>
                <script type="module" src="./ujicoba-website.js"></script>
                <script src="js/cek-login.js"></script>
                <script type="module" src="firebase-config.js"></script>
                <script type="module" src="js/api-artikel.js"></script>


                <script>
                    window.splashScreenApiUrl = 'https://script.googleusercontent.com/macros/echo?user_content_key=Ug4_RY3Q1GjQImtwch8hiiU37tiqDCIMi8bTKHj97_WxEAvt8cdY5oa_0Y6dp_E2w5y237mVYqBpQaI3A6pP_BXAylj9M2Ilm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnFnDUwtuW5IHw5CPwpfhqpJZUQvB1wU_QDcMWPm2k5WgJ9OtqX5w07gpJuDy0PbvOMRplWdFUiYiu_oV8kxVeaRFvnZ3JX3SHg&lib=MOgvvmbSEQE02bq4Gi45tbleS6DrsjUUV';
                </script>
            </div>
            <!-- END SCRIPTS -->


            <!-- Service Worker -->
            <script>
                if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function () {
                        navigator.serviceWorker.register('/service-worker.js').then(function (registration) {
                            // console.log('Service Worker registered with scope:', registration.scope); // Pesan ini telah dikomentari
                        }, function (error) {
                            console.error('Service Worker registration failed:', error); // Tetap tampilkan error untuk debugging
                        });
                    });
                }
            </script>
            <!-- END Service Worker -->
        </div>
    </div>
    </div>
</body>

</html>
            `);
        } else {
            res.status(404).send("<h1>Artikel tidak ditemukan!</h1>");
        }
    } catch (error) {
        console.error("Error fetching article:", error);
        res.status(500).send("<h1>Terjadi kesalahan saat memuat artikel.</h1>");
    }
});

// Mengekspor fungsi handler agar bisa digunakan di Vercel
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});

module.exports = app;
