import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBSgFM40vWN5tbb_0VAQ7wysQ2Bo9FhcZQ",
  authDomain: "cinemapp-4814d.firebaseapp.com",
  projectId: "cinemapp-4814d",
  storageBucket: "cinemapp-4814d.firebasestorage.app",
  messagingSenderId: "1004804875469",
  appId: "1:1004804875469:web:449cd1c8b3326c21d57584",
  measurementId: "G-5FLG74LMMC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);