

# Re-generate `exemples_exercices` for "L'espace géographique haïtien"

## What We'll Do

Trigger the content generation pipeline (now with retry logic and rate limit bypass) to regenerate the missing `exemples_exercices` section for lesson ID `761f0b21-b420-470f-9929-c0bcf80fc2c5`.

## Approach

Create a small one-time script that:
1. Inserts a new `ai_generation_jobs` row targeting only the `exemples_exercices` section
2. Invokes the `process-ai-job` edge function with that job ID
3. The fixed pipeline (with service-role rate limit bypass + retry logic) handles the rest

## Technical Details

### Step 1: Insert a targeted generation job

Insert into `ai_generation_jobs` with config that only includes `exemples_exercices`:

```sql
INSERT INTO ai_generation_jobs (lesson_id, job_type, config, status, created_by, progress)
VALUES (
  '761f0b21-b420-470f-9929-c0bcf80fc2c5',
  'batch_content_generation',
  '{"selectedSections":["exemples_exercices"],"wordCounts":{"exemples_exercices":500},"generateQuiz":false,"generateVideos":false,"generateAudio":false,"imageGenerationModel":"none"}',
  'pending',
  (SELECT user_id FROM profiles LIMIT 1),
  '{"current":0,"total":1,"sections":[]}'
);
```

### Step 2: Invoke the edge function

Call `process-ai-job` with the new job ID. The structural fixes we just deployed will:
- Skip rate limiting (service-role bypass)
- Retry on transient errors (up to 2x with backoff)
- Save the content defensively

### Step 3: Auto-publish

After successful generation, update the lesson to `is_published: true` and `workflow_status: 'approved'` (same as the batch content generator does).

## Safety

| Check | Status |
|-------|--------|
| Targets only the missing section | Yes -- config has only `exemples_exercices` |
| Won't overwrite existing content | Yes -- only updates the `exemples_exercices` column |
| Uses the fixed pipeline | Yes -- deployed edge functions with retry + rate limit bypass |
| Existing lesson data preserved | Yes -- defensive save separates core from metadata |

