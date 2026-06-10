import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { categories } from '../theme/themes';

export default function AddTodo({ onAdd }) {
    const { theme } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);
    const [text, setText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('personal');
    const [selectedDatePreset, setSelectedDatePreset] = useState('today'); // today, tomorrow, nextWeek, none
    const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);

    const handleAdd = () => {
        if (!text.trim()) return;

        let dueDate = null;
        const now = new Date();
        if (selectedDatePreset === 'today') {
            dueDate = now.toDateString();
        } else if (selectedDatePreset === 'tomorrow') {
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            dueDate = tomorrow.toDateString();
        } else if (selectedDatePreset === 'nextWeek') {
            const nextWeek = new Date(now);
            nextWeek.setDate(now.getDate() + 7);
            dueDate = nextWeek.toDateString();
        }

        onAdd(text, selectedCategory, dueDate);
        
        // Reset states
        setText('');
        setSelectedCategory('personal');
        setSelectedDatePreset('today');
        setEstimatedPomodoros(1);
        setModalVisible(false);
    };

    const datePresets = [
        { id: 'today', label: 'Today', icon: 'calendar-number-outline' },
        { id: 'tomorrow', label: 'Tomorrow', icon: 'calendar-outline' },
        { id: 'nextWeek', label: 'Next Week', icon: 'chevron-forward-circle-outline' },
        { id: 'none', label: 'No Date', icon: 'close-circle-outline' }
    ];

    return (
        <View>
            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fabContainer}
                activeOpacity={0.8}
                onPress={() => setModalVisible(true)}
            >
                <LinearGradient
                    colors={[theme.primary, theme.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fab}
                >
                    <Ionicons name="add" size={28} color="#FFFFFF" />
                </LinearGradient>
            </TouchableOpacity>

            {/* Bottom Sheet Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                style={[
                                    styles.modalContent,
                                    {
                                        backgroundColor: theme.bgApp,
                                        borderTopColor: theme.bgGlassBorder,
                                    }
                                ]}
                            >
                                <View style={styles.dragBar} />
                                
                                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                                    Create New Task
                                </Text>

                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            color: theme.textPrimary,
                                            backgroundColor: theme.bgGlass,
                                            borderColor: theme.bgGlassBorder,
                                        }
                                    ]}
                                    placeholder="What needs to be done?"
                                    placeholderTextColor={theme.textSecondary}
                                    value={text}
                                    onChangeText={setText}
                                    autoFocus={true}
                                />

                                {/* Category Selector */}
                                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                                    Category
                                </Text>
                                <View style={styles.categoriesContainer}>
                                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                                        {categories.map((cat) => {
                                            const isSelected = selectedCategory === cat.id;
                                            return (
                                                <TouchableOpacity
                                                    key={cat.id}
                                                    style={[
                                                        styles.categoryChip,
                                                        {
                                                            backgroundColor: isSelected ? cat.color : theme.bgGlass,
                                                            borderColor: isSelected ? cat.color : theme.bgGlassBorder,
                                                        }
                                                    ]}
                                                    onPress={() => setSelectedCategory(cat.id)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Ionicons 
                                                        name={cat.icon} 
                                                        size={14} 
                                                        color={isSelected ? '#FFFFFF' : theme.textSecondary} 
                                                        style={styles.chipIcon}
                                                    />
                                                    <Text
                                                        style={[
                                                            styles.categoryText,
                                                            { color: isSelected ? '#FFFFFF' : theme.textSecondary }
                                                        ]}
                                                    >
                                                        {cat.name}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>

                                {/* Date Presets */}
                                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                                    Due Date
                                </Text>
                                <View style={styles.presetsContainer}>
                                    {datePresets.map((preset) => {
                                        const isSelected = selectedDatePreset === preset.id;
                                        return (
                                            <TouchableOpacity
                                                key={preset.id}
                                                style={[
                                                    styles.presetChip,
                                                    {
                                                        backgroundColor: isSelected ? 'rgba(128, 90, 213, 0.12)' : 'transparent',
                                                        borderColor: isSelected ? theme.primary : 'transparent',
                                                    }
                                                ]}
                                                onPress={() => setSelectedDatePreset(preset.id)}
                                                activeOpacity={0.7}
                                            >
                                                <Ionicons 
                                                    name={preset.icon} 
                                                    size={16} 
                                                    color={isSelected ? theme.primary : theme.textSecondary} 
                                                />
                                                <Text
                                                    style={[
                                                        styles.presetText,
                                                        { color: isSelected ? theme.textPrimary : theme.textSecondary }
                                                    ]}
                                                >
                                                    {preset.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* Pomodoro Estimation */}
                                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                                    Estimated Pomodoros (Focus sessions)
                                </Text>
                                <View style={styles.pomoContainer}>
                                    {[1, 2, 3, 4, 5].map((num) => {
                                        const isActive = num <= estimatedPomodoros;
                                        return (
                                            <TouchableOpacity
                                                key={num}
                                                onPress={() => setEstimatedPomodoros(num)}
                                                style={styles.pomoButton}
                                                activeOpacity={0.7}
                                            >
                                                <Text style={[
                                                    styles.pomoIcon, 
                                                    { opacity: isActive ? 1 : 0.25 }
                                                ]}>
                                                    🍅
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {/* Create Button */}
                                <TouchableOpacity
                                    style={styles.createButtonContainer}
                                    activeOpacity={0.8}
                                    onPress={handleAdd}
                                >
                                    <LinearGradient
                                        colors={[theme.primary, theme.accent]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.createButton}
                                    >
                                        <Text style={styles.createButtonText}>Create Task</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </KeyboardAvoidingView>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    fabContainer: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        zIndex: 99,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderTopWidth: 1,
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        paddingTop: 12,
    },
    dragBar: {
        width: 40,
        height: 5,
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    categoriesContainer: {
        marginBottom: 16,
        marginHorizontal: -24,
    },
    scrollContent: {
        paddingHorizontal: 24,
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        borderWidth: 1,
    },
    chipIcon: {
        marginRight: 6,
    },
    categoryText: {
        fontSize: 13,
        fontWeight: '600',
    },
    presetsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    presetChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    presetText: {
        fontSize: 13,
        fontWeight: '500',
    },
    pomoContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    pomoButton: {
        padding: 4,
    },
    pomoIcon: {
        fontSize: 24,
    },
    createButtonContainer: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    createButton: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
