import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTodos } from '../hooks/useTodos';
import TodoList from '../components/TodoList';
import AddTodo from '../components/AddTodo';
import ThemeSwitcher from '../components/ThemeSwitcher';
import ConfettiEffect from '../components/ConfettiEffect';
import { categories } from '../theme/themes';

export default function HomeScreen() {
    const { theme } = useTheme();
    const {
        todos,
        streak,
        addTodo,
        toggleTodo,
        deleteTodo,
        editTodo,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        incrementPomodoro,
    } = useTodos();

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [confettiTrigger, setConfettiTrigger] = useState(null);

    const handleToggleTodo = (id) => {
        const todo = todos.find(t => t.id === id);
        if (todo && !todo.completed) {
            // Task is transitioning to completed, fire confetti
            setConfettiTrigger(Date.now().toString());
        }
        toggleTodo(id);
    };

    // Filter tasks
    const filteredTodos = todos.filter((todo) => {
        if (selectedCategory === 'all') return true;
        return todo.categoryId === selectedCategory;
    });

    const completedCount = todos.filter(t => t.completed).length;
    const totalCount = todos.length;
    const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    return (
        <LinearGradient
            colors={[theme.gradientStart, theme.gradientEnd]}
            style={styles.flex}
        >
            <StatusBar barStyle="light-content" backgroundColor={theme.gradientStart} />
            <ConfettiEffect trigger={confettiTrigger} />

            <SafeAreaView style={styles.flex} edges={['top', 'left', 'right']}>
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.container}>
                        {/* Header Row */}
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>
                                    Hello! Ready to focus?
                                </Text>
                                <Text style={[styles.title, { color: theme.textPrimary }]}>
                                    My Tasks
                                </Text>
                            </View>

                            <View style={styles.headerRight}>
                                {/* Streak Badge */}
                                <View 
                                    style={[
                                        styles.streakBadge, 
                                        { 
                                            backgroundColor: 'rgba(237, 137, 54, 0.12)',
                                            borderColor: 'rgba(237, 137, 54, 0.25)' 
                                        }
                                    ]}
                                >
                                    <Ionicons name="flame" size={16} color="#ED8936" />
                                    <Text style={styles.streakText}>{streak.count || 0}</Text>
                                </View>

                                {/* Theme Cycler */}
                                <ThemeSwitcher />
                            </View>
                        </View>

                        {/* Date row */}
                        <View style={styles.dateRow}>
                            <Ionicons name="calendar-outline" size={16} color={theme.primary} />
                            <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </Text>
                        </View>

                        {/* Progress Section */}
                        <View style={[styles.progressSection, { backgroundColor: theme.bgGlass, borderColor: theme.bgGlassBorder }]}>
                            <View style={styles.progressTextRow}>
                                <Text style={[styles.progressTitle, { color: theme.textPrimary }]}>
                                    Daily Progress
                                </Text>
                                <Text style={[styles.progressPercentText, { color: theme.primary }]}>
                                    {progressPercent}% Done
                                </Text>
                            </View>
                            <View style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                                <LinearGradient
                                    colors={[theme.primary, theme.accent]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={[styles.progressFill, { width: `${progressPercent}%` }]}
                                />
                            </View>
                            <Text style={[styles.progressSummary, { color: theme.textSecondary }]}>
                                {completedCount} of {totalCount} tasks completed
                            </Text>
                        </View>

                        {/* Category Selector Tabs */}
                        <View style={styles.tabsContainer}>
                            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
                                {/* 'All' Tab */}
                                <TouchableOpacity
                                    style={[
                                        styles.tab,
                                        {
                                            backgroundColor: selectedCategory === 'all' ? theme.primary : 'transparent',
                                            borderColor: selectedCategory === 'all' ? theme.primary : theme.bgGlassBorder,
                                        }
                                    ]}
                                    onPress={() => setSelectedCategory('all')}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[
                                        styles.tabText,
                                        { color: selectedCategory === 'all' ? '#FFFFFF' : theme.textSecondary }
                                    ]}>
                                        All Tasks
                                    </Text>
                                </TouchableOpacity>

                                {/* Specific Category Tabs */}
                                {categories.map((cat) => {
                                    const isSelected = selectedCategory === cat.id;
                                    return (
                                        <TouchableOpacity
                                            key={cat.id}
                                            style={[
                                                styles.tab,
                                                {
                                                    backgroundColor: isSelected ? cat.color : 'transparent',
                                                    borderColor: isSelected ? cat.color : theme.bgGlassBorder,
                                                }
                                            ]}
                                            onPress={() => setSelectedCategory(cat.id)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons 
                                                name={cat.icon} 
                                                size={13} 
                                                color={isSelected ? '#FFFFFF' : theme.textSecondary} 
                                                style={styles.tabIcon}
                                            />
                                            <Text style={[
                                                styles.tabText,
                                                { color: isSelected ? '#FFFFFF' : theme.textSecondary }
                                            ]}>
                                                {cat.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {/* Todos List */}
                        <View style={styles.listArea}>
                            <TodoList
                                todos={filteredTodos}
                                onToggle={handleToggleTodo}
                                onDelete={deleteTodo}
                                onEdit={editTodo}
                                onAddSubtask={addSubtask}
                                onToggleSubtask={toggleSubtask}
                                onDeleteSubtask={deleteSubtask}
                                onIncrementPomo={incrementPomodoro}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>

            {/* Bottom Floating sheet creator trigger */}
            <AddTodo onAdd={addTodo} />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flex: 1,
    },
    welcomeText: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    streakText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ED8936',
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 10,
        marginBottom: 16,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '500',
    },
    progressSection: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        marginBottom: 18,
    },
    progressTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    progressTitle: {
        fontSize: 14,
        fontWeight: '700',
    },
    progressPercentText: {
        fontSize: 14,
        fontWeight: '700',
    },
    progressTrack: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressSummary: {
        fontSize: 12,
        fontWeight: '500',
    },
    tabsContainer: {
        marginBottom: 16,
        marginHorizontal: -20,
    },
    tabsScroll: {
        paddingHorizontal: 20,
        gap: 8,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
    },
    tabIcon: {
        marginRight: 6,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
    },
    listArea: {
        flex: 1,
    },
});
