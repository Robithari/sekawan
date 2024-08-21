import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-analytics.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyDo2kyDl39c4t5DfxYycmmjHSbY5FXB9AA",
  authDomain: "sekawan-fc-427414.firebaseapp.com",
  projectId: "sekawan-fc-427414",
  storageBucket: "sekawan-fc-427414",
  messagingSenderId: "399174955835",
  appId: "1:399174955835:web:c681f8681c474420e8fd1e",
  measurementId: "G-CD0MHD1RBP"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);
