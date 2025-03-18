// Mengimpor modul-modul yang diperlukan
const express = require("express"); // Untuk membuat server web menggunakan Express
const dotenv = require("dotenv"); // Untuk memuat variabel lingkungan dari file .env
const cors = require("cors"); // Middleware untuk mengatur akses lintas domain (CORS)
const morgan = require("morgan"); // Middleware untuk logging HTTP request
const path = require("path"); // Modul untuk mengelola path file
const xml = require("xml"); // Modul untuk menghasilkan XML (digunakan untuk sitemap)
const db = require("./config/firebase"); // Mengimpor konfigurasi Firebase untuk mengakses Firestore
const kasController = require("./controllers/kasController"); // Mengimpor controller untuk halaman Kas
const inventarisController = require("./controllers/inventarisController"); // Mengimpor controller untuk halaman Inventaris

const jadwalController = require("./controllers/jadwalController"); // Mengimpor controller untuk halaman Jadwal
const cmsController = require("./controllers/cmsController"); // Mengimpor controller untuk halaman CMS
const dokumentasiController = require("./controllers/dokumentasiController"); // Mengimpor controller untuk halaman Dokumentasi
const indexController = require("./controllers/indexController"); // Mengimpor controller untuk halaman index (SSR)
const profilController = require("./controllers/profilController"); // Mengimpor controller untuk halaman Profil
const rangkumanBeritaController = require("./controllers/rangkumanBeritaController"); // Mengimpor controller untuk halaman Rangkuman Berita
const rangkumanArtikelController = require("./controllers/rangkumanArtikelController"); // Mengimpor controller untuk halaman Rangkuman Artikel

dotenv.config(); // Memuat file .env untuk konfigurasi variabel lingkungan

const app = express(); // Membuat instance aplikasi Express

// Middleware untuk menangani request
app.use(cors()); // Menggunakan middleware CORS
app.use(morgan("dev")); // Menggunakan morgan untuk mencatat log request dalam format 'dev'
app.use(express.json()); // Middleware untuk meng-handle request body dalam format JSON
app.use(express.urlencoded({ extended: false })); // Middleware untuk meng-handle request body dalam format URL-encoded

// Menetapkan EJS sebagai view engine untuk rendering halaman HTML
app.set("view engine", "ejs"); 
// Menetapkan folder 'views' sebagai lokasi file view EJS
app.set("views", path.join(__dirname, "views")); 

// Menentukan direktori public yang akan digunakan untuk file statis (seperti CSS, JS, gambar)
app.use(express.static(path.join(__dirname, "public"))); 

// Rute untuk halaman Kas menggunakan Server-Side Rendering (SSR)
app.get("/kas", kasController.renderKasPage);

// Rute untuk halaman Jadwal Pertandingan menggunakan SSR
app.get("/jadwal", jadwalController.renderJadwalPage);

// Rute untuk halaman Profil menggunakan SSR
app.get("/profil", profilController.renderProfilPage);

// Rute untuk halaman CMS menggunakan SSR
app.get("/cms", cmsController.renderCmsPage);

// Rute untuk halaman Dokumentasi menggunakan SSR
app.get("/dokumentasi", dokumentasiController.renderDokumentasiPage); 

app.get("/inventaris", inventarisController.renderInventarisPage); // Rute untuk halaman Inventaris menggunakan SSR
// Rute untuk halaman utama (index) menggunakan SSR
app.get("/", indexController.renderHomePage);


// Rute untuk halaman Rangkum Berita menggunakan SSR
app.get("/rangkuman-berita", rangkumanBeritaController.renderRangkumanBeritaPage);

// Rute untuk halaman Rangkum Artikel menggunakan SSR
app.get("/rangkuman-artikel", rangkumanArtikelController.renderRangkumanArtikelPage); // Menambahkan rute rangkuman-artikel

// Rute untuk menghasilkan sitemap.xml secara dinamis
app.get("/sitemap.xml", async (req, res) => {
  try {
    // Mengambil semua artikel yang ada di koleksi 'articles' di Firestore
    const articlesSnapshot = await db.collection("articles").orderBy("createdAt", "desc").get();
    console.log(`Total articles: ${articlesSnapshot.size}`); // Mencetak jumlah artikel yang ditemukan

    // Mengambil semua berita dari koleksi 'berita' di Firestore
    const beritaSnapshot = await db.collection("berita").orderBy("createdAt", "desc").get();
    console.log(`Total berita: ${beritaSnapshot.size}`); // Mencetak jumlah berita yang ditemukan

    const berita = [];
    // Mengolah setiap berita untuk dimasukkan ke dalam array berita
    beritaSnapshot.forEach((doc) => {
      const data = doc.data();
      const lastmod = (data.updatedAt || data.createdAt).split("T")[0]; // Mendapatkan tanggal modifikasi terakhir
      berita.push({
        url: [
          { loc: `https://sekawanfc.fun/berita/${data.slug}` }, // URL berita
          { lastmod }, // Tanggal modifikasi berita
          { changefreq: "weekly" }, // Frekuensi perubahan sitemap (setiap minggu)
          { priority: "0.8" }, // Prioritas URL dalam sitemap
        ],
      });
    });

    // Menyusun semua URL untuk dimasukkan dalam sitemap
    const urls = [
      {
        url: [
          { loc: "https://sekawanfc.fun/" }, // URL untuk homepage
          { lastmod: new Date().toISOString().split("T")[0] }, // Tanggal modifikasi homepage
          { changefreq: "daily" }, // Frekuensi perubahan homepage (setiap hari)
          { priority: "1.0" }, // Prioritas homepage
        ],
      },
      {
        url: [
          { loc: "https://sekawanfc.fun/profil" }, // URL untuk halaman profil
          { lastmod: new Date().toISOString().split("T")[0] }, // Tanggal modifikasi halaman profil
          { changefreq: "weekly" }, // Frekuensi perubahan halaman profil (setiap minggu)
          { priority: "0.8" }, // Prioritas halaman profil
        ],
      },
      {
        url: [
          { loc: "https://sekawanfc.fun/berita" }, // URL untuk halaman berita
          { lastmod: new Date().toISOString().split("T")[0] }, // Tanggal modifikasi halaman berita
          { changefreq: "daily" }, // Frekuensi perubahan halaman berita (setiap hari)
          { priority: "0.9" }, // Prioritas halaman berita
        ],
      },
      // Menambahkan URL artikel dan berita lainnya
      ...articles,
      ...berita,
    ];

    // Menghasilkan sitemap XML
    const sitemap = xml({
      urlset: [
        { _attr: { xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9" } }, // XML namespace untuk sitemap
        ...urls, // Menambahkan URL yang sudah disusun
      ],
    });

    res.header("Content-Type", "application/xml"); // Menetapkan header Content-Type untuk XML
    res.send(sitemap); // Mengirimkan sitemap XML ke klien
  } catch (error) {
    console.error("Error generating sitemap:", error); // Menangani error dalam pembuatan sitemap
    res.status(500).send("Error generating sitemap"); // Mengirimkan response error jika terjadi kesalahan
  }
});

// Import dan menggunakan berbagai rute aplikasi
const apiRoutes = require("./routes/api");
const articleRoutes = require("./routes/articles");
const beritaRoutes = require("./routes/berita");

// Gunakan berbagai rute untuk menangani berbagai URL
app.use("/api", apiRoutes); // Rute untuk API
app.use("/articles", articleRoutes); // Rute untuk artikel
app.use("/berita", beritaRoutes); // Rute untuk berita

// Mengecek koneksi ke Firestore
if (db) {
  console.log("Koneksi ke Firestore berhasil."); // Jika berhasil terhubung ke Firestore
} else {
  console.error("Koneksi ke Firestore gagal."); // Jika gagal terhubung ke Firestore
}

// Menjalankan server pada mode pengembangan
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000; // Menentukan port yang digunakan (default 3000)
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`); // Menampilkan pesan jika server berjalan
  });
}

// Mengekspor aplikasi untuk digunakan pada platform lain (misalnya Vercel)
module.exports = app;
