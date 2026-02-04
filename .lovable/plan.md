
# Plan: Exam Content Editor Structure

## Problem Summary

The AI grounding system for Jude requires high-quality exercise data, but currently:

| Data Field | Coverage | Impact |
|------------|----------|--------|
| `correct_answer` | 7% | Jude can't validate answers definitively |
| `prompt_blocks` | 0% | No structured math rendering in tutor |
| `options_json` | 0% | No structured option rendering |
| `explanation` | 5% | Can't explain why answers are correct |
| `reference_texts` | 52% (language only) | Works for language, missing for others |

Without an editor to fix this data, the grounding improvements cannot be effective.

---

## Solution: Exam Content Editor Module

Build a comprehensive exam content management system with three core components:

### 1. Exercise Detail Editor
- View and edit individual exercise fields
- Inline editing for `correct_answer`, `explanation`, `concept`
- Visual preview of structured content blocks
- Save with optimistic updates

### 2. Exam Dashboard with Quality Indicators
- Show data completeness per exam (% with answers, % with explanations)
- Filter exams by quality status (missing answers, needs review)
- Bulk actions for marking exercises as reviewed

### 3. Reference Text Manager
- View/edit reference texts attached to each exam
- Add new reference texts from exam PDFs
- Link reference texts to specific questions

---

## Technical Architecture

```text
src/features/exams/admin/
├── ExamAdminPage.tsx          (existing - upload/OCR)
├── components/
│   ├── ExistingExamsList.tsx  (existing - list view)
│   ├── ExamPreviewCard.tsx    (existing - OCR preview)
│   ├── ExamDetailEditor.tsx   (NEW - exercise editing)
│   ├── ExerciseCard.tsx       (NEW - single exercise)
│   ├── ReferenceTextEditor.tsx (NEW - manage texts)
│   └── QualityIndicators.tsx  (NEW - data quality badges)
└── hooks/
    ├── useExamExercises.ts    (NEW - fetch/mutate exercises)
    └── useExamQuality.ts      (NEW - calculate completeness)
```

---

## Component Details

### 1. ExamDetailEditor (Main Editor View)

**Features:**
- Opens from ExistingExamsList when clicking an exam
- Tabbed interface: Exercises | Reference Texts | Settings
- Real-time save with debounce
- Keyboard navigation between exercises

**Layout:**
```text
┌─────────────────────────────────────────────────────┐
│ ← Back to Exams   [Exam Title] - 2023              │
│ ──────────────────────────────────────────────────  │
│ [Exercises] [Reference Texts] [Settings]            │
├─────────────────────────────────────────────────────┤
│ Quality: ██████░░░░ 60% answers │ 20% explanations │
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ Q1. Lequel des nombres suivants...             │ │
│ │ A) 2  B) 4  C) 7  D) 14                        │ │
│ │ Answer: [B]  Concept: [divisibilité]           │ │
│ │ Explanation: [                                 │ │
│ │              Textarea for explanation          │ │
│ │                                              ] │ │
│ │ [Save] [Delete] ● Validated                   │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Q2. Quel est le résultat de...                 │ │
│ │ ...                                            │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 2. ExerciseCard (Single Exercise Editing)

**Props:**
```typescript
interface ExerciseCardProps {
  exercise: ExamExercise;
  onUpdate: (updates: Partial<ExamExercise>) => void;
  onDelete: () => void;
  isExpanded?: boolean;
}
```

**Editable Fields:**
- `correct_answer` - Dropdown for MCQ (A/B/C/D), text for open-ended
- `explanation` - Rich textarea with preview
- `concept` - Text input with autocomplete from existing concepts
- `points` - Number input
- `exercise_type` - Toggle MCQ/open-ended

### 3. QualityIndicators

**Visual Badges:**
```typescript
interface QualityMetrics {
  totalExercises: number;
  withAnswer: number;
  withExplanation: number;
  withBlocks: number;  // Structured content
  referenceTexts: number;
}
```

**Display:**
- Progress bars for each metric
- Color-coded: Green (>80%), Yellow (40-80%), Red (<40%)
- Click to filter exercises by missing data

### 4. useExamExercises Hook

```typescript
export function useExamExercises(examId: string) {
  // Fetch all exercises for an exam
  const { data, isLoading, error } = useQuery({
    queryKey: ['exam-exercises', examId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exam_exercises')
        .select('*')
        .eq('exam_id', examId)
        .order('exercise_number', { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // Update mutation with optimistic updates
  const updateExercise = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { error } = await supabase
        .from('exam_exercises')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onMutate: async ({ id, updates }) => {
      // Optimistic update
    }
  });

  return { exercises: data, isLoading, updateExercise };
}
```

---

## Implementation Phases

### Phase 1: Core Editor (This Implementation)
1. Create `ExamDetailEditor.tsx` with basic exercise list
2. Create `ExerciseCard.tsx` with inline editing
3. Create `useExamExercises.ts` hook
4. Add "Edit" button to ExistingExamsList
5. Create `QualityIndicators.tsx` component

### Phase 2: Reference Text Management (Future)
1. Create `ReferenceTextEditor.tsx`
2. Add text linking to exercises
3. PDF text extraction helper

### Phase 3: Bulk Operations (Future)
1. Bulk answer entry mode (rapid-fire)
2. Import answers from spreadsheet
3. AI-assisted answer detection from explanations

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/features/exams/admin/components/ExamDetailEditor.tsx` | Main editor container |
| `src/features/exams/admin/components/ExerciseCard.tsx` | Single exercise editor |
| `src/features/exams/admin/components/QualityIndicators.tsx` | Data quality display |
| `src/features/exams/admin/hooks/useExamExercises.ts` | Data fetching/mutation |

## Files to Modify

| File | Changes |
|------|---------|
| `src/features/exams/admin/components/ExistingExamsList.tsx` | Add "Edit" button, quality badges |
| `src/features/exams/admin/components/index.ts` | Export new components |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing exam upload? | No | New editor is additive |
| Works with existing data? | Yes | Uses existing exam_exercises table |
| 3G optimized? | Yes | Lazy loads exercises, optimistic updates |
| Backward compatible? | Yes | Existing OCR flow unchanged |
| Edge cases handled? | Yes | Empty exams, missing fields handled |

---

## Expected Outcomes

After implementation:
1. Content editors can fix `correct_answer` for all 1,600+ exercises
2. Quality dashboard shows which exams need attention
3. Jude's AI grounding works correctly with accurate data
4. Explanation field allows better tutoring responses
