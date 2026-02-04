

# Fix: Wire Up Exam Content Editor

## Problem Identified

The **Exam Content Editor module is incomplete**. The components exist but are not connected:

```text
Current Flow:
┌──────────────────────┐     ┌─────────────────────┐     ┌───────────────────┐
│ ExamAdminPage        │ ──► │ ExistingExamsList   │  X  │ ExamDetailEditor  │
│ (doesn't pass       │     │ (has onEditExam     │     │ (never rendered)  │
│  onEditExam prop)   │     │  but unused)        │     │                   │
└──────────────────────┘     └─────────────────────┘     └───────────────────┘
```

**What's Missing in `ExamAdminPage.tsx`:**
1. No `selectedExam` state to track which exam is being edited
2. No `onEditExam` callback passed to `ExistingExamsList`
3. No conditional rendering of `ExamDetailEditor` when editing
4. No `ExamDetailEditor` import

---

## Solution

Update `ExamAdminPage.tsx` to complete the wiring:

### 1. Add Import

```typescript
import { ExamDetailEditor } from "./components/ExamDetailEditor";
```

### 2. Add State for Selected Exam

```typescript
const [selectedExam, setSelectedExam] = useState<ExistingExam | null>(null);
```

### 3. Add Edit Handler

```typescript
const handleEditExam = useCallback((exam: ExistingExam) => {
  setSelectedExam(exam);
}, []);

const handleBackFromEdit = useCallback(() => {
  setSelectedExam(null);
}, []);
```

### 4. Conditional Rendering

```tsx
// If editing an exam, show the ExamDetailEditor instead of the main form
if (selectedExam) {
  return (
    <div className="space-y-6">
      <ExamDetailEditor 
        exam={selectedExam} 
        onBack={handleBackFromEdit}
      />
    </div>
  );
}

// Otherwise show the normal upload/list view
return (
  <div className="space-y-6">
    {/* Upload Form */}
    ...
    {/* Existing Exams List */}
    <ExistingExamsList
      track={track}
      selectedSeries={selectedSeries}
      onReanalyze={handleReanalyze}
      reanalyzingExamId={reanalyzingExamId}
      onEditExam={handleEditExam}  // ← Add this!
    />
  </div>
);
```

---

## Updated Flow

```text
Fixed Flow:
┌──────────────────────┐     ┌─────────────────────┐     ┌───────────────────┐
│ ExamAdminPage        │ ──► │ ExistingExamsList   │ ──► │ ExamDetailEditor  │
│ selectedExam state   │     │ onEditExam calls    │     │ Edit exercises    │
│ onEditExam handler   │     │ setSelectedExam     │     │ onBack returns    │
└──────────────────────┘     └─────────────────────┘     └───────────────────┘
         ▲                                                        │
         └────────────────── onBack ──────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/features/exams/admin/ExamAdminPage.tsx` | Add import, state, handlers, and conditional rendering |

---

## Complete Code Changes

### `ExamAdminPage.tsx` Changes:

**Add Import (line ~18):**
```typescript
import { ExamDetailEditor } from "./components/ExamDetailEditor";
```

**Add State (after line 68):**
```typescript
// Editor state
const [selectedExam, setSelectedExam] = useState<ExistingExam | null>(null);
```

**Add Handlers (after resetForm function ~line 335):**
```typescript
const handleEditExam = useCallback((exam: ExistingExam) => {
  setSelectedExam(exam);
}, []);

const handleBackFromEdit = useCallback(() => {
  setSelectedExam(null);
}, []);
```

**Conditional Rendering (wrap the return statement ~line 343):**
```typescript
// Show editor view when an exam is selected
if (selectedExam) {
  return (
    <div className="space-y-6">
      <ExamDetailEditor 
        exam={selectedExam} 
        onBack={handleBackFromEdit}
      />
    </div>
  );
}

// Normal admin view
return (
  <div className="space-y-6">
    ...existing code...
  </div>
);
```

**Pass onEditExam to ExistingExamsList (line 479-484):**
```typescript
<ExistingExamsList
  track={track}
  selectedSeries={selectedSeries}
  onReanalyze={handleReanalyze}
  reanalyzingExamId={reanalyzingExamId}
  onEditExam={handleEditExam}  // Add this line
/>
```

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing upload flow? | No | Upload form works as before |
| Breaks exam list? | No | List works, just adds edit button |
| Works with existing data? | Yes | Uses existing exam_exercises table |
| 3G optimized? | Yes | Exercises lazy-loaded only when editing |
| Backward compatible? | Yes | No API or database changes |

---

## Result

After this fix:
1. Each exam in the list will show a **pencil icon** (edit button)
2. Clicking it opens the **ExamDetailEditor** with all exercises
3. Content editors can update `correct_answer`, `explanation`, `concept`
4. Quality indicators show data completeness
5. Back button returns to the exam list

This completes the wiring needed to make the Content Editor functional.

