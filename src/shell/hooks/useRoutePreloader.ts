/**
 * useRoutePreloader - Smart route preloading for 3G optimization.
 * 
 * Provides two-level preloading:
 * 1. Component chunks (JS) - preload lazy-loaded page components
 * 2. Data prefetching (API) - prefetch route-specific data via React Query
 * 
 * 3G Optimizations:
 * - Uses requestIdleCallback to avoid blocking the main thread
 * - Respects navigator.connection.saveData preference
 * - Uses network-aware cache settings to skip prefetching on slow connections
 * - Only preloads one route at a time
 * - Debounces rapid hover/touch events
 */

import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { shouldSkipPreloading } from '@/utils/networkAwareCache';

/**
 * Map of routes to their lazy import functions.
 * These match the dynamic imports in App.tsx routes.
 */
const ROUTE_CHUNKS: Record<string, () => Promise<unknown>> = {
  '/dashboard': () => import('@/pages/Dashboard'),
  '/matieres': () => import('@/pages/Matieres'),
  '/feed': () => import('@/pages/Feed'),
  '/community': () => import('@/pages/Community'),
  '/notifications': () => import('@/pages/Notifications'),
  '/games': () => import('@/pages/GamesHub'),
  '/settings': () => import('@/pages/Settings'),
  '/resources': () => import('@/pages/Resources'),
  '/leaderboard': () => import('@/pages/Leaderboard'),
  '/lecture': () => import('@/pages/Library'),
  '/user-search': () => import('@/pages/UserSearch'),
  '/passion-discovery': () => import('@/pages/PassionDiscovery'),
};

/**
 * Routes with heavy data requirements that benefit from prefetching.
 * Each entry maps a route to its React Query cache keys.
 */
const ROUTE_DATA_KEYS: Record<string, string[][]> = {
  '/feed': [['feed-posts']],
  '/community': [['conversations']],
  '/notifications': [['notifications']],
  '/leaderboard': [['leaderboard-data']],
  '/matieres': [['subjects-list']],
};

/**
 * Check if the user has requested reduced data usage.
 * Now uses the centralized network-aware cache utility.
 */
// Removed local shouldSkipPreloading - now imported from networkAwareCache

/**
 * Schedule work during browser idle time.
 * Falls back to setTimeout for browsers without requestIdleCallback.
 */
function scheduleIdleWork(callback: () => void): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 2000 });
  } else {
    setTimeout(callback, 100);
  }
}

export interface UseRoutePreloaderResult {
  /** 
   * Preload a route's component and optionally its data.
   * Call on mouseenter/touchstart of navigation items.
   */
  preloadRoute: (path: string) => void;
  /** 
   * Preload only the component chunk (no data).
   * Useful for routes without heavy data requirements.
   */
  preloadChunk: (path: string) => void;
}

/**
 * Hook for intelligent route preloading.
 * 
 * @example
 * const { preloadRoute } = useRoutePreloader();
 * 
 * <Link 
 *   to="/dashboard"
 *   onMouseEnter={() => preloadRoute('/dashboard')}
 *   onTouchStart={() => preloadRoute('/dashboard')}
 * >
 *   Dashboard
 * </Link>
 */
export function useRoutePreloader(): UseRoutePreloaderResult {
  const queryClient = useQueryClient();
  const preloadedRef = useRef<Set<string>>(new Set());
  const debounceRef = useRef<number | null>(null);
  
  /**
   * Preload just the component chunk (Level 1).
   */
  const preloadChunk = useCallback((path: string) => {
    // Skip if already preloaded or data saving mode
    if (preloadedRef.current.has(path) || shouldSkipPreloading()) {
      return;
    }
    
    const chunkLoader = ROUTE_CHUNKS[path];
    if (!chunkLoader) return;
    
    scheduleIdleWork(() => {
      chunkLoader().catch(() => {
        // Silently ignore preload failures
      });
      preloadedRef.current.add(path);
    });
  }, []);
  
  /**
   * Preload component chunk + prefetch data (Level 1 + 2).
   */
  const preloadRoute = useCallback((path: string) => {
    // Debounce rapid hover events
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = window.setTimeout(() => {
      // Level 1: Preload component
      preloadChunk(path);
      
      // Level 2: Prefetch data (if applicable)
      if (!shouldSkipPreloading()) {
        const dataKeys = ROUTE_DATA_KEYS[path];
        if (dataKeys) {
          scheduleIdleWork(() => {
            dataKeys.forEach(queryKey => {
              // Touch the query to trigger prefetch if stale
              queryClient.prefetchQuery({
                queryKey,
                staleTime: 1000 * 60 * 2, // 2 minutes
              });
            });
          });
        }
      }
      
      debounceRef.current = null;
    }, 50); // 50ms debounce
  }, [preloadChunk, queryClient]);
  
  return { preloadRoute, preloadChunk };
}

export default useRoutePreloader;
