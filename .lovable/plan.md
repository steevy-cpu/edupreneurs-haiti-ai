
# Plan: Fix Duplicate React Instances Error

## Problem Analysis

**Error:** `TypeError: Cannot read properties of null (reading 'useState')`

**Root Cause:** Vite is creating duplicate React instances due to:
1. `react-chessboard` excluded from pre-bundling (line 17) - causes it to use a separate React instance
2. Manual chunking splits `react-core` (lines 107-111) - can cause bundling conflicts
3. **Missing `dedupe` configuration** - the critical fix that forces all packages to use a single React instance

**Stack Trace Shows:**
```
at useState → useUserGrade → GamesHub
```
The hook fails because React's internal dispatcher is `null` when different React copies don't share state.

## Solution: Add React Deduplication

The fix requires adding `dedupe` to the Vite `resolve` configuration to ensure all dependencies use the same React instance.

## Implementation

### File: `vite.config.ts`

**Current (lines 83-87):**
```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
},
```

**Fixed:**
```typescript
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
  // Force all packages to use the same React instance
  // Prevents "Cannot read properties of null (reading 'useState')" errors
  dedupe: ["react", "react-dom", "react/jsx-runtime"],
},
```

## Technical Explanation

| What `dedupe` does | Why it matters |
|-------------------|----------------|
| Forces single React instance | React hooks require shared internal state |
| Resolves all imports to one copy | Prevents chunk conflicts from `manualChunks` |
| Works with excluded packages | Ensures `react-chessboard` uses same React |

## Safety Verification

| Check | Status |
|-------|--------|
| Backward compatible? | ✓ Only adds configuration, no code changes |
| Affects existing functionality? | ✓ No - improves stability |
| Works with current optimizeDeps? | ✓ Compatible with exclude/include settings |
| Works with manualChunks? | ✓ Complements chunking strategy |
| 3G performance impact? | ✓ None - same bundle sizes |

## Files to Modify

| File | Changes |
|------|---------|
| `vite.config.ts` | Add `dedupe: ["react", "react-dom", "react/jsx-runtime"]` to `resolve` config (1 line addition) |

## Expected Result

After this fix:
- `/games` page (GamesHub) will load without crashing
- `/community` page will load without crashing  
- All pages using `useUserGrade` hook will work correctly
- No more "Cannot read properties of null" errors during navigation
- React hooks will have consistent dispatcher state across all components

## Post-Implementation Verification

After applying the fix:
1. Navigate to `/games` - should load without error
2. Navigate to `/community` - should load without error
3. Switch between multiple pages rapidly - no crashes
4. Check browser console - no React hook errors
