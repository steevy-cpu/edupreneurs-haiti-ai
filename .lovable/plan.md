

# Plan: Mount VisitorMusicSync in App.tsx

## Problem Summary

When a visitor exits visitor mode (e.g., by clicking "Créer un compte" or "Se connecter"), the music continues playing. The `VisitorMusicSync` component exists but is **never mounted** in the app.

## Root Cause Analysis

The `VisitorMusicSync` component was created at `src/components/visitor/VisitorMusicSync.tsx` but was never imported or rendered in `App.tsx`. 

**Current State:**
- `AuthMusicSync` is correctly mounted in App.tsx (line 132)
- `VisitorMusicSync` exists but is not imported or used anywhere
- Comments in `FloatingLayer.tsx` incorrectly claim it's in App.tsx

**Evidence:**
- `App.tsx` line 18: Only imports `AuthMusicSync`
- `App.tsx` line 132: Only renders `<AuthMusicSync />`
- Search for `import.*VisitorMusicSync` returns no results

## Solution

Add `VisitorMusicSync` alongside `AuthMusicSync` in `App.tsx`. Both need to be at the App root level to survive route changes (like navigating to `/auth`).

## Implementation Details

### File: `src/App.tsx`

**Change 1: Add import (after line 18)**

Current:
```tsx
import { AuthMusicSync } from "@/components/auth/AuthMusicSync";
```

Updated:
```tsx
import { AuthMusicSync } from "@/components/auth/AuthMusicSync";
import { VisitorMusicSync } from "@/components/visitor/VisitorMusicSync";
```

**Change 2: Mount the component (after line 132)**

Current:
```tsx
const App = () => (
  <AppProviders>
    {/* Global music sync - must be outside AppShell to survive logout navigation */}
    <AuthMusicSync />
    
    <Routes>
```

Updated:
```tsx
const App = () => (
  <AppProviders>
    {/* Global music sync - must be outside AppShell to survive logout navigation */}
    <AuthMusicSync />
    <VisitorMusicSync />
    
    <Routes>
```

---

## How It Works

The `VisitorMusicSync` component:
1. Watches `isVisitor` state from `VisitorContext`
2. Uses a ref to track the previous value
3. When transitioning from `true` → `false` (visitor exits), calls `stopMusic()`
4. Renders nothing (returns `null`)

The logic is already correct in the component - it just needs to be mounted.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Import and render `VisitorMusicSync` component |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Backward compatible? | Yes | No change to existing behavior |
| Breaks existing flow? | No | Component already designed to work at root |
| 3G performance? | Yes | Component renders null, no DOM impact |
| Works with dark mode? | N/A | No visual element |
| Affects logged-in users? | No | Only triggers for visitors |

---

## Expected Result

After implementation:
- Music stops automatically when visitor clicks "Créer un compte" or "Se connecter"
- Music stops when visitor tour ends and they navigate to auth
- Console will log `[VisitorMusicSync] Visitor exited -> stopping music` when triggered
- Both auth logout AND visitor exit will properly stop music

