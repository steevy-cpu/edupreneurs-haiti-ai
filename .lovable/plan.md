
# Update Quiz and Activities Prompts for Strict Content Grounding

## Problem

The `generate-quiz-final` edge function (JSON mode, used by students) still combines `contenu` and `exemplesExercices` into a single `combinedContent` blob and passes it to the AI without clear separation or grounding instructions. This means:

1. The AI cannot distinguish lesson content from examples/exercises
2. No explicit instruction to base questions ONLY on provided content
3. Questions may be generic or unrelated to the actual lesson

The activities function was already fixed in the previous iteration. This plan applies the same fix to the quiz function.

## Changes

### File: `supabase/functions/generate-quiz-final/index.ts`

**1. Pass separate contenu/exemples to `generateJsonQuiz` (line 83-97)**

Instead of combining content at line 83 and passing `combinedContent`, pass `contenu` and `exemplesExercices` separately to the `generateJsonQuiz` function.

**2. Update `JsonQuizParams` interface (line 238-247)**

Replace `combinedContent: string` with:
- `contenu: string`
- `exemplesExercices: string`

**3. Rewrite JSON user prompts (lines 312-332)**

Replace the generic "Contenu de la lecon: combinedContent" with structured sections:

French version:
```
Titre: {lessonTitle}
Niveau: {gradeLevel}
Matiere: {subjectSlug}

=== CONTENU DE LA LECON ===
{contenu or 'Pas de contenu.'}

=== EXEMPLES ET EXERCICES DE LA LECON ===
{exemplesExercices or "Pas d'exemples."}

INSTRUCTIONS CRITIQUES:
- Genere EXACTEMENT 10 a 15 questions QCM
- TOUTES les questions doivent etre basees UNIQUEMENT sur le contenu
  et les exemples ci-dessus
- Ne pose JAMAIS de questions sur des sujets non couverts dans la lecon
- Chaque question doit tester la comprehension du contenu specifique
  de cette lecon
- Retourne UNIQUEMENT un objet JSON valide
```

Creole version: same structure translated to Kreyol.

**4. Update JSON system prompts (lines 254-310)**

Add a grounding rule to both French and Creole system prompts:
- "TOUTES les questions doivent etre basees UNIQUEMENT sur le contenu fourni dans la lecon. Ne genere JAMAIS de questions sur des sujets externes."

**5. Also update legacy HTML prompts (lines 164-184)**

Apply the same structured contenu/exemples separation and grounding instructions to the legacy HTML user prompts, for consistency if they are ever used.

### File: `supabase/functions/generate-interactive-activities/index.ts`

No changes needed -- already has structured contenu/exemples and grounding instructions.

### File: `src/features/matieres/hooks/useAIGeneratedContent.ts`

No changes needed -- already passes `contenu` and `exemplesExercices` separately to both edge functions.

## Technical Details

### Updated `generateJsonQuiz` signature

```typescript
interface JsonQuizParams {
  lessonTitle: string;
  lessonSlug: string;
  subjectSlug: string;
  gradeLevel: string;
  contenu: string;           // was: combinedContent
  exemplesExercices: string;  // new
  isCreoleLesson: boolean;
  language: 'fr' | 'ht' | 'en' | 'es';
  LOVABLE_API_KEY: string;
}
```

### Updated call site (line 87-97)

```typescript
return await generateJsonQuiz({
  lessonTitle,
  lessonSlug: ...,
  subjectSlug: ...,
  gradeLevel: gradeLevel || '7AF',
  contenu: contenu || '',
  exemplesExercices: exemplesExercices || '',
  isCreoleLesson,
  language,
  LOVABLE_API_KEY,
});
```

### stripHtml utility

The quiz function does NOT currently strip HTML from contenu/exemples before sending to the AI. The activities function does this (it has a `stripHtml` utility). We should add the same `stripHtml` processing in the quiz function to send clean text to the AI, improving question quality.

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/generate-quiz-final/index.ts` | Separate contenu/exemples in prompts, add grounding instructions, add stripHtml |

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- same JSON schema output, same validation |
| Works with existing data? | Yes -- uses lesson fields that all lessons have |
| 3G optimized? | Yes -- same single request, just better prompt |
| Edge cases handled? | Yes -- empty contenu/exemples show fallback text |
| Backward compatible? | Yes -- cached quizzes still render, new ones are better grounded |
| Activities affected? | No -- already fixed in previous iteration |
