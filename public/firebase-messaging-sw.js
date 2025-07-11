
// DEBUG: Log saat service worker di-load
console.log('[firebase-messaging-sw.js] Service worker loaded (FCM ready) v20250710c - Enhanced Debug'); // PATCH: force update

importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyDo2kyDl39c4t5DfxYycmmjHSbY5FXB9AA",
  authDomain: "sekawan-fc-427414.firebaseapp.com",
  projectId: "sekawan-fc-427414",
  storageBucket: "sekawan-fc-427414.appspot.com",
  messagingSenderId: "399174955835",
  appId: "1:399174955835:web:c681f8681c474420e8fd1e",
  measurementId: "G-CD0MHD1RBP",
  databaseURL: "https://sekawan-fc-427414-default-rtdb.firebaseio.com/" // Tambahkan URL untuk Realtime Database
});

const messaging = firebase.messaging();

// Handler pesan background FCM v8 (robust, fallback icon jika tidak ada)
messaging.setBackgroundMessageHandler(function(payload) {
  try {
    console.log('[firebase-messaging-sw.js] 🔥 BACKGROUND MESSAGE RECEIVED!');
    console.log('[firebase-messaging-sw.js] Full payload:', JSON.stringify(payload, null, 2));
    
    let notificationTitle = 'Notifikasi Baru';
    let notificationOptions = {
      body: '',
      icon: '/SekawanFC.jpg', // fallback icon
      data: {},
      requireInteraction: true,
      badge: '/SekawanFC.jpg'
    };
    
    // Jika payload.notification ada, gunakan
    if (payload && payload.notification) {
      console.log('[firebase-messaging-sw.js] Using payload.notification');
      notificationTitle = payload.notification.title || notificationTitle;
      notificationOptions.body = payload.notification.body || '';
      notificationOptions.icon = payload.notification.icon || '/SekawanFC.jpg';
      notificationOptions.data = payload.data || {};
    } else if (payload && payload.data) {
      console.log('[firebase-messaging-sw.js] Using payload.data only');
      // Jika hanya payload.data, coba ambil title/body/icon dari data
      notificationTitle = payload.data.title || notificationTitle;
      notificationOptions.body = payload.data.body || '';
      notificationOptions.icon = payload.data.icon || '/SekawanFC.jpg';
      notificationOptions.data = payload.data;
    }
    
    console.log('[firebase-messaging-sw.js] Final notification config:');
    console.log('[firebase-messaging-sw.js]   Title:', notificationTitle);
    console.log('[firebase-messaging-sw.js]   Options:', notificationOptions);
    
    // DEBUG: Tampilkan notifikasi dan log
    const showPromise = self.registration.showNotification(notificationTitle, notificationOptions);
    showPromise.then(() => {
      console.log('[firebase-messaging-sw.js] ✅ showNotification SUCCESS:', notificationTitle);
    }).catch((err) => {
      console.error('[firebase-messaging-sw.js] ❌ showNotification ERROR:', err);
    });
    return showPromise;
  } catch (err) {
    console.error('[firebase-messaging-sw.js] ❌ Error in setBackgroundMessageHandler:', err);
    // Fallback notifikasi jika error
    return self.registration.showNotification('Notifikasi Baru', {
      body: 'Pesan masuk, tapi terjadi error saat menampilkan notifikasi.',
      icon: '/SekawanFC.jpg'
    });
  }
});

// Event listener untuk klik notifikasi (best practice)
self.addEventListener('notificationclick', function(event) {
  try {
    console.log('[firebase-messaging-sw.js] 🔥 NOTIFICATION CLICKED! Starting redirect to /notifikasi');
    console.log('[firebase-messaging-sw.js] Event details:', event);
    console.log('[firebase-messaging-sw.js] Notification data:', event.notification?.data);
    
    event.notification.close();
    let url = self.location.origin + '/notifikasi';
    
    console.log('[firebase-messaging-sw.js] Target URL:', url);
    
    if (event.notification && event.notification.data && event.notification.data.click_action) {
      console.log('[firebase-messaging-sw.js] Found click_action, but always redirect to /notifikasi');
    }
    event.waitUntil((async () => {
      try {
        const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
        console.log('[firebase-messaging-sw.js] clientList:', clientList.map(c => c.url));
        for (let i = 0; i < clientList.length; i++) {
          let client = clientList[i];
          try {
            const clientUrl = new URL(client.url);
            const notifUrl = new URL(url);
            if (clientUrl.pathname === notifUrl.pathname && 'focus' in client) {
              console.log('[firebase-messaging-sw.js] ✅ Focusing existing /notifikasi tab:', client.url);
              return client.focus();
            }
          } catch (e) { 
            console.error('[firebase-messaging-sw.js] URL parse error:', e); 
          }
        }
        // Otherwise open new tab
        if (clients.openWindow) {
          console.log('[firebase-messaging-sw.js] 🆕 Opening new /notifikasi tab:', url);
          return clients.openWindow(url);
        }
        // Fallback: try openWindow again
        console.warn('[firebase-messaging-sw.js] Fallback: trying openWindow again');
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
        // Fallback: log error
        console.error('[firebase-messaging-sw.js] Unable to open /notifikasi');
      } catch (err) {
        console.error('[firebase-messaging-sw.js] notificationclick handler error:', err);
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }
    })());
  } catch (err) {
    console.error('[firebase-messaging-sw.js] notificationclick outer error:', err);
    if (clients && clients.openWindow) {
      return clients.openWindow(self.location.origin + '/notifikasi');
    }
  }
});
