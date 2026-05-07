// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore }   from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'  // ← agrega esto

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpnWad3uYy1qVQyQlxjOSHt7JLPzCUa3E",
  authDomain: "horarios-ccd.firebaseapp.com",
  projectId: "horarios-ccd",
  storageBucket: "horarios-ccd.firebasestorage.app",
  messagingSenderId: "888408866342",
  appId: "1:888408866342:web:688519cef16e670a8c70e7",
  measurementId: "G-YLR0YZQQQK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db       = getFirestore(app)
export const auth     = getAuth(app)          // ← exporta
export const provider = new GoogleAuthProvider() // ← exporta