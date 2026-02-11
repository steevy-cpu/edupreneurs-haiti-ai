
# Fix: Activities Generation — 10-15 Questions with Content Grounding

## Problem
The edge function `generate-interactive-activities` is producing only 2 activities instead of 10-15. Two issues:

1. **Question count too vague**: The prompt says "8-10 QUIZ + 5-7 TRUE_FALSE" but the AI often under-generates. Need a stricter minimum of 10-15 total questions.
2. **Content not grounded**: The user prompt just dumps `exercisesContent` as raw text without clearly labeling it as "Contenu de la lecon" and "Exemples et exercices". The AI needs explicit instructions that ALL questions must be based ONLY on the provided lesson content.

## Changes

### File: `supabase/functions/generate-interactive-activities/index.ts`

**1. Update the user prompt (both French and Creole versions, lines 274-304)**

Restructure the user prompt to:
- Clearly separate and label "CONTENU DE LA LECON" and "EXEMPLES ET EXERCICES" as distinct sections
- Change the question count instruction to: "Genere EXACTEMENT 10 a 15 questions au total: 7-10 questions QCM + 3-5 affirmations VRAI/FAUX"
- Add a grounding instruction: "TOUTES les questions doivent etre basees UNIQUEMENT sur le contenu ci-dessus. Ne pose JAMAIS de questions sur des sujets non couverts dans la lecon."

**2. Update the system prompt question count (lines 182, 261)**

Change rule 6 from:
```
Genere 8-10 questions QUIZ + 5-7 affirmations TRUE_FALSE
```
To:
```
Genere EXACTEMENT 10 a 15 questions au total: 7-10 questions QCM + 3-5 affirmations VRAI/FAUX. NE JAMAIS generer moins de 10 questions.
```

**3. Update input schema to accept separate contenu and exemples fields**

Add optional `contenu` and `exemplesExercices` fields to the Zod schema so the hook can pass them separately. Keep backward compatibility with `exercisesContent`.

**4. Update the hook to pass separate fields**

In `useAIGeneratedContent.ts` (line 231), change the body to pass `contenu` and `exemplesExercices` as separate fields alongside `exercisesContent` (for backward compat):

```typescript
body: {
  exercisesContent: combinedContent,  // kept for backward compat
  contenu: lessonContent,             // new: lesson main content
  exemplesExercices: lessonExamples,   // new: examples section
  lessonTitle,
  gradeLevel,
  subject: subjectName,
}
```

### Updated User Prompt (French version)

```
Lecon: "${lessonTitle}"
Niveau: ${gradeLevel}
Matiere: ${subject}

=== CONTENU DE LA LECON ===
${contenu}

=== EXEMPLES ET EXERCICES DE LA LECON ===
${exemplesExercices}

INSTRUCTIONS CRITIQUES:
- Genere EXACTEMENT 10 a 15 questions au total
- 7 a 10 questions QCM (choix multiples avec 4 options A, B, C, D)
- 3 a 5 affirmations VRAI/FAUX
- TOUTES les questions doivent etre basees UNIQUEMENT sur le contenu ci-dessus
- Ne pose JAMAIS de questions sur des sujets non couverts dans la lecon
- Les options doivent etre sur des lignes separees: "A) texte"
- Separe les questions/affirmations avec "---"
- Fournis une explication claire pour chaque reponse
```

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/generate-interactive-activities/index.ts` | Update prompts: question count 10-15, content grounding, separate contenu/exemples |
| `src/features/matieres/hooks/useAIGeneratedContent.ts` | Pass `contenu` and `exemplesExercices` as separate body fields |

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- backward compat with exercisesContent maintained |
| Works with existing data? | Yes -- uses lesson.contenu which all lessons have |
| 3G optimized? | Yes -- same single request, just better prompt |
| Edge cases handled? | Yes -- if contenu is empty, falls back to exercisesContent |
| Backward compatible? | Yes -- old cached data still renders, new generations get 10-15 questions |
