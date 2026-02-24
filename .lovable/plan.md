

# Grade Auto-Detection and Locking — 3 Surgical Fixes

## Scope

**1 file modified:** `src/pages/Matieres.tsx`
**0 other files touched.** `useMatieresData.ts` is unchanged.

---

## Fix 1 — User-Initiated Selection Guard

**Problem:** When a user manually picks a grade, the auto-detection `useEffect` (lines 134-149) fires again once `userGrade` resolves asynchronously, overriding the manual choice.

**Solution:**
- Add `const hasUserSelectedGrade = useRef(false)` (line ~58 area, alongside other state)
- In the grade button `onClick` handler (line 337), add `hasUserSelectedGrade.current = true`
- In the auto-detection `useEffect` (line 135), add early return: `if (hasUserSelectedGrade.current) return`

**Lines affected:** ~58, 135, 337

---

## Fix 2 — Persist Grade via URL Query Param + localStorage

**Problem:** On refresh, the page always defaults to `7AF`, causing a flash before auto-detection kicks in.

**Solution:**
- Replace `useState<GradeLevel>("7AF")` (line 58) with an initializer function that reads:
  1. URL search param `?grade=X` (highest priority)
  2. `localStorage.getItem('matieres_selected_grade')` (fallback)
  3. `null` as final fallback (not `7AF`)
- In the grade button `onClick` (line 337): save to `localStorage` and update URL via `searchParams.set('grade', grade.id)` using `useSearchParams` from react-router-dom
- In the auto-detection `useEffect`: only set grade if `selectedGrade` is still `null`
- When `selectedGrade` is `null` and still resolving, the grade buttons section shows a loading state (see Fix 3)
- Add `useSearchParams` import from `react-router-dom`

**Lines affected:** ~1 (imports), ~58, ~134-149, ~330-338

---

## Fix 3 — Loading State While Grade Resolves

**Problem:** During the loading window (before `userGrade` resolves), all grades appear unlocked with `7AF` selected, which is confusing.

**Solution:**
- Derive a boolean: `const isGradeResolving = isAuthenticated && !isSuperUser && isLoading && !userGrade && selectedGrade === null`
- When `isGradeResolving` is true, render the grade buttons area with `Skeleton` pulses over each button (using the existing `Skeleton` component already imported on line 7)
- Super users skip this entirely — they see all grades immediately since `isSuperUser` is falsy during loading (it depends on `userId` from the same query), but once resolved they get full access. We handle this by checking `isSuperUser` after data loads.
- Once `userGrade` resolves (or auto-detection sets `selectedGrade`), the real buttons animate in

**Lines affected:** ~312-356 (grade selector section)

---

## Detailed Changes Summary

```text
src/pages/Matieres.tsx
+-- Line 2: add useSearchParams to import
+-- Line ~58: selectedGrade initializer reads URL param > localStorage > null
+-- Line ~58: add hasUserSelectedGrade ref
+-- Lines 134-149: add guard for hasUserSelectedGrade + null check on selectedGrade
+-- Lines 312-356: wrap grade buttons in loading/resolved conditional
+-- Lines 330-338: onClick saves to localStorage + URL param + sets ref
```

No new dependencies. No database changes. No other files.

---

## Verification

| Check | Result |
|---|---|
| Existing functionality broken? | No — same data flow, same hook |
| Provider stack affected? | No |
| New dependencies? | No — useSearchParams already available via react-router-dom |
| Bundle size impact? | Negligible — ~20 lines added |
| 3G performance? | Improved — no flash of wrong grade |
| Super users affected? | No — they bypass all locking |
| Visitors affected? | No — isAuthenticated is false, grade resolving skipped |
| URL param XSS risk? | None — value validated against VALID_GRADES array before use |
| localStorage quota? | Trivial — single string value |

