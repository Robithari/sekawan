import admin from 'firebase-admin';
import dotenv from 'dotenv';
import serviceAccount from '../firebase-service-account.json' assert { type: 'json' };

dotenv.config();

// Inisialisasi Firebase Admin SDK menggunakan service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL, // Opsional jika menggunakan Realtime Database
});

// Inisialisasi Firestore
const db = admin.firestore();

export default db;
