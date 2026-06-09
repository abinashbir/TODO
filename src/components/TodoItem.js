import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Animated,
    LayoutAnimation,
    Platform,
    UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { CATEGORY_COLORS } from '../theme/themes';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TodoItem({ todo, onToggle, onDelete, onEdit, onAddSubtask, onToggleSubtask, drag, isActive }) {
    const { theme } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);
    const [showSubtasks, setShowSubtasks] = useState(false);
    const [newSubtask, setNewSubtask] = useState('');
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handleToggle = () => {
        // Bounce animation
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.95,
                duration: 80,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                tension: 200,
                useNativeDriver: true,
            }),
        ]).start();

        onToggle(todo.id);
    };

    const handleEditSubmit = () => {
        if (editText.trim()) {
            onEdit(todo.id, editText);
        }
        setIsEditing(false);
    };

    const handleSubtaskSubmit = () => {
        if (!newSubtask.trim()) return;
        onAddSubtask(todo.id, newSubtask);
        setNewSubtask('');
    };

    const toggleSubtasksView = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowSubtasks(!showSubtasks);
    };

    const categoryColor = CATEGORY_COLORS[todo.categoryId] || theme.textSecondary;

    return (
        <Animated.View style={[
            styles.wrapper,
            { transform: [{ scale: scaleAnim }] },
            isActive && styles.dragging,
        ]}>
            <TouchableOpacity
                onLongPress={drag}
                delayLongPress={200}
                activeOpacity={0.9}
                style={[styles.container, {
                    backgroundColor: todo.completed
                        ? theme.bgGlass.replace('0.85', '0.4').replace('0.75', '0.4')
                        : theme.bgGlass,
                    borderColor: theme.bgGlassBorder,
                    opacity: todo.completed ? 0.7 : 1,
                }]}
            >
                {/* Drag handle */}
                <View style={styles.dragHandle}>
                    <Ionicons name="reorder-three" size={20} color={theme.textSecondary} />
                </View>

                {/* Checkbox */}
                <TouchableOpacity onPress={handleToggle} style={[styles.checkbox, {
                    borderColor: theme.primary,
                    backgroundColor: todo.completed ? theme.primary : 'transparent',
                }]}>
                    {todo.completed && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                </TouchableOpacity>

                {/* Content */}
                <View style={styles.content}>
                    {isEditing ? (
                        <TextInput
                            value={editText}
                            onChangeText={setEditText}
                            onSubmitEditing={handleEditSubmit}
                            onBlur={handleEditSubmit}
                            autoFocus
                            style={[styles.editInput, {
                                color: theme.textPrimary,
                                borderColor: theme.primary,
                            }]}
                            returnKeyType="done"
                        />
                    ) : (
                        <View>
                            <Text style={[styles.todoText, {
                                color: todo.completed ? theme.textSecondary : theme.textPrimary,
                                textDecorationLine: todo.completed ? 'line-through' : 'none',
                            }]}>
                                {todo.text}
                            </Text>

                            {/* Metadata row */}
                            <View style={styles.metaRow}>
                                <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '30' }]}>
                                    <Ionicons name="pricetag" size={10} color={categoryColor} />
                                    <Text style={[styles.categoryText, { color: categoryColor }]}>
                                        {todo.categoryId}
                                    </Text>
                                </View>

                                {todo.dueDate && (
                                    <View style={[styles.dateBadge, { backgroundColor: theme.bgGlassBorder }]}>
                                        <Ionicons name="calendar-outline" size={10} color={theme.textSecondary} />
                                        <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                                            {new Date(todo.dueDate).toLocaleDateString()}
                                        </Text>
                                    </View>
                                )}

                                {todo.pomodoros > 0 && (
                                    <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                                        🔥 {todo.pomodoros}
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}
                </View>

                {/* Action buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity onPress={toggleSubtasksView} style={styles.actionBtn}>
                        <Ionicons
                            name={showSubtasks ? 'chevron-down' : 'chevron-forward'}
                            size={18}
                            color={theme.textSecondary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setEditText(todo.text);
                            setIsEditing(!isEditing);
                        }}
                        style={styles.actionBtn}
                    >
                        <Ionicons
                            name={isEditing ? 'close' : 'create-outline'}
                            size={18}
                            color={theme.textSecondary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(todo.id)} style={styles.actionBtn}>
                        <Ionicons name="trash-outline" size={18} color={theme.danger} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>

            {/* Subtasks panel */}
            {showSubtasks && (
                <View style={[styles.subtasksPanel, { borderColor: theme.bgGlassBorder }]}>
                    {(todo.subtasks || []).map(subtask => (
                        <TouchableOpacity
                            key={subtask.id}
                            onPress={() => onToggleSubtask(todo.id, subtask.id)}
                            style={styles.subtaskRow}
                        >
                            <View style={[styles.subtaskCheckbox, {
                                borderColor: theme.textSecondary,
                                backgroundColor: subtask.completed ? theme.textSecondary : 'transparent',
                            }]}>
                                {subtask.completed && (
                                    <Ionicons name="checkmark" size={10} color={theme.bgApp} />
                                )}
                            </View>
                            <Text style={[styles.subtaskText, {
                                color: subtask.completed ? theme.textSecondary : theme.textPrimary,
                                textDecorationLine: subtask.completed ? 'line-through' : 'none',
                            }]}>
                                {subtask.text}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    <View style={styles.addSubtaskRow}>
                        <TextInput
                            placeholder="Add subtask..."
                            placeholderTextColor={theme.textSecondary + '80'}
                            value={newSubtask}
                            onChangeText={setNewSubtask}
                            onSubmitEditing={handleSubtaskSubmit}
                            returnKeyType="done"
                            style={[styles.subtaskInput, {
                                color: theme.textPrimary,
                                backgroundColor: theme.bgGlass,
                                borderColor: theme.bgGlassBorder,
                            }]}
                        />
                    </View>
                </View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 10,
    },
    dragging: {
        opacity: 0.8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    dragHandle: {
        padding: 4,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    todoText: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 22,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 6,
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 10,
    },
    dateText: {
        fontSize: 11,
    },
    actions: {
        flexDirection: 'row',
        gap: 4,
    },
    actionBtn: {
        padding: 6,
    },
    editInput: {
        fontSize: 16,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderRadius: 8,
    },
    subtasksPanel: {
        marginLeft: 52,
        paddingTop: 8,
        paddingBottom: 4,
        borderLeftWidth: 2,
        paddingLeft: 16,
    },
    subtaskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    subtaskCheckbox: {
        width: 16,
        height: 16,
        borderRadius: 4,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subtaskText: {
        fontSize: 14,
    },
    addSubtaskRow: {
        marginTop: 4,
    },
    subtaskInput: {
        fontSize: 14,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
    },
});
