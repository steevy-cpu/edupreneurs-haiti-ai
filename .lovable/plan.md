
# Plan: Enhanced Batch Validation with Progress Persistence

## Problem Summary

The current validation buttons ("Valider alignement contenu" and "Valider alignement activités") have critical UX issues:

1. **No visibility into existing validation status** - Users don't know how many lessons are already validated
2. **No progress persistence** - If validation stops at lesson 150/204, all progress is lost
3. **No resume capability** - After stopping, users must restart from the beginning
4. **No filtering of already-validated lessons** - Re-validates lessons that were already validated

**Current Stats (from database):**
- Total lessons: 2,832
- Quiz validated: 198 (7%)
- Activities validated: 113 (4%)
- Needs quiz regeneration: 151
- Needs activities regeneration: 88

---

## Solution Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    Enhanced Validation Button                           │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  📊 Quiz Content Validation                                      │   │
│  │                                                                  │   │
│  │  Already validated: 45/204 (22%)                                 │   │
│  │  ████████░░░░░░░░░░░░░░░░░░░░░░ 22%                              │   │
│  │                                                                  │   │
│  │  Needing validation: 159 lessons                                 │   │
│  │                                                                  │   │
│  │  [✓ Skip already validated]  [ Start Validation ]                │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  During Validation:                                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Validating: "Lesson Title..."                    45/159         │   │
│  │  ████████████░░░░░░░░░░░░░░░░░░ 28%                              │   │
│  │                                                                  │   │
│  │  ✓ 32 aligned  ⚠ 13 off-content  ✗ 0 errors                     │   │
│  │                                                                  │   │
│  │  [Pause & Save Progress]                                          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. Pre-Validation Statistics
Before starting, show users:
- How many lessons in this grade level have valid quizzes/activities
- How many have already been validated (checked `last_content_validated_at`)
- How many need validation (not yet checked)
- Estimated time based on remaining lessons

### 2. Progress Auto-Save
- Each lesson's validation result is saved immediately to the database
- Progress persists even if the user closes the browser
- Uses existing fields: `last_content_validated_at`, `needs_quiz_regeneration`, `content_alignment_score`

### 3. Skip Already-Validated Option
- Checkbox to skip lessons that already have `last_content_validated_at` set
- Default: ON (skip validated)
- Users can uncheck to re-validate everything

### 4. Consistent UI Design
Both Quiz and Activities validators will use the same enhanced component structure with appropriate color theming.

---

## Technical Implementation

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/content-editor/BatchQuizContentValidator.tsx` | Add pre-validation stats, skip-validated filter, enhanced UI |
| `src/components/content-editor/BatchActivitiesContentValidator.tsx` | Same enhancements as above |
| `src/components/content-editor/LessonBrowser.tsx` | Pass additional props for validation counts |

### Database Query Updates

**Fetch validation stats before starting:**
```sql
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN last_content_validated_at IS NOT NULL THEN 1 END) as validated,
  COUNT(CASE WHEN needs_quiz_regeneration = true THEN 1 END) as needs_regen
FROM lessons
WHERE subject_id IN (...)
```

### Component Props Enhancement

```typescript
interface BatchQuizContentValidatorProps {
  lessons: any[];
  gradeLevel: string;
  onComplete: () => void;
  // NEW: Pre-computed stats for display
  validatedCount?: number;
  totalWithQuiz?: number;
}
```

---

## UI Enhancements

### Before Starting (Button State)

**Current:**
```
┌────────────────────────────────────────────┐
│  🔍  Valider alignement contenu            │
└────────────────────────────────────────────┘
```

**Enhanced:**
```
┌────────────────────────────────────────────┐
│  🔍  Valider alignement contenu            │
│      45/204 déjà validés                   │
└────────────────────────────────────────────┘
```

### Dialog Content Enhancement

**Current Dialog:**
- Shows total lesson count
- Shows estimated time

**Enhanced Dialog:**
```
┌─────────────────────────────────────────────────────┐
│  Valider l'alignement du contenu?                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📊 Statistiques actuelles:                         │
│     • 204 leçons avec quiz valide                   │
│     • 45 déjà validés (22%)                         │
│     • 159 restants à valider                        │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ ████████░░░░░░░░░░░░░░░░ 22% validé         │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ☑ Ignorer les leçons déjà validées                 │
│                                                     │
│  ℹ️ Les résultats sont sauvegardés automatiquement  │
│  ⏱️ Durée estimée: ~8 minutes (159 leçons)          │
│                                                     │
├─────────────────────────────────────────────────────┤
│           [Annuler]     [Commencer]                 │
└─────────────────────────────────────────────────────┘
```

### During Validation Enhancement

**Current:**
- Progress bar with current/total
- Live counts (aligned, off-content, errors)
- Cancel button

**Enhanced:**
- Add "Progress auto-saved" indicator
- Show overall validated percentage updating in real-time
- "Pause & Save" button (clearer than just "Cancel")

```
┌─────────────────────────────────────────────────────┐
│  ⏳ Validation en cours...                          │
│                                                     │
│  "Les écosystèmes marins"           67/159          │
│  ████████████████░░░░░░░░░░░░ 42%                   │
│                                                     │
│  ✓ 52 alignés  ⚠ 15 hors-contenu  ✗ 0 erreurs     │
│                                                     │
│  💾 Progression sauvegardée automatiquement         │
│                                                     │
│            [⏸ Pause & Sauvegarder]                  │
└─────────────────────────────────────────────────────┘
```

---

## Implementation Details

### Step 1: Add Validation Count Fetching

In `LessonBrowser.tsx`, add a query to fetch validation stats:

```typescript
// New state for validation counts
const [quizValidationStats, setQuizValidationStats] = useState({
  total: 0,
  validated: 0,
  needsRegen: 0
});

// Fetch stats when lessons load
useEffect(() => {
  if (lessonsWithValidQuiz.length > 0) {
    const validated = lessonsWithValidQuiz.filter(
      l => l.last_content_validated_at != null
    ).length;
    setQuizValidationStats({
      total: lessonsWithValidQuiz.length,
      validated,
      needsRegen: lessonsWithValidQuiz.filter(l => l.needs_quiz_regeneration).length
    });
  }
}, [lessonsWithValidQuiz]);
```

### Step 2: Update BatchQuizContentValidator

Key changes:
1. Add `skipAlreadyValidated` state (default: true)
2. Filter lessons based on `last_content_validated_at`
3. Show pre-validation stats in button and dialog
4. Add auto-save indicator during validation

```typescript
const BatchQuizContentValidator = ({ 
  lessons, 
  gradeLevel, 
  onComplete,
  validatedCount = 0,
  totalWithQuiz = 0
}: BatchQuizContentValidatorProps) => {
  const [skipValidated, setSkipValidated] = useState(true);
  
  // Filter lessons to validate
  const lessonsToValidate = skipValidated 
    ? lessons.filter(l => !l.last_content_validated_at)
    : lessons;
    
  // ... rest of component
}
```

### Step 3: Enhanced Button Display

```tsx
<Button 
  size="sm" 
  variant="outline"
  className="w-full border-amber-500/30 text-amber-700 hover:bg-amber-500/10"
>
  <Search className="h-4 w-4 mr-2" />
  <div className="flex flex-col items-start">
    <span>Valider alignement contenu</span>
    <span className="text-xs text-muted-foreground">
      {validatedCount}/{totalWithQuiz} validés
    </span>
  </div>
</Button>
```

---

## Data Flow

```text
LessonBrowser loads lessons
         │
         ▼
Fetch validation stats (last_content_validated_at counts)
         │
         ▼
Pass stats to BatchQuizContentValidator
         │
         ▼
User sees: "45/204 validés" on button
         │
         ▼
User clicks → Dialog shows full stats
         │
         ▼
[Skip validated] checkbox filters list
         │
         ▼
Validation starts (159 lessons)
         │
         ▼
Each result IMMEDIATELY saved to DB ← Auto-save
         │
         ▼
User can pause anytime → Progress preserved
         │
         ▼
Resume later → Only remaining lessons processed
```

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing validation? | No | Same edge functions, same DB fields |
| Works with existing data? | Yes | Uses existing `last_content_validated_at` |
| Backward compatible? | Yes | Enhanced display only |
| 3G optimized? | Yes | Reduces API calls by skipping validated |
| Progress persistence? | Yes | Each lesson saved immediately |

---

## Expected Results

After implementation:

1. **Button shows current status**: "Valider alignement contenu (45/204 validés)"
2. **Dialog shows detailed stats**: Total, validated, remaining counts with progress bar
3. **Skip option**: Checkbox to skip already-validated lessons (default: ON)
4. **Auto-save**: Each validation result saved immediately
5. **Resume capability**: Users can stop/start without losing progress
6. **Time savings**: Skip 45 already-validated lessons = ~2 minutes saved

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `LessonBrowser.tsx` | Modify | Fetch validation stats, pass as props, add `last_content_validated_at` to query |
| `BatchQuizContentValidator.tsx` | Modify | Add skip filter, enhanced UI, validation stats display |
| `BatchActivitiesContentValidator.tsx` | Modify | Same enhancements for activities validation |

---

## Estimated Implementation Time

- LessonBrowser query update: 10 mins
- BatchQuizContentValidator enhancements: 30 mins
- BatchActivitiesContentValidator enhancements: 20 mins (copy pattern)
- Testing: 15 mins

**Total: ~75 minutes**
