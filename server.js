// api/server.js

const express = require('express');
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where } = require("firebase/firestore");
const path = require('path');
const fs = require('fs');

// Inisialisasi aplikasi Express
const app = express();

// Konfigurasi Firebase
const firebaseConfig = {
    // Isi konfigurasi Firebase Anda di sini
};
initializeApp(firebaseConfig);
const db = getFirestore();

// Middleware untuk mengakses static file seperti /artikel-home.html
app.use(express.static(path.join(__dirname, 'public')));

// Rute untuk mendapatkan artikel dengan meta tag OG
app.get('/artikel-home.html', async (req, res) => {
    const slug = req.query.slug;

    try {
        const q = query(collection(db, "articles"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        const article = querySnapshot.empty ? null : querySnapshot.docs[0].data();

        if (article) {
            // Meta tags OG untuk preview
            const metaTags = `
                <meta property="og:title" content="${article.title}" />
                <meta property="og:description" content="${article.titleKeterangan}" />
                <meta property="og:image" content="${article.photoUrl}" />
                <meta property="og:type" content="article" />
                <meta property="og:url" content="https://sekawan.vercel.app/artikel-home.html?slug=${slug}" />
            `;

            // Membaca isi file artikel-home.html
            const filePath = path.join(__dirname, 'public', 'artikel-home.html');
            const htmlContent = fs.readFileSync(filePath, 'utf-8');

            // Menyisipkan meta tags OG ke dalam HTML sebelum dikirim
            const htmlWithMetaTags = htmlContent.replace(
                '<!-- Meta Tags Placeholder -->', 
                metaTags
            );

            res.send(htmlWithMetaTags);
        } else {
            res.status(404).send("<h1>Artikel tidak ditemukan!</h1>");
        }
    } catch (error) {
        console.error("Error fetching article:", error);
        res.status(500).send("<h1>Terjadi kesalahan saat memuat artikel.</h1>");
    }
});

// Mengekspor fungsi handler agar bisa digunakan di Vercel
module.exports = app;
