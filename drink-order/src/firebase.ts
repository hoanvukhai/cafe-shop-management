// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAconkVKleDHkkUWOqhHgDjChFF5gve5Q4",
  authDomain: "drink-shop-menu.firebaseapp.com",
  databaseURL: "https://drink-shop-menu-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "drink-shop-menu",
  storageBucket: "drink-shop-menu.firebasestorage.app",
  messagingSenderId: "322032899675",
  appId: "1:322032899675:web:185f14173b6a6de727117e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);