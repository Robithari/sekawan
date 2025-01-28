// Mengimpor Prerender-node
const prerender = require('prerender-node');

// Set token API Prerender.io
prerender.set('prerenderToken', 'Qda1wQOGSWl5EkcA8twU'); // Ganti dengan token Anda

// Menambahkan log untuk mencatat URL yang sedang dirender
prerender.on('beforeRender', (req, res) => {
    console.log('Prerender sedang memproses URL:', req.url); // Mencetak URL halaman yang sedang dirender
});

// Menambahkan log ketika respons dari Prerender.io diterima
prerender.on('received', (req, res) => {
    console.log('Prerender berhasil menerima respons dari Prerender.io untuk:', req.url);
});

// Ekspor middleware agar bisa digunakan di file lain
module.exports = prerender;
