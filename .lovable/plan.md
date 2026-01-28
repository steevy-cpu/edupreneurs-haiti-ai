# Lesson Content Architecture - Implementation Plan

## Overview

This plan documents the phased migration from legacy HTML-in-column storage to a structured JSON asset architecture for lesson content (quiz, activities). This enables validation, real-time generation tracking, and improved maintainability.

---

## Phase Status

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Foundation - `lesson_assets` table + Zod schemas + Renderers | ✅ Complete |
| **Phase 2** | JSON Quiz Generation - Edge function + asset storage | ✅ Complete |
| **Phase 3** | Lazy Tab Loading - Performance optimization for 3G | ✅ Complete |
| **Phase 4** | Async Generation Jobs - Background processing with realtime | ✅ Complete |
| **Phase 5** | Publishing Gate - Block publish unless validated | ⏳ Pending |

---

## Phase 4: Async Generation Jobs (COMPLETED)

### What Was Built

1. **Database: `ai_generation_jobs` table**
   - Status enum: `pending`, `running`, `completed`, `failed`, `cancelled`
   - Progress tracking via JSONB with realtime updates
   - RLS policies for user ownership + editor viewing
   - Indexed for efficient job queries

2. **Edge Function: `process-ai-job`**
   - Background job processor that orchestrates generation
   - Calls existing functions (generate-lesson-section, generate-quiz-final, suggest-youtube-videos)
   - Updates progress in database after each section (triggers realtime)
   - 3-second rate limiting between API calls
   - Handles cancellation mid-job
   - Stores results in `result_content` JSONB

3. **React Hook: `useGenerationJob`**
   - Manages job lifecycle (create, track, cancel)
   - Realtime subscription for progress updates
   - Resume capability for existing jobs
   - Type-safe transformation from database records

4. **Component: `GenerationJobProgress`**
   - Visual progress display with section status
   - Cancel button for running jobs
   - Resume button for interrupted sessions
   - Background processing info message

### Files Created

| File | Purpose |
|------|---------|
| `supabase/functions/process-ai-job/index.ts` | Background job processor |
| `src/features/content-editor/hooks/useGenerationJob.ts` | React hook for job management |
| `src/features/content-editor/components/GenerationJobProgress.tsx` | Progress UI component |
| `src/features/content-editor/index.ts` | Feature exports |

### Files Modified

| File | Changes |
|------|---------|
| `supabase/config.toml` | Added `process-ai-job` function config |

### Next Step: Integrate with SingleLessonGenerator

The async job system is ready. To complete integration:

1. Import `useGenerationJob` and `GenerationJobProgress` in `SingleLessonGenerator.tsx`
2. Replace local `isGenerating` state with hook's `isGenerating`
3. Replace sync generation loop with `startJob` mutation
4. Show `GenerationJobProgress` component during generation
5. Use `resultContent` from job for preview/apply flow

---

## Phase 5: Publishing Gate (PENDING)

### Goal
Block lesson publishing unless quiz and activities assets are validated.

### Implementation

1. **Database function**: `check_lesson_publishable(lesson_id)` - already exists
2. **UI integration**: Disable publish button if not publishable
3. **Validation status display**: Show which assets need attention

---

## Technical Notes

### Rate Limiting Strategy
The edge function maintains 3-second delays between AI API calls to respect Lovable AI rate limits.

### Error Recovery
If a section fails:
1. Mark that section as `error` in progress JSON
2. Continue with remaining sections
3. Job completes with partial results

### Image/Audio Generation
Currently handled client-side due to canvas requirements. Future enhancement could move image processing to edge function with storage integration.

### Job Cleanup
Consider adding scheduled function to clean up old jobs (completed/failed > 7 days).
