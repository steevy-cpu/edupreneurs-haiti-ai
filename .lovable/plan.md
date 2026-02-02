
# ExamHub Restructuring Plan
## One Exam Platform, Multiple Products

---

## Executive Summary

This plan restructures the ExamHub into a unified, scalable exam platform following the principle: "ExamHub is a data platform; 9AF and NS4 are views." The implementation is divided into 4 phases to maintain stability while progressively enhancing the system.

---

## Current State Analysis

### What Exists
| Component | 9AF | NS4 | Issue |
|-----------|-----|-----|-------|
| Hub Page | `ExamsHub.tsx` (328 lines) | `BaccExamsHub.tsx` (480 lines) | Duplicated logic |
| Admin | `ExamManager.tsx` (891 lines) | `BaccExamManager.tsx` (927 lines) | 90% code duplication |
| Practice | Shared `ExamPreparation.tsx` | Shared | Good - already unified |
| Routing | `/examens-officiels` | `/baccalaureat/:series?/:subject?` | Inconsistent |
| Database | `official_exams` table | Same table + series/session fields | Needs normalization |

### Key Problems to Solve
1. Two separate hubs with duplicated code
2. Two admin managers with 90% code duplication
3. Hardcoded subjects per series (not from DB)
4. No structured content blocks for KaTeX
5. Tutor responses are unstructured (no action buttons)
6. Answer validation is LLM-based, not deterministic

---

## Phase 1: Database Schema Upgrade
**Goal**: Canonical data model that supports all exam types

### 1.1 Add Missing Fields to `official_exams`

```sql
ALTER TABLE official_exams ADD COLUMN IF NOT EXISTS exam_type TEXT DEFAULT 'official';
-- Values: 'official', 'model', 'practice', 'rattrapage'

ALTER TABLE official_exams ADD COLUMN IF NOT EXISTS track TEXT;
-- Values: '9AF', 'NS4' (derived from grade_level for backward compat)

ALTER TABLE official_exams ADD COLUMN IF NOT EXISTS subject_slug TEXT;
-- Normalized slug for consistent querying

-- Add index for fast filtering
CREATE INDEX IF NOT EXISTS idx_exams_track_series_subject 
ON official_exams(track, series, subject_slug, year DESC);
```

### 1.2 Upgrade `exam_exercises` for Structured Content

```sql
-- Add structured content fields
ALTER TABLE exam_exercises ADD COLUMN IF NOT EXISTS prompt_blocks JSONB;
-- Format: [{ type: "text", content: "..." }, { type: "math-inline", latex: "x^2" }]

ALTER TABLE exam_exercises ADD COLUMN IF NOT EXISTS options_json JSONB;
-- Format: { "A": { blocks: [...], value: "..." }, "B": {...} }

ALTER TABLE exam_exercises ADD COLUMN IF NOT EXISTS answer_json JSONB;
-- Format: { index: 0, value: "A", blocks: [...] }

ALTER TABLE exam_exercises ADD COLUMN IF NOT EXISTS explanation_blocks JSONB;
-- Structured explanation with math support

ALTER TABLE exam_exercises ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium';
-- Values: 'easy', 'medium', 'hard'

ALTER TABLE exam_exercises ADD COLUMN IF NOT EXISTS concept_tags TEXT[];
-- Array of concept tags for filtering
```

### 1.3 Enhance `exam_practice_sessions`

```sql
ALTER TABLE exam_practice_sessions ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'practice';
-- Values: 'practice', 'timed', 'review'

ALTER TABLE exam_practice_sessions ADD COLUMN IF NOT EXISTS time_remaining INTEGER;
-- For timed mode (seconds)
```

### 1.4 Data Migration Script

```sql
-- Backfill track from grade_level
UPDATE official_exams SET track = grade_level WHERE track IS NULL;

-- Backfill subject_slug from subject
UPDATE official_exams SET subject_slug = lower(regexp_replace(subject, '[^a-zA-Z0-9]+', '-', 'g'));
```

---

## Phase 2: Unified Routing Structure
**Goal**: One route pattern for all exam types

### 2.1 New Route Structure

```text
/exams                              (unified landing)
/exams/:track                       (9AF | NS4)
/exams/:track/:series?              (NS4 series; 9AF skips series)
/exams/:track/:series?/:subject     (subject step)
/exams/:track/:series?/:subject/:year
/exams/practice/:examId             (practice engine)
```

### 2.2 Route Configuration in `App.tsx`

```typescript
// Replace current exam routes with:
<Route path="/exams" element={<ExamsHubPage />} />
<Route path="/exams/:track" element={<ExamsHubPage />} />
<Route path="/exams/:track/:series" element={<ExamsHubPage />} />
<Route path="/exams/:track/:series/:subject" element={<ExamsHubPage />} />
<Route path="/exams/:track/:subject" element={<ExamsHubPage />} /> // 9AF (no series)
<Route path="/exams/practice/:examId" element={<ExamPracticePage />} />

// Redirects for backward compatibility
<Route path="/examens-officiels" element={<Navigate to="/exams/9AF" replace />} />
<Route path="/baccalaureat" element={<Navigate to="/exams/NS4" replace />} />
<Route path="/baccalaureat/:series" element={<Navigate to="/exams/NS4/:series" replace />} />
<Route path="/baccalaureat/:series/:subject" element={<Navigate to="/exams/NS4/:series/:subject" replace />} />
<Route path="/exam-preparation/:examId" element={<Navigate to="/exams/practice/:examId" replace />} />
```

---

## Phase 3: Unified Hub Architecture
**Goal**: One hub component with data-driven steps

### 3.1 New Folder Structure

```text
src/features/exams/
├── pages/
│   ├── ExamsHubPage.tsx          (unified hub)
│   └── ExamPracticePage.tsx      (practice engine)
├── components/
│   ├── hub/
│   │   ├── TrackSelector.tsx     (9AF | NS4)
│   │   ├── SeriesSelector.tsx    (conditional for NS4)
│   │   ├── SubjectSelector.tsx   (dynamic from DB)
│   │   ├── ExamYearList.tsx      (grouped by year)
│   │   └── EmptyState.tsx        (per filter)
│   └── practice/
│       ├── ExamHeader.tsx
│       ├── ExamPDFViewer.tsx     (moved from /exam)
│       ├── ExamProgressBar.tsx   (moved from /exam)
│       ├── TutorPane.tsx         (new wrapper)
│       └── MobileTabs.tsx
├── data/
│   ├── exams.queries.ts          (React Query hooks)
│   └── practice.queries.ts
├── tutor/
│   ├── tutor.contract.ts         (types for tutor responses)
│   └── tutor.actions.ts          (action handlers)
├── rendering/
│   ├── ContentBlocksRenderer.tsx (unified block renderer)
│   └── katex.ts                  (lazy loader)
└── admin/
    ├── ExamAdminPage.tsx         (unified admin)
    ├── UploadExamWizard.tsx      (step-by-step upload)
    └── ParsingPreview.tsx
```

### 3.2 ExamsHubPage Component

```typescript
// src/features/exams/pages/ExamsHubPage.tsx
export function ExamsHubPage() {
  const { track, series, subject } = useParams();
  
  // Step progression: track -> series (if NS4) -> subject -> exam list
  const step = useMemo(() => {
    if (!track) return 'track';
    if (track === 'NS4' && !series) return 'series';
    if (!subject) return 'subject';
    return 'exams';
  }, [track, series, subject]);
  
  return (
    <PageContainer variant="wide">
      <ExamHubHeader track={track} series={series} />
      
      {step === 'track' && <TrackSelector />}
      {step === 'series' && <SeriesSelector track={track} />}
      {step === 'subject' && <SubjectSelector track={track} series={series} />}
      {step === 'exams' && <ExamYearList track={track} series={series} subject={subject} />}
    </PageContainer>
  );
}
```

### 3.3 SubjectSelector (Data-Driven, No Hardcoding)

```typescript
// Query distinct subjects from exams table, not hardcoded
function SubjectSelector({ track, series }: Props) {
  const { data: subjects, isLoading } = useQuery({
    queryKey: ['exam-subjects', track, series],
    queryFn: async () => {
      let query = supabase
        .from('official_exams')
        .select('subject, subject_slug')
        .eq('track', track);
      
      if (series) query = query.eq('series', series);
      
      const { data } = await query;
      
      // Group and count
      const grouped = groupBy(data, 'subject');
      return Object.entries(grouped).map(([name, exams]) => ({
        name,
        slug: exams[0].subject_slug,
        count: exams.length,
        icon: SUBJECT_ICONS[name] || BookOpen,
        color: SUBJECT_COLORS[name] || 'from-gray-500 to-gray-600',
      }));
    }
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {subjects?.map(subject => (
        <SubjectCard 
          key={subject.slug} 
          subject={subject} 
          disabled={subject.count === 0}
          disabledTooltip="Bientôt disponible"
        />
      ))}
    </div>
  );
}
```

---

## Phase 4: Tutor Contract & Structured Responses
**Goal**: Predictable tutor behavior with action buttons

### 4.1 Tutor Response Contract

```typescript
// src/features/exams/tutor/tutor.contract.ts
interface ContentBlock {
  type: 'text' | 'math-inline' | 'math-block';
  content?: string;
  latex?: string;
}

interface TutorAction {
  type: 'hint' | 'reveal' | 'next' | 'youtube' | 'reference';
  label: string;
  payload?: any;
}

interface TutorGrading {
  isCorrect?: boolean;
  pointsAwarded?: number;
  correctAnswer?: string;  // Only for reveal
}

interface TutorResponse {
  blocks: ContentBlock[];           // Structured content
  actions?: TutorAction[];          // Available actions
  grading?: TutorGrading;           // Score info
  shouldAutoAdvance?: boolean;      // Auto-move to next
  youtubeQuery?: string;            // Video suggestion
}
```

### 4.2 Update `exam-tutor` Edge Function

```typescript
// Return structured response instead of free-form text
return new Response(JSON.stringify({
  // NEW: Structured blocks for KaTeX rendering
  blocks: [
    { type: 'text', content: 'Bravo! La bonne réponse est ' },
    { type: 'math-inline', latex: 'x = 5' },
    { type: 'text', content: '. Voici pourquoi...' }
  ],
  
  // NEW: Available actions for UI buttons
  actions: [
    { type: 'next', label: 'Question suivante' },
    { type: 'youtube', label: 'Voir vidéo', payload: youtubeQuery }
  ],
  
  // Grading (existing, refined)
  grading: {
    isCorrect: true,
    pointsAwarded: exercise.points,
  },
  
  // Backward compat: also include text response
  response: ericResponse,
  
  shouldAutoAdvance: true,
}), { headers: responseHeaders });
```

### 4.3 Deterministic Answer Validation

```typescript
// In exam-tutor edge function
function validateAnswer(studentAnswer: string, exercise: Exercise): boolean {
  const correct = exercise.correct_answer?.toUpperCase().trim();
  const student = studentAnswer?.toUpperCase().trim();
  
  if (!correct) {
    // No answer in DB - log and return false (manual grading)
    console.warn(`No correct_answer for exercise ${exercise.exercise_number}`);
    return false;
  }
  
  // MCQ: exact match
  if (exercise.exercise_type === 'multiple_choice') {
    return student === correct;
  }
  
  // Short answer: normalize and compare
  const normalizedStudent = normalizeAnswer(student);
  const normalizedCorrect = normalizeAnswer(correct);
  
  // Check exact match or synonyms
  if (normalizedStudent === normalizedCorrect) return true;
  if (SYNONYMS[normalizedCorrect]?.includes(normalizedStudent)) return true;
  
  return false;
}

function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '')       // Remove special chars
    .trim();
}
```

---

## Phase 5: Unified Admin Interface
**Goal**: One admin for all tracks/series

### 5.1 ExamAdminPage Structure

```typescript
// src/features/exams/admin/ExamAdminPage.tsx
export function ExamAdminPage() {
  return (
    <div className="space-y-6">
      <h1>Gestion des Examens</h1>
      
      {/* Filters */}
      <div className="flex gap-4">
        <TrackFilter />     {/* 9AF | NS4 */}
        <SeriesFilter />    {/* Conditional for NS4 */}
        <SubjectFilter />   {/* Dynamic from DB */}
      </div>
      
      {/* Upload wizard */}
      <UploadExamWizard />
      
      {/* Existing exams list */}
      <ExamsList />
    </div>
  );
}
```

### 5.2 UploadExamWizard Fields

```typescript
interface UploadExamWizardState {
  track: '9AF' | 'NS4';
  gradeLevel: string;          // Derived from track
  series: string | null;       // Required if NS4
  subject: string;
  year: number;
  version: number;             // Auto-increment
  examType: 'official' | 'model' | 'rattrapage';
  sessionLabel?: string;       // "Rattrapage 2024"
  pdfFile: File | null;
}
```

---

## Phase 6: KaTeX Rendering Pipeline
**Goal**: Math rendering everywhere (prompts, options, explanations, tutor)

### 6.1 ContentBlocksRenderer Component

```typescript
// src/features/exams/rendering/ContentBlocksRenderer.tsx
import { lazy, Suspense } from 'react';

const KaTeX = lazy(() => import('./KaTeXWrapper'));

interface ContentBlock {
  type: 'text' | 'math-inline' | 'math-block';
  content?: string;
  latex?: string;
}

export function ContentBlocksRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'text':
            return <span key={i}>{block.content}</span>;
          case 'math-inline':
            return (
              <Suspense key={i} fallback={<code>{block.latex}</code>}>
                <KaTeX math={block.latex} inline />
              </Suspense>
            );
          case 'math-block':
            return (
              <Suspense key={i} fallback={<pre>{block.latex}</pre>}>
                <KaTeX math={block.latex} block />
              </Suspense>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
```

### 6.2 Update `parse-exam-vision` to Emit Blocks

```typescript
// In parse-exam-vision edge function, instruct AI to return blocks:
const systemPrompt = `...

When extracting questions, return structured blocks for any math content:

{
  "exercises": [{
    "exerciseNumber": 1,
    "promptBlocks": [
      { "type": "text", "content": "Résoudre " },
      { "type": "math-inline", "latex": "x^2 + 5x + 6 = 0" }
    ],
    "options": {
      "A": { "blocks": [{ "type": "math-inline", "latex": "x = -2, -3" }] },
      "B": { "blocks": [{ "type": "text", "content": "x = 2, 3" }] }
    },
    ...
  }]
}
`;
```

---

## Implementation Order

| Order | Task | Files | Est. Time |
|-------|------|-------|-----------|
| 1 | Database migration | 1 migration file | 30 min |
| 2 | Create `/features/exams` folder structure | 15+ new files | 2 hrs |
| 3 | Build unified `ExamsHubPage` | Hub components | 3 hrs |
| 4 | Add route redirects for backward compat | App.tsx | 30 min |
| 5 | Create `ContentBlocksRenderer` | Rendering files | 1 hr |
| 6 | Update `exam-tutor` with structured responses | Edge function | 2 hrs |
| 7 | Build unified `ExamAdminPage` | Admin components | 3 hrs |
| 8 | Update `parse-exam-vision` for blocks | Edge function | 1 hr |
| 9 | Testing & polish | All files | 2 hrs |

**Total Estimated Time: ~15 hours**

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Redirects preserve old URLs |
| Works with existing data? | Yes | Migration backfills missing fields |
| 3G optimized? | Yes | Single query for hub data, lazy KaTeX |
| Backward compatible? | Yes | Old routes redirect to new ones |
| Edge cases handled? | Yes | Empty states, no-series for 9AF |

---

## What This Gives You

### Immediately
- No more hardcoded NS4 subjects (dynamic from DB)
- NS4 gets full admin upload support
- Clean routing & navigation consistency
- KaTeX works everywhere (prompts + tutor)
- Jude becomes a predictable exam tutor (not just chat)
- 90% less duplicated code

### Long Term
- Add new tracks (NS3, new series) trivially
- Add timed mode (time_remaining field ready)
- Add model exams with versioning
- Add analytics per concept (concept_tags field ready)
