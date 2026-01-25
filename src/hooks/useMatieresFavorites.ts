import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionAuth } from '@/contexts/SessionAuthContext';

const FAVORITES_KEY = 'matieres_favorites';

export function useMatieresFavorites() {
  const { user, isLoading: authLoading } = useSessionAuth();
  const userId = user?.id ?? null;
  
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load favorites when auth state changes
  useEffect(() => {
    if (authLoading) return;

    const loadFavorites = async () => {
      setIsLoading(true);
      
      if (userId) {
        // Load from database for authenticated users
        const { data, error } = await supabase
          .from('user_favorites')
          .select('subject_slug')
          .eq('user_id', userId);
        
        if (!error && data) {
          const dbFavorites = data.map(f => f.subject_slug);
          setFavorites(dbFavorites);
          // Also sync to localStorage as cache
          localStorage.setItem(FAVORITES_KEY, JSON.stringify(dbFavorites));
        }
      } else {
        // Load from localStorage for anonymous users
        try {
          const stored = localStorage.getItem(FAVORITES_KEY);
          if (stored) {
            setFavorites(JSON.parse(stored));
          }
        } catch (error) {
          console.error('Error loading favorites from localStorage:', error);
        }
      }
      
      setIsLoading(false);
    };

    loadFavorites();
  }, [userId, authLoading]);

  // Sync localStorage favorites to database on sign in (handled separately)
  useEffect(() => {
    if (!userId || authLoading) return;

    const syncLocalFavorites = async () => {
      try {
        const localFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
        
        if (localFavorites.length > 0) {
          // Insert local favorites to database (ignore conflicts)
          for (const slug of localFavorites) {
            await supabase
              .from('user_favorites')
              .upsert({ user_id: userId, subject_slug: slug }, { onConflict: 'user_id,subject_slug' });
          }
          
          // Reload from database to get merged list
          const { data } = await supabase
            .from('user_favorites')
            .select('subject_slug')
            .eq('user_id', userId);
          
          if (data) {
            const dbFavorites = data.map(f => f.subject_slug);
            setFavorites(dbFavorites);
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(dbFavorites));
          }
        }
      } catch (error) {
        console.error('[useMatieresFavorites] Error syncing local favorites:', error);
      }
    };

    syncLocalFavorites();
  }, [userId, authLoading]);

  // Save to localStorage (for cache and anonymous users)
  const saveToLocalStorage = useCallback((newFavorites: string[]) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }, []);

  const addFavorite = useCallback(async (subjectSlug: string) => {
    if (favorites.includes(subjectSlug)) return;
    
    const newFavorites = [...favorites, subjectSlug];
    setFavorites(newFavorites);
    saveToLocalStorage(newFavorites);
    
    if (userId) {
      await supabase
        .from('user_favorites')
        .insert({ user_id: userId, subject_slug: subjectSlug });
    }
  }, [favorites, userId, saveToLocalStorage]);

  const removeFavorite = useCallback(async (subjectSlug: string) => {
    const newFavorites = favorites.filter(f => f !== subjectSlug);
    setFavorites(newFavorites);
    saveToLocalStorage(newFavorites);
    
    if (userId) {
      await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('subject_slug', subjectSlug);
    }
  }, [favorites, userId, saveToLocalStorage]);

  const toggleFavorite = useCallback(async (subjectSlug: string) => {
    if (favorites.includes(subjectSlug)) {
      await removeFavorite(subjectSlug);
    } else {
      await addFavorite(subjectSlug);
    }
  }, [favorites, addFavorite, removeFavorite]);

  const isFavorite = useCallback((subjectSlug: string) => {
    return favorites.includes(subjectSlug);
  }, [favorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    isLoading
  };
}
