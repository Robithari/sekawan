const admin = require('firebase-admin');
require('dotenv').config();  // Memuat variabel lingkungan dari file .env

// Ambil Firebase Service Account credentials dari environment variables
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),  // Pastikan private key diubah dengan benar
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

// Inisialisasi Firebase Admin SDK dengan menggunakan kredensial dari secret
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL // Ganti dengan URL database Firebase Anda
    });
}

const db = admin.firestore(); // Inisialisasi Firestore

exports.renderDokumentasiPage = async (req, res) => {
  try {
    // Logika untuk mengambil data jika diperlukan
    // Misalnya, ambil data dari Firestore jika ada koleksi yang relevan

    // Render halaman dokumentasi
    res.render("dokumentasi");
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Terjadi kesalahan server.");
  }
};
