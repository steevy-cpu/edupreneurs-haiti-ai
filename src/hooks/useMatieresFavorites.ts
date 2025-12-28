import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'matieres_favorites';

export function useMatieresFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = useCallback((newFavorites: string[]) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, []);

  const addFavorite = useCallback((subjectSlug: string) => {
    if (!favorites.includes(subjectSlug)) {
      saveFavorites([...favorites, subjectSlug]);
    }
  }, [favorites, saveFavorites]);

  const removeFavorite = useCallback((subjectSlug: string) => {
    saveFavorites(favorites.filter(f => f !== subjectSlug));
  }, [favorites, saveFavorites]);

  const toggleFavorite = useCallback((subjectSlug: string) => {
    if (favorites.includes(subjectSlug)) {
      removeFavorite(subjectSlug);
    } else {
      addFavorite(subjectSlug);
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
    isFavorite
  };
}
