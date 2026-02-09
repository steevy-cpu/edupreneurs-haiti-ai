

# Speed Up Batch Validation & Regeneration with Parallel Processing

## Current Bottleneck

All batch operations process lessons **one at a time** with a 2-second delay between each:
- 36 activities to validate: ~2 min (sequential)
- 103 quizzes to regenerate: ~5+ hours (sequential, each regeneration takes ~30s + 2s delay)

## Solution: Configurable Concurrency

Add parallel processing support to `useBatchOperation` so multiple lessons are processed simultaneously. Each operation type gets an appropriate concurrency level based on the AI gateway's rate limits.

| Operation | Current | Proposed | Speedup |
|-----------|---------|----------|---------|
| Validation (quiz/activities) | 1 at a time, 2s delay | 3 concurrent, 1s delay | ~3x |
| Regeneration (quiz/activities) | 1 at a time, 2s delay | 2 concurrent, 1.5s delay | ~2x |
| Generation | 1 at a time, 1.5s delay | 1 (keep sequential) | No change |

Generation stays sequential because it creates content from scratch (heavier AI calls, higher failure risk).

---

## Changes

### 1. Add `concurrency` to `BatchOperationConfig` type

**File:** `src/features/content-editor/batch-operations/types.ts`

Add an optional `concurrency` field (default: 1) to the config type.

### 2. Update `useBatchOperation` hook with parallel processing

**File:** `src/features/content-editor/batch-operations/hooks/useBatchOperation.ts`

Replace the sequential `for` loop with a concurrency-controlled worker pool pattern:

```text
Current flow:
  Lesson 1 -> wait 2s -> Lesson 2 -> wait 2s -> Lesson 3 ...

Proposed flow (concurrency=3):
  Lesson 1 ──────┐
  Lesson 2 ──────┤ (3 running simultaneously)
  Lesson 3 ──────┘
  wait 1s
  Lesson 4 ──────┐
  Lesson 5 ──────┤
  Lesson 6 ──────┘
  ...
```

The implementation uses a simple worker pool: spawn N workers that each pull the next lesson from a shared queue. Each worker waits `rateLimit` ms after finishing before taking the next item. The abort/pause mechanism still works -- workers check `abortRef` before each item.

### 3. Update configs with concurrency values

**Files:**
- `src/features/content-editor/batch-operations/validators/quizValidator.ts` -- add `concurrency: 3`, reduce `rateLimit: 1000`
- `src/features/content-editor/batch-operations/validators/activitiesValidator.ts` -- add `concurrency: 3`, reduce `rateLimit: 1000`
- `src/features/content-editor/batch-operations/regenerators/quizRegenerator.ts` -- add `concurrency: 2`, reduce `rateLimit: 1500`
- `src/features/content-editor/batch-operations/regenerators/activitiesRegenerator.ts` -- add `concurrency: 2`, reduce `rateLimit: 1500`
- `src/features/content-editor/batch-operations/generators/quizGenerator.ts` -- keep `concurrency: 1` (default)

### 4. Update estimated time calculation

In `useBatchOperation`, change from:
```
estimatedMinutes = items * 3 / 60
```
to:
```
estimatedMinutes = Math.ceil((items / concurrency) * (rateLimit/1000 + 2) / 60)
```

---

## Technical Detail: Worker Pool Implementation

```typescript
// Simplified concept for the parallel loop in useBatchOperation
const queue = [...itemsToProcess];
let queueIndex = 0;

const worker = async () => {
  while (queueIndex < queue.length && !abortRef.current) {
    const idx = queueIndex++;
    const lesson = queue[idx];
    
    // Process lesson (same try/catch as current)
    // Update progress atomically
    // Rate limit delay before next item
    await new Promise(r => setTimeout(r, config.rateLimit));
  }
};

// Spawn N workers
const concurrency = config.concurrency ?? 1;
await Promise.all(
  Array.from({ length: Math.min(concurrency, queue.length) }, () => worker())
);
```

Progress updates use a shared counter incremented after each completion, so the UI still shows accurate progress.

---

## File Changes Summary

| File | Change |
|------|--------|
| `src/features/content-editor/batch-operations/types.ts` | Add optional `concurrency` field |
| `src/features/content-editor/batch-operations/hooks/useBatchOperation.ts` | Worker pool pattern for parallel processing |
| `src/features/content-editor/batch-operations/validators/quizValidator.ts` | `concurrency: 3`, `rateLimit: 1000` |
| `src/features/content-editor/batch-operations/validators/activitiesValidator.ts` | `concurrency: 3`, `rateLimit: 1000` |
| `src/features/content-editor/batch-operations/regenerators/quizRegenerator.ts` | `concurrency: 2`, `rateLimit: 1500` |
| `src/features/content-editor/batch-operations/regenerators/activitiesRegenerator.ts` | `concurrency: 2`, `rateLimit: 1500` |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- concurrency defaults to 1 (unchanged behavior) |
| Works with existing data? | Yes -- same DB update logic per lesson |
| 3G performance impact? | Positive -- faster completion means less time on unstable connections |
| Rate limit risk? | Mitigated -- conservative concurrency (2-3), not aggressive (5+) |
| Pause still works? | Yes -- workers check abortRef before each item |
| Data integrity? | Yes -- each lesson updates independently, no cross-lesson dependencies |

