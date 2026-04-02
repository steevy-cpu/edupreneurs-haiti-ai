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
      // Use SECURITY DEFINER RPC to bypass RLS — returns only aggregated counts,
      // safe for anonymous visitors (no PII exposed)
      const { data, error } = await supabase.rpc('get_public_homepage_stats');

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const row = data[0];
        setStats({
          lessons: Number(row.lessons_count) || DEFAULT_STATS.lessons,
          exams: Number(row.exams_count) || DEFAULT_STATS.exams,
          users: Number(row.users_count) || DEFAULT_STATS.users,
        });
      }

      setIsLoaded(true);
      setError(null);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // Keep default stats on error — don't show broken UI
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
