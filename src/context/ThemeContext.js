import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES } from '../theme/themes';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = '@todo_app_theme';

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export function ThemeProvider({ children }) {
    const [themeName, setThemeName] = useState('midnight');
    const theme = THEMES[themeName];

    // Load saved theme on mount
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (saved && THEMES[saved]) {
                    setThemeName(saved);
                }
            } catch (e) {
                console.error('Failed to load theme:', e);
            }
        };
        loadTheme();
    }, []);

    const switchTheme = async (name) => {
        if (THEMES[name]) {
            setThemeName(name);
            try {
                await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
            } catch (e) {
                console.error('Failed to save theme:', e);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, themeName, switchTheme, allThemes: THEMES }}>
            {children}
        </ThemeContext.Provider>
    );
}
