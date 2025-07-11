const admin = require('firebase-admin');

/**
 * Kirim pesan FCM ke device user
 * @param {string} token - FCM device token
 * @param {string} title - Judul pesan
 * @param {string} body - Isi pesan
 * @returns {Promise<object>} hasil pengiriman
 */


/**
 * Kirim pesan FCM ke satu token atau array token
 * @param {string|string[]} tokens - FCM device token(s)
 * @param {string} title - Judul pesan
 * @param {string} body - Isi pesan
 * @returns {Promise<object>} hasil pengiriman
 */
async function sendFCMToToken(tokens, title, body) {
  console.log('🔥🔥🔥 [VERCEL-FCM] SENDFCMTOTOKEN FUNCTION CALLED 🔥🔥🔥');
  console.log('[VERCEL-FCM] Input params:', { 
    tokenCount: Array.isArray(tokens) ? tokens.length : 1,
    title, 
    body,
    timestamp: new Date().toISOString()
  });
  
  if (!tokens || !title || !body) {
    console.error('[VERCEL-FCM] Parameter tidak lengkap:', { tokens, title, body });
    throw new Error('Token(s), title, dan body harus diisi');
  }
  
  // Debug versi firebase-admin (manual log, tidak require package.json)
  console.log('[VERCEL-FCM] firebase-admin version (manual log): 11.11.1');
  
  let result = {
    successCount: 0,
    failureCount: 0,
    responses: []
  };
  
  // Data custom yang ingin dikirim ke field data
  const dataPayload = { 
    title, 
    body,
    click_action: '/notifikasi',
    url: '/notifikasi'
  };
  
  // Jika ingin icon, kirim lewat data, bukan notification (firebase-admin tidak support field icon di notification)
  const iconUrl = 'https://sekawanfc.fun/SekawanFC.jpg';
  dataPayload.icon = iconUrl;
  
  console.log('[VERCEL-FCM] Data payload:', dataPayload);
  
  // PATCH: Robust pengiriman ke banyak token, auto-hapus token invalid dari Firestore user
  const db = require('../config/firebase');
  async function removeInvalidToken(token) {
    // Cari user yang punya token ini, lalu hapus dari array fcmTokens
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('fcmTokens', 'array-contains', token).get();
    for (const doc of snapshot.docs) {
      const userRef = usersRef.doc(doc.id);
      const data = doc.data();
      if (Array.isArray(data.fcmTokens)) {
        const newTokens = data.fcmTokens.filter(t => t !== token);
        await userRef.update({ fcmTokens: newTokens });
        console.log(`[sendFCMToToken] Token FCM invalid dihapus dari user ${doc.id}`);
      }
    }
  }

  const allTokens = Array.isArray(tokens) ? tokens : [tokens];
  console.log('[VERCEL-FCM] Processing tokens:', allTokens.length);
  
  const results = await Promise.all(allTokens.map(async (token, index) => {
    console.log(`[VERCEL-FCM] Processing token ${index + 1}/${allTokens.length}: ${token.substring(0, 20)}...`);
    
    const message = {
      token,
      notification: { 
        title, 
        body,
        icon: iconUrl
      },
      data: dataPayload,
      android: { 
        priority: 'high',
        notification: {
          icon: iconUrl,
          click_action: '/notifikasi'
        }
      },
      apns: { 
        headers: { 'apns-priority': '10' },
        payload: {
          aps: {
            'mutable-content': 1
          }
        }
      },
      webpush: {
        headers: {
          'TTL': '3600'
        },
        notification: {
          icon: iconUrl,
          requireInteraction: true,
          data: {
            click_action: '/notifikasi',
            url: '/notifikasi'
          }
        }
      }
    };
    
    console.log(`[VERCEL-FCM] Message for token ${index + 1}:`, JSON.stringify(message, null, 2));
    
    try {
      console.log(`[VERCEL-FCM] 🚀 Calling admin.messaging().send() for token ${index + 1}...`);
      const result = await admin.messaging().send(message);
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[VERCEL-FCM] ✅ SUCCESS send to token ${token.substring(0, 20)}... - messageId: ${result}`);
      console.log(`[VERCEL-FCM] Success timestamp: ${timestamp}`);
      return { success: true, messageId: result };
    } catch (e) {
      const timestamp = new Date().toLocaleTimeString();
      const errMsg = (e && e.message) ? e.message : String(e);
      console.error(`[VERCEL-FCM] ❌ FAILED send to token ${token.substring(0, 20)}...`);
      console.error(`[VERCEL-FCM] Error timestamp: ${timestamp}`);
      console.error(`[VERCEL-FCM] Error details:`, {
        message: errMsg,
        code: e.code || 'unknown',
        details: e.details || 'no details',
        stack: e.stack || 'no stack'
      });
      
      // Jika error karena token invalid/not found, hapus dari Firestore
      if (errMsg.includes('Requested entity was not found') || 
          errMsg.includes('not a valid FCM registration token') ||
          errMsg.includes('registration-token-not-registered')) {
        console.log(`[VERCEL-FCM] 🗑️ Removing invalid token from database...`);
        await removeInvalidToken(token);
      }
      return { success: false, error: e, errorMessage: errMsg };
    }
  }));
  
  result.successCount = results.filter(r => r.success).length;
  result.failureCount = results.filter(r => !r.success).length;
  result.responses = results;
  
  console.log('[VERCEL-FCM] Final result:', {
    successCount: result.successCount,
    failureCount: result.failureCount,
    totalProcessed: results.length
  });
  
  return result;
}


/**
 * Simpan FCM token ke document user di Firestore (fleksibel, bisa simpan data tambahan)
 * Body: { userId: "...", fcmToken: "...", ...extra }
 * Jika user belum ada, document akan dibuat otomatis.
 * Jika ingin menyimpan data tambahan, tambahkan field lain di body.
 */

// Gunakan Firestore instance yang sama
const db = require('../config/firebase');

/**
 * Simpan FCM token ke array fcmTokens di document user (tidak overwrite, tidak duplikat)
 * Body: { userId: "...", fcmToken: "...", ...extra }
 */
async function saveFcmToken(req, res) {
  const { userId, fcmToken, ...extra } = req.body;
  console.log('[saveFcmToken] Diterima:', { userId, fcmToken, ...extra });
  if (!userId || !fcmToken) {
    console.warn('[saveFcmToken] userId atau fcmToken kosong:', { userId, fcmToken });
    return res.status(400).json({ success: false, message: 'userId dan fcmToken wajib diisi' });
  }
  try {
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    let fcmTokens = [];
    if (userSnap.exists && Array.isArray(userSnap.data().fcmTokens)) {
      fcmTokens = userSnap.data().fcmTokens;
    } else if (userSnap.exists && userSnap.data().fcmToken) {
      // Migrasi dari field lama (string) ke array
      fcmTokens = [userSnap.data().fcmToken];
    }
    // Tambahkan token jika belum ada
    if (!fcmTokens.includes(fcmToken)) {
      fcmTokens.push(fcmToken);
    }
    // Data yang akan di-merge ke document user
    const data = { fcmTokens, ...extra };
    await userRef.set(data, { merge: true });
    console.log(`[saveFcmToken] Token FCM berhasil disimpan untuk userId ${userId}:`, data);
    res.json({ success: true, message: 'FCM token berhasil disimpan', data });
  } catch (err) {
    console.error('[saveFcmToken] ERROR:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { sendFCMToToken, saveFcmToken };
