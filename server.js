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

// Fungsi untuk menghasilkan meta tags OG
function generateMetaTags(data, type) {
    return `
        <meta property="og:title" content="${data.title}" />
        <meta property="og:description" content="${data.titleKeterangan || data.caption || ''}" />
        <meta property="og:image" content="${data.photoUrl || data.imageUrl}" />
        <meta property="og:type" content="${type}" />
        <meta property="og:url" content="https://sekawan.vercel.app/${type}-home.html?slug=${data.slug}" />
    `;
}

// Rute untuk mendapatkan artikel
app.get('/artikel-home.html', async (req, res) => {
    const slug = req.query.slug;

    try {
        const q = query(collection(db, "articles"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        const article = querySnapshot.empty ? null : querySnapshot.docs[0].data();

        if (article) {
            const metaTags = generateMetaTags(article, 'artikel');

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

// Rute untuk mendapatkan berita
app.get('/berita-home.html', async (req, res) => {
    const slug = req.query.slug;

    try {
        const q = query(collection(db, "berita"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        const berita = querySnapshot.empty ? null : querySnapshot.docs[0].data();

        if (berita) {
            const metaTags = generateMetaTags(berita, 'berita');

            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    ${metaTags}
                    <title>${berita.title}</title>
                </head>
                <body>
                    <h1>${berita.title}</h1>
                    <p>${berita.content}</p>
                </body>
                </html>
            `);
        } else {
            res.status(404).send("<h1>Berita tidak ditemukan!</h1>");
        }
    } catch (error) {
        console.error("Error fetching berita:", error);
        res.status(500).send("<h1>Terjadi kesalahan saat memuat berita.</h1>");
    }
});

// Mengekspor fungsi handler agar bisa digunakan di Vercel
module.exports = app;
