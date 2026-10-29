// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "trackgpt-67d3f.firebaseapp.com",
  projectId: "trackgpt-67d3f",
  storageBucket: "trackgpt-67d3f.firebasestorage.app",
  messagingSenderId: "551834184641",
  appId: "1:551834184641:web:15567d81e98085b9909d40",
  measurementId: "G-0XD13VR0LS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);