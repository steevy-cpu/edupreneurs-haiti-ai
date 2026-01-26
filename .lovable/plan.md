
# Fix: Stop Music on User Logout - Root Cause & Solution

## Root Cause Analysis

The previous implementation placed `AuthMusicSync` inside `FloatingLayer`, which is rendered inside `AppShell`. However:

| Route Type | Shell Used | Contains FloatingLayer? |
|------------|------------|------------------------|
| `/auth/*` | `AuthLayout` | No |
| `/dashboard`, `/matieres`, etc. | `AppShell` | Yes |

**When a user logs out:**
1. `supabase.auth.signOut()` is called
2. React Router navigates to `/auth/login`
3. `AppShell` unmounts (including `FloatingLayer` and `AuthMusicSync`)
4. `AuthMusicSync` is destroyed before its `useEffect` can detect the auth change
5. Music continues playing from the orphaned YouTube iframe

## Solution

Move `AuthMusicSync` to `App.tsx` at the top level, outside of any route-specific shell. This ensures it stays mounted during navigation from authenticated routes to auth routes.

---

## Implementation Plan

### Step 1: Move AuthMusicSync to App.tsx

**File**: `src/App.tsx`

Add `AuthMusicSync` directly inside `AppProviders`, before `Routes`:

```typescript
import { AuthMusicSync } from "@/components/auth/AuthMusicSync";

const App = () => (
  <AppProviders>
    {/* Global music sync - must be outside AppShell to survive logout navigation */}
    <AuthMusicSync />
    
    <Routes>
      {/* ... existing routes ... */}
    </Routes>
  </AppProviders>
);
```

### Step 2: Remove AuthMusicSync from FloatingLayer

**File**: `src/shell/FloatingLayer.tsx`

Remove the lazy import and render of `AuthMusicSync` (since it's now in App.tsx):

```typescript
// REMOVE this import:
// const AuthMusicSync = lazy(() => import('@/components/auth/AuthMusicSync').then(...));

// REMOVE this render block:
// <Suspense fallback={null}>
//   <AuthMusicSync />
// </Suspense>
```

---

## Why This Works

```text
Before (broken):
┌─────────────────────────────────────────────────────┐
│  AppProviders                                        │
│    ┌───────────────────────────────────────────────┐│
│    │  Routes                                        ││
│    │    ┌─────────────────────────────────────────┐││
│    │    │  AppShell (only for auth routes)        │││
│    │    │    ┌───────────────────────────────────┐│││
│    │    │    │  FloatingLayer                    ││││
│    │    │    │    └── AuthMusicSync ❌ UNMOUNTS  ││││
│    │    │    └───────────────────────────────────┘│││
│    │    └─────────────────────────────────────────┘││
│    │    ┌─────────────────────────────────────────┐││
│    │    │  AuthLayout (for /auth/*)               │││
│    │    │    └── No AuthMusicSync here!           │││
│    │    └─────────────────────────────────────────┘││
│    └───────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘

After (fixed):
┌─────────────────────────────────────────────────────┐
│  AppProviders                                        │
│    └── AuthMusicSync ✅ ALWAYS MOUNTED              │
│    ┌───────────────────────────────────────────────┐│
│    │  Routes                                        ││
│    │    ├── AppShell (for authenticated routes)    ││
│    │    └── AuthLayout (for /auth/*)               ││
│    └───────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Action |
|------|--------|
| `src/App.tsx` | Add `AuthMusicSync` import and render |
| `src/shell/FloatingLayer.tsx` | Remove `AuthMusicSync` import and render |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - only moves component location |
| Works with existing data? | Yes - uses same contexts |
| 3G optimized? | Yes - no additional network calls, small component |
| Backward compatible? | Yes - no API changes |
| Hook ordering maintained? | Yes - unconditional hooks |
| Component always mounted? | Yes - outside all route shells |

---

## Expected Outcome

After this change:
- Music stops immediately when user clicks logout
- `AuthMusicSync` remains mounted during navigation to `/auth/login`
- The YouTube iframe is destroyed before the auth page loads
- Works regardless of where logout is triggered (sidebar, settings, etc.)
