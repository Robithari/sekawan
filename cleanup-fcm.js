// Script untuk membersihkan semua FCM tokens lama dan restart dengan fresh
const admin = require('firebase-admin');
const db = require('./config/firebase');

async function cleanupAndTest() {
  console.log('🧹 Cleanup FCM Tokens - Starting...');
  
  try {
    // 1. Hapus semua token lama
    console.log('1. Menghapus semua FCM tokens lama...');
    const usersSnapshot = await db.collection('users').get();
    
    for (const doc of usersSnapshot.docs) {
      await doc.ref.update({
        fcmTokens: [] // Clear array
      });
    }
    
    console.log(`✅ Berhasil clear tokens dari ${usersSnapshot.size} users`);
    
    // 2. Test single notification dengan admin SDK
    console.log('2. Test langsung dengan Firebase Admin...');
    
    // Buat test token (dummy - akan diganti dengan real token)
    const testPayload = {
      notification: {
        title: '🧪 Direct Test',
        body: 'Test langsung dari Firebase Admin SDK'
      },
      data: {
        click_action: '/notifikasi',
        url: '/notifikasi'
      }
    };
    
    console.log('Test payload created:', testPayload);
    console.log('✅ Cleanup selesai. Silakan:');
    console.log('1. Buka panel debug');
    console.log('2. Generate token fresh');
    console.log('3. Test kirim notifikasi dengan token baru');
    
  } catch (error) {
    console.error('❌ Error cleanup:', error);
  }
  
  process.exit(0);
}

cleanupAndTest();
