

# Full Restructure Plan: Batch Validation & Regeneration System

## Executive Summary

The current system has **4 nearly identical components** (364 lines each) that each handle validation or regeneration for either quizzes or activities. This plan consolidates them into a **unified, reusable architecture** that fixes critical bugs, reduces code by ~70%, and improves user experience.

---

## Critical Issues Identified

### 1. Data Loss Bug (CRITICAL)
**Current Code (BatchQuizContentValidator, line 151-158):**
```typescript
const validationDetails = {
  quiz: { aligned, confidence, offContentQuestions... },
  lastValidatedAt: new Date().toISOString(),
};
// OVERWRITES entire column - loses activities data!
await supabase.from('lessons').update({
  validation_details_json: validationDetails  // ❌ Destroys activities
})
```

**Impact**: Running quiz validation after activities validation (or vice versa) erases the other's results.

### 2. Progress Bar Bug
**Current Code (line 86 in both validators):**
```typescript
setProgress({ current: i, total: lessons.length });  // ❌ Wrong!
```
Should be `lessonsToProcess.length` since the filtered list may be smaller.

### 3. Code Duplication
| Component | Lines | Similarity |
|-----------|-------|------------|
| BatchQuizContentValidator | 364 | Base |
| BatchActivitiesContentValidator | 372 | ~95% identical |
| BatchQuizRegenerator | 295 | ~90% identical |
| BatchActivitiesRegenerator | 295 | ~90% identical |
| **Total Duplicated** | **~1,326 lines** | |

### 4. Race Condition
No guard prevents running both validators simultaneously, which can cause conflicting database writes.

### 5. Redundant Network Requests
Each validator fetches `contenu` and `exemples_exercices` per lesson, even though this data is already loaded in `LessonBrowser` (line 154).

---

## Proposed Architecture

### New File Structure

```text
src/features/content-editor/batch-operations/
├── hooks/
│   └── useBatchOperation.ts          # Core shared logic
├── components/
│   ├── BatchOperationDialog.tsx      # Unified dialog UI
│   ├── BatchOperationProgress.tsx    # Progress indicator
│   └── BatchOperationButton.tsx      # Trigger button
├── validators/
│   ├── quizValidator.ts              # Quiz-specific logic
│   └── activitiesValidator.ts        # Activities-specific logic
├── regenerators/
│   ├── quizRegenerator.ts            # Quiz regen logic
│   └── activitiesRegenerator.ts      # Activities regen logic
├── types.ts                          # Shared types
└── index.ts                          # Public exports
```

---

## Part 1: Core Batch Operation Hook

**New File: `src/features/content-editor/batch-operations/hooks/useBatchOperation.ts`**

A generic hook that handles ALL batch operations with a configuration pattern:

```typescript
interface BatchOperationConfig<TLesson, TResult> {
  // Identification
  operationType: 'validate' | 'regenerate';
  contentType: 'quiz' | 'activities';
  
  // Filtering
  filterLessons: (lesson: TLesson, skipCompleted: boolean) => boolean;
  
  // Processing
  processLesson: (lesson: TLesson) => Promise<TResult>;
  
  // Database update
  updateLesson: (lessonId: string, result: TResult, existingDetails: any) => Promise<void>;
  
  // UI customization
  theme: { color: string; icon: LucideIcon };
  messages: {
    empty: string;
    progress: string;
    success: string;
    partial: string;
    error: string;
  };
}
```

**Hook Return Value:**
```typescript
interface UseBatchOperationReturn {
  // State
  isRunning: boolean;
  progress: { current: number; total: number };
  results: OperationResult[];
  currentItem: string;
  
  // Actions
  start: () => Promise<void>;
  pause: () => void;
  
  // Computed
  stats: { success: number; failed: number; pending: number };
  canStart: boolean;
  itemsToProcess: TLesson[];
}
```

**Key Features:**
- Abort/pause with persistence
- Automatic rate limiting (2s delay)
- Real-time progress updates
- Error handling per item
- Callbacks for completion

---

## Part 2: Fix Data Loss with Merge Logic

**In `useBatchOperation.updateLesson()`:**

```typescript
// 1. Fetch existing validation_details_json
const { data: existing } = await supabase
  .from('lessons')
  .select('validation_details_json')
  .eq('id', lessonId)
  .single();

// 2. Merge with new results
const mergedDetails = {
  ...existing?.validation_details_json,  // Preserve existing (activities OR quiz)
  [contentType]: newValidationData,       // Add/update current type
  [`${contentType}ValidatedAt`]: new Date().toISOString(),
};

// 3. Update with merged data
await supabase.from('lessons').update({
  validation_details_json: mergedDetails,
  // ... other fields
});
```

---

## Part 3: Unified Dialog Component

**New File: `src/features/content-editor/batch-operations/components/BatchOperationDialog.tsx`**

A single configurable dialog that replaces 4 separate AlertDialog implementations:

```typescript
interface BatchOperationDialogProps {
  trigger: React.ReactNode;
  operation: UseBatchOperationReturn;
  config: {
    title: string;
    description: string;
    confirmLabel: string;
    skipCheckboxLabel: string;
  };
  stats: {
    completed: number;
    total: number;
  };
}
```

**Features:**
- Shows statistics bar
- Skip completed checkbox
- Time estimate
- Real-time progress when running
- Pause & save button

---

## Part 4: Thin Configuration Wrappers

Replace the 4 large components with thin wrappers:

**Example: `BatchQuizValidator.tsx` (~40 lines instead of 364):**

```typescript
export const BatchQuizValidator = ({ lessons, gradeLevel, onComplete, onDashboardRefresh }) => {
  const config = useQuizValidatorConfig({ lessons, gradeLevel, onComplete, onDashboardRefresh });
  const operation = useBatchOperation(config);
  
  return (
    <BatchOperationDialog
      trigger={
        <BatchOperationButton 
          label="Valider alignement contenu"
          stats={{ completed: operation.stats.validated, total: lessons.length }}
          theme={{ color: 'amber', icon: Search }}
        />
      }
      operation={operation}
      config={QUIZ_VALIDATOR_DIALOG_CONFIG}
      stats={{ completed: validatedCount, total: totalWithQuiz }}
    />
  );
};
```

---

## Part 5: Prevent Concurrent Operations

**In `LessonBrowser.tsx`:**

Add a shared state to track active operations:

```typescript
const [activeBatchOperation, setActiveBatchOperation] = useState<string | null>(null);

// Pass to all batch components
<BatchQuizValidator 
  disabled={activeBatchOperation !== null && activeBatchOperation !== 'quiz-validate'}
  onStart={() => setActiveBatchOperation('quiz-validate')}
  onComplete={() => setActiveBatchOperation(null)}
  ...
/>
```

---

## Part 6: Pass Existing Lesson Data

**Current (wasteful):**
```typescript
// Each validator fetches this again
const { data: fullLesson } = await supabase
  .from('lessons')
  .select('contenu, exemples_exercices, quiz_final')
  .eq('id', lesson.id)
```

**Optimized:**
The `LessonBrowser` already loads `contenu` and `exemples_exercices` (line 154). Pass this data directly:

```typescript
<BatchQuizValidator 
  lessons={lessonsWithValidQuiz}  // Already contains contenu, exemples_exercices
  ...
/>

// In validator, skip fetch if data exists:
const content = lesson.contenu || (await fetchLessonContent(lesson.id));
```

---

## Implementation Phases

### Phase 1: Fix Critical Bugs (Quick Wins)
1. Fix data loss bug - add merge logic
2. Fix progress bar total
3. Add concurrent operation guard

### Phase 2: Create Shared Infrastructure
1. Create `useBatchOperation` hook
2. Create shared UI components
3. Create type definitions

### Phase 3: Refactor Components
1. Migrate `BatchQuizContentValidator`
2. Migrate `BatchActivitiesContentValidator`
3. Migrate `BatchQuizRegenerator`
4. Migrate `BatchActivitiesRegenerator`

### Phase 4: Optimization
1. Pass existing lesson data
2. Add operation locking
3. Improve error recovery

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/features/content-editor/batch-operations/types.ts` | CREATE | Shared type definitions |
| `src/features/content-editor/batch-operations/hooks/useBatchOperation.ts` | CREATE | Core batch logic hook |
| `src/features/content-editor/batch-operations/components/BatchOperationDialog.tsx` | CREATE | Unified dialog |
| `src/features/content-editor/batch-operations/components/BatchOperationProgress.tsx` | CREATE | Progress indicator |
| `src/features/content-editor/batch-operations/components/BatchOperationButton.tsx` | CREATE | Trigger button |
| `src/features/content-editor/batch-operations/validators/quizValidator.ts` | CREATE | Quiz validation config |
| `src/features/content-editor/batch-operations/validators/activitiesValidator.ts` | CREATE | Activities validation config |
| `src/features/content-editor/batch-operations/regenerators/quizRegenerator.ts` | CREATE | Quiz regen config |
| `src/features/content-editor/batch-operations/regenerators/activitiesRegenerator.ts` | CREATE | Activities regen config |
| `src/features/content-editor/batch-operations/index.ts` | CREATE | Public exports |
| `src/components/content-editor/BatchQuizContentValidator.tsx` | DELETE | Replaced by new system |
| `src/components/content-editor/BatchActivitiesContentValidator.tsx` | DELETE | Replaced by new system |
| `src/components/content-editor/BatchQuizRegenerator.tsx` | DELETE | Replaced by new system |
| `src/components/content-editor/BatchActivitiesRegenerator.tsx` | DELETE | Replaced by new system |
| `src/components/content-editor/LessonBrowser.tsx` | UPDATE | Import new components, add operation lock |

---

## Code Reduction Analysis

| Before | After | Reduction |
|--------|-------|-----------|
| BatchQuizContentValidator: 364 lines | ~40 lines (wrapper) | -89% |
| BatchActivitiesContentValidator: 372 lines | ~40 lines (wrapper) | -89% |
| BatchQuizRegenerator: 295 lines | ~40 lines (wrapper) | -86% |
| BatchActivitiesRegenerator: 295 lines | ~40 lines (wrapper) | -86% |
| **Total: 1,326 lines** | **~450 lines (all shared + wrappers)** | **-66%** |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Data loss bug fixed? | Yes | Merge logic preserves existing data |
| Progress bar accurate? | Yes | Uses `itemsToProcess.length` |
| Race conditions prevented? | Yes | Operation lock in LessonBrowser |
| Backward compatible? | Yes | Same external API for LessonBrowser |
| Error handling preserved? | Yes | Per-item try/catch in hook |
| Abort/pause works? | Yes | Same abortRef pattern in hook |
| 3G optimized? | Yes | Rate limiting preserved, reduced fetches |

---

## 3G Performance Improvements

| Optimization | Impact |
|--------------|--------|
| Reuse existing lesson data | Eliminates 1 fetch per lesson |
| Single shared component bundle | Smaller JS payload |
| Efficient re-renders | Less UI churn |
| Same 2s rate limiting | API-friendly |

---

## Migration Path

1. **No breaking changes to LessonBrowser** - same props interface
2. **Gradual migration** - can keep old components while building new ones
3. **Same edge functions** - no backend changes required
4. **Same database schema** - only fixes the merge logic

