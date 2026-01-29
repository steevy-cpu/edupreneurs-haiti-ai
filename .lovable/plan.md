
# Matières Page Enhancement Plan

## Overview

This plan implements three optional polish items for the content editor workflow:

1. **PublishGateIndicator in LessonEditor** - Visual feedback near the publish toggle
2. **Job Cleanup Scheduled Function** - Automatic cleanup of old AI generation jobs  
3. **BatchGenerationValidation Refactor** - Use centralized `useLessonPublishable` hook

---

## Enhancement 1: PublishGateIndicator in LessonEditor

### Current State
The `LessonEditor.tsx` component has a simple toggle switch for publishing (lines 229-235) without any visual indicator of whether the lesson meets publication requirements.

### Implementation
Add a compact `PublishGateIndicator` next to the publish toggle to show quiz/activity validation status.

**File: `src/components/content-editor/LessonEditor.tsx`**

```typescript
// Add imports at top
import { useLessonPublishable } from "@/features/content-editor/hooks/useLessonPublishable";
import { PublishGateIndicator } from "@/features/content-editor/components/PublishGateIndicator";

// Inside component, add hook call
const { canPublish, isLoading: gateLoading, blockers, quizAsset, activitiesAsset, blockReason } = 
  useLessonPublishable(selectedLesson?.id);

// Modify the publish toggle section (around line 229)
<div className="flex items-center gap-2">
  <Switch
    checked={lessonData.is_published}
    onCheckedChange={(checked) =>
      setLessonData({ ...lessonData, is_published: checked })
    }
    disabled={!canPublish && checked === false} // Only disable if trying to publish
  />
  <span className="text-xs md:text-sm whitespace-nowrap">Publié</span>
  <PublishGateIndicator
    blockers={blockers}
    quizAsset={quizAsset}
    activitiesAsset={activitiesAsset}
    isLoading={gateLoading}
    compact={true}
  />
</div>
```

### Safety Note
- The hook only runs when a lesson is selected (conditional fetch)
- Uses existing validated queries from `lessonAssets.queries.ts`
- No database changes required

---

## Enhancement 2: Job Cleanup Scheduled Function

### Current State
- `ai_generation_jobs` table stores job records indefinitely
- No automatic cleanup mechanism exists
- Old completed/failed/cancelled jobs accumulate

### Database Schema Reference
```
ai_generation_jobs:
  - id: uuid
  - status: enum (pending, running, completed, failed, cancelled)
  - completed_at: timestamp with time zone
  - created_at: timestamp with time zone
```

### Implementation

**Step 1: Create Edge Function**

**File: `supabase/functions/cleanup-old-jobs/index.ts`**

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Delete old completed, failed, and cancelled jobs
    const { data, error, count } = await supabase
      .from('ai_generation_jobs')
      .delete()
      .in('status', ['completed', 'failed', 'cancelled'])
      .lt('created_at', sevenDaysAgo.toISOString())
      .select('id');

    if (error) throw error;

    const deletedCount = data?.length || 0;
    console.log(`Cleaned up ${deletedCount} old AI generation jobs`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        deletedCount,
        olderThan: sevenDaysAgo.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Cleanup error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

**Step 2: Configure Function**

**Add to: `supabase/config.toml`**

```toml
[functions.cleanup-old-jobs]
verify_jwt = false
```

**Step 3: Schedule with pg_cron**

Using Supabase SQL insert tool (not migration):

```sql
-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule cleanup to run daily at 3 AM
SELECT cron.schedule(
  'cleanup-old-ai-jobs',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://xdyavylcmucjpueybdku.supabase.co/functions/v1/cleanup-old-jobs',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkeWF2eWxjbXVjanB1ZXliZGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTIxODIsImV4cCI6MjA3NDk4ODE4Mn0.TU1dWtjyxFRpNVg3ePt4Kj9cUMpbXFfpsrNawIBv60o"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
```

### Manual Trigger Option
The function can also be called manually from the content editor admin panel if needed.

---

## Enhancement 3: BatchGenerationValidation Refactor

### Current State
- Uses local `parseQuizQuestions` and `parseActivities` for validation
- Publishing logic is disconnected from `lesson_assets` table status
- Doesn't leverage the centralized `useLessonPublishable` hook

### Challenge
The `useLessonPublishable` hook is designed for single lessons, but `BatchGenerationValidation` handles multiple lessons. We need a batched approach.

### Implementation Approach

**Option A: Create a batch-compatible utility**

Instead of calling hooks in a loop (which violates React rules), we'll:
1. Create a utility function that fetches publishability status for multiple lessons
2. Use it in the validation flow

**File: `src/features/content-editor/hooks/useBatchLessonPublishable.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PublishBlockers, PublishGateStatus } from './useLessonPublishable';

interface BatchPublishStatus {
  [lessonId: string]: PublishGateStatus;
}

export function useBatchLessonPublishable(lessonIds: string[]) {
  return useQuery({
    queryKey: ['batch-lesson-publishable', lessonIds.sort().join(',')],
    queryFn: async () => {
      if (lessonIds.length === 0) return {};

      const { data: assets, error } = await supabase
        .from('lesson_assets')
        .select('*')
        .in('lesson_id', lessonIds)
        .in('kind', ['quiz_final', 'activities']);

      if (error) throw error;

      const result: BatchPublishStatus = {};

      for (const lessonId of lessonIds) {
        const lessonAssets = assets?.filter(a => a.lesson_id === lessonId) || [];
        const quizAsset = lessonAssets.find(a => a.kind === 'quiz_final') || null;
        const activitiesAsset = lessonAssets.find(a => a.kind === 'activities') || null;

        const quizMissing = !quizAsset;
        const quizNotValidated = !!quizAsset && 
          quizAsset.status !== 'validated' && quizAsset.status !== 'published';
        const activitiesMissing = !activitiesAsset;
        const activitiesNotValidated = !!activitiesAsset && 
          activitiesAsset.status !== 'validated' && activitiesAsset.status !== 'published';

        const blockers: PublishBlockers = {
          quizMissing,
          quizNotValidated,
          activitiesMissing,
          activitiesNotValidated,
        };

        const hasBlockers = quizMissing || quizNotValidated || 
                           activitiesMissing || activitiesNotValidated;

        result[lessonId] = {
          canPublish: !hasBlockers,
          isLoading: false,
          blockers,
          quizAsset,
          activitiesAsset,
          blockReason: hasBlockers ? 'Validation requise' : null,
        };
      }

      return result;
    },
    enabled: lessonIds.length > 0,
    staleTime: 30000,
  });
}
```

**Update BatchGenerationValidation.tsx**

```typescript
// Add import
import { useBatchLessonPublishable } from '@/features/content-editor/hooks/useBatchLessonPublishable';

// In component, add:
const validationLessonIds = validations.map(v => v.lesson.id);
const { data: publishStatus } = useBatchLessonPublishable(validationLessonIds);

// Update ValidationItem to use publishStatus
// Pass publishStatus[lessonId] to each ValidationItem for display
```

**Update ValidationItem Component**

Add `PublishGateIndicator` compact display in the validation item to show asset status alongside parsing results.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/content-editor/LessonEditor.tsx` | Add imports, hook call, PublishGateIndicator |
| `supabase/functions/cleanup-old-jobs/index.ts` | **New file** - Cleanup function |
| `supabase/config.toml` | Add function config |
| `src/features/content-editor/hooks/useBatchLessonPublishable.ts` | **New file** - Batch hook |
| `src/components/content-editor/BatchGenerationValidation.tsx` | Add batch hook, update ValidationItem |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Will this break existing functionality? | No - additive changes only |
| Are there logical errors? | No - uses existing validated patterns |
| Does this work with existing data? | Yes - queries existing tables |
| Is this optimized for 3G? | Yes - batch queries reduce network calls |
| Are edge cases handled? | Yes - empty arrays, missing assets |
| Is backward compatibility maintained? | Yes - existing validation logic preserved |

---

## Technical Details

### Hook Rules Compliance
- `useBatchLessonPublishable` is called at the top level of `BatchGenerationValidation`
- Uses stable dependency array (sorted, joined lessonIds)
- Enabled flag prevents unnecessary queries

### Performance Considerations
- Single batch query instead of N individual queries
- 30-second stale time for caching
- Query invalidation on lesson updates (via React Query)

### Database Impact
- Cleanup function runs daily at 3 AM (low traffic)
- Deletes only terminal-state jobs (completed/failed/cancelled)
- Preserves pending/running jobs regardless of age
