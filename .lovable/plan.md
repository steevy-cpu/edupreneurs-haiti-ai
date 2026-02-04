
# Plan: Fix React Router Context Error (useContext null)

## Problem Analysis

**Error:** `TypeError: Cannot read properties of null (reading 'useContext')`

**Stack Trace:**
```
at useContext (chunk-ZMLY2J2T.js)
at useInRouterContext (react-router-dom.js)
at useLocation (react-router-dom.js)
at AuthLayout (AuthLayout.tsx:110)
```

**Root Cause Identified:**
The existing `dedupe` configuration only includes React packages, but `react-router-dom` is being split into a separate chunk (via `manualChunks`) and ends up with its own React reference. When React Router's `useContext` runs, it cannot find the React dispatcher because it's using a different React instance.

**Why the previous fix was incomplete:**
1. The `dedupe` array needs to include `react-router-dom` and `react-router` to ensure they use the same React instance
2. The `manualChunks` configuration separates `react-router` into its own bundle (line 116-117), which can cause module resolution conflicts
3. The Vite cache may still contain stale prebundled dependencies

## Solution: Comprehensive React Deduplication

### Changes Required

**File: `vite.config.ts`**

| Change | Why |
|--------|-----|
| Add `react-router`, `react-router-dom` to `dedupe` array | Forces router to use same React instance |
| Add `react-router-dom` to `optimizeDeps.include` | Ensures proper pre-bundling with correct React |
| Remove `react-router` from `manualChunks` | Prevents chunk isolation that causes the issue |
| Force cache invalidation | Clears stale prebundled dependencies |

### Implementation

**Current `optimizeDeps` (lines 15-20):**
```typescript
optimizeDeps: {
  exclude: ["react-chessboard"],
  include: ["next-themes"],
},
```

**Fixed:**
```typescript
optimizeDeps: {
  exclude: ["react-chessboard"],
  // Ensure these packages use the same React instance
  include: ["next-themes", "react-router-dom"],
},
```

**Current `resolve.dedupe` (line 89):**
```typescript
dedupe: ["react", "react-dom", "react/jsx-runtime"],
```

**Fixed:**
```typescript
dedupe: [
  "react", 
  "react-dom", 
  "react/jsx-runtime",
  "react-router",
  "react-router-dom"
],
```

**Current `manualChunks` (lines 110-118):**
```typescript
manualChunks: (id) => {
  if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
    return 'react-core';
  }
  // Router separate for code splitting
  if (id.includes('react-router')) {
    return 'router';
  }
  // ...
}
```

**Fixed (remove router chunk):**
```typescript
manualChunks: (id) => {
  // React core + Router bundled together to prevent context issues
  if (id.includes('node_modules/react/') || 
      id.includes('node_modules/react-dom/') ||
      id.includes('react-router')) {
    return 'react-core';
  }
  // ...
}
```

**Change cache directory name (line 14):**
```typescript
// Current
cacheDir: "node_modules/.vite-edupreneurs",

// Fixed - force complete cache rebuild
cacheDir: "node_modules/.vite-edupreneurs-v2",
```

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Backward compatible? | ✓ | No code changes, only config |
| Affects bundle size? | ✓ | Slightly larger react-core chunk (~+30KB) but more stable |
| 3G performance impact? | ✓ | Minimal - router is small, loaded once |
| Breaks existing routes? | ✓ | No - routing logic unchanged |
| Works with lazy loading? | ✓ | Yes - lazy components still work |

## Files to Modify

| File | Change Description |
|------|-------------------|
| `vite.config.ts` | 4 changes: dedupe array, optimizeDeps.include, manualChunks logic, cacheDir name |

## Expected Result

After this fix:
- `/auth/login` page loads without crashing
- All auth routes (`/auth/signup/*`, `/auth/verify-email`) work correctly
- `useLocation`, `useNavigate`, `useParams` work in all components
- No more "Cannot read properties of null" errors for any React hooks
- Clean browser console with no hook-related errors

## Technical Details for Developers

**Why bundling React + Router together is necessary:**

React Router's hooks (useLocation, useNavigate, etc.) internally call React's useContext. When:
1. React is in chunk A
2. react-router-dom is in chunk B
3. Each chunk may resolve to different React instances during bundling

The result is that React Router's `useContext` call receives `null` because it's calling a different React's context system than the one the app uses.

By bundling them together in `react-core`, we guarantee:
- Single React instance
- Single context dispatcher
- Hooks work correctly across all components

**Cache invalidation rationale:**

Vite pre-bundles dependencies on first run and caches them. If the old cache has react-router bundled with a different React reference, simply changing config won't fix it - the cache must be invalidated. Changing `cacheDir` forces a complete rebuild.
