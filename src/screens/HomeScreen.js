import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useTodos } from '../hooks/useTodos';
import TodoList from '../components/TodoList';
import AddTodo from '../components/AddTodo';
import ThemeSwitcher from '../components/ThemeSwitcher';

export default function HomeScreen() {
    const { theme } = useTheme();
    const { logout } = useAuth();
    const {
        todos,
        streak,
        addTodo,
        toggleTodo,
        deleteTodo,
        editTodo,
        addSubtask,
        toggleSubtask,
        reorderTodos,
    } = useTodos();

    const completedCount = todos.filter(t => t.completed).length;
    const totalCount = todos.length;
    const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
        <LinearGradient
            colors={[theme.bgApp, theme.bgApp]}
            style={styles.flex}
        >
            <StatusBar barStyle="light-content" backgroundColor={theme.bgApp} />

            {/* Background gradient orbs */}
            <View style={[styles.orbTopLeft, { backgroundColor: theme.gradientStart }]} />
            <View style={[styles.orbBottomRight, { backgroundColor: theme.gradientEnd }]} />

            <SafeAreaView style={styles.flex}>
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.container}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <Text style={[styles.title, { color: theme.textPrimary }]}>
                                    My Tasks
                                </Text>
                                <View style={styles.dateRow}>
                                    <Ionicons name="calendar" size={16} color={theme.primary} />
                                    <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                                        {new Date().toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.headerRight}>
                                <ThemeSwitcher />

                                {/* Streak badge */}
                                <View style={[styles.streakBadge, {
                                    backgroundColor: 'rgba(255,165,0,0.12)',
                                    borderColor: 'rgba(255,165,0,0.2)',
                                }]}>
                                    <Ionicons name="flame" size={16} color="orange" />
                                    <Text style={styles.streakText}>{streak.count}</Text>
                                </View>

                                {/* Logout */}
                                <TouchableOpacity
                                    onPress={logout}
                                    style={[styles.logoutBtn, { backgroundColor: theme.bgGlassBorder }]}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="log-out-outline" size={18} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Progress bar */}
                        <View style={styles.progressSection}>
                            <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                                {progressPercent}% Done
                            </Text>
                            <View style={[styles.progressTrack, { backgroundColor: theme.bgGlassBorder }]}>
                                <LinearGradient
                                    colors={[theme.primary, theme.accent]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.progressFill, { width: `${progressPercent}%` }]}
                                />
                            </View>
                        </View>

                        {/* Todo List */}
                        <View style={styles.listArea}>
                            <TodoList
                                todos={todos}
                                onToggle={toggleTodo}
                                onDelete={deleteTodo}
                                onEdit={editTodo}
                                onAddSubtask={addSubtask}
                                onToggleSubtask={toggleSubtask}
                                onReorder={reorderTodos}
                            />
                        </View>

                        {/* Add Todo (pinned to bottom) */}
                        <View style={styles.addTodoArea}>
                            <AddTodo onAdd={addTodo} />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    orbTopLeft: {
        position: 'absolute',
        top: -120,
        left: -120,
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    orbBottomRight: {
        position: 'absolute',
        bottom: -120,
        right: -120,
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    headerLeft: {
        flex: 1,
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '500',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    streakText: {
        fontWeight: '700',
        color: 'orange',
        fontSize: 14,
    },
    logoutBtn: {
        padding: 8,
        borderRadius: 10,
    },
    progressSection: {
        marginBottom: 16,
    },
    progressLabel: {
        fontSize: 13,
        textAlign: 'right',
        marginBottom: 6,
        fontWeight: '500',
    },
    progressTrack: {
        height: 6,
        borderRadius: 10,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 10,
    },
    listArea: {
        flex: 1,
    },
    addTodoArea: {
        paddingVertical: 12,
    },
});
