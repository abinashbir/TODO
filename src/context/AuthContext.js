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
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Handle Google Auth response
    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            signInWithCredential(auth, credential).catch((error) => {
                console.error('Firebase sign-in error:', error);
            });
        }
    }, [response]);

    const loginWithGoogle = async () => {
        try {
            await promptAsync();
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        currentUser,
        loginWithGoogle,
        logout,
        loading,
        googleAuthRequest: request,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
