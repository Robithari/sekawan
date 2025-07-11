// Debug endpoint untuk mengecek FCM system
const express = require('express');
const admin = require('firebase-admin');
const db = require('../config/firebase');
const fcm = require('../controllers/fcm');

const router = express.Router();

router.get('/debug-fcm', async (req, res) => {
  const debug = {
    timestamp: new Date().toISOString(),
    checks: []
  };

  try {
    // 1. Cek Firebase Admin initialization
    debug.checks.push({
      name: 'Firebase Admin Initialized',
      status: !!admin.apps.length ? 'OK' : 'FAIL',
      details: `Apps count: ${admin.apps.length}`
    });

    // 2. Cek Firestore connection
    try {
      await db.collection('test').doc('connection').set({ timestamp: Date.now() }, { merge: true });
      debug.checks.push({
        name: 'Firestore Connection',
        status: 'OK',
        details: 'Can write to test collection'
      });
    } catch (err) {
      debug.checks.push({
        name: 'Firestore Connection',
        status: 'FAIL',
        details: err.message
      });
    }

    // 3. Cek users collection dan FCM tokens
    try {
      const usersSnapshot = await db.collection('users').get();
      let totalTokens = 0;
      const userSummary = [];

      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        let userTokens = [];
        
        if (Array.isArray(userData.fcmTokens)) {
          userTokens = userData.fcmTokens;
        } else if (userData.fcmToken) {
          userTokens = [userData.fcmToken];
        }
        
        if (userTokens.length > 0) {
          totalTokens += userTokens.length;
          userSummary.push({
            userId: doc.id,
            nik: userData.nik || 'N/A',
            tokenCount: userTokens.length,
            tokenPreview: userTokens.map(t => t.substring(0, 20) + '...')
          });
        }
      });

      debug.checks.push({
        name: 'Users & FCM Tokens',
        status: 'OK',
        details: {
          totalUsers: usersSnapshot.size,
          totalTokens,
          usersWithTokens: userSummary.length,
          userSummary: userSummary.slice(0, 5) // Limit to first 5 for brevity
        }
      });

      // 4. Test FCM send jika ada token
      if (userSummary.length > 0) {
        try {
          const firstUserDoc = await db.collection('users').doc(userSummary[0].userId).get();
          const firstUserData = firstUserDoc.data();
          const testToken = Array.isArray(firstUserData.fcmTokens) ? firstUserData.fcmTokens[0] : firstUserData.fcmToken;
          
          const testMessage = {
            token: testToken,
            notification: {
              title: 'Test Debug FCM',
              body: 'Test notifikasi dari debug endpoint'
            },
            data: {
              click_action: '/notifikasi',
              url: '/notifikasi'
            },
            webpush: {
              notification: {
                icon: '/SekawanFC.jpg',
                requireInteraction: true,
                data: {
                  click_action: '/notifikasi',
                  url: '/notifikasi'
                }
              }
            }
          };

          const result = await admin.messaging().send(testMessage);
          debug.checks.push({
            name: 'FCM Test Send',
            status: 'OK',
            details: {
              messageId: result,
              sentTo: userSummary[0].userId,
              tokenUsed: testToken.substring(0, 20) + '...'
            }
          });
        } catch (fcmError) {
          debug.checks.push({
            name: 'FCM Test Send',
            status: 'FAIL',
            details: {
              error: fcmError.message,
              errorCode: fcmError.code || 'unknown'
            }
          });
        }
      } else {
        debug.checks.push({
          name: 'FCM Test Send',
          status: 'SKIP',
          details: 'No FCM tokens available for testing'
        });
      }

    } catch (err) {
      debug.checks.push({
        name: 'Users & FCM Tokens',
        status: 'FAIL',
        details: err.message
      });
    }

  } catch (err) {
    debug.checks.push({
      name: 'Debug Process',
      status: 'FAIL',
      details: err.message
    });
  }

  res.json(debug);
});

module.exports = router;
