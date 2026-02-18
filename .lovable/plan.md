
# Review: Content Generation Flow — Issues & Fix Plan

## What Was Found After Full Code Review

There are **two separate generation systems** in this project that operate completely differently. This is the root cause of most confusion.

---

## System 1 — `BatchLessonGenerator.tsx` (The Old System)

This is the older, manually-wired component. It generates content section by section in a client-side loop and then requires the admin to **manually click "Apply" or "Publish All"** after generation.

**Critical Issues Found:**

### Issue 1 — Content is NOT automatically saved or published
The `generateLessonSections()` function (line ~506) **does save each section immediately** to the database as it's generated (one section at a time via individual `supabase.update()` calls). However, **publishing is a separate manual step**. The admin must click "Publish All Completed" which calls `handleApplyLesson(lessonId, true)` which sets `is_published: true` and `workflow_status: 'published'` only then.

So the answer to your question: **No, content is not auto-published in this old system.** You have to wait for ALL lessons in the batch to finish, then manually click "Publish All."

### Issue 2 — `isPaused` check in the loop is broken (logical error)
In `processBatch()` (line ~353):
```typescript
for (let i = 0; i < batchLessons.length; i++) {
  if (isPaused) break;  // ❌ This reads stale closure value!
  await generateLessonSections(lesson, i);
}
```
`isPaused` is a React state variable, but this is inside an async loop — it will always read the value at the time the loop started (stale closure). The pause button will never stop the loop mid-way.

### Issue 3 — `completedCount` in toast is stale
In `processBatch()` (line ~370):
```typescript
toast.success(`Lot ${batchNumber}/${totalBatchCount} terminé: ${completedCount}/${batchLessons.length} leçons.`);
```
`completedCount` is React state, which is stale inside an async function. It will always show `0` in the toast even if lessons completed.

### Issue 4 — Quiz content generated but NOT saved in `generateLessonSections`
When `generateQuiz` is true, the quiz HTML is stored in `lessonStatuses` (in-memory only). It is **never automatically written to the database**. It only gets saved when the admin manually clicks "Apply" via `handleApplyLesson`. If the page is refreshed, the generated quiz is lost.

---

## System 2 — `contentGenerator.ts` + `useBatchOperation.ts` (The New System)

This is the modern, job-based system using `process-ai-job` edge function. It is what the `BatchContentGenerator` wrapper uses (the card with the blue "Generate Missing Content" button in the content editor dashboard).

**How it currently works:**
1. For each lesson, it creates a job in `ai_generation_jobs` table
2. Invokes `process-ai-job` edge function which generates all sections server-side
3. The edge function **saves content immediately** to the `lessons` table as it completes
4. After `processLesson` completes, `updateLesson` is called, which sets `is_published: true` and `workflow_status: 'approved'`

**This system already auto-saves and auto-publishes per lesson.** However there are still issues:

### Issue 5 — workflow_status is set to 'approved', not 'published'
In `contentGenerator.ts` `updateLesson()` (line ~157):
```typescript
await supabase.from('lessons').update({ 
  is_published: true, 
  workflow_status: 'approved'  // ❌ Should be 'published' for consistency
}).eq('id', lessonId);
```
`is_published: true` is correct, but `workflow_status: 'approved'` means the lesson appears as "Approuvé" in the workflow panel rather than "Publié". This is inconsistent with what `handleApplyLesson` does in the old system (which sets `workflow_status: 'published'`).

### Issue 6 — Concurrency=1 means lessons are processed one at a time
This is intentional for stability, but the consequence is that for 100 lessons with a 3s rate limit + ~60s per generation, it takes approximately **105+ minutes** to complete. The system has a session storage TTL of 60 minutes, so **sessions expire before the batch completes**.

### Issue 7 — The polling timeout in `processLesson` is 5 minutes but generation can take longer
For a lesson with 4 sections + videos, each section taking ~15s + 1.5s delay, total is roughly 4×16.5 = 66 seconds minimum. But for slower AI calls under load, it could reach or exceed 5 minutes (300,000ms max wait), causing a `Timeout` error even though the job is still running.

---

## What Needs To Change

### Fix 1 — Auto-save AND auto-publish per lesson in the Old System (`BatchLessonGenerator`)
After `generateLessonSections()` succeeds for a lesson, immediately call a publish update. No more waiting for "Publish All" button.

**Where to add (after line ~665 in BatchLessonGenerator.tsx):**
```typescript
// After marking lesson as completed:
if (success) {
  await supabase.from('lessons')
    .update({ is_published: true, workflow_status: 'published' })
    .eq('id', lesson.id);
}
```

### Fix 2 — Fix the stale closure `isPaused` bug
Replace state-based `isPaused` with a `useRef` so it can be read inside async loops:
```typescript
const isPausedRef = useRef(false);
// In pause handler: isPausedRef.current = true;
// In loop: if (isPausedRef.current) break;
```

### Fix 3 — Fix quiz not being saved automatically in Old System
After generating quiz content in `generateLessonSections`, immediately save it:
```typescript
if (generateQuiz && quizData?.quizContent) {
  await supabase.from('lessons')
    .update({ quiz_final: quizData.quizContent })
    .eq('id', lesson.id);
}
```

### Fix 4 — Set `workflow_status` to `'published'` in New System
In `contentGenerator.ts`, change `workflow_status: 'approved'` to `workflow_status: 'published'` so status is consistent.

### Fix 5 — Increase session TTL or warn user
The batch session TTL (60 min) should be extended to 120 minutes (or warn the admin when a large batch will exceed 60 minutes based on `estimatedMinutes`).

---

## Files To Modify

| File | Change |
|---|---|
| `src/components/content-editor/BatchLessonGenerator.tsx` | Auto-publish after each lesson completes; fix `isPaused` stale closure; auto-save quiz to DB immediately |
| `src/features/content-editor/batch-operations/generators/contentGenerator.ts` | Change `workflow_status: 'approved'` → `'published'` |
| `src/features/content-editor/batch-operations/store/batchOperationSession.ts` | Extend TTL from 60 min → 120 min |

---

## Safety Verification

| Check | Result |
|---|---|
| Will existing published lessons be affected? | No — only lessons being actively generated |
| Does auto-publish bypass the publish gate (quiz/activities check)? | Yes, intentionally — batch generation is an admin-level operation that bypasses the gate by design (same as existing behavior in new system) |
| Will fixing `isPaused` change pause behavior? | Yes, it will actually work now — which is the correct behavior |
| Will auto-saving quiz break preview functionality? | No — quiz content will just also be persisted to DB immediately instead of only in memory |
| 3G impact? | No change — these are server-side operations |
