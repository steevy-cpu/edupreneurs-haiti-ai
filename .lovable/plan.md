

# Batch Content Generator -- Empty Lessons Detection and Generation

## Problem
Many lessons exist as empty shells (title + objectif only, no introduction/contenu/exemples). For example:
- **9AF**: ~50 lessons missing content
- **NS2**: ~93 lessons missing content
- **NS3**: 7 lessons missing content

Currently, the only way to generate content is one lesson at a time via `SingleLessonGenerator`. There's no visibility into how many lessons are empty, and no batch generation for core content.

## Solution
Add a new **"Contenu manquant"** (Missing Content) stats section and batch generation button in the `LessonBrowser` sidebar, following the same visual pattern as the existing quiz stats/buttons. This includes:

1. A progress bar showing `X/Y leçons avec contenu` (like the quiz progress bar)
2. A batch generation button to process all empty lessons
3. A checkbox filter to show only empty lessons

## Architecture (Following Existing Patterns)

The implementation follows the established batch operations architecture exactly:

```text
src/features/content-editor/batch-operations/
  generators/
    quizGenerator.ts          (existing pattern to follow)
    contentGenerator.ts       <-- NEW: config for batch content generation
  wrappers/
    BatchQuizGeneratorNew.tsx  (existing pattern to follow)
    BatchContentGenerator.tsx  <-- NEW: wrapper component
  types.ts                     (update BatchLesson to include objectif, introduction)
```

## Detailed Changes

### 1. Update `BatchLesson` type (types.ts)
Add the missing fields so the filter can check for empty content:
- `objectif?: string | null`
- `introduction?: string | null`
- `youtube_url?: string | null`

### 2. Create Content Generator Config (`generators/contentGenerator.ts`)
Following the exact same pattern as `quizGenerator.ts`:
- **filterLesson**: Check if lesson is missing any of: objectif, introduction, contenu, exemples_exercices (any field empty or null = needs generation)
- **processLesson**: Call the existing `process-ai-job` edge function (same one used by `SingleLessonGenerator`) with the 4 core sections + images + youtube enabled
- **updateLesson**: Save generated content back to the lesson
- **theme**: Use a blue/indigo color scheme to differentiate from quiz (green) and validation (amber/purple)
- **rateLimit**: 3000ms (content generation is heavier than quiz generation)
- **concurrency**: 1 (one lesson at a time since each generation is multi-step)

### 3. Create Wrapper Component (`wrappers/BatchContentGenerator.tsx`)
Following `BatchQuizGeneratorNew.tsx` pattern exactly:
- Accepts `lessons`, `gradeLevel`, `onComplete`, `onStart`, `disabled` props
- Uses `useBatchOperation` hook with the content generator config
- Renders `BatchOperationDialog`

### 4. Update LessonBrowser.tsx
Add to the existing stats section (lines 418-515):

**New computed values** (alongside existing quiz stats):
- `lessonsWithContent`: count of lessons where ALL 4 fields have content
- `lessonsMissingContent`: filtered list of lessons missing any content field
- `contentPercentage`: coverage percentage

**New UI elements** (inside the grade-level stats block):
- A second progress bar: `{gradeLevel}: {withContent}/{total} contenu`
- A `BatchContentGenerator` button (only shown when `lessonsMissingContent.length > 0`)
- A new checkbox: `Contenu manquant uniquement` filter

**New fields in lesson query** (line 157): Add `objectif, introduction, youtube_url` to the select query so we can check for empty content without extra fetches.

### 5. Update Lesson List Badges
Add a new badge on each lesson item when it's missing content:
- Orange badge with `FileX` icon showing "Vide" (Empty) when core content is missing

### 6. Export from index.ts
Add the new generator and wrapper exports.

## Processing Logic (What Gets Generated Per Lesson)

Each empty lesson will be processed through the existing `process-ai-job` edge function with this config:
- **Sections**: objectif, introduction, contenu, exemples_exercices
- **Images**: enabled (using Lovable model)
- **YouTube**: enabled (video suggestions)
- **Quiz**: NOT included (handled by the existing BatchQuizGenerator)
- **Activities**: NOT included (handled by existing BatchQuizGenerator flow)

This reuses the exact same generation pipeline that `SingleLessonGenerator` uses, just automated across multiple lessons.

## Visual Layout (in LessonBrowser stats section)

```text
7AF: 204/204 quizzes                    100%
[========================================] 

7AF: 154/204 contenu                     75%    <-- NEW
[==============================          ]      <-- NEW

Generation
[Générer 50 contenus manquants]                 <-- NEW (blue button)
[Générer 50 quizzes manquants]                  (existing green button)

Validation
[Valider alignement contenu]
[Valider alignement activités]
...
```

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- adds new section alongside existing ones |
| Works with existing data? | Yes -- checks for null/empty fields already in DB |
| 3G optimized? | Yes -- reuses existing generation pipeline with proper delays |
| Backward compatible? | Yes -- empty lessons simply show as "needs generation" |
| Edge cases? | Lessons with partial content (e.g., has objectif but no contenu) are included |
| Rate limiting? | 3s delay between lessons, concurrency of 1 |
| Follows existing patterns? | Yes -- mirrors quizGenerator.ts and BatchQuizGeneratorNew.tsx exactly |

## What This Does NOT Change
- SingleLessonGenerator stays as-is (still available for individual lessons)
- Quiz generation/validation buttons unchanged
- Tab components unchanged
- No database schema changes needed

