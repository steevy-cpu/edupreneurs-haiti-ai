

# Gold Visibility During Lessons

## Overview
Five surgical changes to make the student's gold balance visible and reactive during lessons and exam practice. No new database queries needed -- we add `gold_earned` to the existing `useUserProfile` hook and use query invalidation for reactivity.

---

## Fix 1 -- Create `src/components/shared/GoldBadge.tsx`

A lightweight, reusable pill badge component:

- **Props:** `goldAmount: number`, `animated?: boolean` (triggers a pulse animation when true)
- **Display:** Gold coin emoji + formatted number (e.g., "1,250 Gold")
- **Styling:** Amber/gold pill (`bg-amber-100 text-amber-800`, dark mode: `dark:bg-amber-900/30 dark:text-amber-300`), compact (`text-xs px-2 py-0.5`)
- **Animation:** When `animated` is true, apply a brief `animate-pulse` for ~1s via a `useEffect` that auto-clears
- **Export** from `src/components/shared/index.ts`

No new dependencies. Pure Tailwind + React state.

---

## Fix 2 -- Add `gold_earned` to `useUserProfile`

**File:** `src/hooks/useUserProfile.ts`

- **Line 19:** Add `goldEarned: number` to the `CachedUserProfile` interface
- **Line 27:** Add `goldEarned: 0` to `FALLBACK_PROFILE`
- **Line 36:** Change select to `"avatar_url, nickname, academic_grade, gold_earned"`
- **Line 63:** Add `goldEarned: profile?.gold_earned ?? 0` to the returned profile object

This makes gold available everywhere `useUserProfile` is already called, with zero additional queries. The existing 10-minute stale time and localStorage persistence apply automatically.

---

## Fix 3 -- Wire gold display in `LessonHeader`

**File:** `src/features/matieres/components/LessonHeader.tsx`

- Add new props: `goldEarned: number`, `onGoldUpdate?: (amount: number) => void`
- Add `useState` for `currentGold` (initialized from `goldEarned`) and `isGoldAnimated`
- Add a `useEffect` syncing `currentGold` when `goldEarned` prop changes (for initial load)
- Render `<GoldBadge goldAmount={currentGold} animated={isGoldAnimated} />` inside the badges row (line 61-68), after the "Terminee" badge
- Expose a method pattern: when `onGoldUpdate` fires from child components, increment `currentGold` locally and trigger animation

**File:** `src/components/LessonPageTemplate.tsx`

- Import `useUserProfile` and `useInvalidateUserProfile`
- Add `handleGoldUpdate` callback that:
  1. Calls `invalidateUserProfile()` to refresh the cached gold
  2. Passes the amount up to `LessonHeader` for immediate local increment + animation
- Pass `goldEarned={profile.goldEarned}` and `onGoldUpdate={handleGoldUpdate}` to `<LessonHeader>`
- Pass `onGoldUpdate={handleGoldUpdate}` to `<LessonActivitiesTab>` and `<LessonQuizTab>`

---

## Fix 4 -- Wire `onGoldUpdate` through tab components

### `LessonActivitiesTab.tsx`
- Add `onGoldUpdate?: () => void` to `LessonActivitiesTabProps`
- Pass `onGoldUpdate={onGoldUpdate}` to both `<InteractiveActivitiesEnhanced>` instances (lines 82, 123)

### `LessonQuizTab.tsx`
- Add `onGoldUpdate?: () => void` to `LessonQuizTabProps`
- The `QuizRenderer` component does not currently support `onGoldUpdate` -- it only has `onComplete`. We will NOT modify `QuizRenderer` internals. Instead, wire `onGoldUpdate` to the `onComplete` callback in `LessonQuizTab`: when `onComplete` fires, also call `onGoldUpdate?.()`.
- Pass `onGoldUpdate` to the legacy `<HTMLQuizParser>` if it accepts it (it does not currently -- we skip this to avoid scope creep; HTMLQuizParser is legacy fallback only).

### Data flow

```text
LessonPageTemplate
  |-- useUserProfile() --> goldEarned
  |-- handleGoldUpdate() --> invalidateUserProfile + local state
  |
  |-- LessonHeader (goldEarned, onGoldUpdate)
  |     |-- GoldBadge (goldAmount, animated)
  |
  |-- LessonActivitiesTab (onGoldUpdate)
  |     |-- InteractiveActivitiesEnhanced (onGoldUpdate) --> calls on correct answer
  |
  |-- LessonQuizTab (onGoldUpdate)
        |-- QuizRenderer (onComplete) --> triggers onGoldUpdate
```

---

## Fix 5 -- Gold display in `ExamPreparation`

**File:** `src/pages/ExamPreparation.tsx`

- Import `useUserProfile`, `useInvalidateUserProfile`, and `GoldBadge`
- Add local `goldDisplay` state initialized from `profile.goldEarned`
- In `handleAnswerValidated`, after gold is awarded successfully, call `invalidateUserProfile()` and increment local `goldDisplay`
- Render `<GoldBadge>` in the Jude welcome banner area (line 274-287), aligned right alongside the existing avatar

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/shared/GoldBadge.tsx` | Create new |
| `src/components/shared/index.ts` | Add export |
| `src/hooks/useUserProfile.ts` | Add `gold_earned` to select + interface |
| `src/features/matieres/components/LessonHeader.tsx` | Add GoldBadge + props |
| `src/components/LessonPageTemplate.tsx` | Wire useUserProfile + onGoldUpdate |
| `src/features/matieres/components/tabs/LessonActivitiesTab.tsx` | Pass onGoldUpdate through |
| `src/features/matieres/components/tabs/LessonQuizTab.tsx` | Pass onGoldUpdate through |
| `src/pages/ExamPreparation.tsx` | Add GoldBadge |

## Safety Verification

| Check | Status |
|-------|--------|
| No new DB queries (piggybacks on existing profile fetch) | OK |
| No new dependencies | OK |
| No changes to Provider stack or AppShell | OK |
| useUserProfile staleTime/gcTime unchanged | OK |
| Works on 3G (no extra network calls) | OK |
| Existing gold award logic untouched | OK |
| No RLS changes needed | OK |
| Bundle impact minimal (~1KB for GoldBadge) | OK |
| Backward compatible (all new props optional) | OK |

