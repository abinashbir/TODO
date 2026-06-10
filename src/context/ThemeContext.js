import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from '../theme/themes';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'todoapp_theme_name';

export function ThemeProvider({ children }) {
    const [themeName, setThemeNameState] = useState('midnight');

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (storedTheme && themes[storedTheme]) {
                    setThemeNameState(storedTheme);
                }
            } catch (e) {
                console.error('Failed to load theme preference', e);
            }
        };
        loadTheme();
    }, []);

    const setThemeName = async (name) => {
        if (themes[name]) {
            setThemeNameState(name);
            try {
                await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
            } catch (e) {
                console.error('Failed to save theme preference', e);
            }
        }
    };

    const value = {
        themeName,
        theme: themes[themeName],
        setThemeName,
        availableThemes: Object.values(themes)
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
