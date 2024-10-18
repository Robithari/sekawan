const express = require('express');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');

// Inisialisasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDo2kyDl39c4t5DfxYycmmjHSbY5FXB9AA",
  authDomain: "sekawan-fc-427414.firebaseapp.com",
  projectId: "sekawan-fc-427414",
  storageBucket: "sekawan-fc-427414.appspot.com",
  messagingSenderId: "399174955835",
  appId: "1:399174955835:web:c681f8681c474420e8fd1e",
  measurementId: "G-CD0MHD1RBP",
  databaseURL: "https://sekawan-fc-427414-default-rtdb.firebaseio.com/" // Tambahkan URL untuk Realtime Database
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const app = express();
const PORT = process.env.PORT || 3000;

// Fungsi untuk mengambil artikel dari Firestore
async function getArticle(slug) {
  const q = query(collection(db, 'articles'), where('slug', '==', slug));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }
  return null;
}

// Route untuk menghasilkan meta tag dinamis berdasarkan slug
app.get('/artikel-home.html', async (req, res) => {
  const slug = req.query.slug;

  // Ambil artikel dari database
  const article = await getArticle(slug);

  if (article) {
    // Kirimkan HTML dengan meta tag dinamis
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta property="og:title" content="${article.title}">
        <meta property="og:description" content="${article.content}">
        <meta property="og:image" content="${article.photoUrl}">
        <title>${article.title}</title>
      </head>
      <body>
        <h1>${article.title}</h1>
        <p>${article.content}</p>
      </body>
      </html>
    `);
  } else {
    res.send('<h1>Artikel tidak ditemukan!</h1>');
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
