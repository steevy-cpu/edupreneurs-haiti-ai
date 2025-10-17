import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseOptimizedFetchOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
}

/**
 * Custom hook for optimized data fetching with caching
 */
export function useOptimizedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: UseOptimizedFetchOptions = {}
) {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 5 * 60 * 1000, // 5 minutes default
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Cache management
  const getCachedData = useCallback(() => {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const { data: cachedData, timestamp } = JSON.parse(cached);
      const now = Date.now();

      if (now - timestamp < staleTime) {
        return cachedData;
      }

      localStorage.removeItem(`cache_${key}`);
      return null;
    } catch {
      return null;
    }
  }, [key, staleTime]);

  const setCachedData = useCallback((newData: T) => {
    try {
      localStorage.setItem(
        `cache_${key}`,
        JSON.stringify({
          data: newData,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }, [key]);

  const refetch = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      setCachedData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [enabled, fetchFn, setCachedData]);

  // Initial fetch
  useEffect(() => {
    if (!enabled) return;

    const cachedData = getCachedData();
    if (cachedData) {
      setData(cachedData);
      return;
    }

    refetch();
  }, [enabled, getCachedData, refetch]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      const cachedData = getCachedData();
      if (!cachedData) {
        refetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, getCachedData, refetch]);

  return { data, loading, error, refetch };
}
