

# Gold Plan A -- Fix Gold Abuse Vectors

## Overview
Three surgical fixes to close gold farming exploits: add completion guard to QuizGame, consolidate per-answer gold to completion-only in InteractiveQuiz and HTMLQuizParser.

---

## Fix 1 -- QuizGame completion guard

**File: `src/components/math-activities/QuizGame.tsx`**

Currently QuizGame has zero completion tracking -- students can restart and earn unlimited gold.

**Changes:**
- Add `useEffect` on mount to query `lesson_completions` for the current user + topic (requires adding a `lessonSlug` prop to `QuizGameProps`)
- Add `isAlreadyCompleted` state (default `false`)
- In `awardGold()` (line 31): early return if `isAlreadyCompleted` is true
- Remove per-answer `awardGold()` call from `handleSubmit` (line 57)
- At quiz completion (`handleNext` when last question, line 72-74): if not already completed, insert into `lesson_completions`, award all gold in one RPC call (`score` amount, capped at 100), and set `isAlreadyCompleted = true`
- In `handleRestart` (line 78): if `isAlreadyCompleted`, show training mode message via toast
- Update completion screen (line 102-105) to show "Mode entrainement" text when already completed instead of gold earned

**Props change:** Add optional `lessonSlug?: string` and `subject?: string` to `QuizGameProps`. If not provided, skip the completion check (backward compatible).

---

## Fix 2 -- InteractiveQuiz: consolidate gold to completion only

**File: `src/components/InteractiveQuiz.tsx`**

Currently awards 1 gold per correct answer (line 319) plus a completion bonus (line 365-368). Students earn partial gold by closing mid-quiz.

**Changes:**
- **Remove** the `awardGold()` call at line 319 inside `handleAnswerSelect`
- **Remove** the per-answer gold toast "+1 Gold!" (lines 320-324)
- Keep the correct/incorrect toast but without gold mention
- In `markLessonComplete()` (line 335): change the gold amount from `lessonGoldReward` to `finalScore + Math.min(lessonGoldReward, 100)` -- but since `increment_gold` caps at 100, we compute `Math.min(finalScore + lessonGoldReward, 100)` as the single award
- Actually, since `increment_gold` caps at 100 per call, and we want `correctAnswers + lessonGoldReward` which could exceed 100: make two calls if total > 100, or simply award `Math.min(finalScore + lessonGoldReward, 100)` to stay within the RPC cap. Given `lessonGoldReward` defaults to 100 and `finalScore` could be up to ~10, the combined total exceeds 100. Solution: award in one call capped at 100 total = `Math.min(finalScore + lessonGoldReward, 100)`. This is the maximum allowed by the RPC.
- Update completion toast to show the combined total

---

## Fix 3 -- HTMLQuizParser: consolidate gold to completion only

**File: `src/components/HTMLQuizParser.tsx`**

Currently awards 1 gold per correct answer (line 167) plus completion bonus (line 247). Same exploit as Fix 2.

**Changes:**
- **Remove** the `awardGold(1)` call at line 167 inside `handleSubmit`
- In `finishQuiz()` (line 199): change the gold calculation to include per-answer gold:
  - Current: `goldEarned = passed ? Math.max(10, Math.round(percentage / 10) * 5) : 0`
  - New: `goldEarned = passed ? Math.min(score + Math.max(10, Math.round(percentage / 10) * 5), 100) : 0`
  - This adds `score` (correct answers) to the completion bonus, capped at 100 per RPC constraint
- Award all gold in the single existing `awardGold(goldEarned)` call at line 247 (no change to call site, just the amount)

---

## Files touched (3 total)

| File | Change |
|------|--------|
| `src/components/math-activities/QuizGame.tsx` | Add completion guard, move gold to completion-only, training mode message |
| `src/components/InteractiveQuiz.tsx` | Remove per-answer gold award, consolidate to completion |
| `src/components/HTMLQuizParser.tsx` | Remove per-answer gold award, consolidate to completion |

---

## Safety verification

| Check | Status |
|-------|--------|
| No DB changes | Correct -- uses existing `lesson_completions` table |
| No new dependencies | Correct |
| RLS unaffected | Correct |
| increment_gold cap respected | Yes -- all awards capped at 100 per call |
| Backward compatible | Yes -- QuizGame new props are optional |
| Existing completion guards preserved | Yes -- `isLessonCompleted` checks remain |
| 80% threshold unchanged | Yes -- HTMLQuizParser and InteractiveQuiz keep their thresholds |

