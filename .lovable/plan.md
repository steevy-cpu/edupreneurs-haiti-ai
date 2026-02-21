

# First-Time UX Plan A -- Dashboard Empty State and Matieres Friction

## Fix 1 -- First-Time User Guidance Card on Dashboard

**File:** `src/components/dashboard/tabs/OverviewTab.tsx`

**Current behavior:** When `recentSubjectsFeature.data` is empty and not loading/errored, nothing renders (line 194: `recentSubjectsFeature.data.length > 0 &&`). New users see a gap.

**Change:** After the error state block (line 193) and before the existing `recentSubjectsFeature.data.length > 0` block, add an `else` branch for when data is empty (length === 0, not loading, no error):

- Render a Card with:
  - A `BookOpen` icon in a gradient circle
  - Title: "Commence ton apprentissage!"
  - Text: "Tu n'as pas encore commence. Lance ta premiere lecon maintenant!"
  - A gradient CTA Button "Commencer a apprendre" that navigates to `/matieres`
- This card only shows when `recentSubjectsFeature.data.length === 0` and disappears once the student has activity

**Lines affected:** ~194-235 in OverviewTab.tsx

---

## Fix 2 -- KPI Zero Helper Text

**File:** `src/components/dashboard/tabs/OverviewTab.tsx`

**Current behavior:** The KPI grid (lines 107-141) shows 0 for Gold, Lecons, Score, Etude with no explanation.

**Change:** Immediately after the KPI Card closing tag (line 141), add a conditional block:

```
if analytics.gold === 0 && analytics.totalLessonsCompleted === 0 && analytics.averageScore === 0 && analytics.studyTimeThisWeek === 0
```

Render a centered `<p>` with `text-xs text-muted-foreground text-center -mt-2 mb-2`:
"Complete ta premiere lecon pour commencer a accumuler des points!"

This disappears as soon as any KPI becomes non-zero.

**Lines affected:** After line 141 in OverviewTab.tsx

---

## Fix 3 -- Remove Matieres "Explorer" Gate

**File:** `src/pages/Matieres.tsx`

**Current behavior:** `showContent` state (line 58) defaults to `false`. Lines 398-456 render a large "Contenu en cours de developpement" card with an "Explorer" button that sets `showContent(true)`. Lines 459-588 only render subjects when `showContent` is true.

**Change:**
- Change the initial state of `showContent` from `false` to `true` (line 58)
- Remove the entire "Content in Development Overlay" block (lines 398-456)
- Remove the `showContent` condition from the grade button onClick (line 323: `setShowContent(false)`) -- keep grade switching but don't reset to hidden
- The main content block (line 459) already checks `showContent` -- with default `true`, subjects show immediately

For NS3/NS4 series flow: The series selection card at line 351 checks `showContent`, so with default `true`, it will show the series picker immediately after selecting NS3/NS4, which is correct behavior.

**Lines affected:** 58, 323, 398-456, 459 in Matieres.tsx

---

## Fix 4 -- Friendly Empty State for Grades With No Content

**File:** `src/pages/Matieres.tsx`

**Current behavior:** Lines 590-618 show a generic "Contenu en preparation" card with a "Explorer 7AF" button when no subjects exist.

**Change:** Replace lines 592-617 with a friendlier empty state:
- `Construction` icon (already imported) in an amber-tinted circle
- Title: "Le contenu pour ton niveau arrive bientot!"
- Description: "En attendant, explore les autres niveaux disponibles."
- Button: "Explorer d'autres niveaux" that scrolls to the grade selector or resets to 7AF
- Only show this when NOT caused by search/filter (existing logic already handles that case)

**Lines affected:** 592-617 in Matieres.tsx

---

## Fix 5 -- Matieres Loading Timeout with Retry

**File:** `src/pages/Matieres.tsx`

**Current behavior:** Lines 378-396 show a skeleton grid while `isLoading` is true. If the query hangs on 3G, skeleton shows forever.

**Change:**
- Add a `useState<boolean>(false)` for `loadingTimedOut`
- Add a `useEffect` that starts a 10-second timer when `isLoading` is true. If still loading after 10s, set `loadingTimedOut = true`. Clear timer when `isLoading` becomes false.
- In the loading block (line 378), add a condition: if `loadingTimedOut`, render an `ErrorState` component (already used in OverviewTab) with message "Impossible de charger les matieres" and a "Reessayer" button that calls `refetch()` from `useMatieresData`
- Import `ErrorState` from `@/components/shared/ErrorState`
- The `useMatieresData` hook already exposes `refetch`

**Lines affected:** Add state + effect near line 58, modify lines 378-396 in Matieres.tsx

---

## Fix 6 -- Community Loading Timeout with Retry

**File:** `src/pages/Community.tsx`

**Current behavior:** `isLoadingConversations` starts as `true` (line 86). The `checkUser` function (line 531) has no try/catch -- if `supabase.auth.getUser()` throws on 3G, `isLoadingConversations` stays `true` forever.

**Change:**
- Add `useState<boolean>(false)` for `loadingTimedOut`
- Add a `useEffect` that starts a 10-second timer when `isLoadingConversations` is true and `!isVisitor`. If still loading after 10s, set `loadingTimedOut = true`. Reset when loading finishes.
- Wrap `checkUser` body in try/catch -- on error, set `isLoadingConversations(false)` and log the error
- In the `ConversationSidebar` rendering area or before it, check: if `loadingTimedOut`, render an `ErrorState` with message "Impossible de charger les conversations" and a "Reessayer" button that calls `checkUser()` again (which triggers `fetchConversations` via the `user` dependency)
- Import `ErrorState` from `@/components/shared/ErrorState`

**Lines affected:** Add state near line 86, add effect, modify lines 531-543, modify rendering near line 2172 in Community.tsx

---

## Safety Verification

| Check | Status |
|-------|--------|
| Existing dashboard layout preserved | Yes -- only adds new conditional blocks, no existing elements removed |
| KPI rendering unchanged | Yes -- helper text is additive below the grid |
| Matieres subject grid logic unchanged | Yes -- only the gate is removed, grid rendering is identical |
| NS3/NS4 series flow preserved | Yes -- series picker still shows for NS3/NS4 grades |
| Community realtime subscriptions unaffected | Yes -- only adding timeout to initial load |
| No new dependencies | Correct -- ErrorState already exists and is imported in OverviewTab |
| No DB schema changes | Correct |
| No provider stack changes | Correct |
| 3G impact | Positive -- fewer clicks, timeout-based recovery |
| Student-facing components improved, not broken | Yes -- all changes are additive UX improvements |

## Files Changed

| File | Fix |
|------|-----|
| `src/components/dashboard/tabs/OverviewTab.tsx` | Fix 1 + Fix 2: First-time card + KPI helper |
| `src/pages/Matieres.tsx` | Fix 3 + Fix 4 + Fix 5: Remove gate, friendly empty state, loading timeout |
| `src/pages/Community.tsx` | Fix 6: Loading timeout + try/catch in checkUser |

