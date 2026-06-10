import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import TodoItem from './TodoItem';

export default function TodoList({
    todos,
    onToggle,
    onDelete,
    onEdit,
    onAddSubtask,
    onToggleSubtask,
    onDeleteSubtask,
    onIncrementPomo
}) {
    const { theme } = useTheme();

    if (todos.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: theme.bgGlass, borderColor: theme.bgGlassBorder }]}>
                <Ionicons name="sparkles-outline" size={42} color={theme.primary} style={styles.emptyIcon} />
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                    All Clear!
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                    No tasks in this category. Tap the '+' button below to add one!
                </Text>
            </View>
        );
    }

    return (
        <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContainer}
        >
            {todos.map((todo) => (
                <TodoItem
                    key={todo.id}
                    todo={todo}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    onAddSubtask={onAddSubtask}
                    onToggleSubtask={onToggleSubtask}
                    onDeleteSubtask={onDeleteSubtask}
                    onIncrementPomo={onIncrementPomo}
                />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        paddingBottom: 90, // room for floating action button
    },
    emptyContainer: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    emptyIcon: {
        marginBottom: 14,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
});
