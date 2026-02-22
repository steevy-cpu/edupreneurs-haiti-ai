

# Fix ExamPreparation Cross-Session Gold Re-Earning

## Overview
Two changes: one DB migration to create a permanent completion tracking table, one component update to check it before awarding gold.

---

## Step 1 -- Database Migration

Create `exam_exercise_completions` table with RLS:

```sql
CREATE TABLE exam_exercise_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL,
  exercise_number integer NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, exam_id, exercise_number)
);

ALTER TABLE exam_exercise_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own completions"
  ON exam_exercise_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON exam_exercise_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## Step 2 -- Update ExamPreparation.tsx

**File: `src/pages/ExamPreparation.tsx`**

### 2a. Add state (after line 32)
- Add `globallyCompletedExercises` state: `useState<number[]>([])`

### 2b. Query on mount (after line 101, inside loadExamData)
After loading/creating the session, query `exam_exercise_completions`:
```typescript
const { data: globalCompletions } = await supabase
  .from('exam_exercise_completions')
  .select('exercise_number')
  .eq('user_id', user.user.id)
  .eq('exam_id', examData.id);

if (globalCompletions) {
  setGloballyCompletedExercises(globalCompletions.map(c => c.exercise_number));
}
```

### 2c. Update gold guard (line 164)
Change from:
```typescript
if (isCorrect && !completedExercises.includes(currentExercise))
```
To:
```typescript
if (isCorrect && !completedExercises.includes(currentExercise) && !globallyCompletedExercises.includes(currentExercise))
```

### 2d. Insert completion record (after line 178, inside the gold award block)
After updating the session, insert into `exam_exercise_completions` with conflict ignore:
```typescript
await supabase
  .from('exam_exercise_completions')
  .upsert({
    user_id: userData.user.id,
    exam_id: exam.id,
    exercise_number: currentExercise,
  }, { onConflict: 'user_id,exam_id,exercise_number', ignoreDuplicates: true });
```

Move the `getUser()` call before the session update so `userData` is available for both the completion insert and the gold RPC.

---

## Files touched

| File | Change |
|------|--------|
| DB migration | New `exam_exercise_completions` table + RLS |
| `src/pages/ExamPreparation.tsx` | Add global completion state, query on mount, update guard, insert on completion |

## Safety verification

| Check | Status |
|-------|--------|
| RLS on new table | Yes -- SELECT and INSERT for own rows only |
| No existing tables modified | Correct |
| Session-level tracking unchanged | Correct -- additive only |
| Unique constraint prevents duplicates | Yes -- `(user_id, exam_id, exercise_number)` |
| Backward compatible | Yes -- no prop or API changes |
| Works on 3G | Yes -- one extra SELECT on mount, tiny payload |
| increment_gold cap respected | Unchanged |

