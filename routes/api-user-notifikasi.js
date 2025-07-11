// Endpoint: GET /api/user-notifikasi-histori?nik=1234567890123456
// Mengembalikan semua notifikasi yang pernah dikirim ke user (berdasarkan NIK atau ke semua user)
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Lokasi file histori notifikasi
const NOTIF_FILE = path.join(__dirname, '../logs/notifikasi-user.json');

// Helper: load histori notifikasi
function loadHistori() {
  try {
    if (!fs.existsSync(NOTIF_FILE)) return [];
    const raw = fs.readFileSync(NOTIF_FILE, 'utf8');
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr;
    return [];
  } catch {
    return [];
  }
}

// GET /api/user-notifikasi-histori?nik=1234567890123456
router.get('/user-notifikasi-histori', (req, res) => {
  const nik = req.query.nik;
  const histori = loadHistori();
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
});

module.exports = router;
