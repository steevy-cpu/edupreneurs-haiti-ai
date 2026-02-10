

# Integrate Quizgecko API for Quiz and Activity Regeneration

## Overview

Quizgecko's V2 API can generate quizzes from lesson text with French language support. We'll create a new edge function that acts as a Quizgecko adapter, and wire it into the existing batch regeneration system as an **alternative provider** alongside the current Lovable AI gateway.

## How Quizgecko API Works

The V2 API is **asynchronous**:
1. `POST /api/v2/generate` -- sends lesson text, returns a course shell with an ID
2. `GET /api/v2/courses/{id}/generation-status` -- poll until `completed`
3. `GET /api/v2/quizzes/{quizId}` -- fetch the generated quiz with questions

Key options: `language: "fr"`, `question_type: "multiple_choice"`, `difficulty`, `number_of_questions`.

## Prerequisites

1. **Quizgecko Account with API Access** -- You need to sign up at quizgecko.com and contact them for API access (their page says "Please contact us to get access"). API access appears to require a paid plan (Premium at $10/mo or Ultra at $23/mo).
2. **API Key** -- Once approved, you generate a Bearer token from your Quizgecko dashboard.
3. **Secret Storage** -- The API key will be stored as a backend secret (`QUIZGECKO_API_KEY`).

## Implementation Plan

### Step 1: Store the Quizgecko API Key
- Use the secret storage system to securely save the `QUIZGECKO_API_KEY`

### Step 2: Create `generate-quiz-quizgecko` Edge Function
A new edge function that:
- Receives the same inputs as `generate-quiz-final` (lesson title, content, grade level, subject, language)
- Calls Quizgecko's `POST /api/v2/generate` with the lesson content as `text`, setting `options.language = "fr"` and `options.question_type = "multiple_choice"`
- Polls `GET /api/v2/courses/{id}/generation-status` until complete (with timeout)
- Fetches the generated quiz via `GET /api/v2/quizzes/{quizId}`
- **Transforms** the Quizgecko response into your existing HTML quiz format (`quiz-container` / `quiz-question` / `data-correct` structure)
- Returns `{ quizContent: string }` -- identical shape to `generate-quiz-final`

### Step 3: Update Quiz Regenerator Config
Modify `quizRegenerator.ts` to accept a `provider` parameter:
- `provider: 'lovable'` (default) -- uses current `generate-quiz-final`
- `provider: 'quizgecko'` -- uses new `generate-quiz-quizgecko`

The `processLesson` function will call the appropriate edge function based on the selected provider.

### Step 4: Update Quiz Generator Config
Same provider toggle for `quizGenerator.ts` (missing quiz generation).

### Step 5: Add Provider Selection to Batch Dialog UI
Add a simple radio toggle in `BatchOperationDialog` when the operation is quiz-related:
- "Lovable AI" (default)
- "Quizgecko"

This selection is passed down to the config's `processLesson`.

### Step 6: Update `SectionGenerator` (Optional)
Add the same provider choice to the single-lesson quiz generation dialog for consistency.

## Quizgecko Response to Your HTML Format -- Transformation

Quizgecko returns structured question data. The edge function will map it:

```text
Quizgecko question -> Your HTML format:
{
  "question": "...",           ->  <div class="quiz-question" data-number="N">
  "answers": [                 ->    <div class="quiz-options">
    {"text": "...", correct}   ->      <div class="option" data-answer="A">A) ...</div>
  ]                            ->    </div>
  "explanation": "..."         ->    <div class="correct-answer" data-correct="X">...</div>
}                              ->  </div>
```

## Rate Limiting Considerations

- Quizgecko API has its own rate limits tied to your plan
- The async polling model adds latency (~5-15s per quiz generation)
- Batch operations will use `rateLimit: 3000` (3s) for Quizgecko to avoid hitting their limits
- Concurrency stays at 1 for Quizgecko provider to be safe

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/generate-quiz-quizgecko/index.ts` | Create | New edge function wrapping Quizgecko API |
| `src/features/content-editor/batch-operations/regenerators/quizRegenerator.ts` | Modify | Add provider parameter support |
| `src/features/content-editor/batch-operations/generators/quizGenerator.ts` | Modify | Add provider parameter support |
| `src/features/content-editor/batch-operations/types.ts` | Modify | Add `provider` field to config/context |
| `src/features/content-editor/batch-operations/BatchOperationDialog.tsx` | Modify | Add provider toggle UI for quiz operations |

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- Lovable AI remains the default; Quizgecko is opt-in |
| Works with existing HTML quiz format? | Yes -- transformation layer maps to canonical structure |
| 3G optimized? | Yes -- polling happens server-side in edge function, client gets single response |
| Backward compatible? | Yes -- no changes to database schema, same `quiz_final` field |
| Handles API failures? | Yes -- falls back gracefully with error messages |
| Rate limit safe? | Yes -- increased delay and concurrency=1 for Quizgecko |

## Important Note

Before implementation, you need to:
1. Create a Quizgecko account at quizgecko.com
2. Contact them to request API access (their docs say "Please contact us to get access")
3. Once you have the API key, we'll store it securely and proceed with the implementation

