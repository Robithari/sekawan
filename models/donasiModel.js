// models/donasiModel.js
// CRUD data donasi ke Firestore
const db = require('../config/firebase');

const collection = db.collection('donasi');

async function getAllDonasi() {
  const snapshot = await collection.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function addDonasi(data) {
  const docRef = await collection.add(data);
  return { id: docRef.id, ...data };
}

async function updateDonasi(id, data) {
  await collection.doc(id).update(data);
  return { id, ...data };
}

async function deleteDonasi(id) {
  await collection.doc(id).delete();
  return true;
}

module.exports = {
  getAllDonasi,
  addDonasi,
  updateDonasi,
  deleteDonasi
};
