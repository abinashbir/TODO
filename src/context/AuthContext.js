import React, { createContext, useContext } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const value = {
        currentUser: { uid: 'local-user', displayName: 'User' },
        loginWithGoogle: async () => {},
        logout: async () => {},
        loading: false,
        googleAuthRequest: { ready: true },
        firebaseError: null,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
