import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const FAVORITES_KEY = 'matieres_favorites';

export function useMatieresFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth state and load favorites
  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      
      if (user) {
        // Load from database for authenticated users
        const { data, error } = await supabase
          .from('user_favorites')
          .select('subject_slug')
          .eq('user_id', user.id);
        
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUserId = session?.user?.id || null;
      setUserId(newUserId);
      
      if (event === 'SIGNED_IN' && newUserId) {
        // User just signed in - sync localStorage favorites to database
        let localFavorites: string[] = [];
        try {
          localFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
        } catch {
          console.error('[useMatieresFavorites] Error parsing localStorage');
          localFavorites = [];
        }
        
        if (localFavorites.length > 0) {
          // Insert local favorites to database (ignore conflicts)
          for (const slug of localFavorites) {
            await supabase
              .from('user_favorites')
              .upsert({ user_id: newUserId, subject_slug: slug }, { onConflict: 'user_id,subject_slug' });
          }
        }
        
        // Load all favorites from database
        const { data } = await supabase
          .from('user_favorites')
          .select('subject_slug')
          .eq('user_id', newUserId);
        
        if (data) {
          const dbFavorites = data.map(f => f.subject_slug);
          setFavorites(dbFavorites);
          localStorage.setItem(FAVORITES_KEY, JSON.stringify(dbFavorites));
        }
      } else if (event === 'SIGNED_OUT') {
        // Keep localStorage favorites but clear state to reload from localStorage
        try {
          const stored = localStorage.getItem(FAVORITES_KEY);
          if (stored) {
            setFavorites(JSON.parse(stored));
          }
        } catch {
          setFavorites([]);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
