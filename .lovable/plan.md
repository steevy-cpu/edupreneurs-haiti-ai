

# Partial Grading System for Exam Practice

## Current Problem (Two Issues)

**Issue 1: False incorrect state.** When `grading.isCorrect` is `undefined` (no answer key), `useTutorAction` runs `data.grading?.isCorrect === true` which evaluates to `false`, so it always sets state to `'incorrect'` -- even though we just fixed the backend to return `undefined`.

**Issue 2: No partial credit.** All grading is binary (0% or 100%). Open-ended questions and exercises without answer keys deserve nuanced scoring.

## Architecture: Structured Grade Contract

The key structural decision is a **single source of truth for grade data** flowing from edge function to UI. Instead of scattered `isCorrect` booleans, we introduce a `GradeResult` type that every layer understands.

```text
Edge Function                    Hook                         UI
+-----------------------+       +------------------+       +----------------+
| AI response includes  |       | Parse gradeResult|       | Map score to   |
| <<GRADE:{score,reason}>> ---> | Map to RunnerState| ---> | color/icon/msg |
| Parse + validate      |       | Calculate points |       | Show fraction  |
+-----------------------+       +------------------+       +----------------+
```

The score is always a percentage (0-100) and the mapping to UI state is deterministic:
- **score >= 75**: state = `correct` (green, voice plays correct clip)
- **25 <= score < 75**: state = `partial` (amber, no voice -- avoids confusing feedback)
- **score < 25**: state = `incorrect` (red, voice plays incorrect clip)

## Files to Edit (5 files, ordered by dependency)

### 1. Types: `src/features/exams/types/exam.types.ts`

Add `partialScore` to `TutorGrading`:

```ts
export interface TutorGrading {
  isCorrect?: boolean;
  partialScore?: number;  // 0-100 percentage
  pointsAwarded?: number;
  correctAnswer?: string;
}
```

### 2. Types: `src/features/exams/practice/types.ts`

Add `'partial'` to `RunnerState`:

```ts
export type RunnerState = 
  | 'idle'
  | 'checking'
  | 'correct'
  | 'partial'      // NEW: 25-74% score
  | 'incorrect'
  | 'revealed'
  | 'error';
```

### 3. Edge Function: `supabase/functions/exam-tutor/index.ts`

**3a. Add `parseGradeFromResponse()` function** (after `parseToBlocks`):

```ts
function parseGradeFromResponse(text: string): { 
  cleanText: string; 
  grade: { score: number; reason: string } | null 
} {
  const match = text.match(/<<GRADE:(\{.*?\})>>/s);
  if (!match) return { cleanText: text, grade: null };
  
  try {
    const parsed = JSON.parse(match[1]);
    const score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
    // Snap to valid tiers: 0, 25, 50, 75, 100
    const snapped = Math.round(score / 25) * 25;
    return {
      cleanText: text.replace(/<<GRADE:\{.*?\}>>/s, '').trim(),
      grade: { score: snapped, reason: parsed.reason || '' }
    };
  } catch {
    return { cleanText: text.replace(/<<GRADE:\{.*?\}>>/s, '').trim(), grade: null };
  }
}
```

**3b. Update the `check` action prompt** for exercises without `correct_answer` AND for open-ended questions (even with an answer key):

When `!exercise.correct_answer` OR `exercise.exercise_type === 'open_ended'`:

```
Tu dois aussi fournir une note en ajoutant ce bloc EXACTEMENT a la fin de ta reponse:
<<GRADE:{"score":X,"reason":"..."}>>
ou X est un pourcentage (0, 25, 50, 75, ou 100):
- 100: Reponse completement correcte
- 75: Bonne reponse avec erreurs mineures ou formulation incomplete
- 50: Partiellement correct, elements importants manquants
- 25: Tentative avec un debut de raisonnement correct
- 0: Reponse incorrecte
```

For MCQ with known answer: keep deterministic (no AI grading needed).

**3c. Update response building** (after AI call):

```ts
const { cleanText, grade } = parseGradeFromResponse(judeResponse);
const blocks = parseToBlocks(cleanText); // Parse cleaned text (no grade tag)

// Determine grading
let partialScore: number | undefined;
if (studentAnswer && exercise.correct_answer && exercise.exercise_type !== 'open_ended') {
  // MCQ with answer key: deterministic
  isCorrect = validateAnswer(studentAnswer, exercise);
  shouldAwardPoints = isCorrect;
} else if (studentAnswer && grade) {
  // AI-graded: use parsed score
  partialScore = grade.score;
  isCorrect = grade.score >= 75;
  shouldAwardPoints = grade.score > 0;
  pointsAwarded = Math.round(exercise.points * (grade.score / 100));
} else if (studentAnswer) {
  // Fallback: AI didn't include grade block
  partialScore = undefined;
  isCorrect = undefined;
}
```

**3d. Update grading object:**

```ts
const grading: TutorGrading = {
  isCorrect: partialScore !== undefined ? (partialScore >= 75) : 
             (studentAnswer && exercise.correct_answer) ? isCorrect : undefined,
  partialScore,
  pointsAwarded: shouldAwardPoints ? (pointsAwarded ?? exercise.points) : 0,
  correctAnswer: revealAnswer ? exercise.correct_answer : undefined,
  confidence, reasoning, // existing fields
};
```

### 4. Hook: `src/features/exams/practice/hooks/useTutorAction.ts`

Update `checkAnswer` state mapping to use `partialScore` when available:

```ts
setFeedback(data as TutorResponse);

const grading = data.grading;
let newState: RunnerState;

if (grading?.partialScore !== undefined) {
  // AI-graded with partial scoring
  if (grading.partialScore >= 75) newState = 'correct';
  else if (grading.partialScore >= 25) newState = 'partial';
  else newState = 'incorrect';
} else if (grading?.isCorrect === true) {
  newState = 'correct';
} else if (grading?.isCorrect === false) {
  newState = 'incorrect';
} else {
  // isCorrect is undefined (no answer key, no AI grade) -- show as partial/neutral
  newState = 'partial';
}

setState(newState);

if (grading?.pointsAwarded && grading.pointsAwarded > 0 && onAnswerValidated) {
  onAnswerValidated(newState === 'correct', grading.pointsAwarded);
}
```

### 5. FeedbackCard: `src/features/exams/practice/components/FeedbackCard.tsx`

Add `'partial'` state styling:

```ts
const isPartial = state === 'partial';
```

In `getStateStyles()`:
```ts
if (isPartial) {
  return {
    border: 'border-amber-500/50',
    bg: 'bg-amber-500/5',
    icon: <CheckCircle2 className="h-4 w-4 text-amber-500" />,
  };
}
```

Status message:
```ts
{isPartial && 'Pas mal! Mais tu peux faire mieux.'}
```

Points display -- show fractional format when partial:
```ts
{feedback.grading?.pointsAwarded != null && feedback.grading.pointsAwarded > 0 && (
  <span className={cn("text-sm font-semibold", isCorrect ? "text-green-600" : "text-amber-600")}>
    +{feedback.grading.pointsAwarded} pts
  </span>
)}
```

Voice: play correct clip for `correct`, incorrect for `incorrect`, **no voice for `partial`** (avoids confusing "you're right!" or "you're wrong!" when the answer is in between).

Update audio logic:
```ts
const audioIndex = useMemo(
  () => (isCorrect || isIncorrect) ? Math.floor(Math.random() * 10) : null,
  [isCorrect, isIncorrect]
);
```
This already excludes `partial` since `isPartial` is neither `isCorrect` nor `isIncorrect`.

### 6. ActionRow + ExamTutorPanel: `canAdvance` update

In `ExamTutorPanel.tsx`, update:
```ts
const canAdvance = state === 'correct' || state === 'incorrect' || state === 'partial' || state === 'revealed';
```

In `ActionRow.tsx`, update:
```ts
const isAnswered = state === 'correct' || state === 'incorrect' || state === 'partial' || state === 'revealed';
```

## Fallback Safety

If the AI fails to include the `<<GRADE:...>>` block (network issues, model quirks):
- `parseGradeFromResponse` returns `grade: null`
- The system falls back to current binary behavior (deterministic for MCQ, `undefined` for no-answer)
- No crash, no wrong state -- just less granular scoring

If the AI returns an invalid score (e.g., `"score": "good"`):
- `Number(parsed.score) || 0` defaults to 0
- `Math.round(0 / 25) * 25 = 0` -- scores as incorrect
- Worst case: student gets 0 instead of partial -- safe direction

## Safety Checklist

| Check | Status |
|-------|--------|
| Breaks existing MCQ with answer keys? | No -- deterministic path unchanged, no AI grading for these |
| Works with existing data? | Yes -- `partialScore` is optional, old responses without it work fine |
| 3G optimized? | Yes -- same single API call, no extra network requests |
| Backward compatible? | Yes -- all new fields are optional |
| Edge case: AI omits grade block? | Falls back to current binary behavior |
| Edge case: AI returns bad JSON in grade? | Caught by try/catch, falls back gracefully |
| State machine consistency? | `partial` is added to every switch/check that references states |

## Files Summary

1. `src/features/exams/types/exam.types.ts` -- add `partialScore` to TutorGrading
2. `src/features/exams/practice/types.ts` -- add `'partial'` to RunnerState
3. `supabase/functions/exam-tutor/index.ts` -- grade parsing, prompt updates, response building
4. `src/features/exams/practice/hooks/useTutorAction.ts` -- state mapping with partial scores
5. `src/features/exams/practice/components/FeedbackCard.tsx` -- amber UI state
6. `src/features/exams/practice/components/ActionRow.tsx` -- include `partial` in `isAnswered`
7. `src/features/exams/practice/components/ExamTutorPanel.tsx` -- include `partial` in `canAdvance`

