import { getFirestore } from 'firebase/firestore'; // Añade getFirestore
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6gLy--KFRlZbdN7hCHvN0q2n-z5zv0Gc",
  authDomain: "bdpascual-5b1eb.firebaseapp.com",
  databaseURL: "https://bdpascual-5b1eb-default-rtdb.firebaseio.com",
  projectId: "bdpascual-5b1eb",
  storageBucket: "bdpascual-5b1eb.firebasestorage.app",
  messagingSenderId: "563807284138",
  appId: "1:563807284138:web:936d6b4789e467ddda99d3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 

export { db }