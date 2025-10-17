/**
 * Performance optimization utilities
 */

// Debounce function for expensive operations
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

// Throttle function for limiting execution frequency
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

// Memoization helper for expensive computations
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

// Check if user is on a slow connection
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
