// models/inventarisModel.js
// CRUD data inventaris ke Firestore
const db = require('../config/firebase');

const collection = db.collection('inventaris');

async function getAllInventaris() {
  const snapshot = await collection.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function addInventaris(data) {
  const docRef = await collection.add(data);
  return { id: docRef.id, ...data };
}

async function updateInventaris(id, data) {
  await collection.doc(id).update(data);
  return { id, ...data };
}

async function deleteInventaris(id) {
  await collection.doc(id).delete();
  return true;
}

module.exports = {
  getAllInventaris,
  addInventaris,
  updateInventaris,
  deleteInventaris
};
