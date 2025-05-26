const rateLimit = require('express-rate-limit');

// Middleware rate limiter untuk membatasi jumlah request dari client
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // maksimal 100 request per IP per windowMs
    message: {
        success: false,
        error: 'Terlalu banyak permintaan, silakan coba lagi nanti.',
    },
    standardHeaders: true, // Mengirim header rate limit standar
    legacyHeaders: false, // Nonaktifkan header lama
});

module.exports = limiter;
