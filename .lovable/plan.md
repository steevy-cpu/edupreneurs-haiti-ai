
# Fix: React Dispatcher Null Error — Definitive Root Cause Analysis & Fix

## Summary of All Issues Found

Four distinct bugs exist. The dispatcher crash is only one of them.

---

## Bug 1 (CRITICAL) — Shared Suspense Boundary Causes Dispatcher Collision

### Location: `src/shell/FloatingLayer.tsx`

`OnboardingOverlays` wraps `FirstTimeUserWelcome`, `AvatarGenerationStep`, and `FirstTimeUserTour` in a **single** `<Suspense>` boundary. When the tour navigates to a lazy-loaded page (Leaderboard, Feed, Matieres, etc.), React suspends that page's component. This suspension event interacts with the FloatingLayer's own Suspense tree at exactly the wrong moment — when the page chunk resolves, React resumes rendering inside a fiber that has lost its dispatcher context, causing the crash.

**Fix:** Give `FirstTimeUserTour` its own isolated `<Suspense>` boundary, separate from the Welcome and Avatar steps.

```tsx
// CURRENT (broken):
function OnboardingOverlays() {
  return (
    <Suspense fallback={null}>
      <FirstTimeUserWelcome />
      <AvatarGenerationStep />
      <FirstTimeUserTour />
    </Suspense>
  );
}

// FIXED:
function OnboardingOverlays() {
  return (
    <>
      <Suspense fallback={null}>
        <FirstTimeUserWelcome />
        <AvatarGenerationStep />
      </Suspense>
      <Suspense fallback={null}>
        <FirstTimeUserTour />
      </Suspense>
    </>
  );
}
```

---

## Bug 2 (HIGH) — `preloadChunk` Uses `requestIdleCallback` — Browser Is Never Idle During Tour

### Location: `src/components/firsttime/FirstTimeUserTour.tsx` + `src/shell/hooks/useRoutePreloader.ts`

The current fix calls `preloadChunk(currentStep.path)` before a 300ms delay and then `navigate()`. However, `preloadChunk` internally schedules the import via `requestIdleCallback` with a 2-second timeout. During the tour, the browser is never truly idle — the typewriter animation, spotlight pulse, and framer-motion animations are all running. This means `requestIdleCallback` may not fire until **after** `navigate()` is called at 300ms, giving zero head-start to the chunk fetch.

**Fix:** In the navigation effect, bypass `preloadChunk` and call the dynamic `import()` directly using a local eager preload map. This fires immediately, synchronously starting the network request, before the 500ms delay elapses.

```tsx
// Direct eager import map — fires immediately, no idle callback
const EAGER_PRELOAD: Record<string, () => Promise<unknown>> = {
  '/matieres':         () => import('@/pages/Matieres'),
  '/feed':             () => import('@/pages/Feed'),
  '/leaderboard':      () => import('@/pages/Leaderboard'),
  '/passion-discovery':() => import('@/pages/PassionDiscovery'),
  '/community':        () => import('@/pages/Community'),
  '/settings':         () => import('@/pages/Settings'),
};

// In the navigation effect:
if (!isNavigating && location.pathname !== currentStep.path) {
  setIsNavigating(true);
  // Fire import immediately — no idle callback delay
  EAGER_PRELOAD[currentStep.path]?.().catch(() => {});
  setTimeout(() => {
    navigate(currentStep.path);
    setTimeout(() => setIsNavigating(false), 800);
  }, 500); // 500ms gives real headroom even on 3G
}
```

The on-mount preload effect (1.5s delay) is kept as-is — it is a safety net for all routes, and its `requestIdleCallback` behavior is fine for that non-urgent use case.

---

## Bug 3 (MEDIUM) — `TOUR_STEP_NAV_PATHS` Off-By-One After Adding Music Step

### Location: `src/contexts/FirstTimeUserContext.tsx`

When the music FAB step was inserted at index 1 in `tourSteps`, the `TOUR_STEP_NAV_PATHS` map in `FirstTimeUserContext.tsx` was **not updated**. It still has 7 entries (indices 0–6) for what is now an 8-step tour (indices 0–7). This causes the mobile bottom nav to highlight the wrong icon during tour steps 1–7.

**Fix:** Update the map to reflect the new 8-step tour:

```ts
// CURRENT (7-step map — wrong):
const TOUR_STEP_NAV_PATHS: Record<number, string | null> = {
  0: '/dashboard',
  1: '/matieres',     // ← was Matieres, now points at Music FAB step
  2: '/feed',         // ← was Feed, now points at Matieres
  3: null,
  4: null,
  5: '/community',
  6: null,
};

// FIXED (8-step map — correct):
const TOUR_STEP_NAV_PATHS: Record<number, string | null> = {
  0: '/dashboard',        // Dashboard KPI cards
  1: '/dashboard',        // Music FAB (stays on /dashboard)
  2: '/matieres',         // Matieres
  3: '/feed',             // Feed
  4: null,                // Leaderboard — no bottom nav icon
  5: null,                // Passion Discovery — no bottom nav icon
  6: '/community',        // Community
  7: null,                // Settings — no bottom nav icon
};
```

---

## Bug 4 (LOW) — `three` Missing from Vite `dedupe`

### Location: `vite.config.ts`

The `dedupe` array currently contains React, React DOM, React Router, and Framer Motion. The Jude 3D avatar uses `three` and `@react-three/fiber`. If any lazy chunk loaded during the tour pulls a different reference to React through the Three.js module graph, the dispatcher can go null via a secondary path. Adding `three` and `@react-three/fiber` to `dedupe` closes this vector definitively.

```ts
// CURRENT:
dedupe: ["react", "react-dom", "react/jsx-runtime", "react-router", "react-router-dom", "framer-motion"],

// FIXED:
dedupe: ["react", "react-dom", "react/jsx-runtime", "react-router", "react-router-dom", "framer-motion", "three", "@react-three/fiber"],
```

---

## Files Modified

| File | Bug Fixed | Change |
|---|---|---|
| `src/shell/FloatingLayer.tsx` | Bug 1 (CRITICAL) | Split `OnboardingOverlays` into two separate `<Suspense>` boundaries |
| `src/components/firsttime/FirstTimeUserTour.tsx` | Bug 2 (HIGH) | Replace `preloadChunk` with direct eager `import()` map; increase delay to 500ms |
| `src/contexts/FirstTimeUserContext.tsx` | Bug 3 (MEDIUM) | Update `TOUR_STEP_NAV_PATHS` from 7-entry to 8-entry map |
| `vite.config.ts` | Bug 4 (LOW) | Add `three` and `@react-three/fiber` to `resolve.dedupe` |

---

## Safety Verification

| Check | Result |
|---|---|
| Does splitting the Suspense boundary affect Welcome/Avatar step behavior? | No. They share one boundary and that boundary is unchanged in behavior. |
| Does adding a local `EAGER_PRELOAD` map duplicate the `ROUTE_CHUNKS` map in `useRoutePreloader`? | Yes, there is duplication. This is intentional — the eager map bypasses the idle callback by design. A comment explains this. |
| Does increasing the delay to 500ms make tour navigation feel slow? | Negligible. Step transitions already include typewriter animation and spotlight recompute (900ms). The 500ms fires before the user sees anything change. |
| Does fixing `TOUR_STEP_NAV_PATHS` require a DB migration? | No. This is a client-side constant only. |
| Does adding `three` to `dedupe` affect the chess game or Three.js Jude avatar? | No. Deduplication only ensures a single instance, which is what we already want. |
| Could the crash still occur after all 4 fixes? | Very unlikely. Bug 1 (Suspense isolation) is the structural fix. Bug 2 (eager import) eliminates the timing race. Together they address both the root cause and the timing window. |
| 3G impact | Positive. Eager imports fire immediately on step change, giving maximum network head-start before navigation. |
