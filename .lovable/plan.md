
# Matières Architecture Gap Analysis & Improvement Roadmap

## Executive Summary

After thorough analysis of your codebase against the 10-point guidelines, I've identified **5 critical gaps** and **3 alignment areas**. This plan provides a phased roadmap to bring the system to the recommended architecture.

---

## Current State vs. Guidelines Analysis

### What's Already Aligned

| Guideline | Current State | Status |
|-----------|---------------|--------|
| **3-Layer Content Delivery** | Routes exist: `/matieres` → `/course/:slug` → `/course/:slug/:lessonSlug` | Aligned |
| **Layout Modes** | `src/shell/config/layoutModes.ts` declares explicit modes (learning, dashboard, etc.) | Aligned |
| **Precomputed Counts** | `activities_count` and `quiz_count` columns exist in `lessons` table | Aligned |
| **Performance Optimizations** | `useMatieresData` uses React Query with 5-min staleTime, prefetching on hover | Aligned |
| **Access Control** | `useUserGrade` enforces grade-level restrictions, super-user bypass | Aligned |

---

### Critical Gaps Identified

#### Gap 1: Content Stored as HTML, Not Structured JSON

**Problem**: `quiz_final` and `activites_interactives` are stored as HTML strings directly in the `lessons` table.

| Current | Recommended |
|---------|-------------|
| `lessons.quiz_final` = HTML blob | `lesson_assets.payload_json` = strict JSON |
| Parsing happens client-side | Parsing validated server-side |
| No validation status tracked | `status: draft → validated → published` |

**Impact**: 
- Quiz format errors reach students
- Cannot validate content alignment
- UI rendering is fragile

---

#### Gap 2: No Server-Side Validation Gate

**Problem**: AI-generated quizzes/activities are saved directly without validation.

**Current flow in `SingleLessonGenerator.tsx`**:
```
generate-quiz-final → returns HTML → saved to lessons.quiz_final
```

**Recommended flow**:
```
generate-quiz-final → returns JSON → validate-schema → validate-alignment → save as draft → manual approve → publish
```

**Missing components**:
1. Canonical JSON schemas for quizzes and activities
2. Server-side Zod validation in edge functions
3. Context alignment checks (keywords overlap)
4. Validation status tracking

---

#### Gap 3: All Lesson Tabs Load Eagerly

**Problem**: `LessonPageTemplate.tsx` renders all 5 tabs (Introduction, Contenu, Activities, Quiz, Notes) on initial load.

```typescript
// Current: All content passed as props and rendered immediately
<TabsContent value="introduction">
  <ProgressiveContent content={lesson.introduction} />
</TabsContent>
<TabsContent value="contenu">
  <ProgressiveContent content={lesson.contenu} />
</TabsContent>
// ... all tabs mounted with full content
```

**Impact on 3G**: Users download ~17KB of quiz HTML even if they never click the Quiz tab.

**Recommended**: Lazy-load each tab's content with separate React Query hooks.

---

#### Gap 4: Synchronous Generation Blocks UI

**Problem**: `SingleLessonGenerator.tsx` runs generation sequentially in the same request, blocking the UI for 30-90 seconds.

**Current architecture**:
```
User clicks → loop through sections → call edge function → wait → update state → repeat
```

**Recommended**: 
- Create `ai_generation_jobs` table
- Background job pattern with polling/realtime subscription
- Resumable if user refreshes

---

#### Gap 5: No Publishing Gate

**Problem**: Lessons can be published (`is_published = true`) without validating that quizzes/activities meet quality standards.

**Current `workflow_status`**: `draft | in_review | approved | published`
- But there's no enforcement that validated content exists before publishing.

---

## Folder Structure Gap

**Current** (scattered):
```
src/pages/
  Matieres.tsx
  DynamicCoursePage.tsx
  DynamicLessonPage.tsx
  ContentEditor.tsx

src/components/
  LessonPageTemplate.tsx
  content-editor/
    SingleLessonGenerator.tsx
    LessonBrowser.tsx
    ...

src/hooks/
  useMatieresData.ts
  useCourseData.ts
```

**Recommended** (modular):
```
src/features/
  matieres/
    pages/
      MatieresPage.tsx
      CoursePage.tsx
      LessonPage.tsx
    components/
      GradeSelector.tsx
      SubjectsGrid.tsx
      LessonTabs/
    data/
      matieres.queries.ts
      course.queries.ts
    renderers/
      QuizRenderer.tsx
      ActivitiesRenderer.tsx
    validation/
      quiz.schema.ts
      activities.schema.ts

  content-editor/
    pages/
      ContentEditorPage.tsx
    services/
      generation.pipeline.ts
      validation.pipeline.ts
```

---

## Technical Implementation Roadmap

### Phase 1: Structured Content & Validation (Foundation)

#### 1.1 Create `lesson_assets` Table

```sql
CREATE TYPE asset_kind AS ENUM ('quiz_final', 'activities', 'outline', 'keywords');
CREATE TYPE asset_status AS ENUM ('draft', 'validating', 'validated', 'rejected', 'published');

CREATE TABLE lesson_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  kind asset_kind NOT NULL,
  schema_version INTEGER DEFAULT 1,
  payload_json JSONB NOT NULL,
  status asset_status DEFAULT 'draft',
  validation_report_json JSONB,
  generated_by UUID REFERENCES profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(lesson_id, kind, schema_version)
);

ALTER TABLE lesson_assets ENABLE ROW LEVEL SECURITY;
```

#### 1.2 Define Canonical JSON Schemas

**Quiz Schema** (`quiz.schema.ts`):
```typescript
import { z } from 'zod';

export const QuizQuestionSchema = z.object({
  type: z.enum(['mcq', 'short']),
  prompt: z.string().min(10).max(500),
  choices: z.array(z.string().max(200)).length(4).optional(), // MCQ only
  answerIndex: z.number().min(0).max(3).optional(), // MCQ only
  answer: z.string().optional(), // Short answer only
  explanation: z.string().min(10).max(500),
  tags: z.array(z.string()).max(5),
});

export const QuizPayloadSchema = z.object({
  version: z.literal(1),
  lessonSlug: z.string(),
  gradeLevel: z.string(),
  subjectSlug: z.string(),
  questions: z.array(QuizQuestionSchema).min(10).max(15),
});
```

**Activities Schema** (`activities.schema.ts`):
```typescript
export const ActivitySchema = z.object({
  type: z.enum(['fill-blank', 'matching', 'ordering', 'true-false', 'short-answer']),
  title: z.string().max(100),
  instructions: z.string().max(300),
  expectedOutcome: z.string().max(200),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()).max(5),
  data: z.record(z.any()), // Type-specific data
});

export const ActivitiesPayloadSchema = z.object({
  version: z.literal(1),
  lessonSlug: z.string(),
  activities: z.array(ActivitySchema).min(3).max(8),
});
```

#### 1.3 Refactor `generate-quiz-final` Edge Function

**Before** (current):
- Returns HTML string
- No schema validation
- Saved directly to `lessons.quiz_final`

**After**:
- Returns strict JSON matching `QuizPayloadSchema`
- Validates with Zod server-side
- Saves to `lesson_assets` as `status: 'draft'`

---

### Phase 2: Validation Pipeline

#### 2.1 Create Unified Validation Service

Update existing validation edge functions to:
1. Validate schema structure
2. Check context alignment (keyword overlap)
3. Return structured validation report

**Validation Report Schema**:
```typescript
interface ValidationReport {
  passed: boolean;
  schemaErrors: string[];
  alignmentScore: number; // 0-1
  alignmentIssues: string[];
  qualityChecks: {
    check: string;
    passed: boolean;
    message?: string;
  }[];
}
```

#### 2.2 Update `LessonValidationPanel` Component

- Display validation status from `lesson_assets`
- Show validation report details
- Allow re-validation with one click
- Block publishing if validation fails

---

### Phase 3: Lazy Tab Loading (Performance)

#### 3.1 Create Tab-Specific Query Hooks

```typescript
// src/features/matieres/data/lessonTabs.queries.ts
export function useLessonIntroduction(lessonId: string) {
  return useQuery({
    queryKey: ['lesson-tab', lessonId, 'introduction'],
    queryFn: () => fetchLessonSection(lessonId, ['introduction', 'audio_introduction_url']),
    enabled: !!lessonId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useLessonQuiz(lessonId: string) {
  return useQuery({
    queryKey: ['lesson-tab', lessonId, 'quiz'],
    queryFn: () => fetchLessonAsset(lessonId, 'quiz_final'),
    enabled: !!lessonId,
    staleTime: 10 * 60 * 1000,
  });
}
```

#### 3.2 Refactor `LessonPageTemplate` Tabs

```typescript
<TabsContent value="quiz">
  <LessonQuizTab lessonId={lesson.id} />
</TabsContent>

// LessonQuizTab component
function LessonQuizTab({ lessonId }) {
  const { data, isLoading, error } = useLessonQuiz(lessonId);
  
  if (isLoading) return <TabSkeleton />;
  if (error) return <TabError />;
  if (!data) return <EmptyTabState />;
  
  return <QuizRenderer payload={data.payload_json} />;
}
```

---

### Phase 4: Async Generation Jobs (Editor UX)

#### 4.1 Create `ai_generation_jobs` Table

```sql
CREATE TYPE job_status AS ENUM ('pending', 'running', 'completed', 'failed');

CREATE TABLE ai_generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  job_type TEXT NOT NULL, -- 'quiz_final', 'activities', 'full_lesson'
  status job_status DEFAULT 'pending',
  progress JSONB DEFAULT '{}',
  result_asset_id UUID REFERENCES lesson_assets(id),
  error_message TEXT,
  created_by UUID REFERENCES profiles(user_id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable realtime for job status updates
ALTER PUBLICATION supabase_realtime ADD TABLE ai_generation_jobs;
```

#### 4.2 Refactor `SingleLessonGenerator`

**Current**: Sequential blocking calls
**New**: 
1. Create job in database
2. Subscribe to realtime updates
3. Background edge function processes job
4. UI updates via subscription

---

### Phase 5: Publishing Gate

#### 5.1 Update Publishing Logic

Add database trigger or RLS policy check:

```sql
-- Function to check if lesson is publishable
CREATE OR REPLACE FUNCTION check_lesson_publishable(p_lesson_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  quiz_validated BOOLEAN;
  activities_validated BOOLEAN;
BEGIN
  -- Check if quiz asset exists and is validated
  SELECT EXISTS (
    SELECT 1 FROM lesson_assets 
    WHERE lesson_id = p_lesson_id 
    AND kind = 'quiz_final' 
    AND status = 'validated'
  ) INTO quiz_validated;
  
  -- Check if activities asset exists and is validated
  SELECT EXISTS (
    SELECT 1 FROM lesson_assets 
    WHERE lesson_id = p_lesson_id 
    AND kind = 'activities' 
    AND status = 'validated'
  ) INTO activities_validated;
  
  RETURN quiz_validated AND activities_validated;
END;
$$;
```

---

## Migration Strategy

### Backward Compatibility

The existing HTML content in `lessons.quiz_final` and `lessons.activites_interactives` will NOT be removed. Instead:

1. **New content** goes to `lesson_assets` as JSON
2. **Renderers** check `lesson_assets` first, fallback to HTML columns
3. **Gradual migration**: Re-generate existing content into new structure

```typescript
// QuizTab rendering logic
const quizAsset = useLessonAsset(lessonId, 'quiz_final');

if (quizAsset?.payload_json) {
  // New JSON-based rendering
  return <QuizRenderer payload={quizAsset.payload_json} />;
} else if (lesson.quiz_final) {
  // Legacy HTML fallback
  return <HTMLQuizParser htmlContent={lesson.quiz_final} />;
}
```

---

## Implementation Priority

| Phase | Effort | Impact | Priority |
|-------|--------|--------|----------|
| Phase 1: lesson_assets + schemas | Medium | High - Foundation for everything | 1st |
| Phase 2: Validation pipeline | Medium | High - Fixes wrong format/context issues | 2nd |
| Phase 3: Lazy tab loading | Low | Medium - Performance improvement | 3rd |
| Phase 5: Publishing gate | Low | High - Quality control | 4th |
| Phase 4: Async jobs | High | Medium - Editor UX improvement | 5th |
| Folder restructure | Medium | Low - Maintainability | 6th |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Backward compatible? | Yes - HTML columns preserved as fallback |
| Breaks existing functionality? | No - All existing pages continue to work |
| Existing data affected? | No - New tables, existing content untouched |
| 3G optimized? | Yes - Lazy loading reduces initial payload |
| Edge cases handled? | Yes - Fallback rendering for legacy content |

---

## Recommended First Steps

1. **Create `lesson_assets` table** with proper RLS policies
2. **Define Zod schemas** for quiz and activities in shared location
3. **Update `generate-quiz-final`** to output JSON and save to `lesson_assets`
4. **Create `QuizRenderer`** component that renders from JSON
5. **Update `LessonQuizTab`** to try JSON first, fallback to HTML

This provides immediate value while maintaining stability for students.
