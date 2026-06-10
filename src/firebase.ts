import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your actual config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDV715G9tur0W-QyTjpzSBPgcVyK1sEbTY",
  authDomain: "smartcafe-81c3f.firebaseapp.com",
  projectId: "smartcafe-81c3f",
  storageBucket: "smartcafe-81c3f.firebasestorage.app",
  messagingSenderId: "361883218417",
  appId: "1:361883218417:web:434ad2bf46bf3fedaf5450"
};

// 1. THE FIX: We export the initialized app right here!
export const app = initializeApp(firebaseConfig);

// 2. Export the services so the rest of the app can use them
export const db = getFirestore(app);
export const auth = getAuth(app);