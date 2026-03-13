/**
 * @file networkAwareCache.ts
 * @description Adjusts TanStack Query caching behavior (stale time, GC, prefetch) based on connection quality for 3G-first optimization.
 * @module utils
 *
 * @example
 * const settings = getCacheSettings(); // → { staleTime: 600000, preferCache: true, ... }
 * const stale = getStaleTimeFor('feed'); // → connection-appropriate stale time
 */

/**
 * Network-Aware Cache Strategy
 * 
 * Adjusts caching behavior based on connection quality.
 * Optimized for 3G users in Haiti.
 */

type ConnectionType = 'fast' | 'slow' | 'offline';

interface NetworkConnection {
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g';
  saveData?: boolean;
  downlink?: number;
  rtt?: number;
}

/**
 * Get the current connection type
 */
export function getConnectionType(): ConnectionType {
  if (typeof navigator === 'undefined') return 'fast';
  if (!navigator.onLine) return 'offline';
  
  const connection = (navigator as Navigator & { connection?: NetworkConnection }).connection;
  if (!connection) return 'fast'; // Assume fast if API unavailable
  
  const { effectiveType, saveData, downlink } = connection;
  
  // User explicitly requested data saving
  if (saveData) return 'slow';
  
  // Check effective type
  if (effectiveType === '4g') return 'fast';
  if (effectiveType === '3g' && downlink && downlink >= 1.5) return 'fast'; // Good 3G
  if (effectiveType === '2g' || effectiveType === 'slow-2g') return 'slow';
  
  // Default 3g to slow
  return effectiveType === '3g' ? 'slow' : 'fast';
}

/**
 * Cache settings based on connection quality
 */
export interface CacheSettings {
  /** Time before data is considered stale (ms) */
  staleTime: number;
  /** Time before data is garbage collected (ms) */
  gcTime: number;
  /** Whether to prefer cached data over fresh fetch */
  preferCache: boolean;
  /** Whether to skip non-essential prefetching */
  skipPrefetch: boolean;
  /** Current connection type */
  connectionType: ConnectionType;
  /** Whether to use reduced quality/size for images */
  useReducedQuality: boolean;
}

/**
 * Get cache settings based on current network conditions
 */
export function getCacheSettings(): CacheSettings {
  const type = getConnectionType();
  
  switch (type) {
    case 'offline':
      return {
        staleTime: Infinity, // Always use cache when offline
        gcTime: 1000 * 60 * 60, // Keep cache for 1 hour
        preferCache: true,
        skipPrefetch: true,
        connectionType: type,
        useReducedQuality: true,
      };
      
    case 'slow':
      return {
        staleTime: 1000 * 60 * 10, // 10 minutes - reduce network calls
        gcTime: 1000 * 60 * 30, // 30 minutes
        preferCache: true,
        skipPrefetch: true, // Don't prefetch on slow connections
        connectionType: type,
        useReducedQuality: true,
      };
      
    case 'fast':
    default:
      return {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
        preferCache: false,
        skipPrefetch: false,
        connectionType: type,
        useReducedQuality: false,
      };
  }
}

/**
 * Check if prefetching should be skipped
 */
export function shouldSkipPreloading(): boolean {
  const { skipPrefetch, connectionType } = getCacheSettings();
  return skipPrefetch || connectionType === 'offline';
}

/**
 * Get a throttled stale time for specific data types
 */
export function getStaleTimeFor(dataType: 'profile' | 'feed' | 'leaderboard' | 'notifications' | 'static' | 'default'): number {
  const { connectionType } = getCacheSettings();
  
  const staleTimeMap = {
    fast: {
      default: 1000 * 60 * 5, // 5 min
      profile: 1000 * 60 * 10, // 10 min
      feed: 1000 * 60 * 2, // 2 min
      leaderboard: 1000 * 60 * 5, // 5 min
      notifications: 1000 * 60 * 1, // 1 min - needs to be fresh
      static: 1000 * 60 * 60, // 1 hour
    },
    slow: {
      default: 1000 * 60 * 10, // 10 min
      profile: 1000 * 60 * 30, // 30 min
      feed: 1000 * 60 * 10, // 10 min
      leaderboard: 1000 * 60 * 15, // 15 min
      notifications: 1000 * 60 * 3, // 3 min - balance freshness vs bandwidth
      static: 1000 * 60 * 60 * 2, // 2 hours
    },
    offline: {
      default: Infinity,
      profile: Infinity,
      feed: Infinity,
      leaderboard: Infinity,
      notifications: Infinity,
      static: Infinity,
    },
  };
  
  return staleTimeMap[connectionType][dataType];
}

/**
 * Add network change listener
 */
export function onNetworkChange(callback: (type: ConnectionType) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  // Listen for online/offline events
  const handleOnline = () => callback(getConnectionType());
  const handleOffline = () => callback('offline');
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Listen for connection changes if available
  const connection = (navigator as Navigator & { connection?: NetworkConnection & EventTarget }).connection;
  const handleConnectionChange = () => callback(getConnectionType());
  
  if (connection && 'addEventListener' in connection) {
    connection.addEventListener('change', handleConnectionChange);
  }
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    if (connection && 'removeEventListener' in connection) {
      connection.removeEventListener('change', handleConnectionChange);
    }
  };
}
