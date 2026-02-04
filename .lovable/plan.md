
# Plan: Integrating Content Quality Dashboard into Content Editor UI

## Current Architecture Analysis

**Content Editor Tabs (6 total):**
1. `review` - Main lesson editing interface (LessonBrowser + detailed editors)
2. `batch` - Batch generation validation
3. `exams` - Exam content management
4. `passion-videos` - Passion video manager
5. `daily-words` - Daily words manager
6. `ebooks` - Ebook manager

**New Components Ready:**
- `ContentQualityDashboard.tsx` - Comprehensive stats with grade-level breakdown and issue categories
- `ValidationDetailsPanel.tsx` - Expandable panel showing specific off-content reasons
- `validationCategories.ts` - Issue categorization utility

**Data Flow:**
- Dashboard fetches all lessons and aggregates stats by grade level
- Displays overall quiz/activities validation percentages
- Shows top issue categories with counts

## Integration Strategy

### Phase 1: Add "Quality" Tab (High Priority)
**Location:** New top-level tab in ContentEditor main Tabs component

```
┌─ ContentEditor.tsx Tabs ─────────────────────────┐
│  [Review] [Quality] [Génération] [Examens] ... │  ← NEW TAB
└──────────────────────────────────────────────────┘
```

**Implementation:**
1. Import `ContentQualityDashboard` component
2. Add new TabsTrigger with icon (e.g., `BarChart3` icon - already in imports)
3. Add TabsContent wrapping the dashboard
4. Tab value: `"quality"`
5. Save preference to localStorage (existing pattern)

**User Flow:**
- Editor opens content editor → clicks "Quality" tab
- Dashboard loads → shows overall stats + grade-level breakdown
- Can see top issues by category
- Understands what needs fixing before diving into individual lessons

### Phase 2: Add Dashboard Refresh Trigger (Medium Priority)
**Problem:** When batch validation completes, dashboard should refresh to show updated stats

**Solution:**
1. Add state for dashboard refresh in ContentEditor
2. Create `refreshDashboard()` function (similar to `refreshLesson`)
3. Pass refresh callback to BatchQuizContentValidator and BatchActivitiesContentValidator
4. When validation completes, trigger dashboard refresh
5. Use same `refreshKey` pattern already in place

**Technical Details:**
- Dashboard component already has `useEffect` that fires on mount
- Could add optional `refreshKey` prop to ContentQualityDashboard
- When refreshKey changes, dashboard re-fetches stats

### Phase 3: Enhance Lesson Details View (Lower Priority - Phase 2)
**Optional:** Add ValidationDetailsPanel to LessonBrowser for individual lessons

When a lesson is selected in LessonBrowser:
- Show inline validation details if validation_details_json exists
- Display specific off-content questions for that lesson
- Let editor understand why THIS lesson failed without opening full dashboard

**Not required for initial integration** but would be valuable enhancement

## Technical Implementation Details

### Step 1: Modify ContentEditor.tsx
```typescript
// At top with other imports
import { ContentQualityDashboard } from "@/components/content-editor/ContentQualityDashboard";

// In useState hooks
const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

// New function
const refreshDashboard = () => {
  setDashboardRefreshKey(prev => prev + 1);
};

// Modify TabsList to include "quality"
<TabsList className="grid w-full grid-cols-7 lg:w-[1400px]">
  {/* existing triggers... */}
  <TabsTrigger value="quality">
    <BarChart3 className="mr-2 h-4 w-4" />
    Qualité
  </TabsTrigger>
</TabsList>

// After TabsContent value="ebooks"
<TabsContent value="quality">
  <ContentQualityDashboard 
    key={`dashboard-${dashboardRefreshKey}`}
  />
</TabsContent>
```

### Step 2: Update ContentQualityDashboard (Minor Enhancement)
- Add optional `refreshKey` prop for re-triggering data fetch
- Ensure dashboard runs stats aggregation query efficiently
- Consider caching for 3G optimization (dashboard stats shouldn't change every second)

### Step 3: Wire Up Refresh Callbacks (Optional Phase 2)
- BatchQuizContentValidator calls `onValidationComplete` callback
- BatchActivitiesContentValidator calls `onValidationComplete` callback
- ContentEditor passes `refreshDashboard` as callback

## Data Flow Diagram

```
User navigates to "Quality" tab
        ↓
ContentQualityDashboard mounts
        ↓
Fetches ALL lessons with validation_details_json
        ↓
Aggregates stats by:
  • Grade level (7AF, 8AF, 9AF, NS1, NS2, NS3)
  • Validation status (quiz/activities)
  • Issue categories (concept, formula, data, cultural, other)
        ↓
Renders:
  • Overview cards (total lessons, % validated)
  • Grade-level progress bars
  • Issue category breakdown
        ↓
User can click categories to see specific lessons (Phase 2)
```

## UI/UX Considerations

**Icon for Quality Tab:**
- `BarChart3` icon (already imported in ContentEditor)
- Label: "Qualité" (maintains French consistency)

**Dashboard Layout (already implemented):**
- Top 3 cards: total lessons, quiz validation %, activities validation %
- Middle section: grade-level breakdown with progress bars
- Bottom tabs: quiz issues vs activities issues with category details

**Mobile Responsiveness:**
- Dashboard uses responsive grid (`grid-cols-1 md:grid-cols-3`)
- Tabs stack vertically on mobile
- Progress bars scale automatically

## 3G Optimization

**Current Implementation:**
- Dashboard fetches entire lessons table once on mount
- Aggregation happens in-memory (efficient for 2,800 lessons)
- No pagination needed (stats already aggregated)

**Potential Improvements (Phase 3):**
- Cache dashboard stats in localStorage for instant load
- Stale-while-revalidate for stats updates
- Only refresh when user explicitly clicks refresh button

## Integration Dependencies

| Component | Status | Notes |
|-----------|--------|-------|
| ContentQualityDashboard | ✓ Ready | No changes needed |
| ValidationDetailsPanel | ✓ Ready | Can integrate in Phase 2 |
| validationCategories.ts | ✓ Ready | Utility already used by dashboard |
| ContentEditor.tsx | ✓ Ready | Simple import + tab addition |
| LessonBrowser.tsx | Optional | Only needed for Phase 3 |

## Implementation Steps

**Step 1:** Import ContentQualityDashboard in ContentEditor.tsx
**Step 2:** Add "quality" TabsTrigger with icon to TabsList
**Step 3:** Add TabsContent value="quality" with dashboard component
**Step 4:** Test dashboard loads correctly
**Step 5:** (Optional) Add refreshDashboard callback for batch validation completion

## Safety Verification

| Check | Status | Details |
|-------|--------|---------|
| Breaks existing tabs? | No | Adding new tab, not modifying existing |
| Tab persistence? | Yes | Uses existing localStorage pattern |
| Performance? | Good | Single query, in-memory aggregation |
| Mobile friendly? | Yes | Already responsive components |
| 3G optimized? | Yes | Single efficient query |
| Backward compatible? | Yes | No changes to existing components |

## Expected Result

After implementation:
- ✓ Users can access "Qualité" tab from main Content Editor
- ✓ Dashboard shows overall content health at a glance
- ✓ Grade-level breakdown shows which levels need most work
- ✓ Issue categories show patterns (e.g., "Concepts not in content" is top issue)
- ✓ No performance impact on other tabs
- ✓ Ready for Phase 2 enhancements (lesson-specific details, refresh triggers)

## Files to Modify

| File | Changes | Complexity |
|------|---------|-----------|
| `src/pages/ContentEditor.tsx` | Add import, add TabsTrigger, add TabsContent | Simple |
| `src/components/content-editor/ContentQualityDashboard.tsx` | Optional: add refreshKey prop | Simple |

**Total Lines of Code:** ~15 lines added to ContentEditor.tsx

