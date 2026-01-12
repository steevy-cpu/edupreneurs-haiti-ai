/**
 * Cross-browser event listener utilities
 * Handles compatibility for MediaQueryList and NetworkInformation APIs
 */

type MediaQueryCallback = (event: MediaQueryListEvent | MediaQueryList) => void;
type ConnectionCallback = () => void;

/**
 * Adds a change listener to a MediaQueryList with cross-browser support.
 * Handles both modern (addEventListener) and legacy (addListener) APIs.
 * @returns A cleanup function to remove the listener
 */
export function addMediaQueryListener(
  mql: MediaQueryList,
  callback: MediaQueryCallback
): () => void {
  try {
    // Modern browsers
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    }
    
    // Legacy browsers (older Safari, iOS < 14)
    if (typeof mql.addListener === 'function') {
      mql.addListener(callback);
      return () => mql.removeListener(callback);
    }
  } catch (e) {
    console.warn('MediaQueryList listener not supported:', e);
  }
  
  // Fallback: no listener support, return no-op cleanup
  return () => {};
}

/**
 * Adds a change listener to navigator.connection with cross-browser support.
 * Handles addEventListener, onchange property, and missing API gracefully.
 * @returns A cleanup function to remove the listener
 */
export function addConnectionListener(
  connection: any,
  callback: ConnectionCallback
): () => void {
  if (!connection) {
    return () => {};
  }

  try {
    // Modern: addEventListener
    if (typeof connection.addEventListener === 'function') {
      connection.addEventListener('change', callback);
      return () => {
        if (typeof connection.removeEventListener === 'function') {
          connection.removeEventListener('change', callback);
        }
      };
    }
    
    // Alternative: onchange property
    if ('onchange' in connection) {
      const previousHandler = connection.onchange;
      connection.onchange = () => {
        if (typeof previousHandler === 'function') {
          previousHandler();
        }
        callback();
      };
      return () => {
        connection.onchange = previousHandler;
      };
    }
  } catch (e) {
    console.warn('Connection listener not supported:', e);
  }
  
  // Fallback: no listener support, return no-op cleanup
  return () => {};
}
