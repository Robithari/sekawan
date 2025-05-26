const admin = require('firebase-admin');
const db = require('../config/firebase'); // Pastikan koneksi Firestore sudah benar

// Fungsi render halaman login CMS
const renderLoginPage = (req, res) => {
    res.render("login-cms"); // Merender halaman login-cms
};

// Fungsi login CMS dengan verifikasi token Firebase dan validasi user di Firestore
const loginCms = async (req, res) => {
    try {
        const idToken = req.body.idToken;
        if (!idToken) {
            return res.status(400).json({ message: 'Token tidak ditemukan' });
        }

        // Verifikasi token Firebase
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Cek apakah user CMS terdaftar di Firestore collection 'cmsUsers'
        const userDoc = await db.collection('cmsUsers').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(403).json({ message: 'User tidak memiliki akses CMS' });
        }

        // Jika valid, kirim response sukses dengan data user
        return res.status(200).json({ message: 'Login CMS berhasil', user: userDoc.data() });
    } catch (error) {
        console.error('Error login CMS:', error);
        return res.status(401).json({ message: 'Token tidak valid atau error autentikasi' });
    }
};

module.exports = {
    renderLoginPage,
    loginCms,
};
