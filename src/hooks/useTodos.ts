import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface Todo {
  id: string;
  userId: string;
  text: string;
  completed: boolean;
  important: boolean;
  category: string;
  order: number;
  dueDate?: string;
  createdAt: number;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setTodos([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'todos'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newTodos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Todo[];
      
      // Sort locally to avoid Firebase composite index requirements
      newTodos.sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return b.createdAt - a.createdAt;
      });

      setTodos(newTodos);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
    });

    return unsubscribe;
  }, [currentUser]);

  const addTodo = async (text: string, category: string = 'block-lime') => {
    if (!currentUser) return;
    
    // Find the max order
    const maxOrder = todos.length > 0 ? Math.max(...todos.map(t => t.order)) : 0;

    await addDoc(collection(db, 'todos'), {
      userId: currentUser.uid,
      text,
      completed: false,
      important: false,
      category,
      order: maxOrder + 1,
      createdAt: Date.now()
    });
  };

  const updateTodo = async (id: string, updates: Partial<Todo>) => {
    // Optimistic Update
    setTodos(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    const todoRef = doc(db, 'todos', id);
    await updateDoc(todoRef, updates);
  };

  const deleteTodo = async (id: string) => {
    // Optimistic Update
    setTodos(prev => prev.filter(t => t.id !== id));
    const todoRef = doc(db, 'todos', id);
    await deleteDoc(todoRef);
  };

  const reorderTodos = async (reorderedTodos: Todo[]) => {
    // Update local state immediately for snappy UI
    setTodos(reorderedTodos);

    const batch = writeBatch(db);
    reorderedTodos.forEach((todo, index) => {
      const todoRef = doc(db, 'todos', todo.id);
      batch.update(todoRef, { order: index });
    });
    
    await batch.commit();
  };

  return {
    todos,
    loading,
    addTodo,
    updateTodo,
    deleteTodo,
    reorderTodos
  };
}
