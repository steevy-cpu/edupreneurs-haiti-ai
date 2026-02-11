
# Structural Fix: End-to-End Content Generation Pipeline

## Current State and Root Issues

After tracing the full flow from Content Editor to lesson display, I found **4 structural problems** that cause content to silently fail or get lost:

### Problem 1: Rate Limiting Blocks Server-to-Server Calls
The `process-ai-job` edge function uses a **service-role** Supabase client to call `generate-lesson-section`. Since service-role calls have no user ID, the rate limiter treats them as **anonymous** (3 req/min limit). With 4 sections + 3-second delays, the 4th call (`exemples_exercices`) always gets a **429 Too Many Requests**.

This is why `exemples_exercices` consistently fails.

### Problem 2: No Retry Logic for Transient Failures
When a section call returns 429, `process-ai-job` logs the error and moves on. There is no retry mechanism. A single transient failure (rate limit, timeout, temporary AI gateway issue) permanently marks that section as failed.

### Problem 3: `suggested_videos` Column Doesn't Exist
The edge function tries to save `resultContent.suggested_videos` to the `lessons` table, but the column doesn't exist. If this UPDATE runs, it could fail and prevent ALL other generated content from being saved (the objectif, introduction, contenu that were successfully generated would be lost because they're in the same UPDATE).

### Problem 4: `totalTasks` Counts Unsupported Features
Image generation (`imageGenerationModel: 'lovable'`) and audio are counted in `totalTasks` but never processed, making the progress bar misleading (e.g., shows 5/7 instead of 5/5).

---

## Structural Fix Plan

### Fix 1: Bypass Rate Limiting for Internal Server-to-Server Calls
**File**: `supabase/functions/generate-lesson-section/index.ts`

Add a check: if the request comes from the service-role key (which only server-side edge functions use), skip rate limiting entirely. These are trusted internal calls, not user-facing.

```text
Logic:
1. Extract the Authorization header
2. If the bearer token matches SUPABASE_SERVICE_ROLE_KEY, skip rate limit check
3. Otherwise, apply normal rate limiting
```

This is safe because the service-role key is never exposed to the client.

### Fix 2: Add Retry Logic with Exponential Backoff
**File**: `supabase/functions/process-ai-job/index.ts`

Wrap the `generateSection` call in a retry helper that:
- Retries up to 2 times on 429 or 5xx errors
- Uses exponential backoff (5s, then 10s)
- Only retries transient failures, not validation errors

```text
async function withRetry(fn, maxRetries = 2, baseDelay = 5000):
  for attempt in 0..maxRetries:
    try:
      return await fn()
    catch error:
      if attempt === maxRetries: throw error
      if isTransientError(error): await sleep(baseDelay * 2^attempt)
      else: throw error  // Don't retry permanent errors
```

### Fix 3: Add `suggested_videos` Column + Defensive Save Logic
**Migration**: Add `suggested_videos TEXT` column to `lessons` table.

**File**: `supabase/functions/process-ai-job/index.ts`

Also make the save logic defensive: separate the `suggested_videos` save from the core content save. If the optional field fails, core content still gets saved.

```text
Logic:
1. Save core sections (objectif, introduction, contenu, exemples) in one UPDATE
2. Save optional metadata (youtube_url, suggested_videos) in a separate UPDATE
3. If optional save fails, log warning but don't mark job as failed
```

### Fix 4: Accurate Task Counting
**File**: `supabase/functions/process-ai-job/index.ts`

Only count tasks that will actually be processed. Remove image generation and audio from `totalTasks` since they're not implemented server-side.

```text
Before: totalTasks = sections + quiz + videos + images + audio
After:  totalTasks = sections + quiz + videos
```

Also update the `contentGenerator.ts` config to not include `imageGenerationModel: 'lovable'` since it does nothing in the batch flow.

### Fix 5: Backfill YouTube URL for Existing Lesson
**Data fix**: Update the lesson that was already generated but missing its YouTube URL.

---

## Files to Change

| File | Change | Why |
|------|--------|-----|
| `supabase/functions/generate-lesson-section/index.ts` | Bypass rate limit for service-role calls | Prevents 429 on server-to-server calls |
| `supabase/functions/process-ai-job/index.ts` | Add retry logic, defensive save, accurate task count | Fault tolerance + correct progress |
| `src/features/content-editor/batch-operations/generators/contentGenerator.ts` | Remove `imageGenerationModel: 'lovable'`, update description | Honest config, no phantom tasks |
| Migration | Add `suggested_videos TEXT` column | Prevent UPDATE failures |
| Data fix | Backfill youtube_url for existing lesson | Immediate fix for current data |

---

## Safety Verification

| Check | Result |
|-------|--------|
| Breaks existing functionality? | No -- all changes are additive or protective |
| Works with existing data? | Yes -- nullable column, defensive saves |
| 3G optimized? | Yes -- no frontend impact |
| Backward compatible? | Yes -- retry is transparent, rate limit bypass only for service-role |
| Edge cases handled? | Yes -- retry only on transient errors, separate core vs optional saves |
| Security risk? | None -- service-role key is server-only, never exposed to client |

## Summary of Impact
- `exemples_exercices` will no longer fail due to rate limiting
- Transient failures get automatic retry instead of permanent failure
- `suggested_videos` data has a proper home in the database
- Progress bar shows accurate completion (no phantom image/audio tasks)
- Core content save is protected from optional field failures
