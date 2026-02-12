

# Add Visible Background Color to Active Tabs

## Problem
The active tab trigger uses `data-[state=active]:bg-background` which blends into the page background (white on white in light mode). Students cannot clearly see which tab is selected -- it only shows a subtle outline/shadow.

## Solution
Add a prominent filled background color to active tabs in both locations:

### 1. Exam Practice Page Tabs (`src/pages/ExamPreparation.tsx`)
Add `data-[state=active]:bg-primary data-[state=active]:text-primary-foreground` to both TabsTrigger elements (lines 291 and 295). This gives the active tab the app's primary teal/green fill with white text -- making selection obvious.

### 2. Dashboard Tabs (`src/components/dashboard/DashboardTabs.tsx`)
Add the same `data-[state=active]:bg-primary data-[state=active]:text-primary-foreground` to all three TabsTrigger elements (lines 37, 42, 47). Consistent styling across the app.

## Technical Details

**ExamPreparation.tsx** (2 TabsTriggers, lines ~291 and ~295):
```tsx
// Before
<TabsTrigger value="pdf" className="text-sm">

// After
<TabsTrigger value="pdf" className="text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
```

**DashboardTabs.tsx** (3 TabsTriggers, lines 37, 42, 47):
```tsx
// Before
className="rounded-lg data-[state=active]:shadow-md text-xs sm:text-sm gap-1"

// After  
className="rounded-lg data-[state=active]:shadow-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm gap-1"
```

## Safety Checklist

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- only CSS class additions |
| Works with existing data? | Yes -- no data changes |
| 3G optimized? | Yes -- no new assets |
| Dark mode compatible? | Yes -- uses theme-aware CSS variables (primary/primary-foreground) |
| Backward compatible? | Yes |

