import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkV1YR_5x2yslRnbJuyGET_2eKJb07Sl4",
  authDomain: "preptime-b5d41.firebaseapp.com",
  projectId: "preptime-b5d41",
  storageBucket: "preptime-b5d41.firebasestorage.app",
  messagingSenderId: "180256609920",
  appId: "1:180256609920:web:36c904e001cda1ef5bb865",
  measurementId: "G-6NQMR171DQ",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
