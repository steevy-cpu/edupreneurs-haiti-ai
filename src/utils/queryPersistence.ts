/**
 * @file queryPersistence.ts
 * @description localStorage-based query data caching with expiration, used to persist TanStack Query data across page reloads.
 * @module utils
 *
 * @example
 * persistQueryData('feed_posts', posts);
 * const cached = getPersistedQueryData<Post[]>('feed_posts'); // → posts or null if expired
 */

// Query persistence utilities for localStorage caching

const CACHE_PREFIX = 'edu_cache_';
const DEFAULT_CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Save data to localStorage with timestamp
 */
export function persistQueryData<T>(key: string, data: T): void {
  try {
    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheEntry));
  } catch (e) {
    console.warn('Failed to persist cache:', e);
  }
}

/**
 * Retrieve data from localStorage if not expired
 */
export function getPersistedQueryData<T>(key: string, expiryMs: number = DEFAULT_CACHE_EXPIRY): T | null {
  try {
    const stored = localStorage.getItem(CACHE_PREFIX + key);
    if (!stored) return null;
    
    const { data, timestamp }: CacheEntry<T> = JSON.parse(stored);
    
    // Check if cache is expired
    if (Date.now() - timestamp > expiryMs) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    
    return data;
  } catch (e) {
    console.warn('Failed to read persisted cache:', e);
    return null;
  }
}

/**
 * Get the timestamp of when the cache was last updated
 */
export function getPersistedCacheTimestamp(key: string): number {
  try {
    const stored = localStorage.getItem(CACHE_PREFIX + key);
    if (!stored) return 0;
    
    const { timestamp }: CacheEntry<unknown> = JSON.parse(stored);
    return timestamp;
  } catch (e) {
    return 0;
  }
}

/**
 * Clear a specific cache entry
 */
export function clearPersistedCache(key: string): void {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch (e) {
    console.warn('Failed to clear cache:', e);
  }
}

/**
 * Clear all persisted cache entries (for logout)
 */
export function clearAllPersistedCache(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (e) {
    console.warn('Failed to clear all cache:', e);
  }
}

/**
 * Clear expired cache entries (can be called periodically)
 */
export function clearExpiredCache(expiryMs: number = DEFAULT_CACHE_EXPIRY): void {
  try {
    const keysToRemove: string[] = [];
    const now = Date.now();
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const { timestamp }: CacheEntry<unknown> = JSON.parse(stored);
            if (now - timestamp > expiryMs) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Invalid entry, remove it
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (e) {
    console.warn('Failed to clear expired cache:', e);
  }
}

// Cache keys - centralized for all persistent data
export const CACHE_KEYS = {
  FEED_POSTS: 'feed_posts',
  CONVERSATIONS: 'conversations',
  USER_PROFILE: 'user_profile',
  LEADERBOARD: 'leaderboard',
  BATTLE_STATS: 'battle_stats',
  NOTIFICATIONS: 'notifications_list',
  SIDEBAR_BADGES: 'sidebar_badges',
} as const;
