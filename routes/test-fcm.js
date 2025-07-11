// Simple test route for sending FCM notifications
const express = require('express');
const fcm = require('../controllers/fcm');
const db = require('../config/firebase');

const router = express.Router();

// Test endpoint untuk mengirim notifikasi ke semua token
router.post('/test-send-notification', async (req, res) => {
  try {
    const { title, body } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and body required' 
      });
    }

    // Ambil semua FCM tokens dari database
    const usersSnapshot = await db.collection('users').get();
    const allTokens = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      if (Array.isArray(userData.fcmTokens)) {
        allTokens.push(...userData.fcmTokens);
      } else if (userData.fcmToken) {
        allTokens.push(userData.fcmToken);
      }
    });

    console.log(`[TEST] Found ${allTokens.length} FCM tokens`);

    if (allTokens.length === 0) {
      return res.json({
        success: false,
        message: 'No FCM tokens found in database'
      });
    }

    // Kirim notifikasi
    const result = await fcm.sendFCMToToken(allTokens, title, body);
    
    res.json({
      success: true,
      message: 'Test notification sent',
      result: {
        totalTokens: allTokens.length,
        successCount: result.successCount,
        failureCount: result.failureCount
      }
    });

  } catch (error) {
    console.error('[TEST] Error sending test notification:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test endpoint untuk mengecek status FCM system
router.get('/test-fcm-status', async (req, res) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      firebaseInitialized: false,
      firestoreConnected: false,
      usersCount: 0,
      tokensCount: 0
    };

    // Check Firebase admin
    const admin = require('firebase-admin');
    status.firebaseInitialized = admin.apps.length > 0;

    // Check Firestore
    try {
      const testDoc = await db.collection('test').doc('status').set({ timestamp: Date.now() }, { merge: true });
      status.firestoreConnected = true;
    } catch (err) {
      status.firestoreError = err.message;
    }

    // Count users and tokens
    try {
      const usersSnapshot = await db.collection('users').get();
      status.usersCount = usersSnapshot.size;
      
      let tokensCount = 0;
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (Array.isArray(userData.fcmTokens)) {
          tokensCount += userData.fcmTokens.length;
        } else if (userData.fcmToken) {
          tokensCount += 1;
        }
      });
      status.tokensCount = tokensCount;
    } catch (err) {
      status.userCountError = err.message;
    }

    res.json(status);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
