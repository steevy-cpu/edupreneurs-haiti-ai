
# Dashboard Reorganization — Tab-Based Layout

## Problem

The current dashboard has 9+ sections stacked vertically, making it feel cluttered and generic. Collapsible sections hide content rather than organize it. It doesn't feel like a focused educational platform.

## Solution

Reorganize the dashboard into a **tab-based layout** with 3 clear tabs, keeping the welcome header and Word of the Day always visible above the tabs. This reduces visual noise while keeping all content accessible.

```text
+------------------------------------------+
|  Welcome Header (always visible)         |
+------------------------------------------+
|  Word of the Day (always visible)        |
+------------------------------------------+
| [ Apercu ] [ Progression ] [ Communaute ]|
+------------------------------------------+
|                                          |
|  Tab content here                        |
|                                          |
+------------------------------------------+
```

### Tab Structure

**Tab 1: "Apercu" (Overview)** — What students see first
- Quick Actions (4-button grid)
- Continue Learning (recent subjects with progress)
- Weekly Goal widget + Learning Streak widget (side by side)
- Banners (PWA, Passion discovery)
- Content Editor link (if applicable)

**Tab 2: "Progression" (Progress)** — Detailed analytics
- KPI Cards (Gold, Lessons, Score, Study Time) — no longer collapsible, just shown directly
- Weekly Activity Chart + Subject Progress Chart (side by side on desktop)
- Learning Insights Panel
- Achievements / Badges

**Tab 3: "Communaute" (Community)** — Social + notes
- Leaderboard (top 5)
- Recent Notes

## Architecture

### New Files
- `src/components/dashboard/DashboardTabs.tsx` — Tab container managing active tab state (persisted to localStorage)
- `src/components/dashboard/tabs/OverviewTab.tsx` — Renders Quick Actions, Continue Learning, Goals, Banners
- `src/components/dashboard/tabs/ProgressTab.tsx` — Renders KPIs, Charts, Insights, Achievements
- `src/components/dashboard/tabs/CommunityTab.tsx` — Renders Leaderboard, Notes

### Modified Files
- `src/pages/Dashboard.tsx` — Significantly simplified. The 922-line file becomes a ~200-line orchestrator that handles data fetching and passes props to `DashboardTabs`

### Removed / Deprecated
- `CollapsibleSection` usage removed from Dashboard (sections are now organized by tabs, not collapsed/expanded)
- The `CollapsibleSection` component itself stays since other pages may use it

## Technical Details

### Tab persistence
Active tab stored in `localStorage` under key `dashboard-active-tab`. Default: `"overview"`.

### Lazy loading preserved
- Charts and heavy widgets in the "Progression" tab remain lazy-loaded with `Suspense`
- The "Communaute" tab content only renders when active (React conditionally renders tab content)

### Data fetching unchanged
- The existing two-phase loading (critical then non-critical) stays exactly as-is
- `useDashboardAnalytics` hook continues to defer by 2 seconds
- Feature-level `FeatureState` pattern stays — each section still has independent loading/error
- No new database queries needed

### Mobile-first tab design
- Tabs use Radix `Tabs` component (already installed) with horizontal scroll on mobile
- Tab indicators are icon + label on desktop, icon-only on small mobile
- Content area gets the scroll isolation pattern: `flex-1 overflow-y-auto`

### 3G Optimization
- Only the active tab's content renders (no hidden tabs loading charts in background)
- Tab switch is instant since data is already fetched and held in state
- No additional network requests from tab switching

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/dashboard/DashboardTabs.tsx` | Create | Tab container with localStorage persistence |
| `src/components/dashboard/tabs/OverviewTab.tsx` | Create | Quick Actions, Continue Learning, Goals, Banners |
| `src/components/dashboard/tabs/ProgressTab.tsx` | Create | KPIs, Charts, Insights, Achievements |
| `src/components/dashboard/tabs/CommunityTab.tsx` | Create | Leaderboard, Notes |
| `src/pages/Dashboard.tsx` | Edit | Simplify from 922 lines to ~200 lines orchestrator |

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No — all sections preserved, just reorganized |
| Data fetching changes? | None — same hooks, same queries |
| Backward compatible? | Yes — localStorage for collapsed sections ignored gracefully |
| 3G optimized? | Yes — only active tab renders; lazy loading preserved |
| Edge cases? | Empty states, error states, visitor mode all pass through unchanged |
| Visitor mode? | Works — tabs still show demo data via existing visitor pattern |
