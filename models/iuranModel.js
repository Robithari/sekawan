// models/iuranModel.js
// CRUD data iuran ke Firestore
const db = require('../config/firebase');

const collection = db.collection('iuran');

async function getAllIuran() {
  const snapshot = await collection.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function addIuran(data) {
  const docRef = await collection.add(data);
  return { id: docRef.id, ...data };
}

async function updateIuran(id, data) {
  await collection.doc(id).update(data);
  return { id, ...data };
}

async function deleteIuran(id) {
  await collection.doc(id).delete();
  return true;
}

module.exports = {
  getAllIuran,
  addIuran,
  updateIuran,
  deleteIuran
};
