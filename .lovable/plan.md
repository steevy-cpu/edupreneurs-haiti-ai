
# Final Integration Plan - ExamHub Restructuring
## Connecting Admin + Routes + Structured Parsing

---

## Summary of Remaining Tasks

| Task | Priority | Description |
|------|----------|-------------|
| 1. Replace ContentEditor tabs | High | Replace "Examens 9AF" + "Baccalauréat" tabs with unified ExamAdminPage |
| 2. Convert legacy routes to redirects | High | Change `/examens-officiels` and `/baccalaureat/*` to `<Navigate>` |
| 3. Update navigation references | Medium | Update `Matieres.tsx`, `ExamPreparation.tsx`, etc. to use new routes |
| 4. Enhance parse-exam-vision | Low | Add `promptBlocks` structured output for KaTeX |

---

## Task 1: Replace ContentEditor Exam Tabs

**File:** `src/pages/ContentEditor.tsx`

**Current State (Lines 256-263, 392-398):**
```typescript
// Two separate tabs:
<TabsTrigger value="exams">Examens 9AF</TabsTrigger>
<TabsTrigger value="baccalaureat">Baccalauréat</TabsTrigger>

// Two separate components:
<TabsContent value="exams"><ExamManager /></TabsContent>
<TabsContent value="baccalaureat"><BaccExamManager /></TabsContent>
```

**Change:**
- Replace both tabs with a single "Examens" tab
- Replace both components with `ExamAdminPage`
- Remove imports of `ExamManager` and `BaccExamManager`

```typescript
// BEFORE: Two imports
import { ExamManager } from "@/components/content-editor/ExamManager";
import { BaccExamManager } from "@/components/content-editor/BaccExamManager";

// AFTER: One import
import { ExamAdminPage } from "@/features/exams/admin";

// BEFORE: Two tabs (7 tabs total)
<TabsList className="grid w-full grid-cols-7 lg:w-[1400px]">
  ...
  <TabsTrigger value="exams">Examens 9AF</TabsTrigger>
  <TabsTrigger value="baccalaureat">Baccalauréat</TabsTrigger>
  ...
</TabsList>

// AFTER: One tab (6 tabs total)
<TabsList className="grid w-full grid-cols-6 lg:w-[1200px]">
  ...
  <TabsTrigger value="exams">Examens</TabsTrigger>
  ...
</TabsList>

// BEFORE: Two contents
<TabsContent value="exams"><ExamManager /></TabsContent>
<TabsContent value="baccalaureat"><BaccExamManager /></TabsContent>

// AFTER: One content
<TabsContent value="exams"><ExamAdminPage /></TabsContent>
```

---

## Task 2: Convert Legacy Routes to Redirects

**File:** `src/App.tsx`

**Current State (Lines 359-383):**
```typescript
// Legacy routes still render old hub pages
<Route path="/examens-officiels" element={<ExamsHub />} />
<Route path="/baccalaureat" element={<BaccExamsHub />} />
<Route path="/baccalaureat/:series" element={<BaccExamsHub />} />
<Route path="/baccalaureat/:series/:subject" element={<BaccExamsHub />} />
```

**Change:**
- Replace with `<Navigate>` to new unified routes
- Keep lazy imports but remove `ExamsHub` and `BaccExamsHub`

```typescript
// Add Navigate import
import { Routes, Route, Navigate } from "react-router-dom";

// BEFORE: Legacy hub pages
<Route path="/examens-officiels" element={<ExamsHub />} />

// AFTER: Redirect to unified hub
<Route path="/examens-officiels" element={<Navigate to="/exams/9AF" replace />} />

// BEFORE: Baccalaureat routes with old hub
<Route path="/baccalaureat" element={<BaccExamsHub />} />
<Route path="/baccalaureat/:series" element={<BaccExamsHub />} />
<Route path="/baccalaureat/:series/:subject" element={<BaccExamsHub />} />

// AFTER: Redirects using LegacyRedirect for params
<Route path="/baccalaureat" element={<Navigate to="/exams/NS4" replace />} />
<Route path="/baccalaureat/:series" element={
  <LegacyRedirect to="/exams/NS4/:series" preserveParams />
} />
<Route path="/baccalaureat/:series/:subject" element={
  <LegacyRedirect to="/exams/NS4/:series/:subject" preserveParams />
} />
```

---

## Task 3: Update Navigation References

**Files to update:**

### `src/pages/Matieres.tsx` (Lines 506, 530)
```typescript
// BEFORE
navigate('/examens-officiels')
navigate(`/baccalaureat${selectedSeries ? `/${selectedSeries}` : ''}`)

// AFTER
navigate('/exams/9AF')
navigate(`/exams/NS4${selectedSeries ? `/${selectedSeries}` : ''}`)
```

### `src/pages/ExamPreparation.tsx` (Lines 43, 226, 245)
```typescript
// BEFORE
navigate('/examens-officiels')

// AFTER
navigate('/exams/9AF')  // Or use history.back() for better UX
```

### `src/pages/Resources.tsx` (Line 59)
```typescript
// BEFORE
handleSectionClick('/examens-officiels', '9AF', 'Examens Officiels 9ème AF')

// AFTER  
handleSectionClick('/exams/9AF', '9AF', 'Examens Officiels 9ème AF')
```

### `src/pages/MigratePDFs.tsx` (Line 53)
```typescript
// BEFORE
navigate('/examens-officiels')

// AFTER
navigate('/exams/9AF')
```

---

## Task 4: Enhance parse-exam-vision for Structured Blocks (Optional Enhancement)

**File:** `supabase/functions/parse-exam-vision/index.ts`

**Enhancement:** Request the AI to return `promptBlocks` instead of just `questionText`

**Changes to system prompt:**
```typescript
const systemPrompt = `Tu es un expert OCR...

RETOURNE UN JSON VALIDE avec cette structure EXACTE:
{
  "exercises": [
    {
      "exerciseNumber": 1,
      "exerciseType": "multiple_choice",
      "questionText": "Le texte complet de la question",
      "promptBlocks": [
        { "type": "text", "content": "Résoudre " },
        { "type": "math-inline", "latex": "x^2 + 5x + 6 = 0" }
      ],
      "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
      "optionsJson": {
        "A": { "blocks": [{ "type": "text", "content": "x = -2" }], "value": "A" }
      },
      "correctAnswer": "A",
      "answerJson": { "index": 0, "value": "A" },
      "points": 5,
      "concept": "Équations quadratiques"
    }
  ]
}

RÈGLE POUR LES MATHÉMATIQUES:
- Si une question contient des formules mathématiques, utilise "promptBlocks" avec type "math-inline" ou "math-block"
- Sinon, utilise "questionText" pour le texte simple
`;
```

**Changes to normalization:**
```typescript
const normalizedExercises = parsedData.exercises.map((ex: any, index: number) => ({
  exerciseNumber: ex.exerciseNumber || index + 1,
  exerciseType: ex.exerciseType || (ex.options ? "multiple_choice" : "open_ended"),
  questionText: ex.questionText || ex.question || `Question ${index + 1}`,
  options: ex.options || null,
  correctAnswer: ex.correctAnswer || null,
  explanation: ex.explanation || null,
  points: typeof ex.points === "number" ? ex.points : (ex.exerciseType === "multiple_choice" ? 5 : 8),
  concept: ex.concept || "Général",
  // NEW: Structured content fields
  promptBlocks: ex.promptBlocks || null,
  optionsJson: ex.optionsJson || null,
  answerJson: ex.answerJson || null,
  explanationBlocks: ex.explanationBlocks || null,
}));
```

---

## File Changes Summary

| Operation | File | Description |
|-----------|------|-------------|
| Modify | `src/pages/ContentEditor.tsx` | Replace 2 tabs with 1, use ExamAdminPage |
| Modify | `src/App.tsx` | Convert legacy routes to Navigate redirects |
| Modify | `src/pages/Matieres.tsx` | Update navigation to /exams routes |
| Modify | `src/pages/ExamPreparation.tsx` | Update back navigation |
| Modify | `src/pages/Resources.tsx` | Update exam section link |
| Modify | `src/pages/MigratePDFs.tsx` | Update back navigation |
| Modify | `supabase/functions/parse-exam-vision/index.ts` | Add promptBlocks to output |

---

## Implementation Order

| Step | Task | Est. Time |
|------|------|-----------|
| 1 | Update ContentEditor.tsx (consolidate tabs) | 10 min |
| 2 | Update App.tsx (legacy route redirects) | 10 min |
| 3 | Update Matieres.tsx navigation | 5 min |
| 4 | Update ExamPreparation.tsx navigation | 5 min |
| 5 | Update Resources.tsx & MigratePDFs.tsx | 5 min |
| 6 | Enhance parse-exam-vision | 15 min |
| 7 | Deploy edge function | 5 min |

**Total: ~55 minutes**

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Redirects preserve all old URLs |
| Works with existing data? | Yes | No DB changes required |
| 3G optimized? | Yes | Navigate is instant, no network |
| Backward compatible? | Yes | All old URLs redirect properly |
| Edge cases handled? | Yes | LegacyRedirect handles params |

---

## Expected Outcomes

After implementation:
- **One admin tab** in ContentEditor instead of two
- **All legacy URLs** (`/examens-officiels`, `/baccalaureat/*`) redirect to new hub
- **Clean navigation** throughout the app using `/exams/:track` pattern
- **Math content** properly structured for KaTeX rendering
- **~200 lines removed** from ContentEditor imports and tabs
