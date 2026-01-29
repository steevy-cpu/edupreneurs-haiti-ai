
# Content Editor Quiz Status Display Plan

## Problem Summary

The content editor does not show which lessons are missing quizzes. The database conversion was successful (2,478 valid quizzes), but the **frontend has no visual indicator** for the 354 lessons still missing quizzes (221 of which are in NS2).

**Current State:**
| Grade | Total | Valid Quizzes | Missing |
|-------|-------|---------------|---------|
| 7AF | 204 | 202 | 2 |
| 8AF | 197 | 197 | 0 |
| 9AF | 191 | 139 | 52 |
| NS1 | 249 | 244 | 5 |
| NS2 | 245 | 24 | **221** |
| NS3 | 874 | 814 | 60 |
| NS4 | 872 | 858 | 14 |

---

## Solution Overview

Add visual quiz status indicators to the LessonBrowser component:

1. **Per-Lesson Badge**: Show a warning icon next to lessons missing quizzes
2. **Subject-Level Summary**: Display "X/Y quizzes" count per subject
3. **Grade-Level Stats Card**: Add a summary dashboard showing quiz coverage

---

## Implementation Details

### 1. Update Lesson Query (LessonBrowser.tsx)

Add `quiz_final` to the lesson select fields so we can detect missing quizzes:

```typescript
// Current query (line 114)
.select('id, title, slug, subject_id, order_index, workflow_status, grade_level, subjects(id, name)')

// Updated query - add quiz_final check
.select('id, title, slug, subject_id, order_index, workflow_status, grade_level, quiz_final, subjects(id, name)')
```

### 2. Add Quiz Status Badge (LessonBrowser.tsx)

Add a visual indicator for lessons missing quizzes:

```typescript
// Add helper function
const hasValidQuiz = (lesson: any) => {
  return lesson.quiz_final && 
    (lesson.quiz_final.includes('quiz-question') || 
     lesson.quiz_final.includes('quiz-container'));
};

// In the lesson item render (around line 291)
{!hasValidQuiz(lesson) && (
  <Badge variant="destructive" className="text-xs flex-shrink-0">
    <AlertCircle className="h-3 w-3 mr-1" />
    Quiz
  </Badge>
)}
```

### 3. Add Subject-Level Quiz Stats

Update the subject header to show quiz completion:

```typescript
// In filteredSubjects calculation, add quiz stats
const filteredSubjects = availableSubjects.map(subject => {
  const subjectLessons = lessonsBySubject[subject.id] || [];
  const filteredLessons = subjectLessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const quizCount = filteredLessons.filter(l => hasValidQuiz(l)).length;
  return {
    ...subject,
    lessons: filteredLessons,
    quizCount,
    missingQuizzes: filteredLessons.length - quizCount
  };
});
```

Display in the collapsible trigger:

```typescript
<CollapsibleTrigger>
  {/* existing content */}
  <Badge variant="secondary">
    {subject.lessons.length}
  </Badge>
  {subject.missingQuizzes > 0 && (
    <Badge variant="destructive" className="ml-1">
      -{subject.missingQuizzes} quiz
    </Badge>
  )}
</CollapsibleTrigger>
```

### 4. Add Grade-Level Summary Card (New Component)

Create a summary card at the top of the content editor showing overall quiz coverage:

```typescript
// New component: QuizCoverageSummary.tsx
interface QuizStats {
  gradeLevel: string;
  total: number;
  withQuiz: number;
  missing: number;
}

export function QuizCoverageSummary({ gradeLevel }: { gradeLevel: string }) {
  // Fetch summary stats from database
  // Display progress bar and counts
}
```

### 5. Add Filter Option

Add a "Show only missing quizzes" toggle to quickly find lessons that need attention:

```typescript
// Add state
const [showOnlyMissingQuiz, setShowOnlyMissingQuiz] = useState(false);

// Add checkbox in header
<div className="flex items-center space-x-2 mt-2">
  <Checkbox 
    id="missing-quiz" 
    checked={showOnlyMissingQuiz}
    onCheckedChange={setShowOnlyMissingQuiz}
  />
  <Label htmlFor="missing-quiz" className="text-sm text-muted-foreground">
    Quizzes manquants uniquement
  </Label>
</div>

// Apply filter
const displayedLessons = showOnlyMissingQuiz 
  ? filteredLessons.filter(l => !hasValidQuiz(l))
  : filteredLessons;
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/content-editor/LessonBrowser.tsx` | Add quiz_final to query, add badges, add filter |
| `src/components/content-editor/QuizCoverageSummary.tsx` (new) | Grade-level stats card |
| `src/pages/ContentEditor.tsx` | Add summary card above LessonBrowser |

---

## User Experience

**Before:**
- User sees lesson list with no indication of quiz status
- Must click each lesson to check if quiz exists

**After:**
- Red badge appears next to lessons missing quizzes
- Subject header shows "-221 quiz" warning for NS2
- Optional filter to show only lessons needing quizzes
- Summary card shows "NS2: 24/245 (10% coverage)"

---

## Visual Mockup

```text
┌─────────────────────────────────────────────┐
│ Parcourir les Leçons                   🔄   │
├─────────────────────────────────────────────┤
│ Niveau: [NS2 ▼]                             │
│ 🔲 Quizzes manquants uniquement             │
├─────────────────────────────────────────────┤
│ ⚠️ NS2: 24/245 leçons avec quiz (10%)       │
│ ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
├─────────────────────────────────────────────┤
│ ▼ 📖 Français NS2          [34] [-30 quiz]  │
│    ├ Leçon 1: Adapter sa parole... [⚠ Quiz] │
│    ├ Leçon 2: Analyser les types... [⚠ Quiz]│
│    └ Leçon 3: Argumenter...                 │
│ ▼ 📖 Anglais NS2           [40] [-35 quiz]  │
│    ├ Leçon 1: Grammar review...     [⚠ Quiz]│
│    └ ...                                    │
└─────────────────────────────────────────────┘
```

---

## Performance Considerations

- The `quiz_final` field is already loaded in the same query (no extra request)
- Client-side filtering is fast since lesson count per subject is typically under 50
- Summary stats can be cached with React Query (staleTime: 5 minutes)

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - only adds new UI elements |
| Works with existing data? | Yes - reads from `quiz_final` column |
| Backward compatible? | Yes - existing lessons display unchanged |
| 3G optimized? | Yes - uses existing data, no extra queries |

