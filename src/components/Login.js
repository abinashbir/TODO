import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function Login() {
    const { loginWithGoogle, loading, googleAuthRequest } = useAuth();
    const { theme } = useTheme();

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.bgApp }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <LinearGradient
            colors={[theme.bgApp, '#1a1a2e', theme.bgApp]}
            style={styles.container}
        >
            {/* Decorative gradient orbs */}
            <View style={[styles.orb, styles.orbTopLeft, { backgroundColor: theme.gradientStart }]} />
            <View style={[styles.orb, styles.orbBottomRight, { backgroundColor: theme.gradientEnd }]} />

            <View style={styles.content}>
                {/* App Icon */}
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                    <Ionicons name="checkmark-done" size={48} color={theme.primary} />
                </View>

                <Text style={[styles.title, { color: theme.textPrimary }]}>
                    Welcome Back
                </Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    Sign in to sync your tasks{'\n'}across all your devices.
                </Text>

                {/* Glass Card */}
                <View style={[styles.card, {
                    backgroundColor: theme.bgGlass,
                    borderColor: theme.bgGlassBorder,
                }]}>
                    <TouchableOpacity
                        onPress={loginWithGoogle}
                        disabled={!googleAuthRequest}
                        style={[styles.googleButton, {
                            opacity: googleAuthRequest ? 1 : 0.5,
                        }]}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="logo-google" size={22} color="#333" />
                        <Text style={styles.googleButtonText}>Sign in with Google</Text>
                    </TouchableOpacity>

                    <Text style={[styles.disclaimer, { color: theme.textSecondary }]}>
                        Your data is securely stored in Firebase
                    </Text>
                </View>

                {/* Feature pills */}
                <View style={styles.features}>
                    {[
                        { icon: 'sync', label: 'Real-time Sync' },
                        { icon: 'color-palette', label: 'Themes' },
                        { icon: 'list', label: 'Subtasks' },
                    ].map((feature, i) => (
                        <View key={i} style={[styles.featurePill, {
                            backgroundColor: theme.bgGlass,
                            borderColor: theme.bgGlassBorder,
                        }]}>
                            <Ionicons name={feature.icon} size={14} color={theme.primary} />
                            <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                                {feature.label}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orb: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    orbTopLeft: {
        top: -100,
        left: -100,
    },
    orbBottomRight: {
        bottom: -100,
        right: -100,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: 32,
        width: '100%',
        maxWidth: 400,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    card: {
        width: '100%',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        alignItems: 'center',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 24,
        width: '100%',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    disclaimer: {
        fontSize: 12,
        marginTop: 16,
    },
    features: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 32,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    featurePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
    },
    featureText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
