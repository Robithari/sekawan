// Mengimpor modul-modul yang diperlukan
const express = require("express"); // Framework web untuk Node.js
const dotenv = require("dotenv"); // Untuk memuat variabel lingkungan dari file .env
const cors = require("cors"); // Middleware untuk mengatur akses lintas domain (CORS)
const morgan = require("morgan"); // Middleware untuk logging HTTP request
const path = require("path"); // Modul untuk mengelola path file dan direktori
const xml = require("xml"); // Modul untuk menghasilkan XML (digunakan untuk sitemap)
const cookieParser = require("cookie-parser"); // Middleware untuk parsing cookie

// Mengimpor konfigurasi Firebase untuk mengakses Firestore
const db = require("./config/firebase");

// Mengimpor controller untuk berbagai halaman
const kasController = require("./controllers/kasController");
const inventarisController = require("./controllers/inventarisController");
const jadwalController = require("./controllers/jadwalController");
const cmsController = require("./controllers/cmsController");
const dokumentasiController = require("./controllers/dokumentasiController");
const indexController = require("./controllers/indexController");
const profilController = require("./controllers/profilController");
const rangkumanBeritaController = require("./controllers/rangkumanBeritaController");
const rangkumanArtikelController = require("./controllers/rangkumanArtikelController");
// const loginCmsController = require("./controllers/loginCmsController");
// const dataIuranController = require("./controllers/dataIuranController");
const loginCmsController = require("./controllers/loginCmsController");

// Middleware autentikasi untuk proteksi route CMS
const authMiddleware = require('./middleware/auth');

// Memuat variabel lingkungan dari file .env
dotenv.config();

// Membuat instance aplikasi Express
const app = express();

// Mengatur trust proxy agar express-rate-limit dapat membaca header X-Forwarded-For dengan benar
app.set('trust proxy', 1);

// Middleware global untuk menangani request
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

app.use(cors()); // Mengizinkan akses lintas domain
app.use(morgan("dev")); // Logging request HTTP dengan format 'dev'
app.use(express.json()); // Parsing body request dengan format JSON
app.use(express.urlencoded({ extended: false })); // Parsing body request dengan format URL-encoded
app.use(cookieParser()); // Parsing cookie dari request

// Gunakan rate limiter untuk membatasi request
app.use(rateLimiter);

const cacheControl = require('./middleware/cacheControl');
app.use(cacheControl);

// Menetapkan EJS sebagai view engine untuk rendering halaman HTML
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Menentukan direktori public untuk file statis (CSS, JS, gambar, dll)
app.use(express.static(path.join(__dirname, "public")));

// Definisi route dengan Server-Side Rendering (SSR)

// Middleware autentikasi untuk user biasa
const authUserMiddleware = require('./middleware/authUser');

// Halaman Kas dengan proteksi autentikasi user biasa
app.get("/kas", authUserMiddleware, kasController.renderKasPage);

// Halaman Jadwal Pertandingan
app.get("/jadwal", jadwalController.renderJadwalPage);

// Halaman Profil
app.get("/profil", profilController.renderProfilPage);

// Halaman Login CMS
app.get("/login-cms", loginCmsController.renderLoginPage);

// Halaman Login Pengunjung
app.get("/login", (req, res) => {
    const footerData = {
        email: "admin@sekawanfc.com",
        telephone: "+62 813 363 06253"
    };
    res.render("login", { footerData });
});

// Halaman CMS dengan proteksi autentikasi
app.get("/cms", authMiddleware, cmsController.renderCmsPage);

// Halaman Dokumentasi
app.get("/dokumentasi", dokumentasiController.renderDokumentasiPage);

// Halaman Inventaris
app.get("/inventaris", inventarisController.renderInventarisPage);

// Halaman Utama (Homepage)
app.get("/", indexController.renderHomePage);

// Halaman Rangkuman Berita
app.get("/rangkuman-berita", rangkumanBeritaController.renderRangkumanBeritaPage);



// Halaman Rangkuman Artikel
app.get("/rangkuman-artikel", rangkumanArtikelController.renderRangkumanArtikelPage);

const dataIuranController = require("./controllers/dataIuranController");

// Halaman Data Iuran
app.get("/data-iuran", dataIuranController.renderDataIuranPage);

app.get("/pembayaran", (req, res) => {
    const footerData = {
        email: "admin@sekawanfc.com",
        telephone: "+62 813 363 06253"
    };
    res.render("pembayaran", { footerData });
});

// Route untuk menghasilkan sitemap.xml secara dinamis
app.get("/sitemap.xml", async (req, res) => {
  try {
    // Mengambil semua artikel dari Firestore
    const articlesSnapshot = await db.collection("articles").orderBy("createdAt", "desc").get();
    console.log(`Total articles: ${articlesSnapshot.size}`);

    // Mengambil semua berita dari Firestore
    const beritaSnapshot = await db.collection("berita").orderBy("createdAt", "desc").get();
    console.log(`Total berita: ${beritaSnapshot.size}`);

    const berita = [];
    beritaSnapshot.forEach((doc) => {
      const data = doc.data();
      const lastmod = (data.updatedAt || data.createdAt).split("T")[0];
      berita.push({
        url: [
          { loc: `https://sekawanfc.fun/berita/${data.slug}` },
          { lastmod },
          { changefreq: "weekly" },
          { priority: "0.8" },
        ],
      });
    });

    // Menyusun URL sitemap
    const urls = [
      {
        url: [
          { loc: "https://sekawanfc.fun/" },
          { lastmod: new Date().toISOString().split("T")[0] },
          { changefreq: "daily" },
          { priority: "1.0" },
        ],
      },
      {
        url: [
          { loc: "https://sekawanfc.fun/profil" },
          { lastmod: new Date().toISOString().split("T")[0] },
          { changefreq: "weekly" },
          { priority: "0.8" },
        ],
      },
      {
        url: [
          { loc: "https://sekawanfc.fun/berita" },
          { lastmod: new Date().toISOString().split("T")[0] },
          { changefreq: "daily" },
          { priority: "0.9" },
        ],
      },
      ...articlesSnapshot.docs.map(doc => ({
        url: [
          { loc: `https://sekawanfc.fun/articles/${doc.data().slug}` },
          { lastmod: doc.data().createdAt.split("T")[0] },
          { changefreq: "weekly" },
          { priority: "0.8" },
        ],
      })),
      ...berita,
    ];

    // Menghasilkan sitemap XML
    const sitemap = xml({
      urlset: [
        { _attr: { xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9" } },
        ...urls,
      ],
    });

    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

// Menggunakan route API
const apiRoutes = require("./routes/api");
const articleRoutes = require("./routes/articles");
const beritaRoutes = require("./routes/berita");

app.use("/api", apiRoutes);
app.use("/articles", articleRoutes);
app.use("/berita", beritaRoutes);

// Mengecek koneksi ke Firestore
if (db) {
  console.log("Koneksi ke Firestore berhasil.");
} else {
  console.error("Koneksi ke Firestore gagal.");
}

// Menjalankan server pada mode pengembangan
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Menangani error global (middleware error handler)
app.use(errorHandler);

// Menangani route yang tidak ditemukan (404)
const { renderNotFoundPage } = require('./controllers/errorController');
app.use(renderNotFoundPage);

// Mengekspor aplikasi untuk digunakan pada platform lain (misalnya Vercel)
module.exports = app;
