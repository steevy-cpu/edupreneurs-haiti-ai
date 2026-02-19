
# Exams Plan C — Data Quality Improvements for Exercise Editor

## Scope
4 targeted fixes across 4 files + 1 new edge function. No database changes. No SQL. No existing functionality touched outside these files.

---

## File Change Summary

| File | Change | Fix |
|---|---|---|
| `src/features/exams/admin/components/QualityIndicators.tsx` | Rename label + add tooltip | Fix 1 |
| `src/features/exams/admin/components/ExamDetailEditor.tsx` | Update filter label + pass exam context to ExerciseCard | Fix 1 + Fix 2 |
| `src/features/exams/admin/components/ExerciseCard.tsx` | Add AI generate button + Textarea for open_ended | Fix 2 + Fix 3 |
| `src/features/exams/admin/components/ExistingExamsList.tsx` | Zero-exercise warning badge + disable edit button | Fix 4 |
| `supabase/functions/generate-exercise-explanation/index.ts` | New edge function for AI explanation generation | Fix 2 |
| `supabase/config.toml` | Add `[functions.generate-exercise-explanation]` entry | Fix 2 |

---

## Fix 1 — Improve Quality Indicator Labels

### Part A — QualityIndicators.tsx

**Change 1:** Replace label `"Contenu structuré"` (line 127) with `"Contenu extrait par IA"`.

**Change 2:** Add a small info icon with a tooltip next to the new label. Import `{ Tooltip, TooltipContent, TooltipTrigger }` from `@/components/ui/tooltip` and `{ Info }` from `lucide-react`.

```tsx
// Before (line 126-127):
<div className="flex items-center gap-2">
  {getIcon(metrics.blocksPercent)}
  <span>Contenu structuré</span>
</div>

// After:
<div className="flex items-center gap-2">
  {getIcon(metrics.blocksPercent)}
  <span>Contenu extrait par IA</span>
  <Tooltip>
    <TooltipTrigger asChild>
      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
    </TooltipTrigger>
    <TooltipContent side="right" className="max-w-xs">
      Les exercices dont le contenu a été extrait automatiquement par l'IA depuis le PDF.
    </TooltipContent>
  </Tooltip>
</div>
```

**Note:** The `TooltipProvider` is already mounted at the root level of the app (in the provider stack), so no local `TooltipProvider` wrapper is needed here.

### Part B — ExamDetailEditor.tsx

Update `getFilterLabel` (line 81) to rename the filter button label:
```ts
// Before:
case 'missing-blocks': return 'Sans contenu structuré';

// After:
case 'missing-blocks': return 'Sans extraction IA';
```

---

## Fix 2 — AI Explanation Generation for Open-Ended Exercises

This is the most complex fix. It requires a new edge function and changes to ExerciseCard's interface and internal state.

### Part A — New Edge Function: `generate-exercise-explanation`

**File:** `supabase/functions/generate-exercise-explanation/index.ts`

A simple, non-streaming POST endpoint. Receives `{ questionText, subject, gradeLevel, series }` and returns `{ explanation: string }`.

```ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questionText, subject, gradeLevel = 'NS4', series } = await req.json();

    if (!questionText || !subject) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: questionText, subject" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context-aware system prompt for the Haitian Baccalauréat
    const examContext = gradeLevel === 'NS4'
      ? `Baccalauréat haïtien (NS4)${series ? ` — Série ${series}` : ''}`
      : `9ème Année Fondamentale haïtienne (9AF)`;

    const systemPrompt = `Tu es un professeur expert en ${subject} pour le ${examContext}.
Génère une réponse modèle complète et pédagogique pour la question suivante.
La réponse doit:
- Être adaptée au niveau ${gradeLevel} haïtien
- Inclure toutes les étapes de raisonnement (pour les matières scientifiques)
- Utiliser la notation LaTeX pour les formules mathématiques (ex: $E = mc^2$)
- Être rédigée en français académique clair
- Ne pas dépasser 300 mots
Retourne uniquement la réponse modèle, sans introduction ni conclusion sur ta tâche.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Question: ${questionText}` },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits insuffisants pour générer une explication." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content?.trim();

    if (!explanation) throw new Error("Empty response from AI");

    return new Response(
      JSON.stringify({ explanation }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-exercise-explanation error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

**config.toml addition** (after the `parse-exam-vision` block):
```toml
[functions.generate-exercise-explanation]
verify_jwt = false
```

### Part B — ExamDetailEditor.tsx: Pass exam context to ExerciseCard

ExerciseCard currently receives no context about the exam it belongs to. The `ExamDetailEditor` has `exam.subject`, `exam.grade_level`, and `exam.series` readily available.

Add three new props to each `ExerciseCard` call in the `filteredExercises.map()` (line 181–188):
```tsx
<ExerciseCard
  key={exercise.id}
  exercise={exercise}
  onUpdate={(updates) => handleUpdateExercise(exercise.id, updates)}
  onDelete={() => handleDeleteExercise(exercise.id)}
  isUpdating={updatingId === exercise.id}
  examSubject={exam.subject}
  examGradeLevel={exam.grade_level}
  examSeries={exam.series ?? undefined}
/>
```

### Part C — ExerciseCard.tsx: Generate button + preview state

**New props added to `ExerciseCardProps` interface:**
```ts
interface ExerciseCardProps {
  exercise: DbExamExercise;
  onUpdate: (updates: Partial<Pick<DbExamExercise, 'correct_answer' | 'explanation' | 'concept' | 'points'>>) => void;
  onDelete: () => void;
  isUpdating?: boolean;
  isExpanded?: boolean;
  // Exam context for AI explanation generation
  examSubject?: string;
  examGradeLevel?: string;
  examSeries?: string;
}
```

**New state inside the component:**
```ts
// AI explanation generation state
const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);
const [isGenerating, setIsGenerating] = useState(false);
```

**New handler:**
```ts
const handleGenerateExplanation = useCallback(async () => {
  setIsGenerating(true);
  try {
    const { data, error } = await supabase.functions.invoke('generate-exercise-explanation', {
      body: {
        questionText: exercise.question_text,
        subject: examSubject,
        gradeLevel: examGradeLevel,
        series: examSeries,
      },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    // Show preview — do not overwrite explanation directly
    setGeneratedPreview(data.explanation);
  } catch (err: any) {
    toast.error(err.message || "Erreur lors de la génération de l'explication");
  } finally {
    setIsGenerating(false);
  }
}, [exercise.question_text, examSubject, examGradeLevel, examSeries]);
```

Need to add `import { supabase } from "@/integrations/supabase/client"` and `import { toast } from "sonner"`.

**Render logic below the Explanation Textarea:**

Show the generate button only when: `!isMCQ` (open_ended) AND `!hasExplanation` AND no preview is already showing.

Show the preview panel when `generatedPreview !== null`.

```tsx
{/* AI Explanation Generator — only for open_ended exercises with empty explanation */}
{!isMCQ && !hasExplanation && !generatedPreview && (
  <Button
    variant="outline"
    size="sm"
    onClick={handleGenerateExplanation}
    disabled={isGenerating}
    className="w-full"
  >
    {isGenerating ? (
      <>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Génération en cours...
      </>
    ) : (
      <>
        <Sparkles className="h-4 w-4 mr-2" />
        Générer une explication
      </>
    )}
  </Button>
)}

{/* AI-generated explanation preview — user must click Appliquer to apply */}
{generatedPreview !== null && (
  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
    <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400">
      <Sparkles className="h-4 w-4" />
      Explication générée par l'IA
    </div>
    <p className="text-sm whitespace-pre-wrap">{generatedPreview}</p>
    <div className="flex gap-2 pt-1">
      <Button
        size="sm"
        onClick={() => {
          // Apply the AI preview to the explanation field
          setExplanation(generatedPreview);
          setGeneratedPreview(null);
        }}
      >
        Appliquer
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setGeneratedPreview(null)}
      >
        Annuler
      </Button>
    </div>
  </div>
)}
```

Add `Sparkles` to the lucide-react import list.

**Safety guarantee:** `setExplanation(generatedPreview)` only runs inside the "Appliquer" click handler. The existing `explanation` state is never mutated by `handleGenerateExplanation` itself. The preview is a separate `generatedPreview` state. Clicking "Annuler" clears `generatedPreview` without touching `explanation`.

---

## Fix 3 — Textarea for Open-Ended Correct Answer

**File:** `src/features/exams/admin/components/ExerciseCard.tsx`

In the `{/* Correct Answer */}` block, the `else` branch (line 185–192) currently renders a single-line `Input`. Replace it with a `Textarea`:

```tsx
// Before (lines 185-192):
) : (
  <Input
    id={`answer-${exercise.id}`}
    value={correctAnswer}
    onChange={(e) => setCorrectAnswer(e.target.value)}
    placeholder="Entrer la réponse..."
  />
)}

// After:
) : (
  // Textarea for open_ended: NS4 model answers can be multi-line
  <Textarea
    id={`answer-${exercise.id}`}
    value={correctAnswer}
    onChange={(e) => setCorrectAnswer(e.target.value)}
    placeholder="Entrer la réponse modèle..."
    rows={3}
    className="resize-y"
  />
)}
```

`Textarea` is already imported at line 8. No new imports needed.

**MCQ safety:** `isMCQ` is computed at line 112. The `Select` component renders when `isMCQ === true`, the `Textarea` only renders when `isMCQ === false`. These are mutually exclusive branches — MCQ display is unchanged.

---

## Fix 4 — Zero Exercise Warning in ExistingExamsList

**File:** `src/features/exams/admin/components/ExistingExamsList.tsx`

Add a computed boolean per exam card:
```ts
const hasNoExercises = exam.total_exercises === 0;
```

**In the exam card's badge row** (after line 180 in the flex wrap div), add:
```tsx
{hasNoExercises && (
  <Badge variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-500 text-xs">
    Aucun exercice — Re-upload requis
  </Badge>
)}
```

**Disable the Pencil edit button** when `hasNoExercises`:
```tsx
{onEditExam && (
  <Button
    variant="ghost"
    size="icon"
    onClick={() => !hasNoExercises && onEditExam(exam)}
    disabled={hasNoExercises}  // nothing to edit if no exercises
    title={hasNoExercises ? "Aucun exercice à modifier" : "Modifier les exercices"}
  >
    <Pencil className="h-4 w-4" />
  </Button>
)}
```

**Precision:** `total_exercises` is the value stored in the `official_exams` row. After Plan A cleanup, all remaining rows with `total_exercises = 0` are ghost entries. For future ghost entries (e.g. failed ingestion runs), this warning will appear automatically. For non-zero rows, the badge is never rendered.

---

## Data Flow for Fix 2 (AI Generation)

```text
ExamDetailEditor (has exam.subject, exam.grade_level, exam.series)
    ↓ props: examSubject, examGradeLevel, examSeries
ExerciseCard (button visible when !isMCQ && !hasExplanation && !generatedPreview)
    ↓ supabase.functions.invoke('generate-exercise-explanation')
generate-exercise-explanation edge function
    ↓ fetch("https://ai.gateway.lovable.dev/v1/chat/completions")
Lovable AI Gateway (google/gemini-2.5-flash)
    ↓ response.explanation
ExerciseCard → setGeneratedPreview(explanation)  [preview panel shown]
    ↓ user clicks "Appliquer"
setExplanation(generatedPreview)  [explanation field updated, preview cleared]
    ↓ user clicks "Enregistrer"
onUpdate({ explanation: ... })  [saved to database]
```

---

## Safety Verification Table

| Risk | Analysis | Status |
|---|---|---|
| AI preview overwrites existing explanation without "Appliquer" | `handleGenerateExplanation` only calls `setGeneratedPreview()`, never `setExplanation()`. `setExplanation()` is called exclusively inside the "Appliquer" click handler. | Safe |
| Textarea for correct_answer breaks MCQ display | The `Select` (MCQ) and `Textarea` (open_ended) are in mutually exclusive branches of `isMCQ` conditional. MCQ exercises are unchanged. | Safe |
| Zero-exercise badge appears on valid exams | `hasNoExercises = exam.total_exercises === 0`. Valid exams always have `total_exercises > 0` after Plan A cleanup. Badge only renders when condition is true. | Safe |
| "Générer une explication" button shows on MCQ exercises | Button render condition: `!isMCQ && !hasExplanation && !generatedPreview`. `!isMCQ` is false for all MCQ exercises. Button cannot appear. | Safe |
| Adding tooltip to QualityIndicators without local TooltipProvider | `TooltipProvider` is mounted at app root in the provider stack. All descendants can use Tooltip without wrapping locally. | Safe |
| New edge function uses LOVABLE_API_KEY | `LOVABLE_API_KEY` is auto-provisioned as a Supabase secret. No user input required. Matches existing pattern from `parse-exam-vision`. | Safe |
| Edge function cold start blocks the UI | The generate button shows a loading spinner with `isGenerating` state. The UI remains interactive. No page-level blocking. | Safe |
| `examSubject/examGradeLevel/examSeries` props are undefined for 9AF exams | All three are optional props with `undefined` as the valid fallback. The edge function defaults `gradeLevel = 'NS4'` if omitted, which is fine since the generate button only appears for open_ended exercises which are predominantly NS4. | Safe |
