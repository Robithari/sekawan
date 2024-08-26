// Mengatur Service Worker dari versi Firebase 8
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
      return getToken(messaging, { vapidKey: 'BPAqQpY9sfUZKGfJVpq6HKFoQp4THJ-ESMjE94WnFEnOqp6H5VSEAGP1QzemeQ55Tj789flPvLAjeKOYC3U4yTI', serviceWorkerRegistration: registration });
    })
    .then((token) => {
      console.log('FCM Token:', token);
    })
    .catch((err) => {
      console.error('Failed to register Service Worker or get token:', err);
    });
} else {
  console.warn('Service Worker is not supported in this browser.');
}
