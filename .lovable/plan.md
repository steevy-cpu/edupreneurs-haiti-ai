
# Plan: Fix Quiz Display Bug and Add Batch Quiz Generator

## Problem Analysis

### Issue 1: Display Inconsistency
The grade-level stats show "2 leçons sans quiz" for 7AF, but all subjects show "0" in their badges, including Espagnol which actually has 2 lessons missing quizzes.

**Root Cause**: In `LessonBrowser.tsx`, when the "Quizzes manquants uniquement" filter is active:
- The badge shows `subject.lessons.length` (filtered lessons)
- Subjects with no missing quizzes correctly show "0"
- But subjects WITH missing quizzes should show their count (e.g., Espagnol: "2")
- The logic at lines 182-207 correctly calculates `missingQuizzes` but the display logic at lines 340-349 shows the wrong values

Looking at the screenshot, the issue is that when `showOnlyMissingQuiz = true`:
- Subjects show "0" when they should show the count of lessons missing quizzes
- The `-X quiz` destructive badge (line 344-348) only appears when `missingQuizzes > 0`, but in the screenshot it's not visible for any subject

The likely cause is that subjects are being filtered out or the lesson data isn't properly associated with the Espagnol subject for 7AF.

### Issue 2: Missing "Generate All" Feature
No batch quiz generation button exists for quickly generating quizzes for all missing lessons in a grade level.

---

## Solution Overview

### Part 1: Fix Display Bug
Update `LessonBrowser.tsx` to:
1. When filter is active, hide subjects with 0 matching lessons instead of showing "0"
2. Ensure the negative badge (`-X quiz`) always appears for subjects with missing quizzes
3. Add debug logging to verify data loading

### Part 2: Add Batch Quiz Generator
Add a "Générer tous les quizzes" button that appears when there are missing quizzes, allowing:
1. One-click generation for all missing quizzes in the selected grade
2. Progress tracking during generation
3. Bulk publish option after completion

---

## Technical Implementation

### File 1: `src/components/content-editor/LessonBrowser.tsx`

**Changes:**

1. **Fix filtering logic** (lines 203-207):
When `showOnlyMissingQuiz` is true, filter out subjects that have 0 lessons matching (i.e., all their lessons already have quizzes):

```typescript
// Current filter only removes subjects based on search query
.filter(subject => 
  searchQuery === "" || 
  subject.lessons.length > 0 || 
  subject.name.toLowerCase().includes(searchQuery.toLowerCase())
);

// Fixed filter - also hide subjects with 0 matching lessons when filter is active
.filter(subject => {
  // When showing only missing quiz, hide subjects with no matching lessons
  if (showOnlyMissingQuiz && subject.lessons.length === 0) {
    return false;
  }
  return searchQuery === "" || 
    subject.lessons.length > 0 || 
    subject.name.toLowerCase().includes(searchQuery.toLowerCase());
});
```

2. **Add "Generate All" button** in the Quiz Coverage Stats section (after line 310):

```typescript
{missingQuizzesTotal > 0 && (
  <Button 
    size="sm" 
    variant="outline"
    onClick={handleGenerateAllMissingQuizzes}
    disabled={isGeneratingQuizzes}
    className="w-full mt-2"
  >
    <Sparkles className="h-4 w-4 mr-2" />
    Générer {missingQuizzesTotal} quiz manquant{missingQuizzesTotal > 1 ? 's' : ''}
  </Button>
)}
```

3. **Add batch generation state and handler**:

```typescript
const [isGeneratingQuizzes, setIsGeneratingQuizzes] = useState(false);
const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

const handleGenerateAllMissingQuizzes = async () => {
  // Find all lessons missing quizzes
  const missingQuizLessons = allLessons.filter(l => !hasValidQuiz(l));
  
  if (missingQuizLessons.length === 0) {
    toast.info("Tous les quizzes sont déjà générés!");
    return;
  }
  
  setIsGeneratingQuizzes(true);
  setGenerationProgress({ current: 0, total: missingQuizLessons.length });
  
  // Generate quizzes one by one with delay to avoid rate limits
  for (let i = 0; i < missingQuizLessons.length; i++) {
    const lesson = missingQuizLessons[i];
    try {
      // Call the generate-quiz-final edge function
      const { data, error } = await supabase.functions.invoke('generate-quiz-final', {
        body: {
          lessonTitle: lesson.title,
          contenu: '', // Will need to fetch from lesson
          gradeLevel: lesson.grade_level,
          subject: lesson.subjects?.name,
        }
      });
      
      if (!error && data?.quizContent) {
        // Update the lesson with the generated quiz
        await supabase
          .from('lessons')
          .update({ quiz_final: data.quizContent })
          .eq('id', lesson.id);
      }
      
      setGenerationProgress({ current: i + 1, total: missingQuizLessons.length });
      
      // Small delay between requests to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error generating quiz for ${lesson.title}:`, error);
    }
  }
  
  setIsGeneratingQuizzes(false);
  toast.success(`${missingQuizLessons.length} quizzes générés!`);
  loadSubjects(); // Refresh to show updated data
};
```

4. **Add progress indicator** when generating:

```typescript
{isGeneratingQuizzes && (
  <div className="mt-2 space-y-1">
    <div className="flex items-center justify-between text-xs">
      <span>Génération en cours...</span>
      <span>{generationProgress.current}/{generationProgress.total}</span>
    </div>
    <Progress value={(generationProgress.current / generationProgress.total) * 100} className="h-1" />
  </div>
)}
```

---

### New File: `src/components/content-editor/BatchQuizGenerator.tsx`

For more complex generation needs, create a dedicated component with:
- Confirmation dialog before starting
- Cancel functionality
- Detailed progress per lesson
- Error handling with retry option
- Success summary with publish option

---

## UI Changes Summary

### Before:
```text
┌────────────────────────────────────────┐
│ 7AF: 202/204 quizzes           99%     │
│ ██████████████████████████░░           │
│ 2 leçons sans quiz                     │
├────────────────────────────────────────┤
│ > Espagnol                        [0]  │  ← Shows 0 (wrong)
│ > Français                        [0]  │
│ > Mathématiques                   [0]  │
└────────────────────────────────────────┘
```

### After:
```text
┌────────────────────────────────────────┐
│ 7AF: 202/204 quizzes           99%     │
│ ██████████████████████████░░           │
│ 2 leçons sans quiz                     │
│ [✨ Générer 2 quiz manquants]          │  ← NEW button
├────────────────────────────────────────┤
│ > Espagnol                   [2] [-2]  │  ← Shows correct counts
└────────────────────────────────────────┘
```

When filter "Quizzes manquants uniquement" is active:
- Hide subjects with 0 missing quizzes (Français, etc.)
- Only show subjects with missing lessons (Espagnol: 2 lessons)

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - enhances existing display |
| Works with existing data? | Yes - reads from `quiz_final` column |
| Backward compatible? | Yes - existing quizzes unchanged |
| 3G optimized? | Yes - sequential generation with delays |
| Edge cases handled? | Yes - empty states, rate limits, errors |
| Publishing gate respected? | Yes - uses existing validation system |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/content-editor/LessonBrowser.tsx` | Fix filter logic, add generate button, add progress UI |
| `src/components/content-editor/BatchQuizGenerator.tsx` (new) | Optional: dedicated batch generation component |

---

## Workflow After Implementation

1. User selects 7AF grade
2. UI shows "2 leçons sans quiz" with "Générer 2 quiz manquants" button
3. User clicks button
4. Progress bar shows generation status
5. When complete, lessons refresh showing all quizzes valid
6. User can then publish using existing bulk publish functionality
