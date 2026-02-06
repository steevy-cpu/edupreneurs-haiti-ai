
# Plan: Fix PassionDiscovery Dynamic Import Failure

## Problem Summary

The error `Failed to fetch dynamically imported module: .../src/pages/PassionDiscovery.tsx` occurs when users try to navigate to `/passion-discovery`. This is a **cache/chunk mismatch issue**, not a code syntax error.

## Root Cause Analysis

When we updated `vite.config.ts` to change the `cacheDir` from `v2` to `v3`, Vite regenerated all chunk hashes. The browser is now requesting old chunk filenames that no longer exist because:

1. **Stale Browser Cache**: Users have cached JavaScript that references old chunk URLs
2. **Lazy Loading Timing**: The lazy import tries to fetch a chunk URL that was valid in a previous build
3. **No Retry Mechanism**: When the chunk fetch fails, React Router's Suspense boundary throws without recovery

## Solution Overview

Implement a **chunk loading error recovery system** that:
1. Detects when a lazy-loaded module fails to fetch
2. Automatically reloads the page to clear stale chunks
3. Shows a friendly message to users on slow connections

## Implementation Details

### File 1: Create `src/utils/chunkLoadErrorHandler.ts`

A utility to handle chunk loading errors gracefully:

```typescript
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

export function clearChunkReloadFlag(): void {
  sessionStorage.removeItem(RELOAD_KEY);
}
```

### File 2: Update `src/components/ErrorBoundary.tsx`

Enhance the error boundary to detect chunk errors and auto-recover:

Add import at top:
```typescript
import { isChunkLoadError, handleChunkLoadError } from '@/utils/chunkLoadErrorHandler';
```

In the `componentDidCatch` method, add chunk error detection:
```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  console.error("ErrorBoundary caught an error:", error, errorInfo);
  
  // Check if this is a chunk loading error (stale cache)
  if (isChunkLoadError(error)) {
    handleChunkLoadError(error);
    return; // Page will reload, no need to update state
  }
  
  // Rest of existing error handling...
}
```

Add a specific UI for chunk errors in the render method:
```typescript
// In the error state render, before the generic error UI
if (isChunkLoadError(this.state.error)) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <h2 className="text-lg font-semibold">Mise à jour en cours...</h2>
        <p className="text-sm text-muted-foreground">
          Une nouvelle version est disponible. Rechargement automatique...
        </p>
      </div>
    </div>
  );
}
```

### File 3: Update `src/App.tsx` - Add Route Error Element

Wrap lazy imports with retry logic for better resilience:

Create a helper function at the top of App.tsx:
```typescript
/**
 * Wrap lazy import with automatic retry on chunk load failure.
 * If the chunk fails to load, reload the page to get fresh chunks.
 */
function lazyWithRetry(importFn: () => Promise<{ default: React.ComponentType }>) {
  return lazy(() =>
    importFn().catch((error) => {
      // Check if it's a chunk load error
      if (error?.message?.includes('Failed to fetch dynamically imported module')) {
        // Only reload if we haven't just reloaded
        const lastReload = sessionStorage.getItem('chunk_reload');
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 5000) {
          sessionStorage.setItem('chunk_reload', now.toString());
          window.location.reload();
        }
      }
      throw error;
    })
  );
}
```

Then update the PassionDiscovery import:
```typescript
// Change from:
const PassionDiscovery = lazy(() => import("./pages/PassionDiscovery"));

// To:
const PassionDiscovery = lazyWithRetry(() => import("./pages/PassionDiscovery"));
```

Apply the same pattern to other frequently-used lazy routes.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/utils/chunkLoadErrorHandler.ts` | NEW: Chunk error detection and recovery utility |
| `src/components/ErrorBoundary.tsx` | Add chunk error detection and auto-reload |
| `src/App.tsx` | Wrap key lazy imports with retry logic |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Backward compatible? | ✓ | No changes to existing behavior when chunks load normally |
| Prevents infinite loops? | ✓ | Session storage flag with 5s cooldown |
| 3G friendly? | ✓ | Shows loading state, single reload attempt |
| Works offline? | ✓ | Error boundary still catches offline errors |
| User experience? | ✓ | Friendly message in French, automatic recovery |

---

## Why This Happens and How to Prevent

### Current Issue
Every time the Vite dev server restarts or builds change, chunk hashes update. Old URLs become 404s.

### Prevention (For Production)
In production, ensure your deployment strategy includes:
1. Cache-Control headers that expire old chunks
2. Service worker that invalidates on new builds
3. The error recovery system we're implementing

---

## Expected Result

After implementation:
- Users hitting stale chunk errors will see a brief "Mise à jour en cours..." message
- Page automatically reloads to fetch fresh chunks
- No infinite reload loops (5 second cooldown)
- Works seamlessly on slow 3G connections
- French language messaging consistent with the app
