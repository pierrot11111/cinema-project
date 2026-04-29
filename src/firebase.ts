// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBSgFM40vWN5tbb_0VAQ7wysQ2Bo9FhcZQ",
  authDomain: "cinemapp-4814d.firebaseapp.com",
  projectId: "cinemapp-4814d",
  storageBucket: "cinemapp-4814d.firebasestorage.app",
  messagingSenderId: "1004804875469",
  appId: "1:1004804875469:web:449cd1c8b3326c21d57584",
  measurementId: "G-5FLG74LMMC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);