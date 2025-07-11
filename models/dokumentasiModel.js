const db = require('../config/firebase');


// Ambil semua dokumentasi
const toPlain = (doc) => ({ id: doc.id, ...doc.data() });

// Ambil semua dokumentasi, urutkan: tanggal (jika ada), lalu createdAt/updatedAt
const getAllDokumentasi = async () => {
  const snapshot = await db.collection('dokumentasi').get();
  let docs = snapshot.docs.map(toPlain);
  // Urutkan: tanggal (desc), jika tidak ada pakai createdAt/updatedAt
  docs.sort((a, b) => {
    const tA = new Date(b.tanggal || b.updatedAt || b.createdAt || 0).getTime();
    const tB = new Date(a.tanggal || a.updatedAt || a.createdAt || 0).getTime();
    return tA - tB;
  });
  return docs;
};

const addDokumentasi = async (data) => {
  const docRef = await db.collection('dokumentasi').add(data);
  return { id: docRef.id, ...data };
};

const updateDokumentasi = async (id, data) => {
  await db.collection('dokumentasi').doc(id).update(data);
  return { id, ...data };
};

const deleteDokumentasi = async (id) => {
  await db.collection('dokumentasi').doc(id).delete();
  return { id };
};

const getDokumentasiById = async (id) => {
  const doc = await db.collection('dokumentasi').doc(id).get();
  if (!doc.exists) throw new Error('Dokumentasi tidak ditemukan');
  return toPlain(doc);
};

module.exports = {
  getAllDokumentasi,
  addDokumentasi,
  updateDokumentasi,
  deleteDokumentasi,
  getDokumentasiById
};
