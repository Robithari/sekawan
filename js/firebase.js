import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDo2kyDl39c4t5DfxYycmmjHSbY5FXB9AA",
  authDomain: "sekawan-fc-427414.firebaseapp.com",
  projectId: "sekawan-fc-427414",
  storageBucket: "sekawan-fc-427414.appspot.com",
  messagingSenderId: "399174955835",
  appId: "1:399174955835:web:c681f8681c474420e8fd1e",
  measurementId: "G-CD0MHD1RBP"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Log peristiwa debug
logEvent(analytics, 'test_event', { debug_mode: true });
console.log('Firebase initialized:', app);
console.log('Analytics initialized:', analytics);
console.log('Test event logged');
