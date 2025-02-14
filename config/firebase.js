const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

// Inisialisasi Firebase Admin SDK menggunakan service account
const serviceAccount = require("../firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL, // Opsional jika menggunakan Realtime Database
});

// Inisialisasi Firestore
const db = admin.firestore();

module.exports = db;
