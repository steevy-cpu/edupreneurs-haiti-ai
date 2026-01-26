
# Fix: Stop Music on User Logout

## Problem Analysis

When a logged-in user logs out, the music continues playing. This happens because:

1. The YouTube player is a global iframe managed by `MusicPlayerContext`
2. The existing `VisitorMusicSync` only handles visitor → logged-in transitions
3. There's no component watching for `SIGNED_OUT` auth events to stop music
4. The logout handlers in `AppSidebar.tsx` and `Settings.tsx` don't call `stopMusic()`

## Solution

Create a new `AuthMusicSync` component that monitors authentication state and stops music when the user logs out. This follows the same pattern as the existing `VisitorMusicSync`.

## Implementation Steps

### Step 1: Create AuthMusicSync Component

**File**: `src/components/auth/AuthMusicSync.tsx` (new file)

```typescript
import { useEffect, useRef } from "react";
import { useSessionAuth } from "@/contexts/SessionAuthContext";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";

/**
 * Root-level component that watches auth state and stops music
 * when user logs out. This component is always mounted (in FloatingLayer),
 * so it survives route changes like navigating to /auth.
 */
export const AuthMusicSync = () => {
  const { isAuthenticated, isLoading } = useSessionAuth();
  const { stopMusic } = useMusicPlayer();
  const prevAuthRef = useRef<boolean>(isAuthenticated);
  const initialLoadRef = useRef<boolean>(true);

  useEffect(() => {
    // Skip during initial loading to avoid false triggers
    if (isLoading) return;
    
    // Skip the first render after loading completes
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      prevAuthRef.current = isAuthenticated;
      return;
    }

    // Stop music when transitioning FROM authenticated TO unauthenticated
    if (prevAuthRef.current === true && isAuthenticated === false) {
      console.log('[AuthMusicSync] User logged out -> stopping music');
      stopMusic();
    }
    
    // Update ref for next comparison
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, isLoading, stopMusic]);

  // This component renders nothing - it's just a state watcher
  return null;
};
```

### Step 2: Add to FloatingLayer

**File**: `src/shell/FloatingLayer.tsx`

Add import and render the component:

```typescript
// Add import (after VisitorMusicSync import)
const AuthMusicSync = lazy(() => import('@/components/auth/AuthMusicSync').then(m => ({ default: m.AuthMusicSync })));

// Add render (after VisitorMusicSync)
<Suspense fallback={null}>
  <AuthMusicSync />
</Suspense>
```

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/auth/AuthMusicSync.tsx` | Create (new file) |
| `src/shell/FloatingLayer.tsx` | Add import and render |

---

## Why This Approach?

| Approach | Pros | Cons |
|----------|------|------|
| **AuthMusicSync (chosen)** | Centralized, follows existing pattern, survives new logout handlers | Adds one small component |
| Modify logout handlers | Direct | Requires changes in multiple places, easy to miss new handlers |
| Add to MusicPlayerContext | Self-contained | Mixes auth concerns into music context |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - additive only |
| Works with existing data? | Yes - uses existing contexts |
| 3G optimized? | Yes - no network calls, lazy-loaded |
| Backward compatible? | Yes - no API changes |
| Hook ordering maintained? | Yes - hooks at top |
| Handles edge cases? | Yes - skips initial load to avoid false triggers |

---

## Expected Outcome

After this change:
- Music stops immediately when user clicks logout
- Works regardless of where logout is triggered (sidebar, settings, etc.)
- No music plays on the login/auth pages after logout
- Visitor mode music sync continues to work as before
