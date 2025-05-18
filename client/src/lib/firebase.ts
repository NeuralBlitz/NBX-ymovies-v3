import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
let firebaseConfig;

// Try to get Firebase config from global ENV (set in env.js)
if (typeof window !== 'undefined' && window.ENV && window.ENV.FIREBASE_CONFIG) {
  firebaseConfig = window.ENV.FIREBASE_CONFIG;
} else {
  // Fallback to environment variables or placeholders
  firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
  };
}

// Log Firebase initialization (in development only)
if (import.meta.env.DEV) {
  console.log('Initializing Firebase with config:', {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey ? "********" : undefined // Hide API key in logs
  });
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Connect to Auth emulator if in development and emulator URL is provided
if (import.meta.env.DEV && import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL) {
  connectAuthEmulator(
    auth, 
    import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL
  );
  console.log(`Connected to Firebase Auth emulator at ${import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL}`);
}

// Export Firebase Auth instance for use throughout the app
export default auth;
