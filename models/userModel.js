const db = require('../config/firebase'); // Menggunakan Firestore yang sudah dikonfigurasi

// Fungsi untuk mendapatkan semua pengguna
const getUsers = async () => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return users;
  } catch (error) {
    throw new Error('Error getting users: ' + error.message);
  }
};

// Fungsi untuk membuat pengguna baru
const createUser = async (userData) => {
  try {
    const docRef = await db.collection('users').add(userData);
    return { id: docRef.id, ...userData };
  } catch (error) {
    throw new Error('Error creating user: ' + error.message);
  }
};

module.exports = { getUsers, createUser };
