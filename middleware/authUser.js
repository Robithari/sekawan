const admin = require('firebase-admin');

module.exports = async (req, res, next) => {
    try {
        let idToken = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            idToken = authHeader.split('Bearer ')[1];
        } else if (req.cookies && req.cookies.__session) {
            idToken = req.cookies.__session;
        }

        if (!idToken) {
            return res.redirect('/login');
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying Firebase ID token:', error);
        return res.redirect('/login');
    }
};
