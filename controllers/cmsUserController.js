const { sendFCMToToken } = require('./fcm');

// Endpoint untuk kirim pesan FCM ke user
exports.sendFcmMessage = async (req, res) => {
  try {
    const { token, title, body } = req.body;
    if (!token || !title || !body) {
      return res.status(400).json({ success: false, error: 'Lengkapi semua field' });
    }
    try {
      await sendFCMToToken(token, title, body);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Gagal kirim pesan', detail: err.message });
  }
};

// Tambah user baru (POST /cms/data-user/add)
exports.addUser = async (req, res) => {
  try {
    const { email, name, membershipCode, phoneNumber, fcmToken, nik } = req.body;
    if (!email || !name || !nik) {
      return res.status(400).json({ success: false, error: 'Data tidak lengkap' });
    }
    if (!/^\d{16}$/.test(nik)) {
      return res.status(400).json({ success: false, error: 'NIK harus 16 digit angka' });
    }
    const createdAt = new Date();
    const userData = {
      email,
      name,
      membershipCode: membershipCode || '',
      phoneNumber: phoneNumber || '',
      fcmToken: fcmToken || '',
      nik,
      createdAt
    };
    const docRef = await db.collection('users').add(userData);
    const user = { id: docRef.id, ...userData };
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Gagal tambah user', detail: err.message });
  }
};

// Update user (POST /cms/data-user/edit)
exports.updateUser = async (req, res) => {
  try {
    const { id, email, name, membershipCode, phoneNumber, fcmToken, nik } = req.body;
    if (!id || !email || !name || !nik) {
      return res.status(400).json({ success: false, error: 'Data tidak lengkap' });
    }
    if (!/^\d{16}$/.test(nik)) {
      return res.status(400).json({ success: false, error: 'NIK harus 16 digit angka' });
    }
    await db.collection('users').doc(id).update({
      email,
      name,
      membershipCode: membershipCode || '',
      phoneNumber: phoneNumber || '',
      fcmToken: fcmToken || '',
      nik
    });
    // Ambil data user terbaru
    const doc = await db.collection('users').doc(id).get();
    const user = { id: doc.id, ...doc.data() };
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Gagal update user', detail: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.body;
    await db.collection('users').doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Gagal hapus user' });
  }
};
const db = require('../config/firebase');

exports.renderDataUserPage = async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.render('cms/data-user', { users });
  } catch (err) {
    res.status(500).render('cms/data-user', { users: [], error: 'Gagal mengambil data user' });
  }
};
