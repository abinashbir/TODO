import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function ThemeSwitcher() {
    const { themeName, theme, setThemeName } = useTheme();
    const scaleValue = React.useRef(new Animated.Value(1)).current;

    const toggleTheme = () => {
        // Trigger button scale bounce animation
        Animated.sequence([
            Animated.timing(scaleValue, { toValue: 0.85, duration: 80, useNativeDriver: true }),
            Animated.timing(scaleValue, { toValue: 1.1, duration: 80, useNativeDriver: true }),
            Animated.timing(scaleValue, { toValue: 1, duration: 80, useNativeDriver: true })
        ]).start();

        if (themeName === 'midnight') {
            setThemeName('ocean');
        } else if (themeName === 'ocean') {
            setThemeName('sunset');
        } else {
            setThemeName('midnight');
        }
    };

    // Map theme to appropriate icons
    const getThemeIcon = () => {
        if (themeName === 'midnight') return 'moon-outline';
        if (themeName === 'ocean') return 'water-outline';
        return 'sunny-outline';
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
                style={[
                    styles.container,
                    {
                        backgroundColor: theme.bgGlass,
                        borderColor: theme.bgGlassBorder
                    }
                ]}
                onPress={toggleTheme}
                activeOpacity={0.7}
            >
                <Ionicons name={getThemeIcon()} size={18} color={theme.primary} />
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
});
