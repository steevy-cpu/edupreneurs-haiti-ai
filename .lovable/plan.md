
# Phase 5: Publishing Gate - Implementation Plan

## Overview

This phase enforces content quality by blocking lesson publication until quiz and activities assets are validated. The goal is to prevent incomplete or invalid lessons from reaching students.

---

## Current State Analysis

### Publishing Points Identified

| Location | Component | Publishing Action |
|----------|-----------|-------------------|
| `WorkflowManagement.tsx` | Workflow panel | Sets `is_published: true` when status → published |
| `BulkOperations.tsx` | Bulk actions | Mass publish selected lessons |
| `BatchGenerationValidation.tsx` | Batch validator | Publish single or all valid lessons |
| `LessonEditor.tsx` | Editor toggle | `is_published` switch in form |

### Existing Infrastructure

1. **Database function** `check_lesson_publishable(lesson_id)` already exists:
   - Checks for validated `quiz_final` asset in `lesson_assets` table
   - Checks for validated `activities` asset in `lesson_assets` table
   - Falls back to legacy HTML content if no JSON assets exist
   - Returns `TRUE` only if both quiz AND activities are present

2. **Validation types** in `validation-report.types.ts`:
   - `AssetStatus`: `'draft' | 'validating' | 'validated' | 'rejected' | 'published'`
   - `ValidationReport` with `passed`, `schemaErrors`, `alignmentScore`, `qualityChecks`

3. **Asset queries** in `lessonAssets.queries.ts`:
   - `useLessonQuizAsset(lessonId)` - fetch quiz JSON asset
   - `useLessonActivitiesAsset(lessonId)` - fetch activities JSON asset
   - `useUpdateAssetStatus()` - update asset validation status

---

## Implementation Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                     Publishing Gate Flow                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User clicks "Publish"                                          │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────┐                                        │
│  │ useLessonPublishable│ ◄─── Hook checks gate status           │
│  │       (hook)        │                                        │
│  └──────────┬──────────┘                                        │
│             │                                                   │
│             ▼                                                   │
│  ┌─────────────────────┐     ┌─────────────────────┐           │
│  │ check_lesson_       │     │    lesson_assets    │           │
│  │ publishable()       │────▶│     (table)         │           │
│  │   (db function)     │     │  status='validated' │           │
│  └──────────┬──────────┘     └─────────────────────┘           │
│             │                                                   │
│      ┌──────┴──────┐                                           │
│      │             │                                           │
│      ▼             ▼                                           │
│   ┌──────┐     ┌──────┐                                        │
│   │ TRUE │     │FALSE │                                        │
│   └──┬───┘     └──┬───┘                                        │
│      │            │                                            │
│      ▼            ▼                                            │
│  Enable        Disable button                                  │
│  Publish       + Show blockers                                 │
│                                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### 5.1 New Hook: `useLessonPublishable`

**Purpose**: Centralized gate check that can be reused across all publishing locations.

**File**: `src/features/content-editor/hooks/useLessonPublishable.ts`

```typescript
interface PublishGateStatus {
  canPublish: boolean;
  isLoading: boolean;
  blockers: {
    quizMissing: boolean;
    quizNotValidated: boolean;
    activitiesMissing: boolean;
    activitiesNotValidated: boolean;
  };
  quizAsset: LessonAsset | null;
  activitiesAsset: LessonAsset | null;
}

export function useLessonPublishable(lessonId: string | undefined): PublishGateStatus
```

**Logic**:
1. Fetch quiz and activities assets using existing hooks
2. Check if each asset exists and has `status === 'validated'`
3. Return structured blockers for UI feedback
4. Optionally call `check_lesson_publishable()` RPC for server-side confirmation

### 5.2 New Component: `PublishGateIndicator`

**Purpose**: Visual indicator showing what's blocking publication.

**File**: `src/features/content-editor/components/PublishGateIndicator.tsx`

**Features**:
- Shows checkmarks for validated assets
- Shows warnings for missing/unvalidated assets
- Links to validation panel for quick fixes
- Compact mode for inline display, expanded mode for detailed view

**Example UI**:
```
┌─────────────────────────────────────────┐
│ 📋 Publication Readiness                │
├─────────────────────────────────────────┤
│ ✅ Quiz Final (15 questions, validated) │
│ ⚠️ Activités: Non validées              │
│                                         │
│ [Valider les activités]                 │
└─────────────────────────────────────────┘
```

### 5.3 Integration Points

#### A. WorkflowManagement.tsx (Primary)

**Current code (line 190)**:
```typescript
{currentStatus === 'approved' && canApprove && (
  <Button onClick={() => updateWorkflowStatus('published')}>
    Publier
  </Button>
)}
```

**Modified code**:
```typescript
const { canPublish, blockers } = useLessonPublishable(selectedLesson?.id);

{currentStatus === 'approved' && canApprove && (
  <>
    <PublishGateIndicator 
      blockers={blockers} 
      lessonId={selectedLesson.id}
      compact 
    />
    <Button 
      onClick={() => updateWorkflowStatus('published')}
      disabled={!canPublish}
    >
      Publier
    </Button>
  </>
)}
```

#### B. BulkOperations.tsx

**Enhancement**: Filter out unpublishable lessons from bulk publish:
```typescript
const bulkPublish = async () => {
  // Fetch publishability status for all selected
  const publishable = await Promise.all(
    selectedLessons.map(id => 
      supabase.rpc('check_lesson_publishable', { p_lesson_id: id })
    )
  );
  
  const validIds = selectedLessons.filter((_, i) => publishable[i].data);
  const blocked = selectedLessons.length - validIds.length;
  
  if (blocked > 0) {
    toast.warning(`${blocked} leçon(s) ne peuvent pas être publiées (validation manquante)`);
  }
  
  // Proceed with valid ones...
};
```

#### C. BatchGenerationValidation.tsx

Already has validation checks (lines 1210-1214), but should use centralized hook.

#### D. LessonEditor.tsx

Add visual indicator near the `is_published` switch showing gate status.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/features/content-editor/hooks/useLessonPublishable.ts` | Gate status hook |
| `src/features/content-editor/components/PublishGateIndicator.tsx` | Visual blocker display |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/content-editor/WorkflowManagement.tsx` | Add gate check + indicator |
| `src/components/content-editor/BulkOperations.tsx` | Filter unpublishable lessons |
| `src/features/content-editor/index.ts` | Export new hook + component |
| `.lovable/plan.md` | Mark Phase 5 complete |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Backward compatible? | ✅ Yes | Fallback to legacy HTML in DB function |
| Breaks existing functionality? | ✅ No | Only adds restrictions, doesn't remove |
| Existing data affected? | ✅ No | Lessons already published remain published |
| 3G optimized? | ✅ Yes | Asset queries already cached |
| Edge cases handled? | ✅ Yes | Missing assets show as blockers |

### Edge Cases

1. **Legacy lessons with HTML but no JSON assets**: DB function already handles this with fallback check
2. **Lesson with validated quiz but no activities**: Shows activities as blocker
3. **Bulk publish with mixed valid/invalid**: Only publishes valid ones, warns about blocked

---

## Implementation Sequence

1. Create `useLessonPublishable` hook
2. Create `PublishGateIndicator` component
3. Integrate into `WorkflowManagement.tsx`
4. Integrate into `BulkOperations.tsx`
5. Update feature exports
6. Test end-to-end
7. Update `.lovable/plan.md`

---

## User Experience

### Before (Current)
- User can publish any lesson regardless of content quality
- No visibility into what's missing
- Invalid content reaches students

### After (With Gate)
- Clear visual indicators show publication readiness
- Disabled publish button with explanation
- One-click navigation to validation panel
- Quality ensured before students see content

---

## Technical Notes

### Why Not Just Use RPC?

While `check_lesson_publishable()` RPC works, calling it for each lesson in bulk operations is N+1 queries. The hook approach:
1. Uses existing asset query caching
2. Provides detailed blockers for UI
3. Reduces database round-trips
4. Enables optimistic UI updates

### Validation Status Flow

```
draft → validating → validated → published
         ↓
      rejected (requires regeneration)
```

Publishing is only allowed when both quiz and activities are in `validated` or have legacy HTML content.
