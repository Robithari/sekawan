// api/server.js

const express = require('express');
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where } = require("firebase/firestore");

// Inisialisasi aplikasi Express
const app = express();

// Tambahkan middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfigurasi Firebase
const firebaseConfig = {
    // Isi konfigurasi Firebase Anda di sini
};
initializeApp(firebaseConfig);
const db = getFirestore();

// Rute untuk mendapatkan artikel
app.get('/artikel-home.html', async (req, res) => {
    const slug = req.query.slug;

    try {
        if (!slug) {
            res.status(400).send("<h1>Slug tidak diberikan.</h1>");
            return;
        }

        const q = query(collection(db, "articles"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            res.status(404).send("<h1>Artikel tidak ditemukan!</h1>");
            return;
        }

        const article = querySnapshot.docs[0].data();

        // Meta tags OG yang dihasilkan di server
        const metaTags = `
            <meta property="og:title" content="${article.title}" />
            <meta property="og:description" content="${article.titleKeterangan}" />
            <meta property="og:image" content="${article.photoUrl}" />
            <meta property="og:type" content="article" />
            <meta property="og:url" content="https://sekawan.vercel.app/artikel-home.html?slug=${slug}" />
        `;

        // Mengirimkan HTML yang berisi meta tag OG
        res.set('Content-Type', 'text/html'); // Menambahkan header Content-Type
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                ${metaTags}
                <title>${article.title}</title>
            </head>
            <body>
                <h1>${article.title}</h1>
                <p>${article.content}</p>
            </body>
            </html>
        `);

    } catch (error) {
        console.error("Error fetching article:", error);
        res.status(500).send("<h1>Terjadi kesalahan saat memuat artikel.</h1>");
    }
});

// Mengekspor fungsi handler agar bisa digunakan di Vercel
module.exports = app;
