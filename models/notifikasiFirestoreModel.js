// models/notifikasiFirestoreModel.js
// Model histori notifikasi user, Firestore version
const db = require('../config/firebase');

const COLLECTION = 'notifikasi_user_histori';

/**
 * Ambil histori notifikasi (terbaru di atas, max limit)
 * @param {number} limit
 * @returns {Promise<Array>}
 */
async function loadAll(limit = 100) {
  const snapshot = await db.collection(COLLECTION)
    .orderBy('waktu', 'desc')
    .limit(limit)
    .get();
  return snapshot.docs.map(doc => doc.data());
}

/**
 * Tambah histori notifikasi baru
 * @param {object} data
 * @returns {Promise<void>}
 */
async function addNotifikasi(data) {
  if (!('judul' in data)) data.judul = '';
  if (!('waktu' in data)) data.waktu = Date.now();
  await db.collection(COLLECTION).add(data);
}

module.exports = {
  loadAll,
  addNotifikasi
};
