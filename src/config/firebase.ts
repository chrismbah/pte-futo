/* eslint-disable @typescript-eslint/no-unused-vars */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getPerformance, type FirebasePerformance } from "firebase/performance";
import { getAnalytics, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "",
  measurementId: process.env.REACT_APP_MEASUREMENT_ID || "",
};

// Check if Firebase config is valid
export const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId);

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize performance and analytics only in browser environment
let perf: FirebasePerformance | null = null;
let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  try {
    perf = getPerformance(app);
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn("Firebase performance/analytics initialization failed:", error);
  }
}

export { perf, analytics };
