
# Plan: Batch Regeneration for Already-Validated Lessons

## Problem Analysis

### Current State
- **601 lessons** have completed quiz validation, **537 of which** are flagged for regeneration (`needs_quiz_regeneration = true`)
- **399 lessons** have completed activities validation, **296 of which** are flagged for regeneration (`needs_activities_regeneration = true`)

### Current Workflow (Slow)
1. User runs validation
2. Validation flags lessons with `needs_*_regeneration = true`
3. User must click each lesson individually to see the ValidationDetailsPanel
4. User clicks "Regenerate" one by one

### Desired Workflow (Fast)
1. User runs validation
2. Validation flags lessons with issues
3. User clicks **one button** to regenerate ALL flagged content at once

---

## Solution Architecture

### Design Principles
1. **Super User Only**: Only admins/founders can trigger batch regeneration (safety gate)
2. **Reuse Existing Infrastructure**: Use the existing regeneration functions from LessonBrowser
3. **Progress Tracking**: Similar UX to BatchQuizGenerator with pause/resume
4. **3G Optimization**: Rate-limited sequential processing with delays

### New Data Flow

```text
Validation → Flags lessons → New "Regenerate All Flagged" button
                                        ↓
                              BatchRegenerator component
                                        ↓
                         For each flagged lesson:
                           1. Call edge function
                           2. Update lesson
                           3. Clear flags
                                        ↓
                              Dashboard refresh
```

---

## Implementation Details

### Part 1: Create BatchQuizRegenerator Component

**New File: `src/components/content-editor/BatchQuizRegenerator.tsx`**

This component will:
- Query lessons with `needs_quiz_regeneration = true` AND `last_content_validated_at IS NOT NULL`
- Show count of lessons needing regeneration
- Provide "Regenerate All" button (super users only)
- Process lessons sequentially with 2s delay
- Save progress on each lesson
- Support pause/cancel

Key structure:
```typescript
interface BatchQuizRegeneratorProps {
  lessons: any[];  // All lessons with valid quizzes
  gradeLevel: string;
  onComplete: () => void;
  onDashboardRefresh?: () => void;
}
```

Button will show:
- "Régénérer quizzes flaggés (X)"
- Stats: "X/Y flaggés pour régénération"

### Part 2: Create BatchActivitiesRegenerator Component

**New File: `src/components/content-editor/BatchActivitiesRegenerator.tsx`**

Same structure as BatchQuizRegenerator but for activities:
- Query lessons with `needs_activities_regeneration = true` AND `last_activities_validated_at IS NOT NULL`
- Call `generate-interactive-activities` edge function
- Clear flags and alignment scores on success

### Part 3: Update LessonBrowser to Include Regenerators

**File: `src/components/content-editor/LessonBrowser.tsx`**

Add the new batch regenerator components below the validation buttons:

```typescript
// After BatchQuizContentValidator
{lessonsNeedingQuizRegen.length > 0 && (
  <BatchQuizRegenerator 
    lessons={lessonsNeedingQuizRegen}
    gradeLevel={gradeLevel}
    onComplete={loadSubjects}
    onDashboardRefresh={onDashboardRefresh}
  />
)}

// After BatchActivitiesContentValidator
{lessonsNeedingActivitiesRegen.length > 0 && (
  <BatchActivitiesRegenerator 
    lessons={lessonsNeedingActivitiesRegen}
    gradeLevel={gradeLevel}
    onComplete={loadSubjects}
    onDashboardRefresh={onDashboardRefresh}
  />
)}
```

Add computed arrays:
```typescript
// Lessons already validated that need regeneration
const lessonsNeedingQuizRegen = lessonsWithValidQuiz.filter(
  l => l.needs_quiz_regeneration && l.last_content_validated_at
);

const lessonsNeedingActivitiesRegen = lessonsWithValidActivities.filter(
  l => l.needs_activities_regeneration && l.last_activities_validated_at
);
```

### Part 4: Permission Check (Super Users Only)

Use content editor roles or founder check:

```typescript
import { useContentEditorPermissions } from "@/hooks/useContentEditorPermissions";

// Inside component:
const { role } = useContentEditorPermissions();
const canBatchRegenerate = role === 'admin';
```

---

## UI Design

### Button Appearance (in validation stats section)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Valider alignement contenu                                          │
│  601/2832 déjà validés (21%)                                         │
├──────────────────────────────────────────────────────────────────────┤
│  🔄 Régénérer quizzes flaggés (537)                                  │ ← NEW
│  537 quiz nécessitent régénération                                   │
├──────────────────────────────────────────────────────────────────────┤
│  Valider alignement activités                                        │
│  399/2676 déjà validées (15%)                                        │
├──────────────────────────────────────────────────────────────────────┤
│  🔄 Régénérer activités flaggées (296)                               │ ← NEW
│  296 activités nécessitent régénération                              │
└──────────────────────────────────────────────────────────────────────┘
```

### Progress View (during regeneration)

```
┌──────────────────────────────────────────────────────────────────────┐
│  🔄 Régénération en cours...                     [Pause & Sauvegarder]│
│  ───────────────────────────────────[======>     ]───── 142/537       │
│  Les fractions décimales...                                          │
│  ✓ 120 régénérés  ⚠ 22 erreurs                                       │
│  📝 Sauvegarde automatique après chaque leçon                        │
└──────────────────────────────────────────────────────────────────────┘
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/content-editor/BatchQuizRegenerator.tsx` | CREATE | Batch regeneration for flagged quizzes |
| `src/components/content-editor/BatchActivitiesRegenerator.tsx` | CREATE | Batch regeneration for flagged activities |
| `src/components/content-editor/LessonBrowser.tsx` | UPDATE | Add regenerator components + computed arrays |

---

## Processing Logic

### For Each Lesson (Quiz):
```typescript
1. Fetch full lesson content (contenu, exemples_exercices, subjects)
2. Call generate-quiz-final edge function
3. Update lesson:
   - quiz_final = generated content
   - needs_quiz_regeneration = false
   - content_alignment_score = null (reset for re-validation)
   - last_content_validated_at = null (reset)
   - validation_details_json = null or clear quiz portion
4. Rate limit: wait 2 seconds before next
```

### For Each Lesson (Activities):
```typescript
1. Fetch full lesson content
2. Call generate-interactive-activities edge function
3. Update lesson:
   - activites_interactives = generated content
   - needs_activities_regeneration = false
   - activities_alignment_score = null
   - last_activities_validated_at = null
4. Rate limit: wait 2 seconds before next
```

---

## 3G Performance Considerations

| Aspect | Solution |
|--------|----------|
| Edge function calls | 2-second delay between calls |
| Batch size | Sequential (not parallel) to avoid timeouts |
| Progress persistence | Update DB after each lesson |
| Network failures | Logged as errors, continue with next |
| Pause support | AbortRef pattern for clean cancellation |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Super user only? | Yes | Admin role check before showing button |
| Preserves original content? | Yes | Only regenerates quiz/activities |
| Backward compatible? | Yes | New feature, no breaking changes |
| Clears validation flags? | Yes | Resets for re-validation cycle |
| Progress saved on cancel? | Yes | Each lesson saved immediately |
| Works with existing dashboard? | Yes | Triggers onDashboardRefresh |

---

## Edge Cases Handled

| Case | Solution |
|------|----------|
| No lessons need regeneration | Button hidden |
| Lesson has no content to base generation on | Skip with error logged |
| Edge function fails | Log error, continue to next lesson |
| User navigates away | Already-regenerated lessons are saved |
| Multiple tabs | Each operates independently |
| Network disconnect | Resume from where it left off |

---

## Future Considerations

This architecture enables:
1. **Filtering by confidence score**: Could add option to only regenerate lessons with confidence < 50%
2. **Priority queue**: Could sort by how many off-content questions each has
3. **Selective regeneration**: Could add checkboxes to pick specific lessons
4. **Background processing**: Could move to job queue for overnight batch runs
