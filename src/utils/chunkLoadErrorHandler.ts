/**
 * @file chunkLoadErrorHandler.ts
 * @description Handles dynamic import failures caused by stale Vite chunk cache after deployments.
 * @module utils
 *
 * @example
 * if (isChunkLoadError(error)) handleChunkLoadError(error);
 */

/**
 * Handles dynamic import failures caused by stale cache.
 * 
 * When Vite rebuilds, chunk hashes change. Users with cached
 * JavaScript may request old chunk URLs that no longer exist.
 * 
 * This utility:
 * 1. Detects the failure pattern
 * 2. Forces a page reload to get fresh chunks
 * 3. Prevents infinite reload loops
 */

const RELOAD_KEY = 'chunk_reload_attempted';
const RELOAD_COOLDOWN = 5000; // 5 seconds

/**
 * Determines whether an error is a chunk load failure from stale cache.
 * @param error - The caught error to inspect
 * @returns True if the error matches known chunk load failure patterns
 */
export function isChunkLoadError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes('failed to fetch dynamically imported module') ||
      message.includes('loading chunk') ||
      message.includes('loading css chunk')
    );
  }
  return false;
}

/**
 * Attempts a single page reload to recover from stale chunks, with cooldown to prevent loops.
 * @param error - The chunk load error that triggered recovery
 */
export function handleChunkLoadError(error: Error): void {
  const lastReload = sessionStorage.getItem(RELOAD_KEY);
  const now = Date.now();
  
  // Prevent infinite reload loops
  if (lastReload && now - parseInt(lastReload, 10) < RELOAD_COOLDOWN) {
    console.error('Chunk load failed after reload:', error);
    return;
  }
  
  // Mark that we're attempting a reload
  sessionStorage.setItem(RELOAD_KEY, now.toString());
  
  // Force reload to get fresh chunks
  window.location.reload();
}

/**
 * Clears the reload attempt flag, allowing future chunk error recovery.
 */
export function clearChunkReloadFlag(): void {
  sessionStorage.removeItem(RELOAD_KEY);
}
