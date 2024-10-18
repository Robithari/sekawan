const express = require('express');
const fetch = require('node-fetch'); // jika Anda menggunakan fetch
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, where } = require("firebase/firestore");

const app = express();

// Konfigurasi Firebase
const firebaseConfig = {
    // Your Firebase config
};
initializeApp(firebaseConfig);
const db = getFirestore();

app.get('/artikel-home.html', async (req, res) => {
    const slug = req.query.slug;

    try {
        const q = query(collection(db, "articles"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        const article = querySnapshot.empty ? null : querySnapshot.docs[0].data();

        if (article) {
            // Menghasilkan meta tags untuk OG
            const metaTags = `
                <meta property="og:title" content="${article.title}" />
                <meta property="og:description" content="${article.description}" />
                <meta property="og:image" content="${article.photoUrl}" />
                <meta property="og:url" content="https://sekawan.vercel.app/artikel-home.html?slug=${slug}" />
            `;

            // Kirim HTML dengan meta tags
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
