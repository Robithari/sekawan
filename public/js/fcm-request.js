// Script ini akan meminta izin notifikasi, mengambil FCM token, dan mengirim ke backend/Firestore
// Pastikan sudah ada firebase-app.js, firebase-messaging.js, dan firebase-config.js

// Gunakan instance firebase yang sudah ada, jangan inisialisasi ulang!
// Tunggu sampai firebase sudah diinisialisasi oleh script lain (cek-login.js atau firebase-config.js)
// dan window.firebase sudah siap


function initFcmRequest() {
  console.log('[FCM] 🚀 initFcmRequest dijalankan');
  if (typeof firebase === 'undefined' || !firebase.messaging) {
    console.warn('[FCM] ⚠️ Firebase SDK/messaging belum siap, retry...');
    if (!window._fcmInitRetry) window._fcmInitRetry = 0;
    if (window._fcmInitRetry < 10) {
      window._fcmInitRetry++;
      setTimeout(initFcmRequest, 200);
    } else {
      alert('Firebase SDK/messaging belum dimuat!');
    }
    return;
  }
  
  console.log('[FCM] ✅ Firebase SDK ready');
  const messaging = firebase.messaging();
  const VAPID_KEY = 'BLX08CbmRL0w_pWLoUhw3wRxMqgzzfpKY5JE5Tphw3cgNjPnQDW2gANdGaqT_VDLmt4NPF2NrwnSvstS8kHywcc';

  window.requestAndSaveFcmToken = async function(userId) {
    console.log('[FCM] 🚀 requestAndSaveFcmToken dipanggil dengan userId:', userId);
    console.log('[FCM] 📋 Current Notification permission:', Notification.permission);
    
    try {
      // Cek status permission sebelum request
      if (Notification.permission === 'denied') {
        console.log('[FCM] ❌ Permission DENIED');
        showToast('Notifikasi diblokir di browser Anda. Silakan aktifkan manual di pengaturan browser jika ingin menerima info penting.');
        return;
      }
      
      if (Notification.permission === 'default') {
        console.log('[FCM] ⚠️ Permission DEFAULT, requesting...');
        const permission = await Notification.requestPermission();
        console.log('[FCM] 📋 Status permission setelah request:', permission);
        if (permission !== 'granted') {
          console.warn('[FCM] ❌ Notifikasi tidak diizinkan user');
          if (window.innerWidth < 800) {
            showToast('Notifikasi browser diblokir. Anda bisa mengaktifkan notifikasi di pengaturan browser jika ingin menerima info penting.');
          } else {
            console.info('Notifikasi browser diblokir. User tetap bisa menggunakan web tanpa notifikasi.');
          }
          return;
        }
      }
      
      console.log('[FCM] ✅ Permission GRANTED, proceeding...');

      // Ambil NIK user dari Firestore berdasarkan userId
      let nik = '';
      if (window.firebase && window.firebase.firestore && userId) {
        try {
          const userDoc = await window.firebase.firestore().collection('users').doc(userId).get();
          if (userDoc.exists && userDoc.data().nik) {
            nik = userDoc.data().nik;
          } else {
            console.warn('[FCM] NIK user tidak ditemukan di Firestore');
          }
        } catch (err) {
          console.warn('[FCM] Gagal mengambil NIK user dari Firestore:', err);
        }
      }
      // Tunggu service worker FCM siap
      console.log('[FCM] 🔧 Waiting for service worker...');
      let swRegistration = null;
      try {
        swRegistration = await navigator.serviceWorker.ready;
        console.log('[FCM] ✅ Service worker ready:', swRegistration);
      } catch (err) {
        console.error('[FCM] ❌ Service worker belum siap:', err);
        showToast('Service worker belum siap. Silakan refresh halaman.');
        return;
      }
      
      // Pastikan swRegistration aktif
      if (!swRegistration || !swRegistration.active) {
        console.warn('[FCM] ⚠️ Service worker belum aktif, retry dalam 500ms...');
        setTimeout(() => window.requestAndSaveFcmToken(userId), 500);
        return;
      }
      
      console.log('[FCM] 🔑 Getting FCM token...');
      // Ambil token dengan service worker yang sudah siap
      const currentToken = await messaging.getToken({ vapidKey: VAPID_KEY, serviceWorkerRegistration: swRegistration });
      
      if (currentToken) {
        console.log('[FCM] ✅ FCM token obtained:', currentToken.substring(0, 20) + '...');
        
        // Kirim token ke backend/Firestore beserta NIK
        console.log('[FCM] 📤 Sending token to backend...');
        const response = await fetch('/api/save-fcm-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, nik, fcmToken: currentToken })
        });
        
        const result = await response.json();
        console.log('[FCM] 📥 Backend response:', result);
        
        console.log('[FCM] ✅ FCM token berhasil dikirim (array mode):', currentToken.substring(0, 20) + '...', 'NIK:', nik);
        
        // Simpan semua token yang pernah dikirim di localStorage (array)
        let sentTokens = [];
        try { sentTokens = JSON.parse(localStorage.getItem('fcmTokenSentArr') || '[]'); } catch {}
        if (!sentTokens.includes(currentToken)) {
          sentTokens.push(currentToken);
          localStorage.setItem('fcmTokenSentArr', JSON.stringify(sentTokens));
          showToast('Notifikasi aktif! Anda akan menerima info penting dari Sekawan FC.');
        } else {
          console.log('[FCM] ℹ️ Token sudah pernah dikirim, tidak tampilkan pesan ulang.');
        }
      } else {
        console.warn('[FCM] ❌ Gagal mendapatkan FCM token');
        showToast('Gagal mendapatkan FCM token.');
      }
    } catch (err) {
      console.error('[FCM] ❌ Error FCM:', err);
      console.error('[FCM] ❌ Error stack:', err.stack);
      showToast('Gagal mengaktifkan notifikasi. Cek koneksi internet atau pengaturan browser Anda.');
    }
  };

  // --- Toast/Info UI sederhana (tanpa library, bisa diganti sesuai framework) ---
  function showToast(msg) {
    let toast = document.getElementById('fcm-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'fcm-toast';
      toast.style.position = 'fixed';
      toast.style.bottom = '24px';
      toast.style.left = '50%';
      toast.style.transform = 'translateX(-50%)';
      toast.style.background = 'rgba(0,0,0,0.85)';
      toast.style.color = '#fff';
      toast.style.padding = '12px 20px';
      toast.style.borderRadius = '8px';
      toast.style.fontSize = '1rem';
      toast.style.zIndex = '9999';
      toast.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
      toast.style.maxWidth = '90vw';
      toast.style.textAlign = 'center';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.display = 'block';
    clearTimeout(window._fcmToastTimeout);
    window._fcmToastTimeout = setTimeout(() => {
      toast.style.display = 'none';
    }, 4000);
  }

// --- Helper: Tampilkan/hide tombol aktifkan notifikasi sesuai status permission ---
function updateFcmButtonVisibility() {
  const btn = document.getElementById('fcm-activate-btn');
  if (!btn) return;
  if (Notification.permission === 'default') {
    btn.style.display = '';
  } else {
    btn.style.display = 'none';
  }
}

// Jalankan update tombol saat halaman siap dan setiap permission berubah
document.addEventListener('DOMContentLoaded', updateFcmButtonVisibility);
document.addEventListener('visibilitychange', updateFcmButtonVisibility);
// (Optional) Panggil juga setelah request permission

  // Listener pesan saat web aktif
  messaging.onMessage(function(payload) {
    console.log('[FCM] 🔥 FOREGROUND MESSAGE RECEIVED!');
    console.log('[FCM] Payload:', payload);
    
    // Tampilkan notifikasi native jika diizinkan
    if (Notification.permission === 'granted' && payload.notification) {
      console.log('[FCM] 📢 Showing foreground notification');
      const notification = new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: '/SekawanFC.jpg', // Ganti path icon jika perlu
        data: payload.data || {}
      });
      
      // Handle klik notifikasi foreground
      notification.onclick = function() {
        console.log('[FCM] 🖱️ Foreground notification clicked');
        window.focus();
        if (window.location.pathname !== '/notifikasi') {
          window.location.href = '/notifikasi';
        }
        notification.close();
      };
    }
  });
}

// Jalankan inisialisasi FCM setelah DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('[FCM] 🔄 DOMContentLoaded');
    initFcmRequest();
    
    // Auto-register FCM untuk semua user (termasuk guest) setelah 2 detik
    setTimeout(() => {
      console.log('[FCM] 🔄 Auto-registering FCM token...');
      const userId = window.currentUserId || 'guest_' + Date.now();
      console.log('[FCM] Using userId for auto-register:', userId);
      if (window.requestAndSaveFcmToken) {
        window.requestAndSaveFcmToken(userId);
      }
    }, 2000);
  });
} else {
  console.log('[FCM] 📄 Document readyState:', document.readyState);
  initFcmRequest();
  
  // Auto-register FCM untuk semua user (termasuk guest) setelah 1 detik
  setTimeout(() => {
    console.log('[FCM] 🔄 Auto-registering FCM token...');
    const userId = window.currentUserId || 'guest_' + Date.now();
    console.log('[FCM] Using userId for auto-register:', userId);
    if (window.requestAndSaveFcmToken) {
      window.requestAndSaveFcmToken(userId);
    }
  }, 1000);
}
