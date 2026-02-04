

# Plan: Critical Fixes for Phase 3B Regeneration Logic

## Problem Summary

Code review identified **two critical bugs** that will cause regeneration failures:

1. **Missing Content Fields in `loadLessons` Query (Line 152)**
   - The lesson query does NOT fetch `contenu` and `exemples_exercices`
   - Both regeneration functions use these fields: `lesson.contenu || ''` and `lesson.exemples_exercices || ''`
   - Result: Empty strings sent to AI models → Poor quality generated content

2. **Missing Required Parameters in `regenerateActivities` (Lines 233-239)**
   - Edge function `generate-interactive-activities` requires: `exercisesContent`, `lessonTitle`, `gradeLevel`, `subject`
   - Current code only sends: `lessonId`, `exercisesContent`, `isCreole`
   - Missing: `lessonTitle`, `gradeLevel`, `subject`
   - Result: Validation error from edge function → Regeneration fails silently

## Root Cause Analysis

**Why regenerateQuiz works but regenerateActivities doesn't:**
- `regenerateQuiz` (lines 188-226) correctly includes all parameters: `lessonTitle`, `contenu`, `exemplesExercices`, `gradeLevel`, `subject`
- `regenerateActivities` (lines 228-264) was implemented with minimal parameters, missing the context needed by the AI
- Both functions rely on `contenu` and `exemples_exercices` from the lesson object, but the query doesn't fetch them

**Edge Function Requirements (Confirmed from index.ts lines 31-36):**
```typescript
const generateActivitiesSchema = z.object({
  exercisesContent: z.string().min(1).max(100000),
  lessonTitle: z.string().min(1).max(500),
  gradeLevel: z.string().min(1).max(50),
  subject: z.string().min(1).max(200)
}).passthrough();
```

## Implementation Approach

### Fix #1: Add Missing Fields to `loadLessons` Query
**File:** `src/components/content-editor/LessonBrowser.tsx`  
**Location:** Line 152

**Current Query:**
```typescript
.select('id, title, slug, subject_id, order_index, workflow_status, grade_level, quiz_final, activites_interactives, needs_quiz_regeneration, needs_activities_regeneration, last_content_validated_at, last_activities_validated_at, validation_details_json, content_alignment_score, activities_alignment_score, subjects(id, name)')
```

**Fixed Query:**
```typescript
.select('id, title, slug, subject_id, order_index, workflow_status, grade_level, quiz_final, activites_interactives, contenu, exemples_exercices, needs_quiz_regeneration, needs_activities_regeneration, last_content_validated_at, last_activities_validated_at, validation_details_json, content_alignment_score, activities_alignment_score, subjects(id, name)')
```

**Change:** Add `contenu, exemples_exercices` to the select statement

### Fix #2: Add Missing Parameters to `regenerateActivities` Function
**File:** `src/components/content-editor/LessonBrowser.tsx`  
**Location:** Lines 233-239

**Current Body:**
```typescript
body: {
  lessonId: lesson.id,
  exercisesContent: lesson.exemples_exercices || lesson.contenu || '',
  isCreole: lesson.grade_level?.includes('creole'),
}
```

**Fixed Body:**
```typescript
body: {
  exercisesContent: lesson.exemples_exercices || lesson.contenu || '',
  lessonTitle: lesson.title,
  gradeLevel: lesson.grade_level,
  subject: lesson.subjects?.name || 'Matière',
}
```

**Changes:**
- Remove `lessonId` (not required by edge function)
- Remove `isCreole` (not required; subject name handles Creole detection via `subjectNormalized` logic in edge function)
- Add `lessonTitle` (required)
- Add `gradeLevel` (required)
- Add `subject` (required) - mirrors the pattern from `regenerateQuiz`

## Data Flow After Fix

```
loadLessons() 
  ├─ Fetches: id, title, contenu, exemples_exercices, grade_level, subjects(name), ...
  └─ Returns lesson object with all needed fields

regenerateQuiz(lesson)
  ├─ Uses: lesson.title, lesson.contenu, lesson.exemples_exercices, lesson.grade_level, lesson.subjects.name
  └─ Edge function validates all required params ✓

regenerateActivities(lesson)
  ├─ Uses: lesson.title, lesson.contenu, lesson.exemples_exercices, lesson.grade_level, lesson.subjects.name
  └─ Edge function validates all required params ✓
```

## Verification Checklist

| Check | Details |
|-------|---------|
| Query fields match all function needs? | ✓ `contenu`, `exemples_exercices`, `grade_level`, `subjects(name)` all present |
| Edge function params match schema? | ✓ `exercisesContent`, `lessonTitle`, `gradeLevel`, `subject` all sent |
| Backward compatible? | ✓ Only adds fields to query; removes unused `lessonId` and `isCreole` |
| No RLS policy issues? | ✓ All fields are accessible; no new queries or permissions needed |
| Creole detection still works? | ✓ `subject` parameter passed to edge function; logic at line 97 of edge function handles detection |
| 3G performance? | ✓ No additional API calls; just more fields in existing query |

## Files to Modify

| File | Changes | Complexity |
|------|---------|-----------|
| `src/components/content-editor/LessonBrowser.tsx` | (1) Add `contenu, exemples_exercices` to line 152 query; (2) Update `regenerateActivities` body (lines 234-238) | Low |

**Total changes:** 2 fixes, ~10 lines modified

## Expected Result After Fix

✓ `regenerateActivities` will have all required parameters for edge function validation  
✓ AI models will receive full lesson context (title, content, grade level, subject)  
✓ Generated activities will be higher quality and better aligned  
✓ Dashboard sync and UI updates continue to work as expected  
✓ Both regeneration pathways (quiz and activities) now follow identical patterns  
✓ No functional regressions or breaking changes  

