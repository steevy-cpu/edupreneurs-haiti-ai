
# Plan: Phase 3B - Quick-Action Regenerate Buttons in Validation Panels

## Objective
Add "Regenerate" buttons directly to the `ValidationDetailsPanel` component, allowing editors to regenerate quiz or activities with one click without leaving the lesson browser.

## Current State Analysis

**ValidationDetailsPanel:**
- Currently a display-only component
- Shows validation issues grouped by category
- Has a recommendation text at the bottom suggesting regeneration
- No action capability yet

**LessonBrowser Context:**
- Renders `ValidationDetailsPanel` for selected lessons with issues
- Has full lesson object available (id, title, contenu, exemples_exercices, grade_level)
- Currently doesn't have regeneration logic

**Regeneration Pattern:**
- Existing `regenerateQuiz()` and `regenerateActivities()` functions in `LessonValidationPanel.tsx` provide the template
- Both invoke edge functions (`generate-quiz-final`, `generate-interactive-activities`)
- Both update the database and clear validation flags
- Both handle loading states and toast notifications

## Technical Implementation

### Step 1: Enhance ValidationDetailsPanel Props
**File:** `src/components/content-editor/ValidationDetailsPanel.tsx`

Add optional callback and loading state:
```typescript
interface ValidationDetailsPanelProps {
  lessonTitle: string;
  validationType: "quiz" | "activities";
  offContentQuestions: OffContentQuestion[];
  aligned: boolean;
  confidence: number;
  onRegenerate?: () => Promise<void>;  // NEW
  isRegenerating?: boolean;              // NEW
}
```

Update component signature:
```typescript
export const ValidationDetailsPanel = ({
  lessonTitle,
  validationType,
  offContentQuestions,
  aligned,
  confidence,
  onRegenerate,        // NEW
  isRegenerating = false, // NEW
}: ValidationDetailsPanelProps) => {
```

### Step 2: Add Regenerate Button to ValidationDetailsPanel
**Location:** In the recommendation section (around line 128-133)

Replace the static recommendation text with an actionable button:
```typescript
<div className="mt-4 pt-3 border-t border-amber-200">
  <p className="text-xs text-amber-700 mb-2">
    <span className="font-medium">Recommandation:</span> Régénérez le{" "}
    {validationType === "quiz" ? "quiz" : "les activités"} pour résoudre ces problèmes.
  </p>
  {onRegenerate && (
    <Button
      size="sm"
      variant="outline"
      onClick={onRegenerate}
      disabled={isRegenerating}
      className="w-full gap-2"
    >
      {isRegenerating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Régénération en cours...
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          Régénérer {validationType === "quiz" ? "le quiz" : "les activités"}
        </>
      )}
    </Button>
  )}
</div>
```

**Import needed icons:**
- Add `Loader2, RefreshCw` to lucide-react imports

### Step 3: Implement Regeneration Logic in LessonBrowser
**File:** `src/components/content-editor/LessonBrowser.tsx`

Add state tracking for regeneration:
```typescript
const [regeneratingLessonId, setRegeneratingLessonId] = useState<string | null>(null);
```

Add regeneration functions (adapted from LessonValidationPanel.tsx):
```typescript
const regenerateQuiz = async (lesson: any) => {
  if (!lesson?.id) return;
  
  setRegeneratingLessonId(lesson.id);
  try {
    const { data, error } = await supabase.functions.invoke('generate-quiz-final', {
      body: {
        lessonTitle: lesson.title,
        contenu: lesson.contenu || '',
        exemplesExercices: lesson.exemples_exercices || '',
        gradeLevel: lesson.grade_level,
        subject: lesson.subjects?.name || 'Matière',
      }
    });

    if (error) throw error;

    if (data?.quizContent) {
      await supabase
        .from('lessons')
        .update({ 
          quiz_final: data.quizContent,
          needs_quiz_regeneration: false,
          content_alignment_score: null,
          last_content_validated_at: null
        })
        .eq('id', lesson.id);

      toast.success("Quiz régénéré avec succès");
      // Refresh the lessons list to show updated state
      await loadSubjects();
      // Trigger dashboard refresh if callback provided
      onDashboardRefresh?.();
    }
  } catch (error) {
    console.error('Regeneration error:', error);
    toast.error("Erreur lors de la régénération");
  } finally {
    setRegeneratingLessonId(null);
  }
};

const regenerateActivities = async (lesson: any) => {
  if (!lesson?.id) return;
  
  setRegeneratingLessonId(lesson.id);
  try {
    const { data, error } = await supabase.functions.invoke('generate-interactive-activities', {
      body: {
        lessonId: lesson.id,
        exercisesContent: lesson.exemples_exercices || lesson.contenu || '',
        isCreole: lesson.grade_level?.includes('creole'),
      }
    });

    if (error) throw error;

    if (data?.content) {
      await supabase
        .from('lessons')
        .update({ 
          activites_interactives: data.content,
          needs_activities_regeneration: false,
          activities_alignment_score: null,
          last_activities_validated_at: null
        })
        .eq('id', lesson.id);

      toast.success("Activités régénérées avec succès");
      // Refresh the lessons list to show updated state
      await loadSubjects();
      // Trigger dashboard refresh if callback provided
      onDashboardRefresh?.();
    }
  } catch (error) {
    console.error('Regeneration error:', error);
    toast.error("Erreur lors de la régénération");
  } finally {
    setRegeneratingLessonId(null);
  }
};
```

### Step 4: Pass Callbacks to ValidationDetailsPanel
**Location:** In the lesson mapping where ValidationDetailsPanel is rendered (lines 489-506)

```typescript
{quizIssues.length > 0 && (
  <ValidationDetailsPanel
    lessonTitle={lesson.title}
    validationType="quiz"
    offContentQuestions={quizIssues}
    aligned={false}
    confidence={lesson.content_alignment_score || 0}
    onRegenerate={() => regenerateQuiz(lesson)}  // NEW
    isRegenerating={regeneratingLessonId === lesson.id}  // NEW
  />
)}
{activityIssues.length > 0 && (
  <ValidationDetailsPanel
    lessonTitle={lesson.title}
    validationType="activities"
    offContentQuestions={activityIssues}
    aligned={false}
    confidence={lesson.activities_alignment_score || 0}
    onRegenerate={() => regenerateActivities(lesson)}  // NEW
    isRegenerating={regeneratingLessonId === lesson.id}  // NEW
  />
)}
```

## Data Flow Diagram

```
LessonBrowser
  │
  ├─ State: regeneratingLessonId
  ├─ Function: regenerateQuiz(lesson)
  └─ Function: regenerateActivities(lesson)
     │
     ├─ Call edge function (generate-quiz-final or generate-interactive-activities)
     ├─ Update database
     ├─ Call loadSubjects() to refresh list
     ├─ Call onDashboardRefresh() to update quality dashboard
     └─ Pass callbacks down to ValidationDetailsPanel
        │
        └─ ValidationDetailsPanel
           ├─ Props: onRegenerate, isRegenerating
           ├─ Renders: Regenerate button
           └─ On click: Calls onRegenerate callback
```

## UX Flow

1. **User selects lesson** → Validation details appear below lesson title
2. **User sees issues** → "Régénérer le quiz/les activités" button is visible
3. **User clicks button** → Button enters loading state with spinner
4. **Regeneration runs** → Edge function generates new content, database updates
5. **Success** → Toast notification, lessons list refreshes, panel disappears (no more issues)
6. **Dashboard syncs** → Quality tab shows updated validation state via `onDashboardRefresh()`

## Safety Verification

| Check | Status | Details |
|-------|--------|---------|
| Breaks existing panel display? | No | Optional callback, panel works without it |
| Performance impact? | Minimal | Only renders button when callback provided |
| Handles loading state? | Yes | isRegenerating prop disables button and shows spinner |
| Database cleared properly? | Yes | Clears validation flags on successful regeneration |
| Dashboard syncs? | Yes | Calls onDashboardRefresh() after update |
| 3G compatible? | Yes | Uses same proven edge functions as batch validators |
| Error handling? | Yes | Try-catch with toast notifications |

## Files to Modify

| File | Changes | Complexity |
|------|---------|-----------|
| `src/components/content-editor/ValidationDetailsPanel.tsx` | Add optional props (onRegenerate, isRegenerating), add Regenerate button with loading state | Low |
| `src/components/content-editor/LessonBrowser.tsx` | Add regeneratingLessonId state, implement two regeneration functions, pass callbacks to panels | Medium |

**Total lines added:** ~100-120 lines

## Integration with Phase 2

Phase 2 callback (`onDashboardRefresh`) is already being passed to `LessonBrowser`. Phase 3B uses this same callback when regeneration completes, ensuring the Quality dashboard automatically updates.

## Expected Result

After implementation:
- ✓ Validation panels display regenerate buttons
- ✓ One-click regeneration without navigation
- ✓ Clear loading feedback during regeneration
- ✓ Automatic dashboard refresh on success
- ✓ Validation flags cleared after successful regeneration
- ✓ Lessons list updates immediately
- ✓ Toast notifications for success/error

## Future Enhancement Opportunities (Phase 3C+)

1. **Bulk regeneration:** Add "Regenerate all with concept issues" feature
2. **Selective regeneration:** Choose which issue categories to prioritize
3. **Progress tracking:** Show regeneration progress for lesson queue
4. **History logging:** Track regeneration attempts and results per lesson
5. **Comparison view:** Show before/after to understand what changed
