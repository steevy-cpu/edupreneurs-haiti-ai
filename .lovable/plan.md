

# Extended Plan: Activities Content Alignment Validation

## Overview

This plan extends the existing quiz content alignment validation to include **activities** (`activites_interactives`). The solution reuses the same architectural patterns while keeping validation logic separate for both content types.

---

## Current State Analysis

### What Already Exists (Quiz Validation)

| Component | Status | Description |
|-----------|--------|-------------|
| `BatchQuizContentValidator.tsx` | ✅ Created | Batch validates quiz content alignment |
| `validate-quiz-content-alignment` edge function | ✅ Created | AI-powered quiz validation |
| `needs_quiz_regeneration` column | ✅ Added | Flags quizzes needing regeneration |
| `parseQuizQuestions` utility | ✅ Exists | Parses quiz HTML in `quizActivityParsing.ts` |

### What's Missing (Activities Validation)

| Component | Status | Description |
|-----------|--------|-------------|
| `BatchActivitiesContentValidator.tsx` | ❌ Missing | Batch validates activities content alignment |
| `validate-activities-content-alignment` edge function | ❌ Missing | AI-powered activities validation |
| `needs_activities_regeneration` column | ❌ Missing | Flags activities needing regeneration |
| `parseActivities` utility | ✅ Exists | Already in `quizActivityParsing.ts` |

---

## Solution Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│                    LessonBrowser.tsx                            │
├─────────────────────────────────────────────────────────────────┤
│ Grade Stats Card                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 7AF: 202/204 quizzes                               99%      │ │
│ │ ██████████████████████████████████████████████░░░░          │ │
│ │ 2 leçons sans quiz                                          │ │
│ │                                                             │ │
│ │ [✨ Générer 2 quizs manquants]                              │ │
│ │ [🔍 Valider alignement quiz]       <-- EXISTING             │ │
│ │ [🔍 Valider alignement activités]  <-- NEW BUTTON           │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│           BatchActivitiesContentValidator.tsx (NEW)             │
├─────────────────────────────────────────────────────────────────┤
│ • Same pattern as BatchQuizContentValidator                     │
│ • Iterates through all lessons WITH activities in grade         │
│ • For each lesson:                                              │
│   1. Fetches contenu + exemples_exercices (reference source)    │
│   2. Parses activities using parseActivities() utility          │
│   3. Calls validate-activities-content-alignment edge function  │
│   4. Updates needs_activities_regeneration flag                 │
│ • Displays summary: X on-content, Y off-content                 │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│     validate-activities-content-alignment (Edge Function - NEW) │
├─────────────────────────────────────────────────────────────────┤
│ Input:                                                          │
│   • lessonId, lessonTitle, gradeLevel                           │
│   • contenu (reference text)                                    │
│   • exemples (reference examples)                               │
│   • activities[] (parsed activities - QUIZ + TRUE_FALSE types)  │
│                                                                 │
│ Process (AI):                                                   │
│   • Compare each activity against ONLY contenu + exemples       │
│   • Handle QUIZ type: question + options + answer               │
│   • Handle TRUE_FALSE type: statement + answer                  │
│   • Flag activities that require external knowledge             │
│                                                                 │
│ Output:                                                         │
│   {                                                             │
│     aligned: boolean,                                           │
│     confidence: 0-1,                                            │
│     offContentActivities: [                                     │
│       { index: 2, type: 'QUIZ', reason: "Concept X not found" } │
│     ],                                                          │
│     summary: "12/15 activities aligned"                         │
│   }                                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files to Create/Modify

| File | Type | Description |
|------|------|-------------|
| `supabase/functions/validate-activities-content-alignment/index.ts` | **New** | Edge function for AI-powered activities validation |
| `src/components/content-editor/BatchActivitiesContentValidator.tsx` | **New** | UI component for batch activities validation |
| `src/components/content-editor/LessonBrowser.tsx` | Modify | Add new validation button + activities regeneration badge |
| `src/components/content-editor/BatchQuizContentValidator.tsx` | Modify | Fix parser bug (use utility from `quizActivityParsing.ts`) |
| Database Migration | **New** | Add `needs_activities_regeneration` column |

---

## Technical Implementation Details

### 1. Database Migration

```sql
-- Add columns for activities content alignment tracking
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS needs_activities_regeneration boolean DEFAULT NULL,
ADD COLUMN IF NOT EXISTS activities_alignment_score numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_activities_validated_at timestamp with time zone DEFAULT NULL;

-- Create partial index for filtering
CREATE INDEX IF NOT EXISTS idx_lessons_needs_activities_regeneration 
ON public.lessons (needs_activities_regeneration) 
WHERE needs_activities_regeneration = true;
```

### 2. New Edge Function: `validate-activities-content-alignment`

Key differences from quiz validation:
- Handles two activity types: `QUIZ` (MCQ) and `TRUE_FALSE`
- Different AI prompt structure for mixed content

```typescript
// Core interface
interface ParsedActivity {
  activityType: 'QUIZ' | 'TRUE_FALSE';
  question?: string;      // For QUIZ type
  statement?: string;     // For TRUE_FALSE type
  options?: string[];     // For QUIZ type
  correctAnswer?: number; // For QUIZ type (0-3)
  isTrue?: boolean;       // For TRUE_FALSE type
  explanation: string;
}

// AI System Prompt (key part)
const systemPrompt = `Tu es un expert en validation de contenu pédagogique.

TÂCHE: Vérifier si chaque activité interactive peut être répondue UNIQUEMENT avec le contenu de la leçon.

TYPES D'ACTIVITÉS À VALIDER:
1. QUIZ (QCM): Vérifie si la question et la bonne réponse sont dérivables du contenu
2. TRUE_FALSE (Vrai/Faux): Vérifie si l'affirmation est abordée dans le contenu

RÈGLES:
- Une activité est "alignée" si les concepts sont présents dans le contenu
- Une activité est "hors-contenu" si elle nécessite des connaissances externes
- NE PAS juger si la réponse est correcte - seulement l'alignement

Réponds avec un JSON:
{
  "offContentActivities": [
    { "index": 0, "type": "QUIZ", "reason": "Le concept X n'est pas mentionné" }
  ],
  "confidence": 0.85
}`;
```

### 3. New Component: `BatchActivitiesContentValidator.tsx`

Mirrors `BatchQuizContentValidator.tsx` structure:

```typescript
interface BatchActivitiesContentValidatorProps {
  lessons: any[];           // Lessons WITH activities
  gradeLevel: string;
  onComplete: () => void;
}

// Uses parseActivities from quizActivityParsing.ts
import { parseActivities } from "@/utils/quizActivityParsing";

// Validation loop
for (const lesson of lessons) {
  // 1. Fetch full content
  const { data } = await supabase.from('lessons')
    .select('contenu, exemples_exercices, activites_interactives')
    .eq('id', lesson.id).single();
  
  // 2. Parse activities using PROVEN utility
  const parseResult = parseActivities(data.activites_interactives);
  const activities = parseResult.items.map(activity => ({
    activityType: activity.activityType,
    question: activity.activityType === 'QUIZ' ? activity.question : undefined,
    statement: activity.activityType === 'TRUE_FALSE' ? activity.statement : undefined,
    options: activity.activityType === 'QUIZ' ? activity.options : undefined,
    correctAnswer: activity.activityType === 'QUIZ' ? activity.correctAnswer : undefined,
    isTrue: activity.activityType === 'TRUE_FALSE' ? activity.isTrue : undefined,
    explanation: activity.explanation
  }));
  
  // 3. Call edge function
  const { data: result } = await supabase.functions.invoke(
    'validate-activities-content-alignment',
    { body: { lessonId, contenu, exemples, activities } }
  );
  
  // 4. Update lesson flag
  await supabase.from('lessons').update({
    needs_activities_regeneration: !result.aligned,
    activities_alignment_score: result.confidence,
    last_activities_validated_at: new Date().toISOString()
  }).eq('id', lesson.id);
}
```

### 4. Fix BatchQuizContentValidator Parser Bug

Replace buggy local parser with proven utility:

```typescript
// Before (lines 42-87 - buggy local parser)
const parseQuizQuestions = (quizHtml: string): QuizQuestion[] => { ... }

// After - use utility
import { parseQuizQuestions as parseQuizQuestionsFromUtils } from "@/utils/quizActivityParsing";

// In validation loop (line 136):
const parseResult = parseQuizQuestionsFromUtils(fullLesson.quiz_final);
const questions = parseResult.items.map(q => ({
  question: q.question,
  options: q.options,
  correctAnswer: q.correctAnswer,
  explanation: q.explanation
}));
```

### 5. LessonBrowser.tsx Updates

```typescript
// Add helper function for activities
const hasValidActivities = (lesson: any): boolean => {
  return !!lesson.activites_interactives && 
         lesson.activites_interactives.length > 50;
};

// Get lessons with valid activities for validation
const lessonsWithValidActivities = allLessons.filter(hasValidActivities);

// Add second validation button (after quiz validator)
{lessonsWithValidActivities.length > 0 && (
  <BatchActivitiesContentValidator 
    lessons={lessonsWithValidActivities}
    gradeLevel={gradeLevel}
    onComplete={loadSubjects}
  />
)}

// Update loadLessons query to include activities flag
.select('..., needs_activities_regeneration, activites_interactives')

// Add activities regeneration badge alongside quiz badge
{lesson.needs_activities_regeneration && (
  <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
    ⚠ Activités
  </Badge>
)}
```

---

## Activity Types Parsing Reference

From `quizActivityParsing.ts`, the existing parser handles:

| Type | Fields | Example |
|------|--------|---------|
| `QUIZ` | `question`, `options[4]`, `correctAnswer`, `explanation` | MCQ with A/B/C/D |
| `TRUE_FALSE` | `statement`, `isTrue`, `explanation` | Affirmation + VRAI/FAUX |

Both types will be validated against lesson content.

---

## User Experience Flow

1. User selects a grade level (e.g., 7AF)
2. Stats panel shows quiz coverage
3. **Quiz validation button**: "Valider alignement quiz"
4. **NEW Activities validation button**: "Valider alignement activités"
5. User clicks activities button
6. Confirmation dialog shows count and estimated time
7. Progress tracking shows current lesson
8. Results summary:
   - "180 activités alignées ✓"
   - "15 activités hors-contenu ⚠"
9. Flagged lessons show orange "Activités" badge
10. User can regenerate activities for flagged lessons

---

## Regeneration Flow Integration

When regeneration is triggered for flagged lessons:
- `generate-interactive-activities` edge function already uses `exercisesContent` (exemples_exercices) as source
- After regeneration, set `needs_activities_regeneration = false`
- Existing regeneration UI in `LessonEditor.tsx` handles this

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | New feature, existing quiz validation unchanged |
| Works with existing data? | Yes | Uses existing `activites_interactives` field |
| Backward compatible? | Yes | New columns have NULL default |
| 3G optimized? | Yes | Sequential processing with 2s delays |
| Reuses proven code? | Yes | Uses `parseActivities` from utility |
| Separation of concerns? | Yes | Separate validator for activities |
| Edge cases handled? | Yes | Empty content, no activities, mixed types |

---

## Performance Considerations

- **Rate limiting**: 2 second delay between AI calls
- **Content truncation**: Same 15,000 char limit as quiz validation
- **Batch size**: Sequential to prevent rate limit errors
- **Caching**: Results stored in database columns

---

## Summary of Deliverables

1. **Database migration**: Add `needs_activities_regeneration` column
2. **New edge function**: `validate-activities-content-alignment`
3. **New component**: `BatchActivitiesContentValidator.tsx`
4. **Fix quiz validator**: Use proven parser utility
5. **LessonBrowser updates**: Second validation button + activities badge
6. **Regeneration integration**: Clear flag after successful regeneration

