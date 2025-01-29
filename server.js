const express = require('express');
const prerender = require('prerender-node');

// Inisialisasi aplikasi Express
const app = express();

// Gunakan Prerender.io dengan token yang benar
app.use(prerender.set('prerenderToken', 'Qda1wQOGSWl5EkcA8twU')); // Ganti dengan token Anda

// Middleware untuk menangani halaman dinamis dengan query parameter
app.use((req, res, next) => {
  if (req.query.slug) {
    console.log('Handling dynamic page with slug:', req.query.slug);
  }
  next();
});

// Definisikan route untuk halaman statis dan dinamis
app.get('/', (req, res) => {
  res.send('Hello, Prerender.io!');
});

// Menangani permintaan untuk halaman berita dengan query parameter
app.get('/berita-home.html', (req, res) => {
  if (req.query.slug) {
    // Kirim konten dinamis berdasarkan slug
    res.send(`<h1>Berita: ${req.query.slug}</h1><p>Ini adalah halaman berita dinamis untuk ${req.query.slug}.</p>`);
  } else {
    // Kirim konten statis untuk berita-home
    res.send('<h1>Berita Home</h1><p>Ini adalah halaman berita utama.</p>');
  }
});

// Menangani permintaan untuk halaman artikel dengan query parameter
app.get('/artikel-home.html', (req, res) => {
  if (req.query.slug) {
    // Kirim konten dinamis berdasarkan slug
    res.send(`<h1>Artikel: ${req.query.slug}</h1><p>Ini adalah halaman artikel dinamis untuk ${req.query.slug}.</p>`);
  } else {
    // Kirim konten statis untuk artikel-home
    res.send('<h1>Artikel Home</h1><p>Ini adalah halaman artikel utama.</p>');
  }
});

// Tentukan port yang digunakan
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
