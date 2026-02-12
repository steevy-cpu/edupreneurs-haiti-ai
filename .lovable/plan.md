

# Fix: Prevent False "Incorrect" Verdicts When No Answer Key Exists

## The Bug
In the `exam-tutor` edge function, when an exercise has no `correct_answer` in the database:

1. `validateAnswer()` returns `false` by default (line 198-200)
2. The system prompt tells the AI: "L'eleve a donne une MAUVAISE reponse"
3. The AI reasons correctly (e.g., "rain" is NOT a transport = odd one out) but is forced to say the student is wrong
4. Result: A contradictory response -- "You're wrong... but here's why you're actually right"

## The Fix

**File:** `supabase/functions/exam-tutor/index.ts`

Update the `check` action block (lines 392-402) to handle missing `correct_answer` separately using cautious/evaluation mode instead of falsely declaring the answer wrong.

### Current Code (lines 392-402)
```ts
if (action === 'check' && studentAnswer) {
  const isCorrect = validateAnswer(studentAnswer, exercise);
  if (isCorrect) {
    // correct prompt...
  } else {
    // ALWAYS says wrong, even when correct_answer is null
  }
}
```

### New Code
```ts
if (action === 'check' && studentAnswer) {
  if (!exercise.correct_answer) {
    // No answer key -- ask AI to evaluate on its own
    systemPrompt += `\n\n**ACTION REQUISE: EVALUER la reponse de l'eleve (${studentAnswer})**
Aucune reponse officielle n'est definie pour cette question.
Tu dois:
1. Analyser la question et determiner toi-meme la bonne reponse
2. Comparer avec la reponse de l'eleve (${studentAnswer})
3. Si l'eleve a raison, felicite-le
4. Si l'eleve a tort, explique pourquoi avec bienveillance
Ne dis JAMAIS que l'eleve a tort si son raisonnement est correct. (max 80 mots)`;
  } else {
    const isCorrect = validateAnswer(studentAnswer, exercise);
    if (isCorrect) {
      // existing correct prompt
    } else {
      // existing incorrect prompt
    }
  }
}
```

Also update the deterministic grading block (lines 443-452) to set `isCorrect` to `undefined` (not `false`) when there's no answer key, so the frontend doesn't show a red "incorrect" state:

```ts
if (studentAnswer && exercise.correct_answer) {
  isCorrect = validateAnswer(studentAnswer, exercise);
  // ... existing logic
} else if (studentAnswer && !exercise.correct_answer) {
  // Let AI determine correctness -- parse from response
  // Don't set isCorrect to false; leave as undefined
  shouldMoveToNext = true;
}
```

And update the grading object to not return `isCorrect: false` when there's no key:

```ts
const grading: TutorGrading = {
  isCorrect: (studentAnswer && exercise.correct_answer) ? isCorrect : undefined,
  // ... rest unchanged
};
```

## Files to Edit
- `supabase/functions/exam-tutor/index.ts`

## Safety Checklist

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- exercises WITH answer keys behave identically |
| Works with existing data? | Yes -- only changes behavior for missing answer keys |
| 3G optimized? | Yes -- no new network calls |
| Backward compatible? | Yes -- grading.isCorrect becomes undefined instead of false |
| Edge cases | AI may still misjudge, but no longer contradicts itself |

