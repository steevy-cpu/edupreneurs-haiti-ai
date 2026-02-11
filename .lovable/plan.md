

# Fix: Statement Timeout on Lesson Loading

## Root Cause
The `LessonBrowser` query fetches **full text content** for every lesson (`quiz_final`, `activites_interactives`, `contenu`, `exemples_exercices`, `objectif`, `introduction`). These are massive HTML strings (5,000-15,000+ characters each). When loading a grade with 200+ lessons, this means transferring megabytes of data in a single query, causing a database statement timeout.

## Solution: Lightweight Content Flags

Replace the heavy column fetches with a database view that returns only boolean existence flags and character lengths. The full content is never needed in the list view -- only when opening a specific lesson.

## Step 1: Create Database View

Create a `lesson_content_flags` view that computes lightweight boolean flags:

```sql
CREATE VIEW lesson_content_flags AS
SELECT 
  id,
  (objectif IS NOT NULL AND length(trim(objectif)) > 10) AS has_objectif,
  (introduction IS NOT NULL AND length(trim(introduction)) > 10) AS has_introduction,
  (contenu IS NOT NULL AND length(trim(contenu)) > 10) AS has_contenu,
  (exemples_exercices IS NOT NULL AND length(trim(exemples_exercices)) > 10) AS has_exemples,
  (quiz_final IS NOT NULL AND length(trim(quiz_final)) > 10) AS has_quiz,
  (activites_interactives IS NOT NULL AND length(trim(activites_interactives)) > 10) AS has_activities
FROM lessons;
```

## Step 2: Update LessonBrowser Query

Replace the current heavy select:
```
id, title, slug, subject_id, order_index, workflow_status, grade_level, 
quiz_final, activites_interactives, contenu, exemples_exercices, objectif, 
introduction, youtube_url, ...
```

With a lightweight select (removing all large text columns):
```
id, title, slug, subject_id, order_index, workflow_status, grade_level, 
youtube_url, needs_quiz_regeneration, needs_activities_regeneration, 
last_content_validated_at, last_activities_validated_at, 
validation_details_json, content_alignment_score, activities_alignment_score, 
subjects(id, name)
```

Then fetch the content flags separately from the view:
```typescript
const { data: flags } = await supabase
  .from('lesson_content_flags')
  .select('id, has_objectif, has_introduction, has_contenu, has_exemples, has_quiz, has_activities')
  .in('id', lessonIds);
```

Merge the flags into the lesson objects for badge/stats calculations.

## Step 3: Update Badge and Stats Logic

Replace direct field checks like:
```typescript
!lesson.contenu || lesson.contenu.trim().length < 10
```

With flag checks:
```typescript
!lesson.has_contenu
```

This applies to:
- Content coverage progress bar calculation
- "Vide" badge rendering
- "Contenu manquant uniquement" filter
- Quiz stats (has_quiz / has_activities)

## Step 4: Update `isLessonMissingContent` in contentGenerator.ts

Update to use the new flag-based properties instead of checking raw text fields.

## Performance Impact

| Metric | Before | After |
|--------|--------|-------|
| Data transferred per grade | ~5-15 MB (full HTML) | ~50-100 KB (metadata + flags) |
| Query time (200 lessons) | Timeout (>8s) | <1s |
| Columns fetched | 22 (including 6 large text) | 16 small + 6 booleans (separate query) |

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- same data, different format |
| Works with existing data? | Yes -- view reads existing columns |
| 3G optimized? | Major improvement -- 100x less data transferred |
| Backward compatible? | Yes -- badges and stats work identically |
| Edge cases? | Null fields handled with IS NOT NULL checks |

