
# Plan: Fix React useState null Error in FirstTimeUserWelcome

## Problem Summary

When clicking "Explorer sans inscription" on the homepage, users see a React error:
```
TypeError: Cannot read properties of null (reading 'useState')
at FirstTimeUserWelcome
```

## Root Cause Analysis

The error occurs due to a module isolation issue during lazy component mounting:

**Navigation Flow:**
1. User on `/` (Index page - outside AppShell)
2. Clicks "Explorer sans inscription" → starts visitor mode
3. Navigates to `/dashboard` (inside AppShell)
4. AppShell mounts → FloatingLayer mounts → lazy loads `FirstTimeUserWelcome`
5. `FirstTimeUserWelcome` imports `framer-motion`
6. `framer-motion` has its own internal React reference that's not deduplicated
7. When `useState` is called, React's dispatcher is `null` because two React instances exist

**Why This Happens:**
- `framer-motion` is NOT in the `resolve.dedupe` array in `vite.config.ts`
- The component mounts during an unstable navigation transition
- Lazy loading + dynamic imports can create timing windows where React's dispatcher isn't initialized

## Solution Overview

Two-pronged approach:

1. **Add `framer-motion` to Vite deduplication** - ensures single React instance
2. **Add rendering guards to onboarding components** - prevents mounting during unstable states

## Implementation Details

### File 1: `vite.config.ts`

**Current `resolve.dedupe` (line 90):**
```typescript
dedupe: ["react", "react-dom", "react/jsx-runtime", "react-router", "react-router-dom"],
```

**Updated:**
```typescript
dedupe: [
  "react", 
  "react-dom", 
  "react/jsx-runtime", 
  "react-router", 
  "react-router-dom",
  "framer-motion"
],
```

**Current `optimizeDeps.include` (line 20):**
```typescript
include: ["next-themes", "react-router-dom"],
```

**Updated:**
```typescript
include: ["next-themes", "react-router-dom", "framer-motion"],
```

**Force cache rebuild by updating cacheDir (line 15):**
```typescript
// Current
cacheDir: "node_modules/.vite-edupreneurs-v2",

// Updated
cacheDir: "node_modules/.vite-edupreneurs-v3",
```

### File 2: `src/components/firsttime/FirstTimeUserWelcome.tsx`

Add a rendering guard that delays mount until the navigation transition is complete:

**Current component start (lines 10-14):**
```tsx
const FirstTimeUserWelcome = () => {
  const { showWelcome, userNickname, completeWelcome, isLoading } = useFirstTimeUser();
  const { shouldAnimate, shouldShowGlow } = useNetworkAwareAnimations();
  
  const [phase, setPhase] = useState<...>('greeting');
```

**Updated with stability guard:**
```tsx
const FirstTimeUserWelcome = () => {
  // STABILITY GUARD: Use safe context access pattern to prevent null dispatcher errors
  const firstTimeUser = useFirstTimeUser();
  const animations = useNetworkAwareAnimations();
  
  // Track mount stability to prevent errors during navigation transitions
  const [isStable, setIsStable] = useState(false);
  
  // Wait one render cycle for React dispatcher to stabilize after lazy load
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsStable(true);
      });
    });
    return () => cancelAnimationFrame(timer);
  }, []);
  
  const [phase, setPhase] = useState<'greeting' | 'intro' | 'walkthrough' | 'progress' | 'done'>('greeting');
  // ... rest of useState calls
  
  // Early return AFTER all hooks are called (prevents hook count mismatch)
  if (!isStable) return null;
  if (!firstTimeUser.showWelcome || firstTimeUser.isLoading) return null;
```

### File 3: `src/components/firsttime/AvatarGenerationStep.tsx`

Apply the same stability pattern:

```tsx
const AvatarGenerationStep = () => {
  const firstTimeUser = useFirstTimeUser();
  const animations = useNetworkAwareAnimations();
  
  const [isStable, setIsStable] = useState(false);
  
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsStable(true);
      });
    });
    return () => cancelAnimationFrame(timer);
  }, []);
  
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  
  if (!isStable) return null;
  if (!firstTimeUser.showAvatarGeneration || firstTimeUser.isLoading) return null;
```

### File 4: `src/components/firsttime/FirstTimeUserTour.tsx`

Apply the same stability pattern:

```tsx
const FirstTimeUserTour = () => {
  // All hooks called unconditionally at top
  const location = useLocation();
  const navigate = useNavigate();
  const firstTimeUser = useFirstTimeUser();
  const animations = useNetworkAwareAnimations();
  
  const [isStable, setIsStable] = useState(false);
  
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsStable(true);
      });
    });
    return () => cancelAnimationFrame(timer);
  }, []);
  
  // ... other state
  
  if (!isStable) return null;
  if (!firstTimeUser.tourActive || firstTimeUser.tourCompleted) return null;
```

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Backward compatible? | ✓ | Same visual behavior, just delayed by 1-2 frames |
| Affects existing users? | ✓ | No - only prevents error during first mount |
| 3G performance? | ✓ | Minimal delay (2 animation frames ~32ms) |
| Works with dark mode? | ✓ | No visual changes |
| Hook count stable? | ✓ | All hooks called unconditionally before early returns |
| Accessibility? | ✓ | No changes to ARIA or interaction patterns |

## Files to Modify

| File | Change |
|------|--------|
| `vite.config.ts` | Add framer-motion to dedupe + optimizeDeps, bump cacheDir |
| `src/components/firsttime/FirstTimeUserWelcome.tsx` | Add stability guard pattern |
| `src/components/firsttime/AvatarGenerationStep.tsx` | Add stability guard pattern |
| `src/components/firsttime/FirstTimeUserTour.tsx` | Add stability guard pattern |

## Expected Result

After implementation:
- "Explorer sans inscription" button works without React errors
- All onboarding components mount gracefully after navigation stabilizes
- No more "Cannot read properties of null" errors during page transitions
- Consistent behavior across all devices and connection speeds

## Technical Rationale

**Why the double requestAnimationFrame?**

This is a proven pattern (documented in project memory) that ensures:
1. The first rAF waits for the current paint cycle to complete
2. The second rAF waits for the next paint cycle
3. By this point, React's fiber reconciliation is complete and the dispatcher is stable

This matches the existing pattern used in:
- Tour-initiated navigation (per memory: "double requestAnimationFrame with 800ms stabilization delay")
- Dialog rendering guards (per memory: "only mount when dependencies are stable")
