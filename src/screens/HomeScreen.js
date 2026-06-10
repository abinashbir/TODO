import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../context/ThemeContext';
import { useTodos } from '../hooks/useTodos';
import TodoList from '../components/TodoList';
import AddTodo from '../components/AddTodo';
import ThemeSwitcher from '../components/ThemeSwitcher';
import ConfettiEffect from '../components/ConfettiEffect';
import Analytics from '../components/Analytics';
import RecycleBin from '../components/RecycleBin';
import FocusTimer from '../components/FocusTimer';
import { categories } from '../theme/themes';

export default function HomeScreen() {
    const { theme } = useTheme();
    const {
        todos,
        trash,
        streak,
        addTodo,
        toggleTodo,
        restoreTodo,
        purgeTodo,
        clearTrash,
        deleteTodo,
        editTodo,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        incrementPomodoro,
    } = useTodos();

    // UI and Filter/Sort States
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('created'); // created, due, priority
    
    // Modal states
    const [statsVisible, setStatsVisible] = useState(false);
    const [trashVisible, setTrashVisible] = useState(false);
    const [selectedFocusTodo, setSelectedFocusTodo] = useState(null);

    // Confetti animation trigger
    const [confettiTrigger, setConfettiTrigger] = useState(null);

    // Request notification permissions on mount
    useEffect(() => {
        const getPermission = async () => {
            const { status } = await Notifications.getPermissionsAsync();
            if (status !== 'granted') {
                await Notifications.requestPermissionsAsync();
            }
        };
        getPermission();
    }, []);

    // Notification scheduler helper
    const scheduleNotification = async (text, categoryId, dueDate) => {
        try {
            const triggerDate = new Date(dueDate);
            triggerDate.setHours(9, 0, 0, 0); // 9:00 AM on due date
            
            // If the calculated time is already in the past, schedule it 5 seconds from now for immediate feedback
            const isPast = triggerDate.getTime() <= Date.now();
            const triggerTime = isPast ? new Date(Date.now() + 5000) : triggerDate;

            const categoryName = categories.find(c => c.id === categoryId)?.name || 'General';

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: `Task Due Today ⏰`,
                    body: `Remember to: "${text}" [${categoryName}]`,
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: triggerTime,
            });
        } catch (e) {
            console.warn("Failed to schedule notification", e);
        }
    };

    // Intercept Add Todo to schedule reminders if selected
    const handleAddTodo = async (text, categoryId, dueDate, priority, scheduleReminder) => {
        await addTodo(text, categoryId, dueDate, priority);

        if (scheduleReminder && dueDate) {
            const { status } = await Notifications.getPermissionsAsync();
            if (status === 'granted') {
                await scheduleNotification(text, categoryId, dueDate);
            } else {
                Alert.alert("Permission Required", "Please enable notifications in settings to schedule task alerts.");
            }
        }
    };

    const handleToggleTodo = (id) => {
        const todo = todos.find(t => t.id === id);
        if (todo && !todo.completed) {
            // Task is completed, fire confetti
            setConfettiTrigger(Date.now().toString());
        }
        toggleTodo(id);
    };

    // Cycle sorting criteria
    const cycleSort = () => {
        if (sortBy === 'created') setSortBy('due');
        else if (sortBy === 'due') setSortBy('priority');
        else setSortBy('created');
    };

    // Retrieve sorted and filtered list
    const getProcessedTodos = () => {
        // 1. Category Filter
        let list = todos.filter((todo) => {
            if (selectedCategory === 'all') return true;
            return todo.categoryId === selectedCategory;
        });

        // 2. Search Query Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            list = list.filter(t => t.text.toLowerCase().includes(query));
        }

        // 3. Sorting
        return [...list].sort((a, b) => {
            if (sortBy === 'priority') {
                const priorityWeight = { high: 3, medium: 2, low: 1 };
                const weightA = priorityWeight[a.priority || 'medium'] || 2;
                const weightB = priorityWeight[b.priority || 'medium'] || 2;
                return weightB - weightA; // High priority first
            }
            if (sortBy === 'due') {
                if (a.dueDate && b.dueDate) {
                    return new Date(a.dueDate) - new Date(b.dueDate);
                }
                if (a.dueDate) return -1;
                if (b.dueDate) return 1;
                return 0; // neither has due date
            }
            // Default: 'created' newest first
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    };

    const processedTodos = getProcessedTodos();
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

            {/* Modals */}
            <Analytics
                visible={statsVisible}
                onClose={() => setStatsVisible(false)}
                todos={todos}
                trash={trash}
                streak={streak}
            />

            <RecycleBin
                visible={trashVisible}
                onClose={() => setTrashVisible(false)}
                trashList={trash}
                onRestore={restoreTodo}
                onPurge={purgeTodo}
                onClearAll={clearTrash}
            />

            {selectedFocusTodo && (
                <FocusTimer
                    visible={!!selectedFocusTodo}
                    onClose={() => setSelectedFocusTodo(null)}
                    todo={selectedFocusTodo}
                    onFocusComplete={(id) => {
                        incrementPomodoro(id);
                        // Refresh active focus todo reference to reload count UI
                        setSelectedFocusTodo(prev => prev ? { ...prev, pomodoros: (prev.pomodoros || 0) + 1 } : null);
                    }}
                />
            )}

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
                                    Productive Day!
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
                                    <Ionicons name="flame" size={15} color="#ED8936" />
                                    <Text style={styles.streakText}>{streak.count || 0}</Text>
                                </View>

                                {/* Analytics Panel Toggle */}
                                <TouchableOpacity 
                                    style={[styles.headerActionBtn, { backgroundColor: theme.bgGlass, borderColor: theme.bgGlassBorder }]}
                                    onPress={() => setStatsVisible(true)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="bar-chart-outline" size={18} color={theme.primary} />
                                </TouchableOpacity>

                                {/* Trash Drawer Toggle */}
                                <TouchableOpacity 
                                    style={[styles.headerActionBtn, { backgroundColor: theme.bgGlass, borderColor: theme.bgGlassBorder }]}
                                    onPress={() => setTrashVisible(true)}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="trash-outline" size={18} color={theme.accent} />
                                </TouchableOpacity>

                                {/* Theme Cycler */}
                                <ThemeSwitcher />
                            </View>
                        </View>

                        {/* Search & Sort Panel */}
                        <View style={styles.searchSortRow}>
                            <View style={[styles.searchBar, { backgroundColor: theme.bgGlass, borderColor: theme.bgGlassBorder }]}>
                                <Ionicons name="search-outline" size={16} color={theme.textSecondary} />
                                <TextInput
                                    style={[styles.searchInput, { color: theme.textPrimary }]}
                                    placeholder="Search tasks..."
                                    placeholderTextColor={theme.textSecondary}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                                        <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
                                    </TouchableOpacity>
                                )}
                            </View>

                            <TouchableOpacity
                                style={[styles.sortBtn, { backgroundColor: theme.bgGlass, borderColor: theme.bgGlassBorder }]}
                                onPress={cycleSort}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="funnel-outline" size={15} color={theme.primary} />
                                <Text style={[styles.sortText, { color: theme.textPrimary }]}>
                                    Sort: {sortBy === 'created' ? 'Date' : sortBy === 'due' ? 'Due' : 'Prio'}
                                </Text>
                            </TouchableOpacity>
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
                                todos={processedTodos}
                                onToggle={handleToggleTodo}
                                onDelete={deleteTodo}
                                onEdit={editTodo}
                                onAddSubtask={addSubtask}
                                onToggleSubtask={toggleSubtask}
                                onDeleteSubtask={deleteSubtask}
                                onIncrementPomo={incrementPomodoro}
                                onStartFocus={setSelectedFocusTodo}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>

            {/* Bottom Floating sheet creator trigger */}
            <AddTodo onAdd={handleAddTodo} />
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
        gap: 8,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 12,
        borderWidth: 1,
    },
    streakText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#ED8936',
    },
    headerActionBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    searchSortRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 14,
        marginBottom: 16,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 10,
        height: 38,
        gap: 6,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        height: '100%',
        padding: 0,
    },
    sortBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        height: 38,
    },
    sortText: {
        fontSize: 12,
        fontWeight: '600',
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
