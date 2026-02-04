
# Plan: Phase 2 - Automatic Dashboard Refresh on Validation Completion

## Problem
When batch validation completes (via `BatchQuizContentValidator` or `BatchActivitiesContentValidator`), the Quality dashboard doesn't automatically update to show the new validation results. Users must manually navigate away and back to the Quality tab to see updated statistics.

## Solution: Three-Layer Callback Chain
Implement an automatic refresh trigger that flows from child components back to the parent ContentEditor to refresh the dashboard.

**Current Flow:**
```
ContentEditor.tsx
  ↓
LessonBrowser.tsx
  ↓
BatchQuizContentValidator.tsx → calls onComplete() (loadSubjects)
BatchActivitiesContentValidator.tsx → calls onComplete() (loadSubjects)
```

**New Flow:**
```
ContentEditor.tsx (has refreshDashboard)
  ↓ Pass refreshDashboard to LessonBrowser
LessonBrowser.tsx
  ↓ Pass onDashboardRefresh to Validators
BatchQuizContentValidator.tsx → calls onDashboardRefresh() after onComplete()
BatchActivitiesContentValidator.tsx → calls onDashboardRefresh() after onComplete()
```

## Technical Implementation

### Step 1: Update LessonBrowser Props
**File:** `src/components/content-editor/LessonBrowser.tsx`

Add new prop to interface:
```typescript
interface LessonBrowserProps {
  onSelectLesson: (lesson: any) => void;
  selectedLesson: any;
  refreshKey?: number;
  onDashboardRefresh?: () => void;  // NEW
}
```

Update component signature:
```typescript
export const LessonBrowser = ({ 
  onSelectLesson, 
  selectedLesson, 
  refreshKey,
  onDashboardRefresh  // NEW
}: LessonBrowserProps) => {
```

Pass to validators:
```typescript
// Line 350: BatchQuizContentValidator
<BatchQuizContentValidator 
  lessons={lessonsWithValidQuiz}
  gradeLevel={gradeLevel}
  onComplete={loadSubjects}
  onDashboardRefresh={onDashboardRefresh}  // NEW
  validatedCount={lessonsWithValidQuiz.filter(l => l.last_content_validated_at).length}
  totalWithQuiz={lessonsWithValidQuiz.length}
/>

// Line 362: BatchActivitiesContentValidator
<BatchActivitiesContentValidator 
  lessons={lessonsWithValidActivities}
  gradeLevel={gradeLevel}
  onComplete={loadSubjects}
  onDashboardRefresh={onDashboardRefresh}  // NEW
  validatedCount={lessonsWithValidActivities.filter(l => l.last_activities_validated_at).length}
  totalWithActivities={lessonsWithValidActivities.length}
/>
```

### Step 2: Update BatchQuizContentValidator Props & Logic
**File:** `src/components/content-editor/BatchQuizContentValidator.tsx`

Add to interface:
```typescript
interface BatchQuizContentValidatorProps {
  lessons: any[];
  gradeLevel: string;
  onComplete: () => void;
  onDashboardRefresh?: () => void;  // NEW
  validatedCount?: number;
  totalWithQuiz?: number;
}
```

Update component signature:
```typescript
export const BatchQuizContentValidator = ({ 
  lessons, 
  gradeLevel, 
  onComplete,
  onDashboardRefresh,  // NEW
  validatedCount = 0,
  totalWithQuiz = 0
}: BatchQuizContentValidatorProps) => {
```

Call in `handleValidateAll` after completion (around line 210):
```typescript
// After: onComplete();
onComplete();
if (onDashboardRefresh) {
  onDashboardRefresh();
}
```

### Step 3: Update BatchActivitiesContentValidator Props & Logic
**File:** `src/components/content-editor/BatchActivitiesContentValidator.tsx`

Same changes as BatchQuizContentValidator:
- Add `onDashboardRefresh` to interface
- Add to component signature
- Call `onDashboardRefresh()` after `onComplete()` in `handleValidateAll`

### Step 4: Update ContentEditor to Pass Callback
**File:** `src/pages/ContentEditor.tsx`

Pass `refreshDashboard` to LessonBrowser (around line 287):
```typescript
<LessonBrowser
  onSelectLesson={async (lesson) => {
    // ... existing code
  }}
  selectedLesson={selectedLesson}
  refreshKey={refreshKey}
  onDashboardRefresh={refreshDashboard}  // NEW
/>
```

## Behavioral Changes

**Before Phase 2:**
1. User clicks "Valider alignement contenu" in LessonBrowser
2. Validation completes → batch validator calls onComplete() → LessonBrowser refreshes
3. Quality dashboard stats are outdated
4. User must manually switch to Quality tab to refresh view

**After Phase 2:**
1. User clicks "Valider alignement contenu" in LessonBrowser
2. Validation completes → calls onComplete() AND onDashboardRefresh()
3. Dashboard automatically refreshes with latest stats
4. User sees updated metrics instantly without manual intervention

## Code Changes Summary

| File | Changes | Lines Added |
|------|---------|------------|
| `LessonBrowser.tsx` | Add `onDashboardRefresh?` prop, pass to 2 validators | ~3 |
| `BatchQuizContentValidator.tsx` | Add prop, call onDashboardRefresh() after onComplete() | ~5 |
| `BatchActivitiesContentValidator.tsx` | Add prop, call onDashboardRefresh() after onComplete() | ~5 |
| `ContentEditor.tsx` | Pass `refreshDashboard` to LessonBrowser | ~1 |

**Total lines added:** ~14

## Backward Compatibility

- `onDashboardRefresh` is optional (`?`) in all interfaces
- Existing code without the callback continues to work
- No breaking changes to existing APIs
- Can integrate gradually if needed

## 3G Performance Impact

**Zero negative impact:**
- No additional network calls (just triggers existing dashboard refresh)
- Dashboard already has efficient query
- Only runs when user explicitly validates
- Callback execution is instant

## Testing Strategy

1. **Manual:**
   - Open Content Editor → Quality tab → note current stats
   - Switch to Review tab → run batch validation
   - Switch back to Quality tab → verify stats updated automatically
   - Check that both Quiz and Activities validators trigger refresh

2. **Edge Cases:**
   - Validation with 0 lessons (skip validated checkbox)
   - Validation interrupted/paused mid-way
   - Dashboard not open when validation completes (no visual change, but state updated)

## Files to Modify

1. `src/components/content-editor/LessonBrowser.tsx`
2. `src/components/content-editor/BatchQuizContentValidator.tsx`
3. `src/components/content-editor/BatchActivitiesContentValidator.tsx`
4. `src/pages/ContentEditor.tsx`

## Implementation Complexity
**Low** - Simple prop threading with minimal logic additions. No new components or database changes needed.
