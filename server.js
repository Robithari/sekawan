const express = require('express');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

// Inisialisasi Express dan Firebase
const app = express();
const PORT = process.env.PORT || 3000;

const firebaseConfig = {
  apiKey: "AIzaSyDo2kyDl39c4t5DfxYycmmjHSbY5FXB9AA",
  authDomain: "sekawan-fc-427414.firebaseapp.com",
  projectId: "sekawan-fc-427414",
  storageBucket: "sekawan-fc-427414.appspot.com",
  messagingSenderId: "399174955835",
  appId: "1:399174955835:web:c681f8681c474420e8fd1e",
  measurementId: "G-CD0MHD1RBP",
  databaseURL: "https://sekawan-fc-427414-default-rtdb.firebaseio.com/"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Middleware untuk file statis
app.use(express.static('public'));

// Rute dinamis untuk mengambil artikel berdasarkan slug dan menyajikan metadata OG
app.get('/artikel/:slug', async (req, res) => {
  const { slug } = req.params;

  try {
    // Query ke Firestore untuk mendapatkan artikel berdasarkan slug
    const q = query(collection(db, 'articles'), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const article = querySnapshot.docs[0].data();

      // Sajikan HTML dengan metadata OG dinamis
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta property="og:title" content="${article.title}" />
          <meta property="og:description" content="${article.caption}" />
          <meta property="og:image" content="${article.photoUrl}" />
          <meta property="og:type" content="article" />
          <meta property="og:url" content="https://www.sekawanfc.fun/artikel/${slug}" />
          <title>${article.title}</title>
        </head>
        <body>
          <h1>${article.title}</h1>
          <p>${article.content}</p>
          <img src="${article.photoUrl}" alt="${article.caption}">
        </body>
        </html>
      `);
    } else {
      res.status(404).send('<h1>Artikel tidak ditemukan!</h1>');
    }
  } catch (error) {
    console.error('Gagal memuat artikel:', error);
    res.status(500).send('<h1>Terjadi kesalahan saat memuat artikel.</h1>');
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
