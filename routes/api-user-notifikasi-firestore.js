// routes/api-user-notifikasi-firestore.js
// Endpoint: GET /api/user-notifikasi-histori?nik=1234567890123456
// Mengembalikan semua notifikasi yang pernah dikirim ke user (berdasarkan NIK atau ke semua user) dari Firestore
const express = require('express');
const router = express.Router();
const notifikasiFirestoreModel = require('../models/notifikasiFirestoreModel');

// GET /api/user-notifikasi-histori?nik=1234567890123456
router.get('/user-notifikasi-histori', async (req, res) => {
  const nik = req.query.nik;
  try {
    const histori = await notifikasiFirestoreModel.loadAll(100);
    let userNotifs;
    if (nik && /^\d{16}$/.test(nik)) {
      // Filter: notifikasi ke semua user atau ke NIK user
      userNotifs = histori.filter(n => n.keSemua === true || (n.nik && n.nik === nik));
    } else {
      // Fallback: hanya notifikasi ke semua user
      userNotifs = histori.filter(n => n.keSemua === true);
    }
    // Urut terbaru
    userNotifs.sort((a, b) => (b.waktu || 0) - (a.waktu || 0));
    res.json({ success: true, histori: userNotifs });
  } catch (err) {
    res.status(500).json({ success: false, histori: [], error: err && err.message ? err.message : err });
  }
});

module.exports = router;
