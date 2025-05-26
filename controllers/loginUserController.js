const admin = require('firebase-admin');
const db = require('../config/firebase');

// Controller untuk verifikasi token Firebase dan validasi user di Firestore
exports.loginUser = async (req, res) => {
    try {
        const idToken = req.body.idToken;
        if (!idToken) {
            return res.status(400).json({ message: 'Token tidak ditemukan' });
        }

        // Verifikasi token Firebase
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Cek apakah user ada di koleksi users di Firestore
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            return res.status(403).json({ message: 'User tidak terdaftar' });
        }

        // Set cookie __session dengan idToken, httpOnly dan secure (secure hanya jika production)
        res.cookie('__session', idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 1 hari
            sameSite: 'strict',
            path: '/',
        });

        // Jika valid, kirim response sukses dengan data user
        return res.status(200).json({ message: 'Login berhasil', user: userDoc.data() });
    } catch (error) {
        console.error('Error pada login user:', error);
        return res.status(401).json({ message: 'Token tidak valid atau error saat login' });
    }
};

// Controller untuk signup user baru dengan validasi kode keanggotaan
exports.signupUser = async (req, res) => {
    try {
        const { email, password, name, phoneNumber, membershipCode } = req.body;
        if (!email || !password || !name || !phoneNumber || !membershipCode) {
            return res.status(400).json({ message: 'Data signup tidak lengkap' });
        }

        // Validasi kode keanggotaan di Firestore collection "membershipCodes"
        const codeQuerySnapshot = await db.collection('membershipCodes').where('code', '==', membershipCode).get();
        if (codeQuerySnapshot.empty) {
            return res.status(400).json({ message: 'Kode keanggotaan tidak valid' });
        }

        // Membuat user baru di Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: name,
        });

        // Simpan data tambahan user di Firestore
        try {
            await db.collection('users').doc(userRecord.uid).set({
                name: name,
                phoneNumber: phoneNumber,
                email: email,
                membershipCode: membershipCode,
                createdAt: new Date().toISOString(),
            });
        } catch (firestoreError) {
            console.error('Error menyimpan data user di Firestore:', firestoreError);
            // Jika gagal simpan data Firestore, hapus user yang sudah dibuat di Firebase Auth untuk konsistensi
            await admin.auth().deleteUser(userRecord.uid);
            return res.status(500).json({ message: 'Gagal menyimpan data user, signup dibatalkan', error: firestoreError.message });
        }

        return res.status(201).json({ message: 'Signup berhasil', uid: userRecord.uid });
    } catch (error) {
        console.error('Error pada signup user:', error);
        return res.status(500).json({ message: 'Gagal signup user', error: error.message });
    }
};
