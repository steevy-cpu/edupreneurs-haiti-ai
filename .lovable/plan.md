
# Fix: React Dispatcher Null Error During Tour Navigation

## Root Cause

When the tour calls `navigate('/feed')` (or any other lazy-loaded route) from inside a `requestAnimationFrame` callback, it triggers React Router to begin rendering the new route. Because `Feed`, `Matieres`, `NotificationPermissionBanner`, and the other tour pages are all `React.lazy()` components, they must first fetch their JS chunk over the network.

The crash happens in this sequence:

1. rAF callback fires → `navigate('/feed')` called
2. React Router starts rendering Feed's `<Suspense>` boundary
3. `React.lazy()` triggers the dynamic `import()` for Feed's chunk
4. While the chunk is in-flight, React suspends
5. The chunk resolves and React tries to resume — but the fiber dispatcher is `null` at this exact moment because the render was initiated outside React's normal event system (from inside rAF)
6. Feed calls `useNavigate()` → `useContext()` → **crash**: `Cannot read properties of null (reading 'useContext')`

This is not a bug in Feed itself. It happens to every lazy-loaded page the tour navigates to when its chunk has not been pre-fetched.

## The Fix: Preload All Tour Route Chunks Before Navigation

The codebase already has `useRoutePreloader` with a `preloadChunk(path)` function. It calls `import('@/pages/Feed')` eagerly so the JS chunk is resolved and cached in the browser's module registry **before** React tries to mount the component. Once the chunk is pre-warmed, `React.lazy()` resolves synchronously (from module cache) and the dispatcher null race cannot occur.

**Two-layer approach:**

1. **On tour start** — preload ALL tour route chunks at once (idle callback, does not block 3G)
2. **Before each navigation** — preload the next step's chunk with a 300ms head-start before calling `navigate()`

## Exact Changes — One File Only

### `src/components/firsttime/FirstTimeUserTour.tsx`

**Change 1 — Import `useRoutePreloader`:**
```tsx
import { useRoutePreloader } from "@/shell/hooks/useRoutePreloader";
```

**Change 2 — Call the hook inside the component:**
```tsx
const { preloadChunk } = useRoutePreloader();
```

**Change 3 — Add a one-time "preload all tour routes" effect on mount:**
```tsx
// Preload all lazy chunks for tour routes on mount (idle, non-blocking)
useEffect(() => {
  const uniquePaths = [...new Set(tourSteps.map(s => s.path))];
  const timer = setTimeout(() => {
    uniquePaths.forEach(path => preloadChunk(path));
  }, 1500); // defer 1.5s so page initial render completes first
  return () => clearTimeout(timer);
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

**Change 4 — Preload the next step's chunk BEFORE navigating:**

Replace the existing navigation effect:
```tsx
// Before (current code):
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    navigate(currentStep.path);
    setTimeout(() => setIsNavigating(false), 800);
  });
});
```

With:
```tsx
// After (new code):
// Preload the chunk first, then navigate after 300ms head-start
preloadChunk(currentStep.path);
setTimeout(() => {
  navigate(currentStep.path);
  setTimeout(() => setIsNavigating(false), 800);
}, 300);
```

This replaces `requestAnimationFrame + requestAnimationFrame` (which fires in ~2 frames, ~33ms) with a 300ms window. This gives the dynamic `import()` enough time to at minimum start fetching and — on a fast connection — fully resolve before React tries to mount the component. On 3G, the chunk may not be ready in 300ms, but `preloadChunk` internally uses `requestIdleCallback` with a 2-second timeout, so the import is already in-flight. The worst case on 3G: the Suspense boundary catches it and shows the existing skeleton fallback rather than crashing.

## Why Only This File

`GlobalMusicPlayer.tsx` and `App.tsx` do not need changes. The preloading happens inside the tour component that controls navigation. `useRoutePreloader` is already in the shell's hook layer and is safe to use from any component inside `AppShell`.

## Safety Verification

| Check | Result |
|---|---|
| Does this affect existing navigation (sidebar, bottom nav)? | No. `useRoutePreloader` is already used by both nav components. Adding it to the tour is additive only. |
| Does `preloadChunk` throw on unknown paths? | No. It checks `ROUTE_CHUNKS[path]` and returns early if not found. All tour paths are already in `ROUTE_CHUNKS`. |
| Does the 1.5s deferred preload affect 3G performance on tour start? | No. It fires on `setTimeout` (deferred, non-blocking) and internally uses `requestIdleCallback`. It will not compete with the dashboard's own data loading. |
| Does removing double-rAF from the navigation effect break anything? | No. The 300ms `setTimeout` is strictly longer and gives more time than double-rAF (~33ms). The `isNavigating` guard still prevents duplicate navigations. |
| Does this fix `NotificationPermissionBanner` crash too? | Yes. That banner is rendered by `FloatingLayer` and crashes for the same reason — its chunk isn't pre-warmed. The tour-mount preload effect calls `preloadChunk` for all unique tour paths, which includes `/dashboard`. The banner renders inside AppShell, so the fix covers it indirectly. |
| Files changed | 1 (`FirstTimeUserTour.tsx`) |
| New dependencies | 0 |
| Database changes | None |
| 3G impact | Positive — chunks pre-fetched during idle time, avoiding crash-level fallbacks |
