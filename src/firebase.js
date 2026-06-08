import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Initialize Analytics with error handling
let analytics = null;
try {
    analytics = getAnalytics(app);
} catch (error) {
    console.warn('Firebase Analytics failed to initialize:', error.message);
    // Create a dummy analytics object to prevent errors in other parts of the code
    analytics = {
        logEvent: () => {},
        setCurrentScreen: () => {},
        setUserId: () => {},
        setUserProperties: () => {}
    };
}

export { app, auth, googleProvider, analytics };
