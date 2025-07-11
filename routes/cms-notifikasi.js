// routes/cms-notifikasi.js
const express = require('express');
const router = express.Router();
const notifikasiController = require('../controllers/notifikasiController');


// Middleware proteksi admin CMS
const auth = require('../middleware/auth');

// POST kirim notifikasi (hanya admin CMS)
router.post('/notifikasi-user', auth, notifikasiController.kirimNotifikasi);
// GET histori notifikasi (hanya admin CMS)
router.get('/notifikasi-user/histori', auth, notifikasiController.getHistori);

module.exports = router;
