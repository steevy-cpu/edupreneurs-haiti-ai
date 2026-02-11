
# Dynamic AI-Generated Quiz and Activities

## Overview

Replace the current static (pre-stored) quiz and activities content with on-demand AI generation via Lovable AI. When a user clicks the Quiz or Activities tab, the system generates fresh content from the lesson's `contenu` and `exemples_exercices`, then caches it on the device so subsequent visits are instant. The existing static HTML content stays in the database as a safety fallback but is no longer the primary rendering path.

## How It Works

```text
User clicks "Quiz" tab
        |
        v
  Check localStorage cache
  (key: quiz_{lessonId}_v1)
        |
   +----+----+
   |         |
 CACHED    NOT CACHED
   |         |
   v         v
 Render    Show skeleton +
 instantly "Generating quiz..."
             |
             v
        Call edge function
        (generate-quiz-final)
             |
             v
        Parse + validate JSON
             |
             v
        Save to localStorage
             |
             v
          Render quiz
```

Same flow for Activities tab using `generate-interactive-activities`.

## Architecture Decisions

- **No database storage for student-facing generated content** -- we cache in localStorage only. This keeps it simple, avoids table bloat, and works offline after first generation.
- **Existing static content preserved** -- `quiz_final` and `activites_interactives` columns remain untouched. The legacy HTML renderers (`HTMLQuizParser`, `InteractiveActivitiesEnhanced`) stay in the codebase but are no longer the primary path.
- **Existing `QuizRenderer` reused** -- it already renders the `QuizPayload` JSON structure perfectly with progress bar, feedback, score. We just need to feed it AI-generated data.
- **Regenerate button** -- clears the cache and re-triggers generation for fresh questions.
- **Edge functions already exist** -- `generate-quiz-final` (with `outputFormat: 'json'`) and `generate-interactive-activities` are already built and deployed. We reuse them as-is.

## Changes

### 1. New hook: `useAIGeneratedContent`

**New file: `src/features/matieres/hooks/useAIGeneratedContent.ts`**

A reusable hook that handles the generate-cache-render lifecycle for both quiz and activities:

- Accepts: `lessonId`, `contentType` ('quiz' | 'activities'), lesson metadata (title, contenu, grade, subject)
- On mount: checks `localStorage` for cached content (`quiz_{lessonId}_v1` or `activities_{lessonId}_v1`)
- If cached: returns parsed data immediately, no network call
- If not cached: calls the appropriate edge function, validates the response, saves to localStorage, returns data
- Exposes: `{ data, isLoading, isGenerating, error, regenerate }`
- `regenerate()`: clears cache and re-triggers generation
- Uses `staleTime` concept: cached content older than 7 days gets a "Regenerer?" suggestion badge but still renders

Cache key format: `ai_quiz_{lessonId}_v1` / `ai_activities_{lessonId}_v1`

Cache value structure:
```typescript
{
  payload: QuizPayload | ActivitiesPayload,
  generatedAt: ISO string,
  lessonTitle: string
}
```

### 2. Rewrite: `LessonQuizTab.tsx`

**File: `src/features/matieres/components/tabs/LessonQuizTab.tsx`**

Replace the current flow (fetch from `lesson_assets` table then fallback to legacy HTML) with:

- Use `useAIGeneratedContent('quiz', ...)` hook
- Three states:
  - **Loading/Generating**: Skeleton with animated "Generation du quiz en cours..." message
  - **Ready**: Render `QuizRenderer` with the AI-generated `QuizPayload`
  - **Error**: Show error card with "Reessayer" button
- Add "Regenerer le quiz" button (RefreshCw icon) in the card header
- Remove dependency on `useLessonQuizAsset` (the lesson_assets table query)
- Remove `legacyQuizHtml` prop -- no longer needed as primary path

New props:
```typescript
interface LessonQuizTabProps {
  lessonId: string;
  lessonSlug: string;
  subjectName: string;
  subjectSlug: string;
  gradeLevel: string;
  lessonContent: string;      // lesson.contenu
  lessonExamples: string;     // lesson.exemples_exercices
  legacyQuizHtml?: string | null;  // kept as emergency fallback
}
```

### 3. Rewrite: `LessonActivitiesTab.tsx`

**File: `src/features/matieres/components/tabs/LessonActivitiesTab.tsx`**

Same pattern as quiz:

- Use `useAIGeneratedContent('activities', ...)` hook
- Render activities using `InteractiveActivitiesEnhanced` (pass generated HTML) or build a new JSON-based renderer
- Add "Regenerer les activites" button
- Remove dependency on `useLessonActivitiesAsset`

New props:
```typescript
interface LessonActivitiesTabProps {
  lessonId: string;
  subjectName: string;
  gradeLevel: string;
  lessonTitle: string;
  lessonContent: string;
  lessonExamples: string;
  legacyActivitiesHtml?: string | null;
}
```

### 4. Update: `LessonPageTemplate.tsx`

**File: `src/components/LessonPageTemplate.tsx`**

Pass additional props to the Quiz and Activities tabs:

```tsx
<LessonQuizTab
  lessonId={lesson.id}
  lessonSlug={lessonSlug}
  subjectName={subjectName}
  subjectSlug={subjectSlug}
  gradeLevel={gradeLevel}
  lessonContent={lesson.contenu}
  lessonExamples={lesson.exemples_exercices}
  legacyQuizHtml={lesson.quiz_final}
/>

<LessonActivitiesTab
  lessonId={lesson.id}
  subjectName={subjectName}
  gradeLevel={gradeLevel}
  lessonTitle={lesson.title}
  lessonContent={lesson.contenu}
  lessonExamples={lesson.exemples_exercices}
  legacyActivitiesHtml={lesson.activites_interactives}
/>
```

### 5. Edge function adjustment: `generate-quiz-final`

**File: `supabase/functions/generate-quiz-final/index.ts`**

Minor change: set `verify_jwt = false` in config.toml so unauthenticated students can also generate quizzes (the function already works without auth). The rate limiting will still protect against abuse.

Actually, looking at the config, `generate-quiz-final` already has `verify_jwt = false`. But `generate-interactive-activities` has `verify_jwt = true` -- we need to handle this by passing the auth token from the client, which `supabase.functions.invoke` already does automatically.

### 6. Activities edge function: ensure HTML output for compatibility

**File: `supabase/functions/generate-interactive-activities/index.ts`**

The existing function already outputs HTML content that `InteractiveActivitiesEnhanced` can render. No changes needed to the edge function itself. The hook will call it with the lesson content and receive back HTML to pass to the existing renderer.

## What Does NOT Change

- **Database tables**: `lessons`, `lesson_assets` -- untouched
- **Static content**: `quiz_final` and `activites_interactives` columns keep their data
- **Content Editor**: The admin-side batch generation/validation system stays as-is
- **QuizRenderer component**: Reused as-is for JSON quiz rendering
- **InteractiveActivitiesEnhanced component**: Reused as-is for activities rendering
- **Edge functions**: Reused as-is, no prompt changes

## 3G Optimization Strategy

- **First visit**: ~3-8 seconds generation time (shown with progress animation)
- **Subsequent visits**: Instant from localStorage (0ms network)
- **Cache size**: ~5-15KB per quiz/activity (lightweight JSON/HTML)
- **No unnecessary re-fetching**: Cache persists across sessions until user explicitly regenerates
- **Skeleton loading**: Immediate visual feedback while generating

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- static content preserved, legacy renderers kept |
| Works with existing data? | Yes -- uses lesson.contenu which all lessons have |
| 3G optimized? | Yes -- localStorage cache means one-time cost, instant thereafter |
| Edge cases handled? | No contenu (show fallback), generation failure (retry), cache corruption (clear + retry) |
| Backward compatible? | Yes -- legacy HTML fallback remains as emergency path |
| Content Editor system affected? | No -- admin tools untouched |

## File Summary

| File | Action |
|------|--------|
| `src/features/matieres/hooks/useAIGeneratedContent.ts` | NEW -- core generation + cache hook |
| `src/features/matieres/components/tabs/LessonQuizTab.tsx` | REWRITE -- use AI generation |
| `src/features/matieres/components/tabs/LessonActivitiesTab.tsx` | REWRITE -- use AI generation |
| `src/components/LessonPageTemplate.tsx` | UPDATE -- pass extra props to tabs |
| `src/features/matieres/index.ts` | UPDATE -- export new hook |
