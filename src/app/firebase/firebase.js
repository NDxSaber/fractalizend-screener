// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOgPEXaC97rAri5BrkZ8I9CLxbrZrdLu8",
  authDomain: "fractalizend-screener.firebaseapp.com",
  projectId: "fractalizend-screener",
  storageBucket: "fractalizend-screener.firebasestorage.app",
  messagingSenderId: "1023573792880",
  appId: "1:1023573792880:web:a44d486723548dc9247cb5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (if needed)
const db = getFirestore(app);

export { app, db };