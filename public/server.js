// api/server.js

const express = require('express');
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where } = require("firebase/firestore");

// Inisialisasi aplikasi Express
const app = express();

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
        const q = query(collection(db, "articles"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        const article = querySnapshot.empty ? null : querySnapshot.docs[0].data();

        if (article) {
            // Meta tags OG yang dihasilkan di server
            const metaTags = `
                <meta property="og:title" content="${article.title}" />
                <meta property="og:description" content="${article.titleKeterangan}" />
                <meta property="og:image" content="${article.photoUrl}" />
                <meta property="og:type" content="article" />
                <meta property="og:url" content="https://sekawan.vercel.app/artikel-home.html?slug=${slug}" />
            `;

            // Mengirimkan HTML yang berisi meta tag OG
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
