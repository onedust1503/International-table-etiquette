// Firebase 配置
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBGvEKCTzQzwDi0Hd3cV5pjBicJpqByuSQ",
  authDomain: "table-food-culture.firebaseapp.com",
  databaseURL: "https://table-food-culture-default-rtdb.firebaseio.com",
  projectId: "table-food-culture",
  storageBucket: "table-food-culture.firebasestorage.app",
  messagingSenderId: "936255864915",
  appId: "1:936255864915:web:761832954d17b25e47c6a6",
  measurementId: "G-TJSNXCHG2G"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db, analytics }; 

