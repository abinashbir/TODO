import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const TODOS_STORAGE_KEY = 'todoapp_todos';
const STREAK_STORAGE_KEY = 'todoapp_streak';

export function useTodos() {
    const [todos, setTodos] = useState([]);
    const [streak, setStreak] = useState({ count: 0, lastDate: null });
    const [loading, setLoading] = useState(true);

    // Load todos and streak from AsyncStorage on mount
    useEffect(() => {
        const loadLocalData = async () => {
            try {
                const storedTodos = await AsyncStorage.getItem(TODOS_STORAGE_KEY);
                if (storedTodos) {
                    setTodos(JSON.parse(storedTodos));
                }

                const storedStreak = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
                if (storedStreak) {
                    setStreak(JSON.parse(storedStreak));
                }
            } catch (error) {
                console.error('Error loading data from AsyncStorage:', error);
            } finally {
                setLoading(false);
            }
        };

        loadLocalData();
    }, []);

    // Save helper functions
    const saveTodos = async (newTodos) => {
        try {
            await AsyncStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(newTodos));
        } catch (error) {
            console.error('Error saving todos to AsyncStorage:', error);
        }
    };

    const saveStreak = async (newStreak) => {
        try {
            await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(newStreak));
        } catch (error) {
            console.error('Error saving streak to AsyncStorage:', error);
        }
    };

    const updateStreakOnCompletion = () => {
        const todayStr = new Date().toDateString();
        if (streak.lastDate === todayStr) return; // Already completed a task today

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        let newStreak;
        if (streak.lastDate === yesterdayStr) {
            // Consecutive day completion
            newStreak = { count: streak.count + 1, lastDate: todayStr };
        } else {
            // Streak broken or new streak
            newStreak = { count: 1, lastDate: todayStr };
        }
        
        setStreak(newStreak);
        saveStreak(newStreak);
    };

    const addTodo = async (text, categoryId = 'personal', dueDate = null) => {
        if (!text.trim()) return;

        const newTodo = {
            id: Crypto.randomUUID(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
            categoryId,
            dueDate,
            subtasks: [],
            pomodoros: 0
        };

        const newTodos = [newTodo, ...todos];
        setTodos(newTodos);
        await saveTodos(newTodos);
    };

    const toggleTodo = async (id) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        const willBeCompleted = !todo.completed;
        const newTodos = todos.map(t =>
            t.id === id ? { ...t, completed: willBeCompleted } : t
        );
        setTodos(newTodos);
        await saveTodos(newTodos);

        if (willBeCompleted) {
            updateStreakOnCompletion();
        }
    };

    const deleteTodo = async (id) => {
        const newTodos = todos.filter(t => t.id !== id);
        setTodos(newTodos);
        await saveTodos(newTodos);
    };

    const editTodo = async (id, newText) => {
        if (!newText.trim()) return;
        const newTodos = todos.map(t =>
            t.id === id ? { ...t, text: newText.trim() } : t
        );
        setTodos(newTodos);
        await saveTodos(newTodos);
    };

    const addSubtask = async (todoId, text) => {
        if (!text.trim()) return;
        const todo = todos.find(t => t.id === todoId);
        if (!todo) return;

        const newSubtasks = [
            ...(todo.subtasks || []),
            { id: Crypto.randomUUID(), text: text.trim(), completed: false }
        ];

        const newTodos = todos.map(t =>
            t.id === todoId ? { ...t, subtasks: newSubtasks } : t
        );
        setTodos(newTodos);
        await saveTodos(newTodos);
    };

    const toggleSubtask = async (todoId, subtaskId) => {
        const todo = todos.find(t => t.id === todoId);
        if (!todo) return;

        const newSubtasks = (todo.subtasks || []).map(s =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );

        const newTodos = todos.map(t =>
            t.id === todoId ? { ...t, subtasks: newSubtasks } : t
        );
        setTodos(newTodos);
        await saveTodos(newTodos);
    };

    const deleteSubtask = async (todoId, subtaskId) => {
        const todo = todos.find(t => t.id === todoId);
        if (!todo) return;

        const newSubtasks = (todo.subtasks || []).filter(s => s.id !== subtaskId);

        const newTodos = todos.map(t =>
            t.id === todoId ? { ...t, subtasks: newSubtasks } : t
        );
        setTodos(newTodos);
        await saveTodos(newTodos);
    };

    const incrementPomodoro = async (todoId) => {
        const newTodos = todos.map(t =>
            t.id === todoId ? { ...t, pomodoros: (t.pomodoros || 0) + 1 } : t
        );
        setTodos(newTodos);
        await saveTodos(newTodos);
    };

    const reorderTodos = async (data) => {
        setTodos(data);
        await saveTodos(data);
    };

    const clearCompleted = async () => {
        const newTodos = todos.filter(t => !t.completed);
        setTodos(newTodos);
        await saveTodos(newTodos);
    };

    return {
        todos,
        streak,
        loading,
        addTodo,
        toggleTodo,
        deleteTodo,
        editTodo,
        clearCompleted,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        incrementPomodoro,
        reorderTodos
    };
}
