import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNetworkAwareLoading } from '@/hooks/useNetworkAwareLoading';
import { DEFAULT_STATS } from '@/data/homePageData';

interface Stats {
  lessons: number;
  exams: number;
  users: number;
}

interface UseDeferredStatsOptions {
  /** Custom delay in ms (overrides network-based delay) */
  delay?: number;
}

interface UseDeferredStatsReturn {
  stats: Stats;
  isLoaded: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Network-aware stats fetching hook.
 * Defers database calls to prioritize initial render (LCP).
 * 
 * - Slow connections (3G): 3000ms delay
 * - Fast connections: 500ms delay
 * - Returns skeleton-friendly defaults immediately
 */
export function useDeferredStats(options?: UseDeferredStatsOptions): UseDeferredStatsReturn {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const { shouldDeferResources } = useNetworkAwareLoading();

  const fetchStats = useCallback(async () => {
    try {
      const [lessonsRes, examsRes, usersRes] = await Promise.all([
        supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('official_exams').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
      ]);

      // Check for errors
      if (lessonsRes.error || examsRes.error || usersRes.error) {
        throw new Error('Failed to fetch stats');
      }

      setStats({
        lessons: lessonsRes.count || DEFAULT_STATS.lessons,
        exams: examsRes.count || DEFAULT_STATS.exams,
        users: usersRes.count || DEFAULT_STATS.users
      });
      setIsLoaded(true);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // Keep default stats on error - don't show broken UI
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Calculate delay based on network conditions
    const delay = options?.delay ?? (shouldDeferResources ? 3000 : 500);

    const timer = setTimeout(() => {
      fetchStats();
    }, delay);

    return () => clearTimeout(timer);
  }, [fetchStats, shouldDeferResources, options?.delay]);

  return {
    stats,
    isLoaded,
    error,
    refetch: fetchStats
  };
}

export default useDeferredStats;
