

# Add "Select All Incomplete Lessons" Button to BatchLessonGenerator

## Overview
Add a single button that fetches ALL lessons across ALL grades with missing content fields, and populates `selectedLessonIds` with their IDs -- bypassing the grade/subject filter entirely.

## What Changes (Single File)
**File:** `src/components/content-editor/BatchLessonGenerator.tsx`

### 1. Add state for the cross-grade fetch
- Add `isLoadingAllIncomplete` state (boolean) near the existing state declarations (~L57)

### 2. Add `fetchAllIncompleteLessons` function
- New async function after `loadLessonsForSelection` (~L232)
- Queries `supabase.from('lessons').select('id, title')` with `.or('contenu.is.null,contenu.eq.,introduction.is.null,introduction.eq.,exemples_exercices.is.null,exemples_exercices.eq.')` and `.eq('is_published', true)`
- Note: Supabase default limit is 1000, but we have ~134 incomplete lessons so this is safe. If needed, we can add `.limit(1000)`.
- Sets `selectedLessonIds` to the returned IDs
- Sets `gradeLevel` to "all" and `subject` to "all" so the generation uses selectedLessonIds mode
- Shows toast with count
- Also enables `onlyEmpty` checkbox automatically (so existing content is preserved)

### 3. Add the button in the UI
- Place it between the grade/subject filter grid (ends L1238) and the section selection (starts L1241)
- Styled as a highlighted info box with the button:

```text
[info box]
  134 leçons publiées sont incomplètes (contenu, introduction ou exercices manquants).
  [Button: Sélectionner toutes les leçons incomplètes] [Badge: 134 sélectionnées]
[/info box]
```

- Button shows `Loader2` spinner while loading
- After selection, a Badge shows the count
- Disabled during generation (`isGenerating`)

### 4. Auto-enable `onlyEmpty` when using this button
- The function will set `onlyEmpty` to `true` so that existing `objectif` and `quiz_final` fields are preserved during generation

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- adds new button only, no existing logic changed |
| Provider/AppShell impact? | None |
| New dependencies? | None |
| Bundle size? | Negligible (one function + one button) |
| 3G performance? | Single lightweight query, no page-load impact |
| RLS compatibility? | Uses existing lessons table read policy |
| Backward compatible? | Yes -- purely additive |

## Technical Notes
- The Supabase `.or()` filter syntax handles the WHERE clause: `contenu IS NULL OR contenu = '' OR introduction IS NULL OR ...`
- Setting `gradeLevel="all"` and `subject="all"` ensures `fetchLessons()` at generation time uses the `selectedLessonIds` path (L243-256) rather than grade filters
- The `onlyEmpty` flag (L281-287) combined with section selection ensures only missing sections are regenerated per lesson

