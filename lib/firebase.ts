import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics, logEvent, EventParams } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB1MzJseyU3p9YsWvDCrfz3nE3-GmahFPw",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dry-fruit-77b11.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dry-fruit-77b11",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dry-fruit-77b11.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "661239578745",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:661239578745:web:f6d542b29b84e1e35614a8",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-N33SLL4HCY"
};

// Initialize Firebase App (singleton pattern)
export const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let analyticsInstance: Analytics | null = null;
let analyticsPromise: Promise<Analytics | null> | null = null;

export const getFirebaseAnalytics = async (): Promise<Analytics | null> => {
  if (typeof window === "undefined") return null;
  if (analyticsInstance) return analyticsInstance;
  if (!analyticsPromise) {
    analyticsPromise = isSupported().then((supported) => {
      if (supported) {
        analyticsInstance = getAnalytics(app);
        return analyticsInstance;
      }
      return null;
    }).catch(() => null);
  }
  return analyticsPromise;
};

/**
 * Safe helper to log events to Firebase Analytics on the client side.
 */
export const logAnalyticsEvent = async (eventName: string, eventParams?: EventParams) => {
  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
    }
  } catch (error) {
    console.error("Firebase Analytics logEvent error:", error);
  }
};
