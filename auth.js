// ============================================================
//  auth.js — GLOW Firebase Authentication Logic
//  Uses Firebase v9+ Modular SDK (compat layer via CDN)
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

const app      = initializeApp(firebaseConfig);
const auth     = getAuth(app);
const provider = new GoogleAuthProvider();

// ── ADMIN BYPASS CREDENTIALS (hardcoded) ───────────────────
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin";

// ── ERROR MESSAGE MAP ───────────────────────────────────────
const errorMessages = {
  "auth/invalid-email":            "The email address is not valid.",
  "auth/user-disabled":            "This account has been disabled.",
  "auth/user-not-found":           "No account found with this email.",
  "auth/wrong-password":           "Incorrect password. Please try again.",
  "auth/email-already-in-use":     "An account with this email already exists.",
  "auth/weak-password":            "Password must be at least 6 characters.",
  "auth/popup-closed-by-user":     "Google sign-in was cancelled.",
  "auth/network-request-failed":   "Network error. Check your connection.",
  "auth/too-many-requests":        "Too many attempts. Please wait a moment.",
  "auth/invalid-credential":       "Invalid credentials. Please try again.",
};

export function getFriendlyError(code) {
  return errorMessages[code] || "Something went wrong. Please try again.";
}

// ── ADMIN CHECK (must run BEFORE Firebase calls) ────────────
export function checkAdminBypass(usernameOrEmail, password) {
  if (
    usernameOrEmail.trim().toLowerCase() === ADMIN_USERNAME &&
    password === ADMIN_PASSWORD
  ) {
    window.location.href = "admin.html";
    return true;
  }
  return false;
}

// ── EMAIL / PASSWORD SIGN UP ────────────────────────────────
export async function signUpWithEmail(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// ── EMAIL / PASSWORD SIGN IN ────────────────────────────────
export async function signInWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// ── GOOGLE SIGN IN ──────────────────────────────────────────
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// ── SIGN OUT ────────────────────────────────────────────────
export async function logOut() {
  await signOut(auth);
  window.location.href = "login.html";
}

// ── AUTH STATE OBSERVER ─────────────────────────────────────
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export { auth };