// Debug script untuk mengecek sistem FCM
const admin = require('firebase-admin');
const db = require('./config/firebase');

async function debugFCM() {
  console.log('=== DEBUG FCM SYSTEM ===');
  
  try {
    // 1. Cek Firebase Admin initialization
    console.log('1. Firebase Admin initialized:', !!admin.apps.length);
    
    // 2. Cek Firestore connection
    const testDoc = await db.collection('test').doc('connection').set({ timestamp: Date.now() }, { merge: true });
    console.log('2. Firestore connection: OK');
    
    // 3. Cek users collection dan FCM tokens
    const usersSnapshot = await db.collection('users').get();
    console.log('3. Users count:', usersSnapshot.size);
    
    let totalTokens = 0;
    const tokenDetails = [];
    
    usersSnapshot.forEach(doc => {
      const userData = doc.data();
      let userTokens = [];
      
      // Handle array format
      if (Array.isArray(userData.fcmTokens)) {
        userTokens = userData.fcmTokens;
      }
      // Handle old string format
      else if (userData.fcmToken) {
        userTokens = [userData.fcmToken];
      }
      
      if (userTokens.length > 0) {
        totalTokens += userTokens.length;
        tokenDetails.push({
          userId: doc.id,
          nik: userData.nik || 'N/A',
          tokenCount: userTokens.length,
          tokens: userTokens.map(t => t.substring(0, 20) + '...')
        });
      }
    });
    
    console.log('4. Total FCM tokens found:', totalTokens);
    console.log('5. Users with tokens:', tokenDetails);
    
    // 4. Test FCM send ke satu token (jika ada)
    if (tokenDetails.length > 0 && tokenDetails[0].tokens.length > 0) {
      console.log('\n6. Testing FCM send...');
      
      // Ambil token lengkap untuk test
      const firstUserDoc = await db.collection('users').doc(tokenDetails[0].userId).get();
      const firstUserData = firstUserDoc.data();
      const testToken = Array.isArray(firstUserData.fcmTokens) ? firstUserData.fcmTokens[0] : firstUserData.fcmToken;
      
      const message = {
        token: testToken,
        notification: {
          title: 'Test Notifikasi Debug',
          body: 'Ini adalah test notifikasi dari debug script'
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
      
      try {
        const result = await admin.messaging().send(message);
        console.log('   FCM send result:', result);
      } catch (error) {
        console.error('   FCM send error:', error.message);
        
        // Jika token invalid, coba hapus dari database
        if (error.message.includes('not a valid FCM registration token') || 
            error.message.includes('Requested entity was not found')) {
          console.log('   Token invalid, removing from database...');
          
          const userRef = db.collection('users').doc(tokenDetails[0].userId);
          const userData = firstUserData;
          
          if (Array.isArray(userData.fcmTokens)) {
            const newTokens = userData.fcmTokens.filter(t => t !== testToken);
            await userRef.update({ fcmTokens: newTokens });
            console.log('   Invalid token removed');
          }
        }
      }
    } else {
      console.log('6. No FCM tokens found for testing');
    }
    
    console.log('\n=== DEBUG COMPLETE ===');
    
  } catch (error) {
    console.error('Debug error:', error);
  }
  
  process.exit(0);
}

debugFCM();
