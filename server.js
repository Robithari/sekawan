// server.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const xml = require('xml');
const db = require("./config/firebase"); // Pastikan impor 'db' sudah benar

// Debugging: Log untuk memeriksa data artikel dan berita
console.log("Memeriksa koneksi ke Firestore...");
console.log("Memeriksa data artikel dan berita...");








dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Menentukan direktori public
app.use(express.static(path.join(__dirname, "public")));

// Sitemap Generator
app.get('/sitemap.xml', async (req, res) => {
  try {
    // Ambil semua artikel
    const articlesSnapshot = await db.collection("articles")
      .orderBy('createdAt', 'desc')
      .get();
    console.log(`Total articles: ${articlesSnapshot.size}`); // Log jumlah artikel

    if (articlesSnapshot.empty) {
      console.log("Tidak ada artikel ditemukan.");
    }

    const beritaSnapshot = await db.collection("berita")
      .orderBy('createdAt', 'desc')
      .get();
    console.log(`Total berita: ${beritaSnapshot.size}`); // Log jumlah berita

    if (beritaSnapshot.empty) {
      console.log("Tidak ada berita ditemukan.");
    }





    console.log(`Total berita: ${beritaSnapshot.size}`); // Log jumlah berita

    console.log(`Total berita: ${beritaSnapshot.size}`); // Log jumlah berita

    const berita = [];
    beritaSnapshot.forEach(doc => {
      const data = doc.data();
      const lastmod = (data.updatedAt || data.createdAt).split('T')[0];
      berita.push({
        url: [
          { loc: `https://sekawanfc.fun/berita/${data.slug}` },
          { lastmod },
          { changefreq: 'weekly' },
          { priority: '0.8' }
        ]
      });
    });

    // Gabungkan semua URL
    const urls = [
      {
        url: [
          { loc: 'https://sekawanfc.fun/' },
          { lastmod: new Date().toISOString().split('T')[0] },
          { changefreq: 'daily' },
          { priority: '1.0' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawanfc.fun/profil' },
          { lastmod: new Date().toISOString().split('T')[0] },
          { changefreq: 'weekly' },
          { priority: '0.8' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawanfc.fun/berita' },
          { lastmod: new Date().toISOString().split('T')[0] },
          { changefreq: 'daily' },
          { priority: '0.9' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawanfc.fun/artikel' },
          { lastmod: new Date().toISOString().split('T')[0] },
          { changefreq: 'daily' },
          { priority: '0.9' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawanfc.fun/jadwal' },
          { lastmod: new Date().toISOString().split('T')[0] },
          { changefreq: 'weekly' },
          { priority: '0.8' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawanfc.fun/kas' },
          { lastmod: new Date().toISOString().split('T')[0] },
          { changefreq: 'monthly' },
          { priority: '0.7' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawanfc.fun/dokumentasi' },
          { lastmod: new Date().toISOString().split('T')[0] },
          { changefreq: 'weekly' },
          { priority: '0.8' }
        ]
      },
      {
        url: [
          { loc: 'https://sekawanfc.fun/inventaris' },
          { lastmod: new Date().toISOString().split('T')[0] },
          { changefreq: 'monthly' },
          { priority: '0.7' }
        ]
      },
      ...articles,
      ...berita
    ];


    // Generate sitemap XML
    const sitemap = xml({
      urlset: [
        { _attr: { xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9' } },
        ...urls
      ]
    });

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Import Routes
const indexRoutes = require("./routes/index");

const apiRoutes = require("./routes/api");
const articleRoutes = require("./routes/articles");
const beritaRoutes = require("./routes/berita");
const hrefRoutes = require("./routes/href");

// Gunakan Routes
app.use("/", indexRoutes);
app.use("/api", apiRoutes);
app.use("/articles", articleRoutes);
app.use("/berita", beritaRoutes);
app.use("/", hrefRoutes);

// Pastikan 'db' terdefinisi
if (db) {
  console.log('Koneksi ke Firestore berhasil.');
} else {
  console.error('Koneksi ke Firestore gagal.');
}

// Fungsi untuk mengambil data dari Firestore
const getUsersFromFirestore = async () => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => doc.data());

    console.log(`Berhasil mengambil ${users.length} pengguna dari Firestore.`);
    users.forEach(user => {
      console.log(`Pengguna: ${user.name}`);
    });

  } catch (error) {
    console.error("Error getting users:", error);
  }
};

// Panggil fungsi jika diperlukan
// getUsersFromFirestore();

// Kondisi untuk memulai server hanya saat pengembangan lokal
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Ekspor aplikasi untuk digunakan oleh Vercel
module.exports = app;
