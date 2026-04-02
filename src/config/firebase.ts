/* eslint-disable @typescript-eslint/no-unused-vars */
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getPerformance, type FirebasePerformance } from "firebase/performance";
import { getAnalytics, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCeDJW_9r37phtogoo04FDUWcqEninfPfM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ebsumsa-f3120.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ebsumsa-f3120",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ebsumsa-f3120.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1020501012962",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1020501012962:web:a5cfe29f53ad7aee9b89bb",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-5GD0XSKT8X",
};

// Check if Firebase config is valid
export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

// Prevent re-initialization if already initialized (HMR safe)
export const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "";
export const storage = getStorage(
  app,
  storageBucket
    ? storageBucket.startsWith("gs://")
      ? storageBucket
      : `gs://${storageBucket}`
    : undefined
);

// Initialize performance and analytics only in browser environment with valid config
let perf: FirebasePerformance | null = null;
let analytics: Analytics | null = null;

if (typeof window !== "undefined" && isFirebaseConfigured) {
  try {
    perf = getPerformance(app);
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn("Firebase performance/analytics initialization failed:", error);
  }
}

export { perf, analytics };
