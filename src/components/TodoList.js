import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import TodoItem from './TodoItem';

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Done' },
];

export default function TodoList({ todos, onToggle, onDelete, onEdit, onAddSubtask, onToggleSubtask, onReorder }) {
    const { theme } = useTheme();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    const filteredTodos = todos
        .filter(t => {
            if (filter === 'active') return !t.completed;
            if (filter === 'completed') return t.completed;
            return true;
        })
        .filter(t => t.text.toLowerCase().includes(search.toLowerCase()));

    const handleDragEnd = ({ data }) => {
        onReorder(data);
    };

    const renderItem = ({ item, drag, isActive }) => (
        <TodoItem
            todo={item}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
            onAddSubtask={onAddSubtask}
            onToggleSubtask={onToggleSubtask}
            drag={drag}
            isActive={isActive}
        />
    );

    return (
        <View style={styles.container}>
            {/* Search + Filter row */}
            <View style={styles.controlsRow}>
                <View style={[styles.searchContainer, {
                    backgroundColor: theme.bgGlass,
                    borderColor: theme.bgGlassBorder,
                }]}>
                    <Ionicons name="search" size={16} color={theme.textSecondary + '80'} />
                    <TextInput
                        placeholder="Search tasks..."
                        placeholderTextColor={theme.textSecondary + '60'}
                        value={search}
                        onChangeText={setSearch}
                        style={[styles.searchInput, { color: theme.textPrimary }]}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Filter tabs */}
            <View style={styles.filterRow}>
                {FILTERS.map(f => {
                    const isActive = filter === f.key;
                    return (
                        <TouchableOpacity
                            key={f.key}
                            onPress={() => setFilter(f.key)}
                            style={[styles.filterTab, {
                                backgroundColor: isActive ? theme.primary + '25' : 'transparent',
                                borderColor: isActive ? theme.primary : 'transparent',
                            }]}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.filterText, {
                                color: isActive ? theme.primary : theme.textSecondary,
                                fontWeight: isActive ? '600' : '400',
                            }]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Todo List */}
            {filteredTodos.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="checkmark-done-circle-outline" size={56} color={theme.textSecondary + '40'} />
                    <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>
                        No tasks found
                    </Text>
                    <Text style={[styles.emptySubtext, { color: theme.textSecondary + '80' }]}>
                        {filter === 'all' ? 'Add your first task below!' : `No ${filter} tasks`}
                    </Text>
                </View>
            ) : (
                <DraggableFlatList
                    data={filteredTodos}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    onDragEnd={handleDragEnd}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    activationDistance={10}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    controlsRow: {
        marginBottom: 10,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 12,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 10,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 14,
    },
    filterTab: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterText: {
        fontSize: 13,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        gap: 8,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '500',
    },
    emptySubtext: {
        fontSize: 14,
    },
    listContent: {
        paddingBottom: 20,
    },
});
