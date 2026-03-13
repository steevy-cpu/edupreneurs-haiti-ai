/**
 * @file performanceOptimization.ts
 * @description Collection of performance utilities — debounce, throttle, memoization, API caching, request deduplication, and lazy loading.
 * @module utils
 *
 * @example
 * const debouncedSearch = debounce(search, 300);
 * const cached = getCachedApiResponse<User[]>('users');
 */

/**
 * Delays function execution until after the specified wait period since the last invocation.
 * @param func - Function to debounce
 * @param wait - Delay in milliseconds
 * @returns Debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Limits function execution to at most once per specified time period.
 * @param func - Function to throttle
 * @param limit - Minimum interval between executions in milliseconds
 * @returns Throttled version of the function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Caches function results based on serialized arguments to avoid redundant computation.
 * @param func - Pure function to memoize
 * @returns Memoized version with internal Map cache
 */
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Checks if the user is on a slow or data-saving connection via the Network Information API.
 * @returns True if connection is 2G, slow-2G, or data saver is enabled
 */
export function isSlowConnection(): boolean {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection?.effectiveType === 'slow-2g' || 
           connection?.effectiveType === '2g' ||
           connection?.saveData === true;
  }
  return false;
}

// Preload image
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Batch multiple updates together
export function batchUpdates<T>(
  updates: Array<() => void>,
  delay: number = 0
): void {
  if (delay === 0) {
    updates.forEach(update => update());
  } else {
    setTimeout(() => {
      updates.forEach(update => update());
    }, delay);
  }
}

// Lazy load components when they enter viewport
export function lazyLoadOnIntersection(
  element: Element,
  callback: () => void
): IntersectionObserver | null {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
          observer.disconnect();
        }
      });
    });
    
    observer.observe(element);
    return observer;
  }
  
  // Fallback for browsers without IntersectionObserver
  callback();
  return null;
}

// Clean up subscriptions
export function cleanupSubscriptions(subscriptions: Array<() => void>): void {
  subscriptions.forEach(unsubscribe => {
    try {
      unsubscribe();
    } catch (error) {
      console.error('Error cleaning up subscription:', error);
    }
  });
}

// Cache API responses
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCachedApiResponse<T>(key: string): T | null {
  const cached = apiCache.get(key);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
  if (isExpired) {
    apiCache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

export function setCachedApiResponse(key: string, data: any): void {
  apiCache.set(key, { data, timestamp: Date.now() });
}

export function clearApiCache(): void {
  apiCache.clear();
}

// Optimize images
export function getOptimizedImageUrl(url: string, width?: number): string {
  if (!url) return url;
  
  // For Supabase storage URLs, add transformation parameters
  if (url.includes('supabase')) {
    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    params.append('quality', '85');
    return `${url}?${params.toString()}`;
  }
  
  return url;
}

// Prefetch resources
export function prefetchResource(url: string, type: 'script' | 'style' | 'image'): void {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = type;
  link.href = url;
  document.head.appendChild(link);
}

// Reduce API calls with request deduplication
const pendingRequests = new Map<string, Promise<any>>();

export async function deduplicateRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  // If request is already pending, return the same promise
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<T>;
  }
  
  // Create new request
  const promise = requestFn().finally(() => {
    pendingRequests.delete(key);
  });
  
  pendingRequests.set(key, promise);
  return promise;
}
