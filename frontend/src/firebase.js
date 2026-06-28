// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzE5b5SBTSoXqZWTkJloHAfGFms20GvNs",
  authDomain: "wealthfuture.firebaseapp.com",
  projectId: "wealthfuture",
  storageBucket: "wealthfuture.firebasestorage.app",
  messagingSenderId: "120897534894",
  appId: "1:120897534894:web:55dbae7c12ac39b6d3663f",
  measurementId: "G-VBPGT42J27"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);