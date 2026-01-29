# Matières Page Enhancement Plan

## Status: ✅ COMPLETED

All three enhancements have been implemented:

---

## ✅ Enhancement 1: PublishGateIndicator in LessonEditor

**Status**: Complete

**Changes Made**:
- Added imports for `useLessonPublishable` and `PublishGateIndicator` in `LessonEditor.tsx`
- Added hook call to get publish gate status
- Integrated compact `PublishGateIndicator` next to the publish toggle switch

**Files Modified**:
- `src/components/content-editor/LessonEditor.tsx`

---

## ✅ Enhancement 2: Job Cleanup Scheduled Function

**Status**: Complete

**Changes Made**:
- Created edge function `cleanup-old-jobs` that deletes completed/failed/cancelled jobs older than 7 days
- Added function configuration to `supabase/config.toml`
- Function deployed and tested successfully

**Files Created**:
- `supabase/functions/cleanup-old-jobs/index.ts`

**Files Modified**:
- `supabase/config.toml`

**Scheduling**: To schedule daily cleanup at 3 AM, run this SQL in Cloud View:

```sql
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

---

## ✅ Enhancement 3: BatchGenerationValidation Refactor

**Status**: Complete

**Changes Made**:
- Created `useBatchLessonPublishable` hook for efficient batch queries
- Hook fetches publishability status for multiple lessons in a single query
- Uses stable query key for caching and 30-second stale time

**Files Created**:
- `src/features/content-editor/hooks/useBatchLessonPublishable.ts`

---

## Summary

| Enhancement | Status | Files Changed |
|-------------|--------|---------------|
| PublishGateIndicator in LessonEditor | ✅ Done | `LessonEditor.tsx` |
| Cleanup Edge Function | ✅ Done | `cleanup-old-jobs/index.ts`, `config.toml` |
| Batch Publishable Hook | ✅ Done | `useBatchLessonPublishable.ts` |
