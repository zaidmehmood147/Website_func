// ============================================================
//  admin.js — GLOW Admin Product Management Logic
//  Pushes product data to Firebase Realtime Database
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ── REPLACE WITH YOUR FIREBASE CONFIG ──────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyBSAop_oP2RsxM4iGv9NtsVq46Wo-KRS-A",
    authDomain: "fir-login-signup-wma.firebaseapp.com",
    databaseURL: "https://fir-login-signup-wma-default-rtdb.firebaseio.com",
    projectId: "fir-login-signup-wma",
    storageBucket: "fir-login-signup-wma.firebasestorage.app",
    messagingSenderId: "199141690287",
    appId: "1:199141690287:web:4a44b88a4755aa8e6ebd5a",
    measurementId: "G-Q9N56M34QL"
};
// ───────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig, "admin-app");
const db  = getDatabase(app);

// ── ADD PRODUCT ─────────────────────────────────────────────
export async function addProduct({ name, price, description, imageUrl, category }) {
  const productsRef = ref(db, "products");
  const newProduct = {
    name:        name.trim(),
    price:       parseFloat(price),
    description: description.trim(),
    imageUrl:    imageUrl.trim(),
    category:    category.trim(),
    createdAt:   serverTimestamp()
  };
  const snapshot = await push(productsRef, newProduct);
  return snapshot.key; // returns the new product's unique key
}