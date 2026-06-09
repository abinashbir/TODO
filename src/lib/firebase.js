import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase config is properly configured
const isFirebaseConfigured = Object.values(firebaseConfig).every(value => value && value !== 'undefined');

if (!isFirebaseConfigured) {
    console.warn(
        '⚠️ Firebase is not properly configured. Please add your Firebase credentials to .env.local file.'
    );
}

let app;
let auth;
let db;

try {
    app = initializeApp(firebaseConfig);
    
    // Use React Native persistence so auth state survives app restarts
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
    
    db = getFirestore(app);
} catch (error) {
    console.error('Firebase initialization error:', error.message);
}

export const googleProvider = new GoogleAuthProvider();
export { auth, db };
