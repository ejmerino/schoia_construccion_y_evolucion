// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKvl1fZIBTo6dt5ZA0-cx2gOLXb2Klauw",
  authDomain: "mallascurriculares-2de48.firebaseapp.com",
  projectId: "mallascurriculares-2de48",
  storageBucket: "mallascurriculares-2de48.appspot.com",
  messagingSenderId: "116282303343",
  appId: "1:116282303343:web:c3af8a57823d80ef357e9a"
};


// Initialize Firebase
// To avoid re-initializing on hot reloads
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
