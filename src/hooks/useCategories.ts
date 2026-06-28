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

export interface Category {
  id: string;
  userId: string;
  label: string;
  color: string;
  order: number;
}

const DEFAULT_CATEGORIES = [
  { label: '수업준비', color: '#dceeb1' },
  { label: '업무', color: '#c5b0f4' },
  { label: '개인', color: '#f4ecd6' }
];

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setCategories([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'categories'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const newCats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      
      newCats.sort((a, b) => a.order - b.order);

      // Initialize default categories if none exist for this user
      if (newCats.length === 0 && !snapshot.metadata.hasPendingWrites) {
        const batch = writeBatch(db);
        DEFAULT_CATEGORIES.forEach((cat, idx) => {
          const newDocRef = doc(collection(db, 'categories'));
          batch.set(newDocRef, {
            userId: currentUser.uid,
            label: cat.label,
            color: cat.color,
            order: idx
          });
        });
        await batch.commit();
        // The snapshot listener will trigger again automatically after commit
      } else {
        setCategories(newCats);
        setLoading(false);
      }
    }, (error) => {
      console.error("Firestore error:", error);
    });

    return unsubscribe;
  }, [currentUser]);

  const addCategory = async (label: string, color: string) => {
    if (!currentUser) return;
    const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.order)) : 0;
    
    await addDoc(collection(db, 'categories'), {
      userId: currentUser.uid,
      label,
      color,
      order: maxOrder + 1
    });
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    const ref = doc(db, 'categories', id);
    await updateDoc(ref, updates);
  };

  const deleteCategory = async (id: string) => {
    const ref = doc(db, 'categories', id);
    await deleteDoc(ref);
  };

  const reorderCategories = async (reorderedCategories: Category[]) => {
    setCategories(reorderedCategories);
    const batch = writeBatch(db);
    reorderedCategories.forEach((cat, index) => {
      const ref = doc(db, 'categories', cat.id);
      batch.update(ref, { order: index });
    });
    await batch.commit();
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories
  };
}
