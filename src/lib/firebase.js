import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyBziq-_2Yt4qCMx-cZj0Dwwz_fkpi_1qyA",
    authDomain: "todoapp-2005.firebaseapp.com",
    projectId: "todoapp-2005",
    storageBucket: "todoapp-2005.firebasestorage.app",
    messagingSenderId: "219252900104",
    appId: "1:219252900104:web:515bf8a1e3a08dc3b2ecbd",
    measurementId: "G-GBS1PK47C7"
};

const app = initializeApp(firebaseConfig);

// Use React Native persistence so auth state survives app restarts
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
