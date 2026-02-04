
# Plan: Enhanced AI Grounding for Jude Exam Tutor

## Problem Summary

Jude (the exam tutor) lacks ground-truth `correct_answer` data for 93% of exercises. When students submit answers, Jude must evaluate correctness without a definitive answer key, leading to potential inaccuracies.

**Current Data Coverage:**
| Subject | Exercises | Has Answer | Has Reference Text |
|---------|-----------|------------|-------------------|
| Sciences sociales | 249 | 0% | 0% |
| Français | 244 | 0.4% | **100%** |
| Espagnol | 242 | 2.5% | **100%** |
| Anglais | 219 | 3.2% | **100%** |
| Créole | 182 | 1.6% | **100%** |
| Mathématiques | 204 | 44% | 0% |
| Sciences expérimentales | 226 | 4.4% | 0% |

**Key Insight:** Language subjects have **reference texts** that can be used to derive correct answers. The AI just needs better grounding instructions.

---

## Solution: Subject-Aware Grounding System

Enhance the `exam-tutor` edge function with:

1. **Subject-Specific Evaluation Strategies** - Different grounding rules per subject type
2. **Reference Text Extraction Mode** - Force AI to cite evidence from texts
3. **Confidence Scoring** - When uncertain, express confidence level
4. **Cautious Mode** - When no ground truth exists, avoid definitive grading

---

## Technical Implementation

### 1. Subject Detection & Strategy Selection

Add subject detection to route to appropriate evaluation strategy:

```typescript
type SubjectType = 'language' | 'math' | 'science' | 'social' | 'unknown';

function detectSubjectType(exercise: any): SubjectType {
  const concept = (exercise.concept || '').toLowerCase();
  const question = (exercise.question_text || '').toLowerCase();
  
  // Language indicators
  if (/reading|writing|compréhension|grammaire|vocabulaire|text/i.test(concept)) {
    return 'language';
  }
  
  // Math indicators
  if (/math|calcul|équation|géométrie|algèbre|statistique/i.test(concept)) {
    return 'math';
  }
  
  // Science indicators
  if (/science|physique|chimie|biologie|svt/i.test(concept)) {
    return 'science';
  }
  
  return 'unknown';
}
```

### 2. Enhanced System Prompt with Grounding Rules

**For Language Subjects (with reference texts):**

```text
**RÈGLES D'ÉVALUATION - Mode Texte de Référence:**

Tu as accès aux TEXTES DE RÉFÉRENCE de l'examen. Pour évaluer les réponses:

1. **TOUJOURS CITER** le passage exact du texte qui justifie la réponse
2. Pour les QCM: L'option correcte est celle qui correspond au texte
3. Pour les questions ouvertes: La réponse doit être trouvable/déductible du texte
4. Si la question demande une opinion, accepte toute réponse cohérente

**Format de réponse pour vérification:**
- "Dans le texte, on lit: «[citation exacte]». Donc la bonne réponse est [X]."
- Si la réponse n'est pas dans le texte: "Cette question demande ton opinion/analyse."
```

**For Math Subjects (computable answers):**

```text
**RÈGLES D'ÉVALUATION - Mode Mathématique:**

1. **RÉSOUS** le problème étape par étape
2. **MONTRE** ton calcul complet
3. Compare le résultat de l'élève avec ta solution
4. Pour les équations: Vérifie en substituant la valeur

**Format de réponse:**
- "Voici la solution: [calcul]. La réponse correcte est [X]."
- Si l'élève a fait une erreur: "Tu as fait une erreur à l'étape [N]: [explication]"
```

**For Questions Without Ground Truth:**

```text
**RÈGLES D'ÉVALUATION - Mode Prudent (pas de réponse confirmée):**

ATTENTION: Aucune réponse correcte n'est définie pour cette question.

1. **NE JAMAIS dire** "Tu as raison" ou "Tu as tort" de façon définitive
2. **GUIDER** l'élève avec des questions: "As-tu pensé à...?"
3. **EXPLIQUER** le concept sans confirmer/infirmer
4. **ÊTRE TRANSPARENT**: "Je n'ai pas la réponse officielle, mais voici comment raisonner..."
```

### 3. Reference Text Extraction Logic

Force the AI to ground answers in provided texts:

```typescript
function buildReferenceGroundingPrompt(referenceTexts: any[]): string {
  if (!referenceTexts?.length) return '';
  
  return `
**TEXTES DE RÉFÉRENCE (TU DOIS CITER CES TEXTES):**

${referenceTexts.map((ref, i) => `
[Document ${i + 1}${ref.title ? `: ${ref.title}` : ''}]
${ref.text}
`).join('\n')}

**INSTRUCTION CRITIQUE:**
- Pour chaque réponse, tu DOIS citer le passage exact qui la justifie
- Utilise le format: 《passage cité》 pour les citations
- Si l'information n'est pas dans le texte, dis-le clairement
`;
}
```

### 4. Confidence-Based Response

Add confidence indication when grading without ground truth:

```typescript
interface TutorGrading {
  isCorrect?: boolean;
  confidence?: 'high' | 'medium' | 'low';  // NEW
  reasoning?: string;  // NEW: Why we think it's correct/incorrect
  pointsAwarded?: number | null;
  correctAnswer?: string | null;
}
```

---

## File Changes

### File: `supabase/functions/exam-tutor/index.ts`

**Changes:**
1. Add `detectSubjectType()` function
2. Add `buildReferenceGroundingPrompt()` function  
3. Modify system prompt construction to use subject-specific strategies
4. Add confidence scoring to grading response
5. Add "cautious mode" when no `correct_answer` exists

---

## Enhanced System Prompt Structure

```text
Tu es Jude, un tuteur pédagogique haïtien...

[Base instructions - kept]

**EXERCICE ACTUEL:**
Question: {question_text}
Options: {options if any}
Concept: {concept}

**CONTEXTE D'ÉVALUATION:**
Type de sujet: {language|math|science|unknown}
Réponse correcte connue: {oui/non}
Textes de référence disponibles: {oui/non}

[Subject-specific grounding rules based on context]

**TEXTES DE RÉFÉRENCE:**
[Full reference texts with citation instructions]
```

---

## Example: Before vs After

**Before (current behavior):**
```
Student: "A" (for a reading comprehension question)
Jude: "Tu as tort! La bonne réponse est B."  
[But Jude doesn't know the actual answer - guessed based on AI inference]
```

**After (grounded behavior):**
```
Student: "A" (for a reading comprehension question)
Jude: "Dans le texte, on lit: «Elle avait deux filles de son humeur». 
Cela signifie que la belle-mère avait deux filles. Donc la réponse 
correcte est bien A! Bravo! 🎉"
[Grounded in the actual reference text]
```

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Adds to existing prompt, doesn't remove |
| Works with existing data? | Yes | Uses available reference_texts |
| 3G optimized? | Yes | Same token count, no extra API calls |
| Backward compatible? | Yes | Response format unchanged |
| Edge cases handled? | Yes | Fallback for missing data |

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/exam-tutor/index.ts` | Add subject detection, grounding prompts, confidence scoring |

---

## Expected Outcomes

1. **Language subjects**: Jude cites reference texts to justify answers
2. **Math subjects**: Jude shows step-by-step solutions
3. **Unknown answers**: Jude guides without false confidence
4. **Overall**: More accurate, trustworthy tutoring experience
