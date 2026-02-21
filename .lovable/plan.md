

# Fix: Matieres Grade Auto-Selection Bug

## Problem
Line 148 in `src/pages/Matieres.tsx` has an empty dependency array `[]` on the `useEffect` that sets `selectedGrade` from the student's profile. It runs once on mount when `userGrade` is still `null`, so `selectedGrade` stays `'7AF'` for all students.

## Change
**File:** `src/pages/Matieres.tsx`  
**Line:** 148  
**Change:** `}, []);` to `}, [userGrade, isAuthenticated]);`

This is a single-line edit. No other files or lines are touched.

## Why This Works
- `userGrade` loads asynchronously from the profile query
- With the corrected dependency array, the effect re-runs once `userGrade` resolves to the student's actual grade (e.g. `'9AF'`)
- The existing guard `if (userGrade && isAuthenticated)` inside the effect prevents unnecessary runs while still loading

## Safety
| Check | Status |
|-------|--------|
| Existing subject grid unchanged | Yes |
| NS3/NS4 series flow unchanged | Yes |
| No new dependencies | Correct |
| No DB changes | Correct |
| 3G impact | None -- no extra network calls |
