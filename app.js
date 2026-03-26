// ============================================================
//  app.js — GLOW · Central Firebase Logic
//  Firebase v10+ Modular SDK
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  push,
  remove,
  onValue,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ── ❶ REPLACE WITH YOUR FIREBASE CONFIG ────────────────────
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

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const db       = getDatabase(app);
const provider = new GoogleAuthProvider();

// ── ❷ ADMIN BYPASS (checked BEFORE any Firebase call) ──────
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin";

export function checkAdminBypass(identifier, password) {
  if (identifier.trim().toLowerCase() === ADMIN_USER && password === ADMIN_PASS) {
    window.location.href = "admin.html";
    return true;
  }
  return false;
}

// ── ❸ ERROR MAP ─────────────────────────────────────────────
const ERROR_MAP = {
  "auth/invalid-email":          "The email address is not valid.",
  "auth/user-disabled":          "This account has been disabled.",
  "auth/user-not-found":         "No account found with this email.",
  "auth/wrong-password":         "Incorrect password. Please try again.",
  "auth/email-already-in-use":   "An account with this email already exists.",
  "auth/weak-password":          "Password must be at least 6 characters.",
  "auth/popup-closed-by-user":   "Google sign-in was cancelled.",
  "auth/network-request-failed": "Network error. Check your connection.",
  "auth/too-many-requests":      "Too many attempts. Please wait a moment.",
  "auth/invalid-credential":     "Invalid credentials. Please try again.",
};
export function getFriendlyError(code) {
  return ERROR_MAP[code] || "Something went wrong. Please try again.";
}

// ── ❹ AUTH FUNCTIONS ────────────────────────────────────────
export async function signUpEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}
export async function signInEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
export async function signInGoogle() {
  return signInWithPopup(auth, provider);
}
export async function logOut() {
  await signOut(auth);
  window.location.href = "login.html";
}
export function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}

// ── ❺ PRODUCT CRUD ───────────────────────────────────────────
export async function addProduct({ name, price, description, imageUrl, category }) {
  const productsRef = ref(db, "products");
  return push(productsRef, {
    name:        name.trim(),
    price:       parseFloat(price),
    description: description.trim(),
    imageUrl:    imageUrl,          // base64 or URL
    category:    category.trim(),
    createdAt:   serverTimestamp()
  });
}

export async function deleteProduct(id) {
  return remove(ref(db, `products/${id}`));
}

// ── ❻ REAL-TIME PRODUCT LISTENER ────────────────────────────
//  Returns an unsubscribe function
export function listenProducts(callback) {
  const productsRef = ref(db, "products");
  return onValue(productsRef, snapshot => {
    const data = snapshot.val();
    if (!data) { callback([]); return; }
    const list = Object.entries(data)
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    callback(list);
  });
}

// ── ❼ UTILITY: BUILD PRODUCT CARD HTML ──────────────────────
export function buildProductCard(product) {
  const imgContent = product.imageUrl
    ? `<img src="${product.imageUrl}" alt="${product.name}" loading="lazy"/>`
    : `<div class="img-placeholder">GLOW</div>`;

  return `
    <div class="product-card reveal" data-id="${product.id}">
      <div class="product-card-img">
        ${imgContent}
        <div class="product-card-overlay">
          <button class="overlay-btn">Add to Cart</button>
        </div>
      </div>
      <div class="product-card-info">
        <div class="product-card-name">${product.name}</div>
        <div class="product-card-cat">${product.category}</div>
        <div class="product-card-price">PKR ${Number(product.price).toLocaleString()}</div>
      </div>
    </div>`;
}

// ── ❽ UTILITY: BUILD ADMIN TABLE ROW HTML ───────────────────
export function buildAdminRow(product, onDelete) {
  const tr = document.createElement('tr');
  tr.dataset.id = product.id;

  const thumbHtml = product.imageUrl
    ? `<img class="table-thumb" src="${product.imageUrl}" alt="${product.name}"/>`
    : `<div class="table-thumb"></div>`;

  tr.innerHTML = `
    <td>${thumbHtml}</td>
    <td><span class="table-name">${product.name}</span></td>
    <td><span class="table-cat">${product.category}</span></td>
    <td><span class="table-price">PKR ${Number(product.price).toLocaleString()}</span></td>
    <td>
      <button class="btn-delete" data-id="${product.id}">Delete</button>
    </td>`;

  tr.querySelector('.btn-delete').addEventListener('click', () => onDelete(product.id, product.name));
  return tr;
}

// ── ❾ SCROLL REVEAL OBSERVER ────────────────────────────────
export function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  return io;
}

// ── ❿ CURSOR ────────────────────────────────────────────────
export function initCursor() {
  const dot  = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx - 5}px,${my - 5}px)`;
  });
  (function animRing() {
    rx += (mx - rx - 18) * .12;
    ry += (my - ry - 18) * .12;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(animRing);
  })();
  document.querySelectorAll('a,button').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.style.transform += ' scale(2.2)'; ring.style.opacity = '0'; });
    el.addEventListener('mouseleave', () => { dot.style.transform = dot.style.transform.replace(' scale(2.2)',''); ring.style.opacity = '.45'; });
  });
}

export { auth, db };