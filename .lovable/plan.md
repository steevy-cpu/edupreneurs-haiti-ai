
# Add Music Player FAB as a New Tour Step

## What Exists Today

The `FirstTimeUserTour` has 7 steps. The music player FAB is a `<Button>` rendered inside `GlobalMusicPlayer.tsx` at approximately line 224. It currently has **no `data-tour` attribute**, so the spotlight system cannot target it. The tour's spotlight mechanism works by calling `document.querySelector(currentStep.target)` and reading `getBoundingClientRect()`.

The new step will sit at **index 1** in the array — after dashboard (`/dashboard`) and before matières (`/matieres`). Since it is a global feature visible from any page, it stays on `/dashboard` (no navigation needed), making the transition seamless.

---

## Exact Changes Required

### File 1 — `src/components/GlobalMusicPlayer.tsx`

**Change:** Add `data-tour="music-fab"` to the outer wrapper `<div>` of the floating music player (line ~208). This is the `fixed z-50` container div that wraps both the minimized button and the expanded card. Targeting the wrapper is safer than targeting the button directly because `getBoundingClientRect()` on the wrapper gives a stable rect regardless of minimized/expanded state.

```tsx
// Before (line 208):
<div 
  ref={playerRef}
  className="fixed z-50"
  style={{ ... }}
>

// After:
<div 
  ref={playerRef}
  data-tour="music-fab"
  className="fixed z-50"
  style={{ ... }}
>
```

---

### File 2 — `src/components/firsttime/FirstTimeUserTour.tsx`

**Change A — Insert the new step at index 1** in the `tourSteps` array:

```ts
{
  path: "/dashboard",       // stays on dashboard — no navigation
  title: "Musique d'étude 🎵",
  description: "Tu peux écouter de la musique pendant que tu étudies! 🎵 Clique sur ce bouton pour ouvrir le lecteur et choisir ta playlist préférée.",
  target: "[data-tour='music-fab']",
},
```

This is placed at array index 1, shifting the existing matieres step to index 2 and all subsequent steps by one. No step logic needs changing — `tourSteps.length` is used everywhere, so the progress bar, step count display, and dot indicators all update automatically.

**No other changes needed in `FirstTimeUserTour.tsx`** — the existing spotlight system, navigation guard, typewriter, step dots, and progress bar all derive from `tourSteps.length` dynamically.

---

## Why `/dashboard` for This Step

The music FAB is a floating element that persists across all authenticated routes via `FloatingLayer`. Keeping the step path as `/dashboard` means:
- No route transition occurs between step 0 (dashboard) and step 1 (music FAB) — the user is already on `/dashboard`
- The `isNavigating` guard in the tour skips navigation when `location.pathname === currentStep.path`
- The spotlight computes immediately (900ms timeout after step change, no nav delay)
- The FAB is guaranteed to be mounted and visible because `FloatingLayer` is always active inside `AppShell`

---

## Spotlight Behavior on This Step

The music FAB sits at `fixed z-50` in the bottom-right corner (or wherever the user dragged it). The spotlight `<div>` is rendered at `z-[1002]` with `pointer-events: none`. The tour card sits at `z-[1004]`. This layering is already correct — the FAB at z-50 will be inside the spotlight cutout and clickable (pointer-events: none on the overlay means interaction passes through).

The `animate-pulse` on the spotlight border will draw the user's eye directly to the music button in the corner of the screen — exactly the right behaviour for a feature the user might never notice otherwise.

---

## Safety Verification

| Check | Result |
|---|---|
| Does adding `data-tour` to `GlobalMusicPlayer.tsx` affect any existing logic? | No. It is a plain HTML attribute, invisible to React and CSS. |
| Does inserting at index 1 break the `previousTourStep` / `nextTourStep` buttons? | No. They increment/decrement `tourStep` which is compared against `tourSteps.length - 1` (derived). |
| Does `onboarding_tour_completed` in the DB need updating? | No. The step count is stored client-side in `sessionStorage` / context. The DB flag is only set when `completeTour()` is called. |
| Is `tourSteps.length` hardcoded anywhere in the tour? | No. The progress bar, dot count, `isLastStep`, and the "Étape X sur Y" text all reference `tourSteps.length` dynamically. All become 8 automatically. |
| Does this step require any new assets, dependencies, or edge function calls? | No. Zero new dependencies. |
| Does the FAB always render when the tour is active? | Yes. The tour only activates after the user is authenticated and on `/dashboard`. `FloatingLayer` is always mounted in `AppShell`. `GlobalMusicPlayer` only returns `null` if `tracks.length === 0` — but the music library is fetched on context init. If tracks haven't loaded yet, the spotlight simply degrades gracefully (returns `null` when `querySelector` finds nothing). |
| 3G impact? | Zero. `data-tour` is a string attribute. No new network request, no new bundle weight. |
| Does this affect the `VisitorTour`? | No. The visitor tour is a completely separate component (`VisitorTour.tsx`) with its own `tourSteps` array. It is untouched. |

---

## Files Modified

| File | Change |
|---|---|
| `src/components/GlobalMusicPlayer.tsx` | Add `data-tour="music-fab"` to the outer floating container `<div>` (1 attribute, 1 line) |
| `src/components/firsttime/FirstTimeUserTour.tsx` | Insert 1 new step object at index 1 of `tourSteps` array (6 lines) |
