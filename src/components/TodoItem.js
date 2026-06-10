import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    LayoutAnimation,
    Platform,
    UIManager,
    Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { categories } from '../theme/themes';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export default function TodoItem({
    todo,
    onToggle,
    onDelete,
    onEdit,
    onAddSubtask,
    onToggleSubtask,
    onDeleteSubtask,
    onIncrementPomo
}) {
    const { theme } = useTheme();
    const [expanded, setExpanded] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.text);
    const [newSubtaskText, setNewSubtaskText] = useState('');
    
    // Scale animation for checkbox check
    const checkScale = useRef(new Animated.Value(1)).current;

    const category = categories.find(c => c.id === todo.categoryId) || categories[0];

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const handleToggleCheck = () => {
        Animated.sequence([
            Animated.timing(checkScale, { toValue: 0.75, duration: 80, useNativeDriver: true }),
            Animated.timing(checkScale, { toValue: 1.2, duration: 80, useNativeDriver: true }),
            Animated.timing(checkScale, { toValue: 1, duration: 80, useNativeDriver: true })
        ]).start();

        onToggle(todo.id);
    };

    const handleSaveEdit = () => {
        if (editText.trim() && editText !== todo.text) {
            onEdit(todo.id, editText);
        }
        setIsEditing(false);
    };

    const handleAddSubtaskSubmit = () => {
        if (newSubtaskText.trim()) {
            onAddSubtask(todo.id, newSubtaskText.trim());
            setNewSubtaskText('');
        }
    };

    const completedSubtasks = (todo.subtasks || []).filter(s => s.completed).length;
    const totalSubtasks = (todo.subtasks || []).length;

    return (
        <View style={[
            styles.card,
            {
                backgroundColor: theme.bgCard,
                borderColor: expanded ? theme.primary : theme.bgGlassBorder,
            }
        ]}>
            {/* Main Task Row */}
            <View style={styles.mainRow}>
                {/* Checkbox */}
                <Animated.View style={{ transform: [{ scale: checkScale }] }}>
                    <TouchableOpacity
                        onPress={handleToggleCheck}
                        style={[
                            styles.checkbox,
                            {
                                borderColor: todo.completed ? theme.primary : theme.textSecondary,
                                backgroundColor: todo.completed ? theme.primary : 'transparent',
                            }
                        ]}
                    >
                        {todo.completed && (
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                    </TouchableOpacity>
                </Animated.View>

                {/* Task Title */}
                <View style={styles.titleContainer}>
                    {isEditing ? (
                        <TextInput
                            style={[styles.editInput, { color: theme.textPrimary, borderBottomColor: theme.primary }]}
                            value={editText}
                            onChangeText={setEditText}
                            onBlur={handleSaveEdit}
                            onSubmitEditing={handleSaveEdit}
                            autoFocus={true}
                        />
                    ) : (
                        <TouchableOpacity 
                            onPress={toggleExpand} 
                            activeOpacity={0.8}
                            style={styles.textClickable}
                        >
                            <Text style={[
                                styles.taskText,
                                {
                                    color: todo.completed ? theme.textSecondary : theme.textPrimary,
                                    textDecorationLine: todo.completed ? 'line-through' : 'none',
                                }
                            ]}>
                                {todo.text}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Right Side Icons */}
                <View style={styles.rightIcons}>
                    {/* Category Dot */}
                    <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
                        <Ionicons name={category.icon} size={10} color="#FFFFFF" />
                    </View>

                    {/* Expand/Collapse Button */}
                    <TouchableOpacity onPress={toggleExpand} style={styles.iconButton}>
                        <Ionicons 
                            name={expanded ? 'chevron-up' : 'chevron-down'} 
                            size={18} 
                            color={theme.textSecondary} 
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Subtasks Progress Info when collapsed */}
            {!expanded && totalSubtasks > 0 && (
                <View style={styles.subtaskMiniProgress}>
                    <Ionicons name="git-branch-outline" size={12} color={theme.textSecondary} />
                    <Text style={[styles.miniProgressText, { color: theme.textSecondary }]}>
                        {completedSubtasks}/{totalSubtasks} subtasks
                    </Text>
                </View>
            )}

            {/* Expandable Details Area */}
            {expanded && (
                <View style={[styles.detailsContainer, { borderTopColor: theme.divider }]}>
                    {/* Due Date & Pomo row */}
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <Ionicons name="calendar-outline" size={14} color={theme.textSecondary} />
                            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                                {todo.dueDate ? todo.dueDate : 'No due date'}
                            </Text>
                        </View>

                        {/* Pomodoro Focus session tracker */}
                        <View style={styles.metaItem}>
                            <Text style={styles.metaTextEmoji}>🍅</Text>
                            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                                {todo.pomodoros || 0} focused
                            </Text>
                            <TouchableOpacity
                                style={[styles.pomoIncrementBtn, { backgroundColor: theme.bgGlassBorder }]}
                                onPress={() => onIncrementPomo(todo.id)}
                            >
                                <Ionicons name="play-outline" size={10} color={theme.primary} />
                                <Text style={[styles.pomoAddText, { color: theme.primary }]}>+1</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Subtasks list */}
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                        Subtasks
                    </Text>

                    {(todo.subtasks || []).map((sub) => (
                        <View key={sub.id} style={styles.subtaskRow}>
                            <TouchableOpacity
                                style={[
                                    styles.subtaskCheckbox,
                                    { borderColor: sub.completed ? theme.primary : theme.textSecondary }
                                ]}
                                onPress={() => onToggleSubtask(todo.id, sub.id)}
                            >
                                {sub.completed && (
                                    <View style={[styles.subtaskChecked, { backgroundColor: theme.primary }]} />
                                )}
                            </TouchableOpacity>
                            <Text style={[
                                styles.subtaskText,
                                {
                                    color: sub.completed ? theme.textSecondary : theme.textPrimary,
                                    textDecorationLine: sub.completed ? 'line-through' : 'none'
                                }
                            ]}>
                                {sub.text}
                            </Text>
                            <TouchableOpacity 
                                onPress={() => onDeleteSubtask(todo.id, sub.id)}
                                style={styles.subtaskDelete}
                            >
                                <Ionicons name="trash-outline" size={14} color="#E53E3E" />
                            </TouchableOpacity>
                        </View>
                    ))}

                    {/* Add Subtask Input */}
                    <View style={[styles.addSubtaskContainer, { backgroundColor: theme.bgGlass, borderColor: theme.bgGlassBorder }]}>
                        <TextInput
                            style={[styles.subtaskInput, { color: theme.textPrimary }]}
                            placeholder="Add a subtask..."
                            placeholderTextColor={theme.textSecondary}
                            value={newSubtaskText}
                            onChangeText={setNewSubtaskText}
                            onSubmitEditing={handleAddSubtaskSubmit}
                        />
                        <TouchableOpacity onPress={handleAddSubtaskSubmit}>
                            <Ionicons name="arrow-forward-circle" size={20} color={theme.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Action buttons */}
                    <View style={styles.actionsRow}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.bgGlassBorder }]}
                            onPress={() => setIsEditing(true)}
                        >
                            <Ionicons name="pencil-outline" size={16} color={theme.textSecondary} />
                            <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>Edit Title</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: 'rgba(229, 62, 62, 0.1)' }]}
                            onPress={() => onDelete(todo.id)}
                        >
                            <Ionicons name="trash-outline" size={16} color="#E53E3E" />
                            <Text style={[styles.actionBtnText, { color: '#E53E3E' }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
        padding: 14,
        overflow: 'hidden',
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    titleContainer: {
        flex: 1,
    },
    textClickable: {
        paddingVertical: 4,
    },
    taskText: {
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 20,
    },
    editInput: {
        fontSize: 15,
        fontWeight: '600',
        paddingVertical: 2,
        borderBottomWidth: 1.5,
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconButton: {
        padding: 4,
    },
    subtaskMiniProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        marginLeft: 34,
    },
    miniProgressText: {
        fontSize: 12,
        fontWeight: '500',
    },
    detailsContainer: {
        borderTopWidth: 1,
        marginTop: 12,
        paddingTop: 12,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
        fontWeight: '500',
    },
    metaTextEmoji: {
        fontSize: 13,
    },
    pomoIncrementBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 8,
        gap: 4,
        marginLeft: 4,
    },
    pomoAddText: {
        fontSize: 10,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    subtaskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingLeft: 4,
    },
    subtaskCheckbox: {
        width: 14,
        height: 14,
        borderRadius: 4,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    subtaskChecked: {
        width: 8,
        height: 8,
        borderRadius: 2,
    },
    subtaskText: {
        fontSize: 13,
        fontWeight: '500',
        flex: 1,
    },
    subtaskDelete: {
        padding: 4,
    },
    addSubtaskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 10,
        height: 38,
        marginTop: 4,
        marginBottom: 14,
    },
    subtaskInput: {
        flex: 1,
        fontSize: 13,
        height: '100%',
        padding: 0,
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 6,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        gap: 6,
    },
    actionBtnText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
