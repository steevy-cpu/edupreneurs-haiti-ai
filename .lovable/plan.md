

# Phase 4: Async Generation Jobs - Implementation Plan

## Overview

This phase refactors the `SingleLessonGenerator` from a synchronous, UI-blocking pattern to an async job-based architecture with real-time progress updates. This enables:
- Users can close the dialog and continue working while generation runs in background
- Jobs are resumable if user refreshes the page
- Better UX on slow 3G connections (no timeout failures)
- Multiple lessons can be queued for generation

---

## Current Problem Analysis

**Current Flow in `SingleLessonGenerator.tsx` (lines 127-551):**
```
User clicks "Générer" 
  → Loop through selectedSections (5 sections)
  → For each: call edge function synchronously
  → Wait 3 seconds between calls (rate limiting)
  → Total blocking time: 30-90 seconds
  → If user closes dialog or refreshes, all progress is lost
```

**Key Issues:**
1. UI is blocked for the entire generation duration
2. No persistence - refreshing loses all progress
3. Edge function timeout risks on slow connections
4. Cannot queue multiple generation jobs

---

## Proposed Architecture

```text
                    ┌─────────────────────┐
                    │    Content Editor   │
                    │    (UI Component)   │
                    └──────────┬──────────┘
                               │
                    1. Create job record
                               ▼
                    ┌─────────────────────┐
                    │  ai_generation_jobs │ ◄────────────────┐
                    │     (Database)      │                  │
                    └──────────┬──────────┘                  │
                               │                             │
                    2. Subscribe to realtime                 │
                               │                             │
                    ┌──────────▼──────────┐                  │
                    │   Realtime Channel  │                  │
                    │   (Job Updates)     │                  │
                    └──────────┬──────────┘                  │
                               │                             │
                    3. Edge function polls                   │
                               │                             │
                    ┌──────────▼──────────┐    4. Update     │
                    │  process-ai-job     │ ──────────────────┘
                    │  (Edge Function)    │
                    │  - Runs generation  │
                    │  - Updates progress │
                    │  - Saves to assets  │
                    └─────────────────────┘
```

---

## Technical Implementation

### 4.1 Database: Create `ai_generation_jobs` Table

```sql
-- Job status enum
CREATE TYPE ai_job_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- Main jobs table
CREATE TABLE ai_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  
  -- Job configuration
  job_type TEXT NOT NULL, -- 'single_lesson', 'quiz_only', 'activities_only', 'batch'
  config JSONB NOT NULL DEFAULT '{}', -- selectedSections, wordCounts, options
  
  -- Progress tracking
  status ai_job_status DEFAULT 'pending',
  progress JSONB DEFAULT '{"current": 0, "total": 0, "sections": []}',
  current_section TEXT,
  
  -- Results
  result_content JSONB, -- Generated content ready for preview
  error_message TEXT,
  
  -- Metadata
  created_by UUID REFERENCES profiles(user_id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_generation_jobs ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see/manage their own jobs
CREATE POLICY "Users can manage own jobs"
  ON ai_generation_jobs FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

-- Content editors can view all jobs for monitoring
CREATE POLICY "Editors can view all jobs"
  ON ai_generation_jobs FOR SELECT
  TO authenticated
  USING (public.is_content_editor(auth.uid(), 'viewer'));

-- Enable realtime for job status updates
ALTER PUBLICATION supabase_realtime ADD TABLE ai_generation_jobs;

-- Trigger for updated_at
CREATE TRIGGER update_ai_generation_jobs_timestamp
  BEFORE UPDATE ON ai_generation_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Index for querying pending jobs
CREATE INDEX idx_ai_jobs_status ON ai_generation_jobs(status) WHERE status IN ('pending', 'running');
CREATE INDEX idx_ai_jobs_lesson ON ai_generation_jobs(lesson_id, status);
```

### 4.2 New Edge Function: `process-ai-job`

This function processes a single job, updating progress in realtime:

```typescript
// supabase/functions/process-ai-job/index.ts

// Key responsibilities:
// 1. Fetch job configuration from ai_generation_jobs
// 2. Loop through sections defined in config
// 3. Call existing generation functions (generate-lesson-section, generate-quiz-final)
// 4. Update progress in database after each section (triggers realtime)
// 5. Store results in result_content JSONB
// 6. On completion: set status = 'completed' or 'failed'

// Rate limiting: 3-second delay between sections (same as current)
// Error handling: Mark section as failed, continue with next, mark job as 'completed' with partial results
```

### 4.3 React Hook: `useGenerationJob`

```typescript
// src/features/matieres/data/useGenerationJob.ts

interface UseGenerationJobOptions {
  lessonId: string;
  onJobComplete?: (result: JobResult) => void;
}

export function useGenerationJob({ lessonId, onJobComplete }: UseGenerationJobOptions) {
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [progress, setProgress] = useState<JobProgress | null>(null);
  
  // Query to check for existing active job for this lesson
  const { data: existingJob } = useQuery({
    queryKey: ['ai-job', lessonId, 'active'],
    queryFn: () => fetchActiveJob(lessonId),
  });

  // Subscribe to realtime updates for active job
  useRealtimeSubscription({
    table: 'ai_generation_jobs',
    event: 'UPDATE',
    filter: `id=eq.${activeJob?.id}`,
    enabled: !!activeJob?.id,
    callback: (payload) => {
      const updatedJob = payload.new as Job;
      setProgress(updatedJob.progress);
      
      if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
        setActiveJob(null);
        onJobComplete?.(updatedJob.result_content);
      }
    },
  });

  // Start new generation job
  const startJob = useMutation({
    mutationFn: async (config: JobConfig) => {
      // 1. Insert job record
      const { data: job } = await supabase
        .from('ai_generation_jobs')
        .insert({ lesson_id: lessonId, config, created_by: userId })
        .select()
        .single();
      
      // 2. Trigger edge function to process job
      await supabase.functions.invoke('process-ai-job', {
        body: { jobId: job.id }
      });
      
      return job;
    },
    onSuccess: (job) => setActiveJob(job),
  });

  // Cancel running job
  const cancelJob = useMutation({
    mutationFn: async () => {
      await supabase
        .from('ai_generation_jobs')
        .update({ status: 'cancelled' })
        .eq('id', activeJob?.id);
    },
  });

  return {
    activeJob,
    progress,
    isGenerating: !!activeJob && activeJob.status === 'running',
    startJob,
    cancelJob,
    existingJob, // Resume capability
  };
}
```

### 4.4 Refactor `SingleLessonGenerator.tsx`

**Changes:**
1. Replace local state (`isGenerating`, `progress`, `generatedContent`) with `useGenerationJob` hook
2. Remove the synchronous `handleGenerate` loop
3. Add "Resume" button if `existingJob` is found
4. Add "Cancel" functionality
5. Show progress from realtime subscription
6. Keep preview/apply flow the same (uses `result_content` from job)

**Before → After Comparison:**

| Aspect | Before | After |
|--------|--------|-------|
| State management | Local useState | Database + Realtime |
| UI blocking | 30-90s blocked | Immediate response |
| Progress persistence | Lost on refresh | Survives refresh |
| Cancel support | None | Graceful cancel |
| Multiple tabs | Conflicting | Synchronized |

---

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `supabase/migrations/xxxx_ai_generation_jobs.sql` | Database table + RLS + realtime |
| `supabase/functions/process-ai-job/index.ts` | Background job processor |
| `src/features/content-editor/hooks/useGenerationJob.ts` | React hook for job management |
| `src/features/content-editor/components/GenerationJobProgress.tsx` | Reusable progress display |

### Modified Files

| File | Changes |
|------|---------|
| `src/components/content-editor/SingleLessonGenerator.tsx` | Replace sync logic with async job pattern |
| `supabase/config.toml` | Add `process-ai-job` function config |
| `.lovable/plan.md` | Update Phase 4 status |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Backward compatible? | Yes | Existing `ai_generation_logs` table unchanged |
| Breaks existing functionality? | No | Same user flow, different backend |
| Existing data affected? | No | New table, no migration of old data needed |
| 3G optimized? | Yes | Non-blocking, resumable |
| Edge cases handled? | Yes | Cancel, resume, partial failures |
| RLS policies correct? | Yes | Users can only see own jobs |

---

## Implementation Sequence

1. **Database migration**: Create `ai_generation_jobs` table with RLS and realtime
2. **Edge function**: Create `process-ai-job` that orchestrates generation
3. **React hook**: Create `useGenerationJob` with realtime subscription
4. **UI component**: Create `GenerationJobProgress` component
5. **Refactor**: Update `SingleLessonGenerator` to use new architecture
6. **Testing**: Verify job creation, progress updates, completion, cancellation
7. **Update plan**: Mark Phase 4 as complete

---

## Technical Notes

### Rate Limiting Strategy
The edge function will maintain the existing 3-second delay between API calls to respect Lovable AI rate limits. Progress updates are sent to the database after each section completes.

### Error Recovery
If a section fails:
1. Mark that section as `error` in progress JSON
2. Continue with remaining sections
3. Job completes with partial results (user can regenerate failed sections)

### Job Cleanup
Add a scheduled function to clean up old jobs (completed/failed > 7 days) to prevent table bloat.

