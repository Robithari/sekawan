const express = require('express');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');

const app = express();

// Konfigurasi Firebase
const firebaseConfig = {
    // Your Firebase config here
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

app.get('/artikel-home.html', async (req, res) => {
    const slug = req.query.slug;
    const q = query(collection(db, "articles"), where("slug", "==", slug));
    
    try {
        const querySnapshot = await getDocs(q);
        const article = querySnapshot.empty ? null : querySnapshot.docs[0].data();

        if (article) {
            const metaTags = `
                <meta property="og:title" content="${article.title}" />
                <meta property="og:description" content="${article.description}" />
                <meta property="og:image" content="${article.photoUrl}" />
                <meta property="og:url" content="https://sekawan.vercel.app/artikel-home.html?slug=${slug}" />
            `;
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
