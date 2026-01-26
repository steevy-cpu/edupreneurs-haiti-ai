
# Plan: Update Visitor Mode for New App Shell Architecture

## Problem Summary

The visibility system (`src/shell/config/visibility.ts`) only checks `isAuthenticated` to decide what to show. This causes issues because visitors are NOT authenticated, but they SHOULD see certain features like:
- Music player (during tour)
- Jude chatbot (for welcome popup)
- Bottom navigation

Additionally, `VisitorMusicSync` is rendered twice (in both `FloatingLayer.tsx` and `App.tsx`), which is redundant.

---

## Implementation Steps

### Step 1: Remove Duplicate VisitorMusicSync from FloatingLayer

**File**: `src/shell/FloatingLayer.tsx`

Remove the redundant `VisitorMusicSync` since it now lives in `App.tsx` (moved in the previous fix for AuthMusicSync).

**Remove**:
```typescript
const VisitorMusicSync = lazy(() => import('@/components/visitor/VisitorMusicSync').then(...));

// And remove render:
<Suspense fallback={null}>
  <VisitorMusicSync />
</Suspense>
```

---

### Step 2: Add Visitor Support to Visibility System

**File**: `src/shell/config/visibility.ts`

Update the visibility options and logic to support visitors:

```typescript
export interface VisibilityOptions {
  isAuthenticated?: boolean;
  isVisitor?: boolean;     // NEW: Visitor mode state
  keyboardOpen?: boolean;
}

export interface VisibilityConfig {
  hideOn: string[];
  hideOnPatterns: RegExp[];
  requiresAuth?: boolean;
  allowForVisitors?: boolean;  // NEW: Allow for visitor mode even if requiresAuth
  hideWhenKeyboardOpen?: boolean;
}
```

Update component configs to allow visitors where appropriate:

| Component | `requiresAuth` | `allowForVisitors` | Reason |
|-----------|---------------|-------------------|--------|
| `jude` | true | true | Welcome popup and tour guidance |
| `musicPlayer` | true | true | Music plays during tour |
| `quickMessage` | true | false | Requires real user messaging |
| `bottomNav` | false | - | Already works (no auth required) |
| `notificationBanner` | true | false | Real notifications only |

Update `shouldShowComponent` function:

```typescript
export function shouldShowComponent(
  componentKey: keyof typeof UI_VISIBILITY,
  pathname: string,
  options: VisibilityOptions = {}
): boolean {
  const config = UI_VISIBILITY[componentKey];
  if (!config) return true;
  
  const { isAuthenticated = true, isVisitor = false, keyboardOpen = false } = options;
  
  // Check auth requirement - allow visitors if specified
  if (config.requiresAuth && !isAuthenticated) {
    if (!config.allowForVisitors || !isVisitor) {
      return false;
    }
  }
  
  // ... rest of existing logic
}
```

---

### Step 3: Update useVisibility Hook to Include Visitor State

**File**: `src/shell/hooks/useVisibility.ts`

Import and use `useVisitor` to pass visitor state:

```typescript
import { useVisitor } from '@/contexts/VisitorContext';

export function useVisibility(options: Partial<VisibilityOptions> = {}): UseVisibilityResult {
  const location = useLocation();
  const { isAuthenticated } = useSessionAuth();
  const { isVisitor } = useVisitor();  // NEW
  
  return useMemo(() => {
    const opts: VisibilityOptions = {
      isAuthenticated,
      isVisitor,  // NEW
      keyboardOpen: options.keyboardOpen ?? false,
    };
    
    const visibility = createVisibilityChecker(location.pathname, opts);
    // ...
  }, [location.pathname, isAuthenticated, isVisitor, options.keyboardOpen]);
}
```

---

### Step 4: Update createVisibilityChecker

**File**: `src/shell/config/visibility.ts`

Update to pass the new options:

```typescript
export function createVisibilityChecker(pathname: string, options: VisibilityOptions = {}) {
  return {
    showJude: shouldShowComponent('jude', pathname, options),
    showMusicPlayer: shouldShowComponent('musicPlayer', pathname, options),
    showBottomNav: shouldShowComponent('bottomNav', pathname, options),
    showQuickMessage: shouldShowComponent('quickMessage', pathname, options),
    showSidebar: shouldShowComponent('sidebar', pathname, options),
    showNotificationBanner: shouldShowComponent('notificationBanner', pathname, options),
    showPWAPrompt: shouldShowComponent('pwaPrompt', pathname, options),
  };
}
```

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `src/shell/FloatingLayer.tsx` | Edit | Remove duplicate VisitorMusicSync |
| `src/shell/config/visibility.ts` | Edit | Add `isVisitor` option and `allowForVisitors` config |
| `src/shell/hooks/useVisibility.ts` | Edit | Import useVisitor and pass isVisitor to options |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - existing auth checks still work |
| Works with existing data? | Yes - no database changes |
| 3G optimized? | Yes - no additional network calls |
| Backward compatible? | Yes - new options are optional with defaults |
| Hook ordering maintained? | Yes - useVisitor called unconditionally at top |
| Edge cases handled? | Yes - defaults to false for isVisitor |

---

## Expected Outcome

After these changes:

1. **Visitors can see** music player and Jude during their tour
2. **Visitors cannot see** quick message FAB, notification banner (auth-only features)
3. **No duplicate rendering** of VisitorMusicSync
4. **Bottom nav works** for visitors (already does since no auth requirement)
5. **Seamless transition** - when visitor signs up, isVisitor becomes false and components re-evaluate visibility

---

## Architecture Diagram (Before vs After)

```text
BEFORE:
┌───────────────────────────────────────────────────────┐
│  Visibility Check                                      │
│    isAuthenticated? ───────┬─────────────────────────→│
│                            │                           │
│    ❌ Visitors blocked     │  ✅ Authenticated shown  │
└───────────────────────────────────────────────────────┘

AFTER:
┌───────────────────────────────────────────────────────┐
│  Visibility Check                                      │
│    isAuthenticated? ───────┬─────────────────────────→│
│         │                  │                           │
│         ↓ No               │  ✅ Authenticated shown  │
│    isVisitor? ─────────────┤                           │
│         │                  │                           │
│    ✅ Yes + allowForVisitors → Show (Jude, Music)    │
│         │                  │                           │
│    ❌ No → Hide (redirect to auth)                    │
└───────────────────────────────────────────────────────┘
```
