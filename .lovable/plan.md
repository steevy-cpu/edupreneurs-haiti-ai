

# Fix: lesson_completions upsert conflict mismatch

## Root Cause
The `lesson_completions` table has a unique constraint on `(user_id, lesson_slug)` only -- **not** `(user_id, lesson_slug, subject)`.

The upsert at line 104 of `LessonQuizTab.tsx` specifies:
```
onConflict: 'user_id,lesson_slug,subject'
```
This fails because no such constraint exists in the database.

## Fix (1 line change)

**File:** `src/features/matieres/components/tabs/LessonQuizTab.tsx`, line 104

Change:
```
{ onConflict: 'user_id,lesson_slug,subject' }
```
To:
```
{ onConflict: 'user_id,lesson_slug' }
```

This matches the actual database constraint `lesson_completions_user_id_lesson_slug_key`.

## Safety Verification

| Check | Status |
|-------|--------|
| Matches existing DB constraint | Yes -- UNIQUE (user_id, lesson_slug) |
| No schema change needed | Correct |
| Subject still stored in the row | Yes -- subject column is still written |
| Single file, single line | Correct |
| No other files affected | Correct |
| Backward compatible | Yes |

