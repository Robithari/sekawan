/**
 * Script test direct FCM tanpa endpoint, untuk memastikan FCM benar-benar bisa send di environment ini
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./config/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
  console.log('[TEST-DIRECT] Firebase Admin initialized');
} else {
  console.log('[TEST-DIRECT] Firebase Admin already initialized');
}

async function testDirectFCM() {
  console.log('[TEST-DIRECT] Starting direct FCM test...');
  
  // Token test - ganti dengan token fresh dari browser Anda
  const testToken = 'GANTI_DENGAN_TOKEN_DARI_BROWSER_ANDA';
  
  if (testToken === 'GANTI_DENGAN_TOKEN_DARI_BROWSER_ANDA') {
    console.error('[TEST-DIRECT] ❌ Harap ganti testToken dengan token fresh dari browser!');
    console.log('[TEST-DIRECT] 📝 Buka debug-fcm-simple.html, copy token, lalu paste di script ini');
    return;
  }
  
  const message = {
    token: testToken,
    notification: {
      title: 'Test Direct FCM',
      body: 'Ini test langsung dari script Node.js'
    },
    data: {
      click_action: '/notifikasi',
      url: '/notifikasi'
    },
    webpush: {
      notification: {
        requireInteraction: true,
        icon: 'https://sekawanfc.fun/SekawanFC.jpg'
      }
    }
  };
  
  try {
    console.log('[TEST-DIRECT] 🚀 Sending FCM message...');
    console.log('[TEST-DIRECT] Message payload:', JSON.stringify(message, null, 2));
    
    const result = await admin.messaging().send(message);
    
    console.log('[TEST-DIRECT] ✅ SUCCESS! Message sent');
    console.log('[TEST-DIRECT] Message ID:', result);
    console.log('[TEST-DIRECT] 📱 Cek browser/device Anda, notifikasi harus muncul!');
    
  } catch (error) {
    console.error('[TEST-DIRECT] ❌ FAILED to send FCM');
    console.error('[TEST-DIRECT] Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack
    });
  }
}

// Export untuk digunakan di endpoint juga
module.exports = { testDirectFCM };

// Jika dijalankan langsung
if (require.main === module) {
  testDirectFCM().then(() => {
    console.log('[TEST-DIRECT] Test completed');
    process.exit(0);
  }).catch(error => {
    console.error('[TEST-DIRECT] Test failed:', error);
    process.exit(1);
  });
}
