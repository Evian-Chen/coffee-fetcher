// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const FIREBASE_API = process.env.FIREBASE_API;
const FIREBASE_MESSAGE_SENDER_ID = process.env.FIREBASE_MESSAGE_SENDER_ID;
const FIREBASE_APP_ID = process.env.FIREBASE_APP_ID;

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: FIREBASE_API,
  authDomain: "coffee-fetcher-e3938.firebaseapp.com",
  projectId: "coffee-fetcher-e3938",
  storageBucket: "coffee-fetcher-e3938.firebasestorage.app",
  messagingSenderId: FIREBASE_MESSAGE_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: "G-Y133TH7Y8Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);