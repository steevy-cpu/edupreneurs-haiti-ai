

# Implement Quizgecko Integration (Ready for API Key)

## Overview

Build the complete Quizgecko integration now so everything is ready to use the moment you receive your API key. The system adds Quizgecko as an **opt-in alternative provider** alongside the existing Lovable AI for quiz generation/regeneration.

## What Gets Built

### 1. New Edge Function: `generate-quiz-quizgecko`

**File:** `supabase/functions/generate-quiz-quizgecko/index.ts`

- Accepts the same input shape as `generate-quiz-final` (lessonTitle, contenu, exemplesExercices, gradeLevel, subject)
- Calls Quizgecko V2 API:
  1. `POST https://quizgecko.com/api/v2/generate` with lesson text, `language: "fr"`, `question_type: "multiple_choice"`
  2. Polls `GET /api/v2/courses/{id}/generation-status` every 2s until `completed` (max 60s timeout)
  3. Fetches quiz via `GET /api/v2/quizzes/{quizId}`
- Transforms Quizgecko's JSON response into your canonical HTML format (`quiz-container` / `quiz-question` / `data-correct`)
- Returns `{ quizContent: string }` -- identical to `generate-quiz-final`
- Uses `QUIZGECKO_API_KEY` from secrets (graceful error if not set)
- Includes input validation with Zod, CORS headers, security headers from `_shared/securityHeaders.ts`

**Config:** Add `[functions.generate-quiz-quizgecko]` with `verify_jwt = false` to `supabase/config.toml`

### 2. Add `QuizProvider` Type

**File:** `src/features/content-editor/batch-operations/types.ts`

Add a new type:
```typescript
export type QuizProvider = 'lovable' | 'quizgecko';
```

Update `BatchOperationConfig` to accept an optional provider, and update factory function signatures to accept `provider` parameter.

### 3. Update Quiz Regenerator

**File:** `src/features/content-editor/batch-operations/regenerators/quizRegenerator.ts`

- `createQuizRegeneratorConfig` accepts `provider: QuizProvider = 'lovable'`
- When `provider === 'quizgecko'`, `processLesson` calls `generate-quiz-quizgecko` instead of `generate-quiz-final`
- Rate limit increases from 1500ms to 3000ms for Quizgecko
- Concurrency drops from 2 to 1 for Quizgecko

### 4. Update Quiz Generator

**File:** `src/features/content-editor/batch-operations/generators/quizGenerator.ts`

- Same provider parameter pattern as the regenerator
- `createQuizGeneratorConfig(provider)` routes to appropriate edge function

### 5. Update Wrapper Components with Provider State

**Files:**
- `src/features/content-editor/batch-operations/wrappers/BatchQuizRegenerator.tsx`
- `src/features/content-editor/batch-operations/wrappers/BatchQuizGeneratorNew.tsx`

- Add `useState<QuizProvider>('lovable')` for provider selection
- Pass provider to `createQuizRegeneratorConfig(provider)` / `createQuizGeneratorConfig(provider)`
- Rebuild config with `useMemo` when provider changes

### 6. Add Provider Toggle to Batch Dialog

**File:** `src/features/content-editor/batch-operations/components/BatchOperationDialog.tsx`

- Add optional `provider` / `onProviderChange` props
- When `contentType === 'quiz'` and props are provided, show a simple radio group in the dialog:
  - "Lovable AI" (default)
  - "Quizgecko"
- Compact UI using existing Radix RadioGroup, placed above the stats bar

### 7. Export Updates

**File:** `src/features/content-editor/batch-operations/index.ts`

- Export `QuizProvider` type

## HTML Transformation Logic (Edge Function)

```text
Quizgecko API response:
{
  "questions": [
    {
      "question_text": "...",
      "answer_options": [
        { "option_text": "...", "is_correct": true/false }
      ],
      "explanation": "..."
    }
  ]
}

Transforms to:
<div class="quiz-container">
  <div class="quiz-question" data-number="1">
    <h3>Question 1</h3>
    <p>{question_text}</p>
    <div class="quiz-options">
      <div class="option" data-answer="A">A) {option_text}</div>
      <div class="option" data-answer="B">B) {option_text}</div>
      <div class="option" data-answer="C">C) {option_text}</div>
      <div class="option" data-answer="D">D) {option_text}</div>
    </div>
    <div class="correct-answer" data-correct="{correct_letter}">
      <p><strong>Reponse correcte: {correct_letter}</strong></p>
      <p>{explanation}</p>
    </div>
  </div>
</div>
```

## Files Summary

| File | Action |
|------|--------|
| `supabase/functions/generate-quiz-quizgecko/index.ts` | Create |
| `supabase/config.toml` | Add function config entry |
| `src/features/content-editor/batch-operations/types.ts` | Add `QuizProvider` type |
| `src/features/content-editor/batch-operations/regenerators/quizRegenerator.ts` | Add provider param |
| `src/features/content-editor/batch-operations/generators/quizGenerator.ts` | Add provider param |
| `src/features/content-editor/batch-operations/wrappers/BatchQuizRegenerator.tsx` | Add provider state |
| `src/features/content-editor/batch-operations/wrappers/BatchQuizGeneratorNew.tsx` | Add provider state |
| `src/features/content-editor/batch-operations/components/BatchOperationDialog.tsx` | Add provider toggle UI |
| `src/features/content-editor/batch-operations/index.ts` | Export QuizProvider |

## When You Get the API Key

Once Quizgecko approves your access:
1. We store the `QUIZGECKO_API_KEY` as a backend secret
2. The toggle in the batch dialog immediately becomes functional
3. No code changes needed -- everything is already wired up

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- Lovable AI is default, Quizgecko is opt-in toggle |
| Works with existing data? | Yes -- same `quiz_final` HTML field, same format |
| 3G optimized? | Yes -- polling is server-side, client gets single response |
| Backward compatible? | Yes -- no DB schema changes |
| Edge cases? | API key missing = clear error; timeout = graceful failure; empty response = handled |

