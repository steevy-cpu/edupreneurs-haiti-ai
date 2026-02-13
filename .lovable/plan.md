

# Fix: Add `'partial'` State to All Input Components

## The Problem

The partial grading system was implemented in the edge function, hook, FeedbackCard, ActionRow, and ExamTutorPanel -- but the **4 answer input components** were missed. They check for `state === 'correct' || state === 'incorrect' || state === 'revealed'` to disable inputs after answering, but don't include `'partial'`.

**Result:** After receiving a partial grade (25-74%), students can click another MCQ option or re-submit their answer, triggering a second API call. This is a bug.

## Files to Fix (4 input components)

### 1. `src/features/exams/practice/components/inputs/MCQInput.tsx`
**Line 30-31:** Add `'partial'` to both `isDisabled` and `showResult`:
```ts
// Before
const isDisabled = state === 'checking' || state === 'correct' || state === 'incorrect' || state === 'revealed';
const showResult = state === 'correct' || state === 'incorrect' || state === 'revealed';

// After
const isDisabled = state === 'checking' || state === 'correct' || state === 'incorrect' || state === 'partial' || state === 'revealed';
const showResult = state === 'correct' || state === 'incorrect' || state === 'partial' || state === 'revealed';
```

### 2. `src/features/exams/practice/components/inputs/ShortInput.tsx`
**Line 29-30:** Same change:
```ts
const isDisabled = state === 'checking' || state === 'correct' || state === 'incorrect' || state === 'partial' || state === 'revealed';
const showResult = state === 'correct' || state === 'incorrect' || state === 'partial' || state === 'revealed';
```

### 3. `src/features/exams/practice/components/inputs/MatchingInput.tsx`
**Line 39-40:** Same change:
```ts
const isDisabled = state === 'checking' || state === 'correct' || state === 'incorrect' || state === 'partial' || state === 'revealed';
const showResult = state === 'correct' || state === 'incorrect' || state === 'partial' || state === 'revealed';
```

### 4. `src/features/exams/practice/components/inputs/EssayInput.tsx`
Find the same `isDisabled`/`showResult` pattern and add `'partial'`.

## Why This Was Missed

The plan listed 7 files but only covered the "container" components (ActionRow, ExamTutorPanel, FeedbackCard). The individual input components that also gate on `RunnerState` weren't included.

## Safety Checklist

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- additive condition only |
| Backward compatible? | Yes -- just adds a new state to existing checks |
| All RunnerState consumers covered? | Yes -- after this fix, all 9 files using RunnerState handle `'partial'` |
