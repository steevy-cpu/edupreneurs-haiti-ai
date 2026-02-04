
# Plan: Phase 3 - Enhanced Lesson Details with Inline Validation Insights

## Objective
Add inline validation details to individual lessons in the LessonBrowser, allowing editors to see specific "off-content" questions and reasons without navigating to the full Quality dashboard.

## Current State Analysis

**LessonBrowser Structure:**
- Displays lessons in collapsible subject groups (lines 387-471)
- Each lesson is a clickable div showing title and status badges (lines 416-465)
- Currently shows validation regeneration badges (`needs_quiz_regeneration`, `needs_activities_regeneration`)
- No display of actual validation details from `validation_details_json`

**ValidationDetailsPanel:**
- Already exists and is designed for this purpose
- Accepts `offContentQuestions` array with structure: `{ index, question, reason }`
- Groups issues by category using `categorizeValidationIssue()` utility
- Shows success state when aligned, or expandable details when issues exist

**Data Available:**
- Lessons fetched in `loadLessons()` already include `validation_details_json`
- Structure: `{ quiz?: { offContentQuestions: [...] }, activities?: { offContentActivities: [...] } }`
- Can be extracted and passed directly to `ValidationDetailsPanel`

## Implementation Approach

### Phase 3A: Add Validation Details Display (High Priority)

**Integration Point:** Within each lesson's clickable div in LessonBrowser

**Current Lesson Item HTML (lines 416-465):**
```
<div className="p-2 rounded-md cursor-pointer...">
  <div className="flex items-start justify-between gap-2">
    <span className="text-sm font-medium...">{lesson.title}</span>
    <div className="flex items-center gap-1...">
      {/* Status badges */}
    </div>
  </div>
  <div className="mt-1">
    <Badge variant="outline">{lesson.grade_level}</Badge>
  </div>
</div>
```

**Enhancement:**
1. Import `ValidationDetailsPanel` component at the top of LessonBrowser
2. After the badge display, conditionally render `ValidationDetailsPanel` if validation data exists
3. Extract quiz and activities off-content questions from `validation_details_json`
4. Show separate panels for quiz and activities issues
5. Only show when selected lesson matches (`selectedLesson?.id === lesson.id`)

### Phase 3B: Data Extraction Helper Function

Create a utility function to parse validation details:

```typescript
function extractValidationDetails(lesson: any) {
  const details = lesson.validation_details_json;
  if (!details) return { quiz: [], activities: [] };
  
  return {
    quiz: details.quiz?.offContentQuestions || [],
    activities: details.activities?.offContentActivities || [],
  };
}
```

Alternative: Transform activity data to match question format for unified display
- Activities use `{ index, activity, reason }` format
- Questions use `{ index, question, reason }` format
- Can map activities to questions format for reuse

### Phase 3C: UI Layout in LessonBrowser

**New Layout for Selected Lesson:**
```
┌─ Subject ─────────────────────────────────────┐
│  ├─ Lesson 1 (not selected)                   │
│  ├─ Lesson 2 (SELECTED)                        │
│  │  ├─ Title + Status Badges                  │
│  │  ├─ Grade Level Badge                      │
│  │  ├─ ─────────────────────────────           │
│  │  ├─ Quiz Validation Details (if exists)    │
│  │  └─ Activities Validation Details (if exists)│
│  └─ Lesson 3                                   │
```

**Implementation:**
- Wrap existing lesson content in conditional rendering
- Show additional validation panels only for selected lesson
- Use `selectedLesson?.id === lesson.id` check
- Maintain existing styling/spacing for unselected lessons

## Technical Implementation Details

### Step 1: Import and Helper
**File:** `src/components/content-editor/LessonBrowser.tsx`

```typescript
import { ValidationDetailsPanel } from "@/components/content-editor/ValidationDetailsPanel";

// Helper to extract validation details
const extractValidationDetails = (lesson: any) => {
  const details = lesson.validation_details_json;
  if (!details) return { quiz: [], activities: [] };
  
  return {
    quiz: details.quiz?.offContentQuestions || [],
    activities: details.activities?.offContentActivities || [],
  };
};
```

### Step 2: Update Lesson Item Rendering
**Location:** Lines 416-465 in LessonBrowser

```typescript
{subject.lessons.map((lesson: any) => {
  const isSelected = selectedLesson?.id === lesson.id;
  const { quiz: quizIssues, activities: activityIssues } = extractValidationDetails(lesson);
  
  return (
    <div key={lesson.id}>
      {/* Existing lesson item wrapper and content */}
      <div
        onClick={() => onSelectLesson(lesson)}
        className={`p-2 rounded-md cursor-pointer transition-colors ${
          isSelected ? "bg-primary/10 border border-primary" : "hover:bg-muted"
        }`}
      >
        {/* Title and badges - EXISTING CODE */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium flex-1 line-clamp-2">
            {lesson.title}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Status badges - EXISTING CODE */}
          </div>
        </div>
        <div className="mt-1">
          <Badge variant="outline" className="text-xs">
            {lesson.grade_level}
          </Badge>
        </div>
      </div>
      
      {/* NEW: Validation details for selected lesson only */}
      {isSelected && (quizIssues.length > 0 || activityIssues.length > 0) && (
        <div className="mt-2 ml-2 space-y-2">
          {quizIssues.length > 0 && (
            <ValidationDetailsPanel
              lessonTitle={lesson.title}
              validationType="quiz"
              offContentQuestions={quizIssues}
              aligned={false}
              confidence={lesson.content_alignment_score || 0}
            />
          )}
          {activityIssues.length > 0 && (
            <ValidationDetailsPanel
              lessonTitle={lesson.title}
              validationType="activities"
              offContentQuestions={activityIssues}
              aligned={false}
              confidence={lesson.activities_alignment_score || 0}
            />
          )}
        </div>
      )}
    </div>
  );
})}
```

### Step 3: Consider Collapsing/Expanding
**Optional Enhancement:**
- Add collapsible wrapper around validation details
- Prevents overwhelming the lesson list when many lessons have issues
- Can expand on demand

## Data Structure Verification

**From ContentQualityDashboard (lines 122-141):**
```typescript
lesson.validation_details_json = {
  quiz?: {
    offContentQuestions: Array<{
      index: number;
      question: string;
      reason: string;
    }>
  },
  activities?: {
    offContentActivities: Array<{
      index: number;
      activity: string;  // Note: activities use "activity" key
      reason: string;
    }>
  }
}
```

**Needed Transformation for Activities:**
The `ValidationDetailsPanel` expects `{ index, question, reason }` format, but activities have `{ index, activity, reason }`. Two options:

1. **Map in LessonBrowser:** Transform activities before passing
   ```typescript
   const activityIssuesFormatted = activityIssues.map(issue => ({
     ...issue,
     question: issue.activity  // Alias for display
   }));
   ```

2. **Update ValidationDetailsPanel:** Accept generic `content` field
   - More flexible but requires component changes
   - Recommended if activities become more common

**Recommendation:** Use Option 1 (simpler, non-breaking change)

## UX Flow

1. **User browses lessons** → sees lesson list with status badges (existing behavior)
2. **User clicks a lesson** → lesson becomes selected with blue highlight
3. **If lesson has validation issues** → `ValidationDetailsPanel` appears below lesson item
4. **User expands panel** → sees specific off-content questions grouped by category
5. **User understands** → why this lesson failed and what needs fixing
6. **User can then** → navigate to Quality tab for bulk context OR regenerate individual content

## Safety Verification

| Check | Status | Details |
|-------|--------|---------|
| Breaks existing lesson selection? | No | Maintains onClick and selection styling |
| Performance impact? | Minimal | Only renders details for selected lesson |
| Mobile friendly? | Yes | Details expand below, responsive layout |
| 3G optimized? | Yes | No new network calls, just displays existing data |
| Backward compatible? | Yes | ValidationDetailsPanel already exists and works |
| Data integrity? | Yes | Uses existing validation_details_json from DB |

## Files to Modify

| File | Changes | Complexity |
|------|---------|-----------|
| `src/components/content-editor/LessonBrowser.tsx` | Import component, add helper, conditional render validation panels for selected lesson | Medium |

**Total lines of code:** ~30 lines added

## Expected Result

After implementation:
- ✓ When a lesson is selected, validation details appear inline
- ✓ Quiz and activities issues shown separately with clear categorization
- ✓ Editor understands specific problems without leaving lesson list
- ✓ No impact on unselected lessons
- ✓ Smooth integration with existing data flow
- ✓ Ready for Phase 3B (optional): Add quick-actions (Regenerate, Mark as reviewed) directly from panel

## Integration Dependencies

- ✓ ValidationDetailsPanel (already exists, fully functional)
- ✓ validation_details_json (already in database)
- ✓ categorizeValidationIssue utility (already exists)
- ✓ Selected lesson state (already tracked in LessonBrowser)

## Future Enhancements (Phase 3B+)

1. **Quick Actions:** Add "Regenerate Quiz" button directly in panel
2. **Filtering:** Filter lesson list to show only lessons with specific issue types
3. **Bulk Operations:** "Regenerate all lessons with 'concept_not_in_content' issues"
4. **Comparison View:** Side-by-side with content to understand gaps
