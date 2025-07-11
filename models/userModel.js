const db = require('../config/firebase'); // Menggunakan Firestore yang sudah dikonfigurasi

// Fungsi untuk mendapatkan semua pengguna
const getUsers = async () => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Pastikan fcmTokens selalu array (migrasi dari fcmToken string jika ada)
    return users.map(u => ({
      ...u,
      fcmTokens: Array.isArray(u.fcmTokens) ? u.fcmTokens : (u.fcmToken ? [u.fcmToken] : [])
    }));
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

// Ambil user by NIK
const getUserByNik = async (nik) => {
  try {
    const snapshot = await db.collection('users').where('nik', '==', nik).limit(1).get();
    if (snapshot.empty) return null;
    const data = snapshot.docs[0].data();
    // Pastikan fcmTokens selalu array (migrasi dari fcmToken string jika ada)
    return {
      id: snapshot.docs[0].id,
      ...data,
      fcmTokens: Array.isArray(data.fcmTokens) ? data.fcmTokens : (data.fcmToken ? [data.fcmToken] : [])
    };
  } catch (error) {
    return null;
  }
};

// Ambil semua user (array)
const getAllUsers = async () => {
  try {
    const snapshot = await db.collection('users').get();
    // Pastikan fcmTokens selalu array (migrasi dari fcmToken string jika ada)
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fcmTokens: Array.isArray(data.fcmTokens) ? data.fcmTokens : (data.fcmToken ? [data.fcmToken] : [])
      };
    });
  } catch (error) {
    return [];
  }
};

module.exports = { getUsers, createUser, getUserByNik, getAllUsers };
