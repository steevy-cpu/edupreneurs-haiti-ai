
# Batch Quiz Content Alignment Validation Plan

## Overview

This plan adds a **second validation button** to the grade-level quiz stats panel that validates whether quiz questions are aligned with their lesson content. Unlike the existing batch generator, this feature does NOT auto-fix quizzes—it only flags them for manual review or regeneration.

---

## Problem Statement

Current quizzes may contain questions that:
- Introduce concepts not covered in the lesson's `contenu` or `exemples_exercices` sections
- Test knowledge that requires external references
- Are factually correct but contextually irrelevant to the lesson

The existing validation only checks:
- Structural validity (4 options, correct answer marked, explanation present)
- Factual accuracy (via AI)

**Missing**: Content alignment validation that ensures quiz questions are derived from lesson material.

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
│ │ [✨ Générer 2 quizs manquants]   <-- Existing               │ │
│ │ [🔍 Valider alignement contenu]  <-- NEW BUTTON             │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│              BatchQuizContentValidator.tsx (NEW)                │
├─────────────────────────────────────────────────────────────────┤
│ • Iterates through all lessons WITH quizzes in selected grade   │
│ • For each lesson:                                              │
│   1. Fetches contenu + exemples_exercices (reference source)    │
│   2. Parses quiz questions                                      │
│   3. Calls validate-quiz-content-alignment edge function        │
│   4. Stores result in lesson_assets table                       │
│ • Displays summary: X on-content, Y off-content                 │
│ • Off-content lessons get a badge: "⚠ Besoin régénération"      │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│      validate-quiz-content-alignment (Edge Function - NEW)      │
├─────────────────────────────────────────────────────────────────┤
│ Input:                                                          │
│   • lessonId, lessonTitle, gradeLevel                           │
│   • contenu (reference text)                                    │
│   • exemples (reference examples)                               │
│   • questions[] (parsed quiz questions)                         │
│                                                                 │
│ Process (AI):                                                   │
│   • Compare each question against ONLY contenu + exemples       │
│   • Detect if question introduces external concepts             │
│   • Flag questions that cannot be answered from lesson content  │
│                                                                 │
│ Output:                                                         │
│   {                                                             │
│     aligned: boolean,                                           │
│     confidence: 0-1,                                            │
│     offContentQuestions: [                                      │
│       { index: 3, reason: "Concept X not in lesson" }           │
│     ],                                                          │
│     summary: "8/10 questions aligned"                           │
│   }                                                             │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database Storage                             │
├─────────────────────────────────────────────────────────────────┤
│ lessons table:                                                  │
│   • Add column: needs_quiz_regeneration (boolean, default null) │
│   • Add column: content_alignment_score (numeric, default null) │
│   • Add column: last_content_validated_at (timestamp)           │
│                                                                 │
│ OR use existing lesson_assets table:                            │
│   kind = 'quiz_validation'                                      │
│   payload_json = { aligned, confidence, offContentQuestions }   │
│   status = 'validated' | 'rejected'                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Files to Create/Modify

| File | Type | Description |
|------|------|-------------|
| `src/components/content-editor/BatchQuizContentValidator.tsx` | New | UI component for batch content alignment validation |
| `supabase/functions/validate-quiz-content-alignment/index.ts` | New | Edge function to check quiz-to-content alignment |
| `src/components/content-editor/LessonBrowser.tsx` | Modify | Add new button to grade stats panel |
| Database Migration | New | Add `needs_quiz_regeneration` column to lessons table |

---

## Technical Implementation Details

### 1. New Edge Function: `validate-quiz-content-alignment`

```typescript
// supabase/functions/validate-quiz-content-alignment/index.ts

interface ValidationRequest {
  lessonId: string;
  lessonTitle: string;
  gradeLevel: string;
  contenu: string;         // Only reference source #1
  exemples: string;        // Only reference source #2
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
}

// AI System Prompt (key part)
const systemPrompt = `Tu es un expert en validation de contenu pédagogique.

TÂCHE: Vérifier si chaque question de quiz peut être répondue UNIQUEMENT avec les informations du contenu fourni.

RÈGLES STRICTES:
1. Une question est "alignée" si TOUS les concepts nécessaires pour y répondre sont présents dans le contenu
2. Une question est "hors-contenu" si elle requiert des connaissances NON présentes dans le contenu
3. NE PAS juger si la réponse est correcte - seulement si elle est dérivable du contenu

EXEMPLES:
- Contenu parle de "la photosynthèse utilise le CO2"
- Question: "Quel gaz est utilisé dans la photosynthèse?" → ALIGNÉE
- Question: "Quelle est la formule chimique du glucose?" → HORS-CONTENU (si non mentionné)

Réponds avec un JSON structuré.`;
```

### 2. New Component: `BatchQuizContentValidator.tsx`

```typescript
interface BatchQuizContentValidatorProps {
  lessons: any[];           // All lessons WITH valid quizzes in grade
  gradeLevel: string;
  onComplete: () => void;
  onLessonFlagged: (lessonId: string) => void;
}

// Key states:
const [validationResults, setValidationResults] = useState<Map<string, {
  aligned: boolean;
  confidence: number;
  offContentCount: number;
}>>(new Map());

// Validation flow:
// 1. Iterate through each lesson
// 2. Fetch full content (contenu, exemples_exercices)
// 3. Parse quiz questions
// 4. Call edge function
// 5. If offContentQuestions.length > 0, mark lesson as needs_quiz_regeneration = true
// 6. Display results
```

### 3. Database Changes

```sql
-- Add columns for content alignment tracking
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS needs_quiz_regeneration boolean DEFAULT NULL,
ADD COLUMN IF NOT EXISTS content_alignment_score numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_content_validated_at timestamp with time zone DEFAULT NULL;

-- Create index for filtering
CREATE INDEX IF NOT EXISTS idx_lessons_needs_regeneration 
ON public.lessons (needs_quiz_regeneration) 
WHERE needs_quiz_regeneration = true;
```

### 4. LessonBrowser.tsx Modifications

```typescript
// Add new button below BatchQuizGenerator
{lessonsWithValidQuiz.length > 0 && (
  <div className="pt-2">
    <BatchQuizContentValidator 
      lessons={lessonsWithValidQuiz}
      gradeLevel={gradeLevel}
      onComplete={loadSubjects}
      onLessonFlagged={(lessonId) => {
        // Could add visual indicator
      }}
    />
  </div>
)}

// Add filter for "needs regeneration" lessons
const [showNeedsRegeneration, setShowNeedsRegeneration] = useState(false);

// Add badge to lesson items
{lesson.needs_quiz_regeneration && (
  <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
    ⚠ Régénérer
  </Badge>
)}
```

---

## User Experience Flow

1. **User selects a grade level** (e.g., 7AF)
2. **Stats panel shows** quiz coverage (202/204)
3. **User clicks "Valider alignement contenu"**
4. **Confirmation dialog** explains what will happen:
   - "Cette action va analyser 202 quizzes pour vérifier l'alignement avec le contenu de chaque leçon"
   - "Durée estimée: ~5 minutes"
5. **Progress tracking** shows current lesson being validated
6. **Results summary**:
   - "192 quizzes alignés avec le contenu ✓"
   - "10 quizzes nécessitent régénération ⚠"
7. **Flagged lessons** now show an amber badge in the browser
8. **User can filter** to see only flagged lessons
9. **User manually triggers regeneration** for each flagged lesson (or uses existing batch regeneration)

---

## Regeneration Constraint

When regeneration is triggered for flagged lessons:
- The existing `generate-quiz-final` edge function already uses `contenu` and `exemplesExercices` as the only source
- No code changes needed for regeneration—just ensure we pass the right fields
- After regeneration, `needs_quiz_regeneration` is set back to `false`

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | ✅ No | New feature only, existing buttons unchanged |
| Works with existing data? | ✅ Yes | Uses existing contenu, exemples, quiz_final fields |
| Backward compatible? | ✅ Yes | New columns have NULL default |
| 3G optimized? | ✅ Yes | Sequential processing with delays, shows progress |
| Edge cases handled? | ✅ Yes | Empty content, no quiz, AI rate limits |
| Separation of concerns? | ✅ Yes | Validation separate from generation |

---

## Performance Considerations

- **Rate limiting**: 2 second delay between AI calls (prevent 429 errors)
- **Batch size**: Process 5 lessons in parallel (configurable)
- **Content truncation**: Limit contenu + exemples to 15,000 chars to stay within token limits
- **Caching**: Store validation results in database to avoid re-validating unchanged lessons

---

## Summary of Deliverables

1. **New edge function**: `validate-quiz-content-alignment` - AI-powered content alignment detection
2. **New component**: `BatchQuizContentValidator.tsx` - Batch validation UI with progress
3. **Database migration**: Add `needs_quiz_regeneration` column to lessons table
4. **LessonBrowser updates**: New button, filter option, and visual badges for flagged lessons
5. **Regeneration integration**: Clear flag after successful regeneration

