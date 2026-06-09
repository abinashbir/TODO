import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function ThemeSwitcher() {
    const { theme, themeName, switchTheme, allThemes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themeEntries = Object.entries(allThemes);

    return (
        <View>
            <TouchableOpacity
                onPress={() => setIsOpen(true)}
                style={styles.trigger}
                activeOpacity={0.7}
            >
                <Ionicons name="color-palette-outline" size={22} color={theme.textSecondary} />
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setIsOpen(false)}
            >
                <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
                    <Pressable style={[styles.sheet, {
                        backgroundColor: theme.bgApp,
                        borderColor: theme.bgGlassBorder,
                    }]}>
                        <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>
                            Choose Theme
                        </Text>

                        <View style={styles.themeGrid}>
                            {themeEntries.map(([name, t]) => {
                                const isSelected = name === themeName;
                                return (
                                    <TouchableOpacity
                                        key={name}
                                        onPress={() => {
                                            switchTheme(name);
                                            setIsOpen(false);
                                        }}
                                        style={[styles.themeCard, {
                                            backgroundColor: t.bgGlass,
                                            borderColor: isSelected ? t.primary : t.bgGlassBorder,
                                            borderWidth: isSelected ? 2 : 1,
                                        }]}
                                        activeOpacity={0.7}
                                    >
                                        {/* Color preview */}
                                        <View style={styles.colorPreview}>
                                            <View style={[styles.colorDot, { backgroundColor: t.primary }]} />
                                            <View style={[styles.colorDot, { backgroundColor: t.accent }]} />
                                            <View style={[styles.colorDot, { backgroundColor: t.bgApp }]} />
                                        </View>

                                        <Text style={[styles.themeName, {
                                            color: isSelected ? t.primary : '#f8fafc',
                                            fontWeight: isSelected ? '700' : '500',
                                        }]}>
                                            {name.charAt(0).toUpperCase() + name.slice(1)}
                                        </Text>

                                        {isSelected && (
                                            <View style={[styles.selectedBadge, { backgroundColor: t.primary }]}>
                                                <Ionicons name="checkmark" size={12} color="#fff" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <TouchableOpacity
                            onPress={() => setIsOpen(false)}
                            style={[styles.closeButton, {
                                backgroundColor: theme.bgGlass,
                                borderColor: theme.bgGlassBorder,
                            }]}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.closeText, { color: theme.textSecondary }]}>
                                Close
                            </Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    trigger: {
        padding: 8,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    sheet: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
    },
    themeGrid: {
        gap: 12,
    },
    themeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 14,
    },
    colorPreview: {
        flexDirection: 'row',
        gap: 4,
    },
    colorDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    themeName: {
        fontSize: 16,
        flex: 1,
    },
    selectedBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        marginTop: 20,
        paddingVertical: 12,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    closeText: {
        fontSize: 15,
        fontWeight: '500',
    },
});
