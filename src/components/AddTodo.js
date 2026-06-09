import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Keyboard,
    LayoutAnimation,
    UIManager,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { CATEGORIES, CATEGORY_COLORS } from '../theme/themes';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AddTodo({ onAdd }) {
    const { theme } = useTheme();
    const [text, setText] = useState('');
    const [category, setCategory] = useState('personal');
    const [dueDate, setDueDate] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSubmit = () => {
        if (!text.trim()) return;
        const dateStr = dueDate ? dueDate.toISOString().split('T')[0] : null;
        onAdd(text, category, dateStr);
        setText('');
        setDueDate(null);
        setIsExpanded(false);
        Keyboard.dismiss();
    };

    const toggleExpanded = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios'); // iOS keeps the picker open
        if (selectedDate) {
            setDueDate(selectedDate);
        }
    };

    const categoryColor = CATEGORY_COLORS[category] || theme.primary;

    return (
        <View style={styles.wrapper}>
            {/* Expanded options panel */}
            {isExpanded && (
                <View style={[styles.optionsPanel, {
                    backgroundColor: theme.bgGlass,
                    borderColor: theme.bgGlassBorder,
                }]}>
                    {/* Category pills */}
                    <View style={styles.categoryRow}>
                        {CATEGORIES.map(cat => {
                            const isSelected = category === cat.id;
                            const color = CATEGORY_COLORS[cat.id];
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    onPress={() => setCategory(cat.id)}
                                    style={[styles.categoryPill, {
                                        backgroundColor: isSelected ? color : color + '15',
                                        borderColor: isSelected ? '#fff' : 'transparent',
                                        borderWidth: isSelected ? 1.5 : 1,
                                    }]}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.categoryPillText, {
                                        color: isSelected ? '#fff' : color,
                                        fontWeight: isSelected ? '700' : '500',
                                    }]}>
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Date picker trigger */}
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(true)}
                        style={[styles.dateButton, {
                            backgroundColor: theme.bgGlassBorder,
                        }]}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
                        <Text style={[styles.dateButtonText, { color: theme.textSecondary }]}>
                            {dueDate ? dueDate.toLocaleDateString() : 'Set due date'}
                        </Text>
                        {dueDate && (
                            <TouchableOpacity onPress={() => setDueDate(null)}>
                                <Ionicons name="close-circle" size={16} color={theme.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* Main input row */}
            <View style={styles.inputRow}>
                <View style={[styles.inputContainer, {
                    backgroundColor: theme.bgGlass,
                    borderColor: theme.bgGlassBorder,
                }]}>
                    <TextInput
                        value={text}
                        onChangeText={setText}
                        onFocus={toggleExpanded}
                        placeholder="Add a new task..."
                        placeholderTextColor={theme.textSecondary + '80'}
                        onSubmitEditing={handleSubmit}
                        returnKeyType="done"
                        style={[styles.textInput, {
                            color: theme.textPrimary,
                        }]}
                    />
                    {/* Category indicator dot */}
                    <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
                </View>

                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!text.trim()}
                    style={[styles.addButton, {
                        backgroundColor: theme.primary,
                        opacity: text.trim() ? 1 : 0.5,
                    }]}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={28} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Native Date Picker */}
            {showDatePicker && (
                <DateTimePicker
                    value={dueDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        paddingHorizontal: 4,
    },
    optionsPanel: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 14,
        marginBottom: 10,
        gap: 12,
    },
    categoryRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    categoryPill: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 20,
    },
    categoryPillText: {
        fontSize: 13,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    dateButtonText: {
        fontSize: 13,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        paddingRight: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 4,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 16,
        paddingHorizontal: 18,
    },
    categoryDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    addButton: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
});
