
# Plan: Content Quality Dashboard with Detailed Validation Feedback

## Problem Analysis

**Current Gaps:**
1. **No visibility into validation failure reasons** - Lessons are flagged with "⚠ Besoin régénération" but editors don't know WHY they failed
2. **No comprehensive quality overview** - Users can't see overall health of content across grade levels
3. **Validation details are lost** - API returns detailed reasons for off-content questions, but they're not stored or displayed
4. **Error messages are generic** - "hors-contenu" flag with no actionable context

**Data Currently Available (but underutilized):**
- `content_alignment_score` - Quiz validation confidence (0-1)
- `activities_alignment_score` - Activities validation confidence (0-1)
- `needs_quiz_regeneration` / `needs_activities_regeneration` - Boolean flags
- `last_content_validated_at` / `last_activities_validated_at` - Validation timestamps
- **Validation API Response** contains: `offContentQuestions[{index, question, reason}]` with specific failure reasons

## Solution: Two-Component System

### Component 1: Enhanced Validation Result Storage
**Currently:** Validation results are calculated but only high-level metrics stored (aligned/confidence).
**New:** Store full validation response with specific failure reasons.

```typescript
// Store in lessons table (or new lesson_validation_details table)
{
  lesson_id: uuid,
  validation_type: 'quiz' | 'activities',
  aligned: boolean,
  confidence: number,
  off_content_details: {
    offContentQuestions: [
      { index: 0, question: "...", reason: "Concept X non mentionné dans le contenu" },
      { index: 3, question: "...", reason: "Formule chimique non présente dans le contenu" }
    ]
  },
  last_validated_at: timestamp
}
```

### Component 2: Content Quality Dashboard
A comprehensive dashboard with multiple views:

```
┌─────────────────────────────────────────────────────────────────┐
│                    📊 CONTENT QUALITY DASHBOARD                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Overview Stats (Top Cards)                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ 📈 Overall   │  │ ✓ Quiz       │  │ 🎮 Activités │           │
│  │ Score: 73%   │  │ 72% validé   │  │ 68% validé   │           │
│  │ 2,832 total  │  │ 198 validés  │  │ 113 validés  │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                 │
│  Tabs: [Overview] [Quiz Issues] [Activities Issues] [Trends]    │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  Grade Level Quality Breakdown                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 7AF  ████████████░░░░░░░░░░░░  85% (94/111 lessons)    │   │
│  │ 8AF  ████████░░░░░░░░░░░░░░░░░  62% (68/109)           │   │
│  │ 9AF  ██████████████░░░░░░░░░░░  78% (156/201)          │   │
│  │ NS1  ███████░░░░░░░░░░░░░░░░░░  54% (48/89)            │   │
│  │ NS2  ███░░░░░░░░░░░░░░░░░░░░░░  32% (44/138)  🔴       │   │
│  │ NS3-SMP ████░░░░░░░░░░░░░░░░░░  45% (67/149)           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Quiz Issues Detail (Filterable)                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 📌 Lessons with off-content questions: 187              │   │
│  │                                                          │   │
│  │ ⚠ Top Issue Categories:                                 │   │
│  │  • Concept not in content: 124 questions               │   │
│  │  • Specific date/formula missing: 45 questions         │   │
│  │  • Cultural knowledge not mentioned: 18 questions      │   │
│  │                                                          │   │
│  │ 🔍 Click to see specific lessons needing fixes         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Component 3: Enhanced Lesson Browser Integration
When a lesson is flagged as "needing regeneration", show WHY:

```
Before:
❌ Lesson Title
  [⚠ Besoin régénération - Quiz] [Brouillon]

After:
❌ Lesson Title  
  [⚠ Besoin régénération - Quiz] [Brouillon]
  └─ Q1: Concept X non mentionné; Q5: Formule non présente
```

## Technical Implementation

### Step 1: Extend Validation Result Capture
In `BatchQuizContentValidator.tsx` and `BatchActivitiesContentValidator.tsx`:
- Store full validation response from API (not just aligned/confidence)
- Add new database field: `validation_details_json` (or update lessons table)

### Step 2: Create ContentQualityDashboard Component
New file: `src/components/content-editor/ContentQualityDashboard.tsx`

Key features:
- **Overview Cards**: Overall score, quiz health, activities health
- **Grade Level Breakdown**: Progress bars showing validation % per grade level
- **Issue Categories**: Aggregate failure reasons to identify patterns
- **Trend Charts**: Validation progress over time (using recharts already in project)
- **Drilldown**: Click to see specific lessons with issues

### Step 3: Enhanced Lesson Details in Browser
Update `LessonBrowser.tsx`:
- Add expandable "validation details" section showing specific reasons
- Color-code by severity: red (many issues), amber (some issues), green (few)
- Allow filtering by issue type

### Step 4: Smart Issue Categorization
Create utility function to categorize failure reasons:
```typescript
function categorizeValidationIssue(reason: string): string {
  if (reason.includes('non mentionné')) return 'Concept not in content';
  if (reason.includes('formule') || reason.includes('date')) return 'Specific data missing';
  if (reason.includes('culture') || reason.includes('connaissances générales')) return 'General knowledge';
  return 'Other';
}
```

## Data Structure Changes

### Option A: Extend Lessons Table (Simpler)
Add column to `lessons` table:
```sql
ALTER TABLE lessons ADD COLUMN validation_details_json JSONB;
-- Stores: { quiz: { offContentQuestions: [...], confidence: 0.75 }, activities: {...} }
```

### Option B: Create Separate Table (Cleaner)
```sql
CREATE TABLE lesson_validation_details (
  id uuid PRIMARY KEY,
  lesson_id uuid REFERENCES lessons(id),
  validation_type 'quiz' | 'activities',
  response_json JSONB, -- Full API response
  created_at timestamp,
  UNIQUE(lesson_id, validation_type)
);
```

**Recommendation:** Option A (simpler, leverages existing structure)

## UI Integration Points

| Component | Change | Benefit |
|-----------|--------|---------|
| LessonBrowser | Add "validation details" toggle | See why each lesson is flagged |
| ContentEditor | Add "Quality" tab with dashboard | Overall visibility |
| BatchValidators | Store detailed results | Enable detailed feedback |
| WorkflowManagement | Show blockers with reasons | Clear publishing requirements |

## Expected Results

After implementation:

**Educators can:**
1. ✓ See at a glance which lessons have validation issues
2. ✓ Understand WHY specific questions failed alignment
3. ✓ Prioritize fixes based on issue frequency (patterns)
4. ✓ Track quality improvements over time with dashboard trends
5. ✓ Filter lessons by issue type to batch-fix similar problems

**For 204 lessons with 50% off-content rate:**
- Before: "⚠ 102 lessons need regeneration" (no context)
- After: "⚠ 102 lessons need regeneration — Top issues: Concepts not mentioned (67), Missing formulas (21), Cultural knowledge (14)"

## 3G Optimization

- Dashboard uses aggregated stats (minimal queries)
- Validation details stored with lesson (no extra fetch)
- Trends use cached data when possible
- Drilldown loads details on-demand

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing validation? | No | Extends, doesn't replace |
| Works with existing data? | Yes | Backward compatible, new fields optional |
| Performance impact? | Minimal | Adds one JSONB column, queries still use indexes |
| 3G optimized? | Yes | Aggregated stats, lazy loading |
| Backward compatible? | Yes | Old validation results show basic metrics |

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/content-editor/ContentQualityDashboard.tsx` | Create | Main dashboard with stats, trends, drilldown |
| `src/components/content-editor/ValidationDetailsPanel.tsx` | Create | Shows specific off-content reasons for a lesson |
| `src/utils/validationCategories.ts` | Create | Utility to categorize and aggregate failure reasons |
| `BatchQuizContentValidator.tsx` | Modify | Store full validation response, not just metrics |
| `BatchActivitiesContentValidator.tsx` | Modify | Same as above for activities |
| `LessonBrowser.tsx` | Modify | Add validation details expansion + filtering |
| Database | Modify | Add `validation_details_json` column to lessons table |

---

## Implementation Phases

**Phase 1 (High Value):** Core Dashboard + Storage
- Add column to store validation details
- Create ContentQualityDashboard component
- Update batch validators to store full responses
- 📊 Users can see overall quality + specific failure reasons

**Phase 2 (Medium Value):** Enhanced Integration
- Add validation details to LessonBrowser
- Add filtering by issue type
- Create issue categorization utility

**Phase 3 (Nice-to-Have):** Advanced Analytics
- Trend charts (quality improvement over time)
- Predictive alerts ("NS2 quality declining")
- Batch operations ("Fix all lessons with missing formulas")

---

## How This Solves the User's Problem

The user identified two key pain points:

1. **"Can't see why lessons failed validation"**
   - ✓ Solution: ValidationDetailsPanel shows specific reasons per lesson
   - ✓ Shows exact question text + reason why it's off-content

2. **"Content Quality Dashboard needed"**
   - ✓ Solution: Comprehensive dashboard with grade-level breakdown
   - ✓ Shows issue patterns and aggregated metrics
   - ✓ Enables prioritization of fixes

The dashboard transforms validation from "X lessons flagged" → "X lessons flagged because of Y patterns, affecting Z students"
