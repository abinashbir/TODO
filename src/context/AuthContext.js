import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithCredential, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [firebaseError, setFirebaseError] = useState(null);

    const webClientId =
        process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
        '219252900104-5ihspi7oftu89j28ff13c0qou37c6999.apps.googleusercontent.com';

    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId,
        androidClientId:
            process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || webClientId,
        iosClientId:
            process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || webClientId,
    });

    useEffect(() => {
        if (!auth) {
            setFirebaseError('Firebase is not configured. Please add your credentials to .env.local');
            setLoading(false);
            return;
        }

        try {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                setCurrentUser(user);
                setLoading(false);
            });
            return unsubscribe;
        } catch (error) {
            console.error('Auth listener error:', error);
            setFirebaseError(error.message);
            setLoading(false);
        }
    }, []);

    // Handle Google Auth response
    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            signInWithCredential(auth, credential).catch((error) => {
                console.error('Firebase sign-in error:', error);
                setFirebaseError(error.message);
            });
        }
    }, [response]);

    const loginWithGoogle = async () => {
        if (!auth) {
            setFirebaseError('Firebase is not configured');
            return;
        }
        try {
            await promptAsync();
        } catch (error) {
            console.error('Login failed:', error);
            setFirebaseError(error.message);
        }
    };

    const logout = () => {
        if (!auth) return Promise.reject('Firebase not configured');
        return signOut(auth);
    };

    const value = {
        currentUser,
        loginWithGoogle,
        logout,
        loading,
        googleAuthRequest: request,
        firebaseError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
