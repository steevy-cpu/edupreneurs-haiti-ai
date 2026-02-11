
# Fix: Save Generated Content to Lessons Table

## Problem
The batch content generation successfully generates content (objectif, introduction, contenu, exemples) via the `process-ai-job` edge function, but the generated content is **never written back to the `lessons` table**. It only gets stored in `ai_generation_jobs.result_content`. The lesson still shows placeholder text like "Contenu a venir...".

Evidence from the database:
- `ai_generation_jobs` for lesson `espace-geographique-haitien`: contains full HTML content for all sections (objectif: 136 words, introduction: 363 words, contenu: rich HTML)
- `lessons` table: still has `"Contenu à venir..."` for introduction, contenu, and exemples_exercices

## Root Cause
The `process-ai-job` edge function (line 383-392) saves results to `ai_generation_jobs.result_content` but has **no code to update the `lessons` table** with the generated content.

## Solution
Add a lessons table update to the `process-ai-job` edge function, right before marking the job as completed. This writes each successfully generated section back to the lesson record.

## Changes

### 1. Update: `supabase/functions/process-ai-job/index.ts`

After line 378 (after all generation is done), before the job completion update, add:

```typescript
// Save generated content to the lessons table
const lessonUpdates: Record<string, any> = {};
for (const section of progress.sections) {
  if (section.status === 'completed' && section.content) {
    // Map section names to lesson column names
    const columnName = section.name === 'quiz_final' ? 'quiz_final' 
      : section.name === 'activites_interactives' ? 'activites_interactives'
      : section.name;
    lessonUpdates[columnName] = section.content;
  }
}

// Also save youtube_url and suggested_videos if available
if (resultContent.youtube_url) {
  lessonUpdates.youtube_url = resultContent.youtube_url;
}
if (resultContent.suggested_videos) {
  lessonUpdates.suggested_videos = resultContent.suggested_videos;
}

if (Object.keys(lessonUpdates).length > 0) {
  const { error: updateError } = await supabase
    .from('lessons')
    .update(lessonUpdates)
    .eq('id', lesson.id);

  if (updateError) {
    console.error('Failed to save content to lesson:', updateError);
    hasErrors = true;
  } else {
    console.log('Lesson content saved:', Object.keys(lessonUpdates));
  }
}
```

### 2. No other file changes needed

The `contentGenerator.ts` `updateLesson` callback already handles auto-publishing. The edge function just needs to actually save the content.

## Safety Verification

| Check | Result |
|-------|--------|
| Breaks existing functionality? | No -- additive only, adds the missing save step |
| Works with existing data? | Yes -- only writes successfully generated sections |
| 3G optimized? | Yes -- single UPDATE query with all sections combined |
| Backward compatible? | Yes -- existing jobs still work, new jobs also save content |
| Edge cases handled? | Yes -- only saves sections with status 'completed' and non-empty content; update errors are logged but don't crash the job |
| Quiz content format? | Handled -- maps quiz_final and activites_interactives to correct column names |
