// api/server.js

const express = require('express');
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where } = require("firebase/firestore");

// Inisialisasi aplikasi Express
const app = express();

// Middleware untuk menangani URL-encoded data (jika diperlukan)
app.use(express.urlencoded({ extended: true }));

// Konfigurasi Firebase menggunakan Variabel Lingkungan
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};
initializeApp(firebaseConfig);
const db = getFirestore();

// Fungsi untuk escape HTML untuk mencegah potensi XSS
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Fungsi untuk menghasilkan meta tags OG dan Twitter
function generateMetaTags(data, type) {
    const baseUrl = "https://sekawan.vercel.app"; // Ganti dengan URL dasar situs Anda
    const url = `${baseUrl}/${type}-home.html?slug=${encodeURIComponent(data.slug)}`;
    const title = data.title || 'Judul Tidak Tersedia';
    const description = data.titleKeterangan || data.caption || 'Deskripsi tidak tersedia.';
    const image = data.photoUrl || data.imageUrl || `${baseUrl}/default-image.jpg`; // Ganti dengan URL gambar default jika perlu

    return `
        <!-- Basic Meta Tags -->
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="${escapeHtml(description)}">

        <!-- Open Graph / Facebook -->
        <meta property="og:title" content="${escapeHtml(title)}" />
        <meta property="og:description" content="${escapeHtml(description)}" />
        <meta property="og:image" content="${escapeHtml(image)}" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="${escapeHtml(url)}" />
        <meta property="og:site_name" content="Sekawan" />
        <meta property="og:locale" content="id_ID" />

        <!-- Twitter -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${escapeHtml(title)}" />
        <meta name="twitter:description" content="${escapeHtml(description)}" />
        <meta name="twitter:image" content="${escapeHtml(image)}" />
        <meta name="twitter:domain" content="sekawan.vercel.app" />
        <meta name="twitter:url" content="${escapeHtml(url)}" />
        <meta name="twitter:site" content="@YourTwitterHandle" /> <!-- Ganti dengan handle Twitter Anda atau hapus jika tidak ada -->
        <meta name="twitter:creator" content="@YourTwitterHandle" /> <!-- Ganti dengan handle Twitter Anda atau hapus jika tidak ada -->
    `;
}

// Rute untuk mendapatkan artikel
app.get('/artikel-home.html', async (req, res) => {
    const slug = req.query.slug;

    if (!slug) {
        return res.status(400).send("<h1>Slug tidak diberikan!</h1>");
    }

    try {
        const q = query(collection(db, "articles"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        const article = querySnapshot.empty ? null : querySnapshot.docs[0].data();

        if (article) {
            const metaTags = generateMetaTags(article, 'artikel');

            res.send(`
                <!DOCTYPE html>
                <html lang="id">
                <head>
                    ${metaTags}
                    <title>${escapeHtml(article.title)}</title>
                </head>
                <body>
                    <h1>${escapeHtml(article.title)}</h1>
                    <p>${escapeHtml(article.content)}</p>
                </body>
                </html>
            `);
        } else {
            res.status(404).send("<h1>Artikel tidak ditemukan!</h1>");
        }
    } catch (error) {
        console.error("Error fetching artikel:", error);
        res.status(500).send("<h1>Terjadi kesalahan saat memuat artikel.</h1>");
    }
});

// Rute untuk mendapatkan berita
app.get('/berita-home.html', async (req, res) => {
    const slug = req.query.slug;

    if (!slug) {
        return res.status(400).send("<h1>Slug tidak diberikan!</h1>");
    }

    try {
        const q = query(collection(db, "berita"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        const berita = querySnapshot.empty ? null : querySnapshot.docs[0].data();

        if (berita) {
            const metaTags = generateMetaTags(berita, 'berita');

            res.send(`
                <!DOCTYPE html>
                <html lang="id">
                <head>
                    ${metaTags}
                    <title>${escapeHtml(berita.title)}</title>
                </head>
                <body>
                    <h1>${escapeHtml(berita.title)}</h1>
                    <p>${escapeHtml(berita.content)}</p>
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

// Middleware untuk menangani rute yang tidak dikenal
app.use((req, res) => {
    res.status(404).send("<h1>Halaman tidak ditemukan!</h1>");
});

// Mengekspor fungsi handler agar bisa digunakan di Vercel
module.exports = app;
