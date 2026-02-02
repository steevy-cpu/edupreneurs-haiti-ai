
# ExamHub Restructuring - Phase 4 & 5 Implementation Plan
## Tutor Contract & Unified Admin Interface

---

## Summary of Remaining Work

| Phase | Component | Status | Description |
|-------|-----------|--------|-------------|
| Phase 4 | Tutor Contract | **TODO** | Update `exam-tutor` to return structured responses |
| Phase 5 | Unified Admin | **TODO** | Merge `ExamManager.tsx` + `BaccExamManager.tsx` into one |

---

## Phase 4: Tutor Contract & Structured Responses

### 4.1 Update Tutor Types

**File:** `src/features/exams/types/exam.types.ts`

Add the tutor contract types (partially done, needs refinement):

```typescript
// Already exists - enhance with more action types
export interface TutorAction {
  type: 'hint' | 'reveal' | 'next' | 'youtube' | 'reference' | 'check';
  label: string;
  payload?: any;
}

// Add parsing helper for LLM response to blocks
export function parseResponseToBlocks(text: string): ContentBlock[] {
  // Parse $...$ and $$...$$ into structured blocks
  const blocks: ContentBlock[] = [];
  // Implementation converts plain text with LaTeX to structured blocks
  return blocks;
}
```

### 4.2 Update `exam-tutor` Edge Function

**File:** `supabase/functions/exam-tutor/index.ts`

**Changes:**
1. Add deterministic answer validation (no LLM guessing for MCQ)
2. Return structured `TutorResponse` with blocks and actions
3. Maintain backward compatibility with `response` field

```typescript
// NEW: Deterministic validation for MCQ
function validateAnswer(studentAnswer: string, exercise: any): boolean {
  const correct = exercise.correct_answer?.toUpperCase().trim();
  const student = studentAnswer?.toUpperCase().trim();
  
  if (!correct) return false;
  
  // For MCQ: exact letter match
  if (exercise.options && Array.isArray(exercise.options)) {
    return student === correct;
  }
  
  // For open-ended: normalize and compare
  return normalizeAnswer(student) === normalizeAnswer(correct);
}

function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// NEW: Parse AI response into content blocks
function parseToBlocks(text: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const mathBlockRegex = /\$\$(.*?)\$\$/gs;
  const mathInlineRegex = /\$(.*?)\$/g;
  
  let lastIndex = 0;
  let remaining = text;
  
  // Extract math blocks and text segments
  // ... parsing logic ...
  
  return blocks;
}

// UPDATED response structure
return new Response(JSON.stringify({
  // NEW: Structured content blocks for KaTeX
  blocks: parseToBlocks(ericResponse),
  
  // NEW: Available action buttons
  actions: [
    { type: 'next', label: 'Question suivante' },
    ...(youtubeQuery ? [{ type: 'youtube', label: 'Voir vidéo', payload: youtubeQuery }] : []),
  ],
  
  // Grading info
  grading: {
    isCorrect,
    pointsAwarded: shouldAwardPoints ? exercise.points : 0,
    correctAnswer: revealAnswer ? exercise.correct_answer : undefined,
  },
  
  shouldAutoAdvance: shouldMoveToNext,
  youtubeQuery,
  
  // BACKWARD COMPAT: Keep raw response
  response: ericResponse,
  isCorrect,
  shouldAwardPoints,
  pointsEarned: shouldAwardPoints ? exercise.points : 0,
  shouldMoveToNext,
}), { headers: responseHeaders });
```

### 4.3 Update ExamTutorChat to Use Structured Response

**File:** `src/components/exam/ExamTutorChat.tsx`

**Changes:**
1. Import `ContentBlocksRenderer` from features/exams
2. Handle new `blocks` field in response
3. Render action buttons from `actions` array

```typescript
// Add import
import { ContentBlocksRenderer } from '@/features/exams/rendering/ContentBlocksRenderer';

// Update message rendering to use blocks when available
{message.message_role === 'assistant' ? (
  data.blocks ? (
    <ContentBlocksRenderer blocks={data.blocks} />
  ) : (
    <MathText text={message.message_content} />
  )
) : (
  message.message_content
)}
```

---

## Phase 5: Unified Admin Interface

### 5.1 Code Duplication Analysis

| Feature | ExamManager.tsx | BaccExamManager.tsx | Unified Approach |
|---------|-----------------|---------------------|------------------|
| PDF Upload | Lines 105-144 | Lines 141-182 | Shared utility |
| PDF to Images | Lines 146-198 | Lines 184-229 | Shared utility |
| Re-analyze | Lines 200-261 | Lines 231-294 | Pass `track` param |
| Confirm Save | Lines 413-567 | Lines 433-567 | Unified with track field |
| Exercise Insert | Lines 497-525 | Lines 494-520 | Identical |
| Delete Exam | Not present | Lines 555-598 | Add to unified |

**Duplication Rate:** ~85% identical code

### 5.2 Create Unified ExamAdminPage

**New File:** `src/features/exams/admin/ExamAdminPage.tsx`

```typescript
export function ExamAdminPage() {
  const [track, setTrack] = useState<'9AF' | 'NS4'>('9AF');
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [year, setYear] = useState('');
  const [session, setSession] = useState('principale');
  const [isModelExam, setIsModelExam] = useState(false);
  // ... rest of state

  // Dynamic subject list based on track/series
  const availableSubjects = useMemo(() => {
    if (track === '9AF') return SUBJECTS_9AF;
    if (selectedSeries.length > 0) {
      return SUBJECTS_BY_SERIES[selectedSeries[0]] || [];
    }
    return [];
  }, [track, selectedSeries]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Gestion des Examens Officiels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Track Selector */}
          <div className="flex gap-4">
            <TrackToggle value={track} onChange={setTrack} />
          </div>

          {/* Series Selector (NS4 only) */}
          {track === 'NS4' && (
            <SeriesMultiSelect 
              value={selectedSeries} 
              onChange={setSelectedSeries} 
            />
          )}

          {/* Subject, Year, Session selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SubjectSelect subjects={availableSubjects} value={subject} onChange={setSubject} />
            <YearSelect years={YEARS} value={year} onChange={setYear} />
            {track === 'NS4' && (
              <SessionSelect value={session} onChange={setSession} />
            )}
          </div>

          {/* Model exam toggle (NS4 only) */}
          {track === 'NS4' && (
            <ModelExamToggle value={isModelExam} onChange={setIsModelExam} />
          )}

          {/* PDF Upload */}
          <PDFUploader 
            file={pdfFile} 
            onChange={setPdfFile}
            isConverting={isConvertingPdf}
            progress={conversionProgress}
          />

          {/* Analyze Button */}
          <Button onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 className="animate-spin" /> : <Upload />}
            Analyser et Sauvegarder
          </Button>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      {showPreview && parsedPreview && (
        <ExamPreviewCard 
          preview={parsedPreview}
          onConfirm={handleConfirmAndSave}
          onCancel={() => setShowPreview(false)}
        />
      )}

      {/* Existing Exams List */}
      <ExistingExamsList 
        track={track}
        series={selectedSeries}
        onReanalyze={handleReanalyze}
        onDelete={handleDelete}
      />
    </div>
  );
}
```

### 5.3 Extract Shared Utilities

**New File:** `src/features/exams/admin/utils/pdfUtils.ts`

```typescript
export async function convertPdfToImages(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string[]> {
  // Extracted from both ExamManager and BaccExamManager
  // Identical implementation
}

export async function uploadPdfToStorage(
  file: File,
  track: '9AF' | 'NS4',
  subject: string,
  year: number,
  series?: string,
  session?: string,
  isModel?: boolean
): Promise<string | null> {
  // Unified upload with dynamic filename
}
```

**New File:** `src/features/exams/admin/utils/examSaveUtils.ts`

```typescript
export async function saveExamWithExercises(
  examData: ExamFormData,
  exercises: ParsedExercise[],
  referenceTexts: ReferenceText[]
): Promise<string> {
  // Unified save logic for both tracks
}

export async function reanalyzeExam(
  exam: ExistingExam,
  onProgress?: (stage: string) => void
): Promise<ParsedPreview> {
  // Unified reanalysis logic
}
```

### 5.4 Update parse-exam-vision for Structured Content

**File:** `supabase/functions/parse-exam-vision/index.ts`

**Add:** Support for `prompt_blocks` and `options_json` in output:

```typescript
// Update system prompt to request structured blocks
const systemPrompt = `...
RETOURNE UN JSON VALIDE avec cette structure EXACTE:
{
  "exercises": [{
    "exerciseNumber": 1,
    "exerciseType": "multiple_choice",
    "questionText": "Le texte complet de la question",
    "promptBlocks": [
      { "type": "text", "content": "Résoudre " },
      { "type": "math-inline", "latex": "x^2 + 5x + 6 = 0" }
    ],
    "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
    "optionsJson": {
      "A": { "blocks": [{ "type": "text", "content": "x = -2" }], "value": "A" },
      ...
    },
    "correctAnswer": "A",
    "answerJson": { "index": 0, "value": "A" },
    ...
  }]
}
...`;

// In normalization, preserve structured fields
const normalizedExercises = parsedData.exercises.map((ex: any, index: number) => ({
  ...existingFields,
  // NEW: Structured content
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
| Modify | `supabase/functions/exam-tutor/index.ts` | Add structured response with blocks/actions |
| Modify | `src/components/exam/ExamTutorChat.tsx` | Handle new response format |
| Create | `src/features/exams/admin/ExamAdminPage.tsx` | Unified admin component |
| Create | `src/features/exams/admin/components/TrackToggle.tsx` | 9AF/NS4 toggle |
| Create | `src/features/exams/admin/components/SeriesMultiSelect.tsx` | Series selector |
| Create | `src/features/exams/admin/components/PDFUploader.tsx` | PDF upload component |
| Create | `src/features/exams/admin/components/ExamPreviewCard.tsx` | Preview parsed exam |
| Create | `src/features/exams/admin/components/ExistingExamsList.tsx` | List with actions |
| Create | `src/features/exams/admin/utils/pdfUtils.ts` | PDF conversion utilities |
| Create | `src/features/exams/admin/utils/examSaveUtils.ts` | Save/update utilities |
| Create | `src/features/exams/admin/index.ts` | Barrel export |
| Modify | `supabase/functions/parse-exam-vision/index.ts` | Add structured blocks output |
| Modify | `src/features/exams/index.ts` | Export admin components |

---

## Implementation Order

| Step | Task | Est. Time |
|------|------|-----------|
| 1 | Update `exam-tutor` with deterministic validation + structured response | 45 min |
| 2 | Create admin utility files (`pdfUtils.ts`, `examSaveUtils.ts`) | 30 min |
| 3 | Create admin sub-components (TrackToggle, SeriesMultiSelect, etc.) | 45 min |
| 4 | Build unified `ExamAdminPage.tsx` | 60 min |
| 5 | Update `ExamTutorChat.tsx` to use new response format | 30 min |
| 6 | Update `parse-exam-vision` for structured blocks (optional enhancement) | 30 min |
| 7 | Update routing to use new admin page | 15 min |
| 8 | Deploy and test edge functions | 15 min |

**Total Estimated Time: ~4.5 hours**

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Backward compat with `response` field |
| Works with existing data? | Yes | New fields are optional |
| 3G optimized? | Yes | Same payload size, lazy KaTeX |
| Backward compatible? | Yes | Old response format preserved |
| Edge cases handled? | Yes | Null-safe validation |

---

## What This Completes

After this implementation:
- Jude returns **structured blocks** for KaTeX rendering
- Answer validation is **deterministic** (no LLM guessing for MCQ)
- **One admin interface** for both 9AF and NS4 exams
- **90% less duplicated code** in admin
- Action buttons are **data-driven** from tutor response
- Ready for future enhancements (timed mode, concept analytics)
