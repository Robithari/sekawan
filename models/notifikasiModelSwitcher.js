// models/notifikasiModelSwitcher.js
// Switcher untuk histori notifikasi: pakai Firestore di production/serverless, file JSON di dev/local

const notifikasiModel = require('./notifikasiModel');
const notifikasiFirestoreModel = require('./notifikasiFirestoreModel');

// Deteksi environment production/serverless (Vercel, dst)
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1' || process.env.SERVERLESS === '1';

// Bisa diubah sesuai kebutuhan, misal pakai env khusus
const useFirestore = isProduction;

module.exports = useFirestore ? notifikasiFirestoreModel : notifikasiModel;
