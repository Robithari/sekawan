const db = require('../config/firebase'); // Menggunakan Firestore yang sudah dikonfigurasi

// Fungsi untuk mendapatkan semua post
const getPosts = async () => {
  try {
    const snapshot = await db.collection('posts').get();
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return posts;
  } catch (error) {
    throw new Error('Error getting posts: ' + error.message);
  }
};

// Fungsi untuk membuat post baru
const createPost = async (postData) => {
  try {
    const docRef = await db.collection('posts').add(postData);
    return { id: docRef.id, ...postData };
  } catch (error) {
    throw new Error('Error creating post: ' + error.message);
  }
};

module.exports = { getPosts, createPost };
