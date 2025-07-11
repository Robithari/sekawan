// controllers/notifikasiController.js
// Gunakan switcher: Firestore di production, file JSON di dev/local
const notifikasiModel = require('../models/notifikasiModelSwitcher');
const userModel = require('../models/userModel');
const fcm = require('./fcm'); // pastikan ada fungsi sendFCMToToken(token, title, body)

// Kirim notifikasi ke user tertentu/semua
exports.kirimNotifikasi = async (req, res) => {
  try {
    const { judul, isi, keSemua, keTertentu, nik } = req.body;
    if (!judul || !isi || (!keSemua && !keTertentu)) {
      return res.status(400).json({ success: false, message: 'Data tidak lengkap.' });
    }
    let targetTokens = [];
    let targetInfo = '';
    if (keSemua) {
      // Ambil semua user yang punya fcmTokens (array)
      const users = await userModel.getAllUsers();
      // Gabungkan semua token dari semua user, flatten array
      targetTokens = users.flatMap(u => Array.isArray(u.fcmTokens) ? u.fcmTokens : (u.fcmToken ? [u.fcmToken] : [])).filter(Boolean);
      targetInfo = 'Semua User';
    } else if (keTertentu && nik) {
      const user = await userModel.getUserByNik(nik);
      if (!user || (!user.fcmTokens && !user.fcmToken)) {
        return res.status(404).json({ success: false, message: 'User/NIK tidak ditemukan atau belum punya FCM token.' });
      }
      // Ambil semua token user (array atau string lama)
      targetTokens = Array.isArray(user.fcmTokens) ? user.fcmTokens : (user.fcmToken ? [user.fcmToken] : []);
      targetInfo = nik;
    } else {
      return res.status(400).json({ success: false, message: 'Target tidak valid.' });
    }
    // Kirim FCM ke semua token sekaligus (multicast)
    let status = 'Terkirim';
    let errorMsg = '';
    if (targetTokens.length > 0) {
      try {
        // Kirim judul ke FCM, bukan hardcode
        const result = await fcm.sendFCMToToken(targetTokens, judul, isi);
        if (result.failureCount && result.failureCount > 0) {
          status = result.successCount > 0 ? 'Sebagian gagal' : 'Gagal';
          errorMsg = (result.responses || []).map((r, i) => {
            if (!r.success) {
              if (r.error && r.error.message) return `Token ke-${i+1}: ${r.error.message}`;
              if (r.error && typeof r.error === 'string') return `Token ke-${i+1}: ${r.error}`;
              if (r.error) return `Token ke-${i+1}: ${r.error.toString()}`;
              return `Token ke-${i+1}: error`;
            }
            return null;
          }).filter(Boolean).join('; ');
        }
      } catch (err) {
        status = 'Gagal';
        errorMsg = err && err.message ? err.message : (err ? err.toString() : 'Gagal kirim FCM');
      }
    } else {
      status = 'Tidak ada token';
      errorMsg = 'Tidak ada user yang memiliki FCM token.';
    }
    // Simpan histori
    try {
      await Promise.resolve(notifikasiModel.addNotifikasi({
        judul,
        isi,
        waktu: Date.now(),
        keSemua: !!keSemua,
        nik: keTertentu ? nik : '',
        status: errorMsg ? status + ': ' + errorMsg : status
      }));
      console.log('[NotifikasiController] Histori notifikasi berhasil disimpan.');
      return res.json({ success: true });
    } catch (err) {
      console.error('[NotifikasiController] Gagal simpan histori notifikasi:', err);
      return res.status(500).json({ success: false, message: 'Gagal simpan histori notifikasi: ' + (err && err.message ? err.message : err) });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Ambil histori notifikasi
exports.getHistori = (req, res) => {
  // loadAll bisa async jika pakai Firestore
  Promise.resolve(notifikasiModel.loadAll())
    .then(histori => res.json({ histori }))
    .catch(err => {
      console.error('[NotifikasiController] Gagal load histori notifikasi:', err);
      res.status(500).json({ histori: [], error: 'Gagal load histori notifikasi' });
    });
};
