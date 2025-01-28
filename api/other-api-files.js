// File API lainnya yang menangani rute lain jika diperlukan
module.exports = (req, res) => {
    if (req.method === 'GET') {
        res.status(200).send('Selamat datang di API Prerender!');
    } else {
        res.status(405).send('Metode tidak diizinkan');
    }
};
