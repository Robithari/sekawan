const User = require('../models/userModel');

const db = require('../config/firebase');
exports.getUsers = async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || '-',
                email: data.email || '-',
                createdAt: data.createdAt || null,
                membershipCode: data.membershipCode || '-',
                phoneNumber: data.phoneNumber || '-',
                fcmTokens: data.fcmTokens || (data.fcmToken ? [data.fcmToken] : []),
                nik: data.nik || ''
            };
        });
        res.json(users);
    } catch (err) {
        res.status(500).json([]);
    }
};