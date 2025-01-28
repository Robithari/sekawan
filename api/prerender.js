// Mengimpor middleware dari file 'prerender-middleware.js'
const prerender = require('./prerender-middleware');

// Fungsi utama untuk menangani permintaan API
module.exports = (req, res) => {
    // Menjalankan middleware yang sudah diatur
    prerender(req, res, () => {
        res.status(404).send('Halaman tidak ditemukan'); // Mengirim respons jika halaman tidak ditemukan
    });
};
