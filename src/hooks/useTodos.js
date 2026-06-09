import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import 'react-native-get-random-values'; // polyfill for crypto.randomUUID

export function useTodos() {
    const { currentUser } = useAuth();
    const [todos, setTodos] = useState([]);
    const [streak, setStreak] = useState({ count: 0, lastDate: null });

    // Real-time Sync from Firestore
    useEffect(() => {
        if (!currentUser || !db) {
            setTodos([]);
            return;
        }

        try {
            const q = query(
                collection(db, 'users', currentUser.uid, 'todos'),
                orderBy('createdAt', 'desc')
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedTodos = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTodos(fetchedTodos);
            }, (error) => {
                console.error('Error fetching todos:', error);
            });

            return unsubscribe;
        } catch (error) {
            console.error('Error setting up todos listener:', error);
            return () => {};
        }
    }, [currentUser]);

    const updateStreak = () => {
        const today = new Date().toDateString();
        if (streak.lastDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (streak.lastDate === yesterday.toDateString()) {
            setStreak({ count: streak.count + 1, lastDate: today });
        } else {
            setStreak({ count: 1, lastDate: today });
        }
    };

    const addTodo = async (text, categoryId = 'personal', dueDate = null) => {
        if (!text.trim() || !currentUser || !db) {
            console.error('Cannot add todo: No text, no user logged in, or Firebase not configured.');
            return;
        }
        try {
            await addDoc(collection(db, 'users', currentUser.uid, 'todos'), {
                text: text.trim(),
                completed: false,
                createdAt: new Date().toISOString(),
                categoryId,
                dueDate,
                subtasks: [],
                pomodoros: 0
            });
        } catch (e) {
            console.error('Error adding todo:', e);
        }
    };

    const toggleTodo = async (id) => {
        if (!currentUser || !db) return;
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        try {
            await updateDoc(doc(db, 'users', currentUser.uid, 'todos', id), {
                completed: !todo.completed
            });
            if (!todo.completed) updateStreak();
        } catch (e) {
            console.error('Error toggling todo:', e);
        }
    };

    const deleteTodo = async (id) => {
        if (!currentUser || !db) return;
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'todos', id));
        } catch (e) {
            console.error('Error deleting todo:', e);
        }
    };

    const editTodo = async (id, newText) => {
        if (!currentUser || !db) return;
        try {
            await updateDoc(doc(db, 'users', currentUser.uid, 'todos', id), {
                text: newText.trim()
            });
        } catch (e) {
            console.error('Error editing todo:', e);
        }
    };

    const addSubtask = async (todoId, text) => {
        if (!currentUser || !db) return;
        const todo = todos.find(t => t.id === todoId);
        if (!todo) return;
        const newSubtasks = [
            ...(todo.subtasks || []),
            { id: crypto.randomUUID(), text, completed: false }
        ];
        try {
            await updateDoc(doc(db, 'users', currentUser.uid, 'todos', todoId), {
                subtasks: newSubtasks
            });
        } catch (e) {
            console.error('Error adding subtask:', e);
        }
    };

    const toggleSubtask = async (todoId, subtaskId) => {
        if (!currentUser || !db) return;
        const todo = todos.find(t => t.id === todoId);
        if (!todo) return;
        const newSubtasks = (todo.subtasks || []).map(s =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );
        try {
            await updateDoc(doc(db, 'users', currentUser.uid, 'todos', todoId), {
                subtasks: newSubtasks
            });
        } catch (e) {
            console.error('Error toggling subtask:', e);
        }
    };

    const reorderTodos = (data) => {
        // Optimistic UI update from DraggableFlatList
        setTodos(data);
    };

    const clearCompleted = () => {
        const completed = todos.filter(t => t.completed);
        completed.forEach(t => deleteTodo(t.id));
    };

    return {
        todos,
        streak,
        addTodo,
        toggleTodo,
        deleteTodo,
        editTodo,
        clearCompleted,
        addSubtask,
        toggleSubtask,
        reorderTodos
    };
}
