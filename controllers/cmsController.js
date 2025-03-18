const admin = require('firebase-admin');
require('dotenv').config(); // Memuat variabel lingkungan dari file .env

// Menggunakan debug mode berdasarkan environment
const isDevelopment = process.env.NODE_ENV !== 'production';

// Ambil Firebase Service Account credentials dari environment variables
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Pastikan private key diubah dengan benar
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

// Inisialisasi Firebase Admin SDK jika belum ada instance
if (!admin.apps.length) {
    admin.initializeApp({

    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL // URL database Firebase dari .env
  });
}

const db = admin.firestore(); // Inisialisasi Firestore


exports.renderCmsPage = async (req, res) => {

  try {
    // Ambil Data Artikel
    const artikelSnapshot = await db.collection("articles").get();
    const artikelData = artikelSnapshot.docs.map(doc => doc.data());

    // Ambil Data Berita
    const beritaSnapshot = await db.collection("berita").orderBy("tanggalPembuatan", "desc").get();
    const beritaData = beritaSnapshot.docs.map(doc => doc.data());

    // Ambil Data Footer
    const footerSnapshot = await db.collection("footer").get();
    const footerData = footerSnapshot.docs.map(doc => doc.data())[0] || {};

    // Ambil Data Jadwal Pertandingan
    const pertandinganSnapshot = await db.collection("jadwalPertandingan").get();
    const pertandinganData = pertandinganSnapshot.docs.map(doc => doc.data());

    // Ambil Data Profil
    const profilSnapshot = await db.collection("profil").doc("main").get();
    const profilData = profilSnapshot.exists ? profilSnapshot.data().content : "";

    // Ambil Data Gambar Carousel
    const carouselSnapshot = await db.collection("carousel").get();
    const carouselData = carouselSnapshot.docs.map(doc => doc.data());

    // Logging hanya jika dalam mode development
    if (isDevelopment) {
      console.log("✅ Data berhasil diambil untuk CMS:");
      console.log(`📌 Artikel: ${artikelData.length} items`);
      console.log(`📌 Berita: ${beritaData.length} items`);
      console.log(`📌 Footer: ${Object.keys(footerData).length > 0 ? "Ada data" : "Tidak ada data"}`);
      console.log(`📌 Jadwal Pertandingan: ${pertandinganData.length} items`);
      console.log(`📌 Profil: ${profilData ? "Ada data" : "Tidak ada data"}`);
      console.log(`📌 Carousel: ${carouselData.length} items`);
    }

    // Kirimkan Data ke Template EJS untuk SSR
    res.render("cms", {
      artikelData,
      beritaData,
      footerData,
      pertandinganData,
      profilData,
      carouselData
    });
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    res.status(500).send("Terjadi kesalahan server.");
  }
};
