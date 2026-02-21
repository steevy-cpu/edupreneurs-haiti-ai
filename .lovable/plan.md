

# Fix: Grade Locking Timing Issue in Matieres.tsx

## Problem
On line 322, `isLocked` evaluates to `true` for all grades while `userGrade` is still `null` (loading), because `canAccessGrade()` returns `false` when no grade is set. On 3G connections, this causes all grade buttons to flash as locked before the profile loads.

## Change
**File:** `src/pages/Matieres.tsx`
**Line:** 322
**Change:** Add `!!userGrade` guard to the `isLocked` condition.

```text
Before: const isLocked = isAuthenticated && !canAccessGrade(grade.id);
After:  const isLocked = isAuthenticated && !!userGrade && !canAccessGrade(grade.id);
```

Single condition change. No other lines or files touched.

## Why This Works
- While `userGrade` is `null`, `!!userGrade` is `false`, so `isLocked` is `false` -- no lock icons shown during loading
- Once `userGrade` resolves (e.g. `'9AF'`), the full condition activates: student's grade unlocks, others lock correctly

## Safety
| Check | Status |
|-------|--------|
| Subject grid unchanged | Yes |
| NS3/NS4 series flow unchanged | Yes |
| No new dependencies | Correct |
| No DB changes | Correct |
| 3G impact | Positive -- removes false lock flash |

