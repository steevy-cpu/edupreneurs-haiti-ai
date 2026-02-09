

# Dashboard UX Polish — Focused Educational Experience

## What's Changing

This plan improves the visual hierarchy, spacing, and information density across all three tabs without changing any data fetching or architecture. The goal: make it feel like a purpose-built learning platform, not a generic admin dashboard.

## Changes by Area

### 1. Overview Tab — Prioritize Learning Actions

**Current issues:**
- QuickActionsCard has equal visual weight for all 4 items, but "Continuer" (learning) should dominate
- "Continue Learning" cards are plain white boxes with just a progress bar — no subject color identity
- Goal/Streak widgets are tall cards with large icons but little information density

**Changes:**
- **Merge Quick Actions into a compact inline row** (icon buttons, no card wrapper) to reduce vertical space — the tab content below IS the action
- **Add subject color coding** to "Continue Learning" cards — each subject gets a left-border accent (Math = blue, French = green, etc.) for instant visual recognition
- **Combine Goal + Streak into a single compact "Today's Focus" card** — one row showing streak flame + count, goal progress bar, and lessons remaining. This cuts vertical space in half while keeping the same data
- **Move the "Voir toutes les matieres" CTA** into the Quick Actions row as a primary button

### 2. Progress Tab — Less Decoration, More Data

**Current issues:**
- KPI cards use large gradient icons (48px) and gradient text that's hard to read — style over substance
- 4 KPI cards take the entire viewport width but each shows only one number
- Charts section works well but has no summary text

**Changes:**
- **Compact KPI strip**: Replace 4 separate cards with a single card containing a 4-column grid of stat items (icon + number + label on one line each). Cuts height by ~60%
- **Remove gradient text on numbers** — use `font-bold text-foreground` for readability
- **Add a one-line summary above charts**: "Tu as complete X lecons cette semaine" — gives context before the chart
- **Keep charts and achievements as-is** — they work well

### 3. Community Tab — Better Leaderboard Density

**Current issues:**
- Each leaderboard entry is a tall card with gradient background — takes too much space for 5 entries
- Notes section works fine

**Changes:**
- **Tighten leaderboard rows**: Reduce padding from `p-4` to `p-2.5`, reduce avatar size from 48px to 36px. Same info, 30% less height
- **Add rank numbers as text** instead of only icons — "#1, #2, #3" is clearer than crown/medal icons alone
- **Keep notes section unchanged** — it's clean and functional

### 4. Word of the Day — Slim Down

**Current issue:** The dark gradient card is visually heavy and takes significant vertical space above the tabs.

**Changes:**
- **Reduce padding** from `p-4 sm:p-5` to `p-3 sm:p-4`
- **Single-line layout on desktop**: Word + phonetic + audio button on one line, definition below. Saves ~30px height
- **Remove the Sparkles icon** from the header (per anti-vibe-code rules)

### 5. Tab Bar — Add Active State Labels

**Current issue:** On mobile, tabs show only icons with no text, which is ambiguous.

**Changes:**
- **Always show short labels** even on mobile: use 3-letter abbreviations on small screens ("Vue", "Stat", "Club") via responsive classes

## Files Modified

| File | Change |
|------|--------|
| `src/components/dashboard/tabs/OverviewTab.tsx` | Merge Quick Actions inline, add subject colors to Continue Learning, combine Goal+Streak |
| `src/components/dashboard/tabs/ProgressTab.tsx` | Compact KPI strip, remove gradient text, add summary line |
| `src/components/dashboard/tabs/CommunityTab.tsx` | Tighter leaderboard rows, add rank numbers |
| `src/components/dashboard/DashboardTabs.tsx` | Always show tab labels (short on mobile) |
| `src/components/dashboard/WordOfTheDayCard.tsx` | Reduce padding, remove Sparkles icon |
| `src/components/dashboard/QuickActionsCard.tsx` | Refactor to inline compact layout |
| `src/components/dashboard/WeeklyGoalWidget.tsx` | No longer used standalone — merged into OverviewTab |
| `src/components/dashboard/LearningStreakWidget.tsx` | No longer used standalone — merged into OverviewTab |

## Technical Notes

- No new dependencies
- No database changes
- No new components created — only refactoring existing ones
- All changes are CSS/layout only (className changes, JSX restructuring)
- Lazy loading and error boundaries remain unchanged
- The `WeeklyGoalWidget` and `LearningStreakWidget` components stay in the codebase (other pages may reference them) — they're just inlined in the OverviewTab instead of imported

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No — layout-only changes |
| Data fetching changes? | None |
| 3G optimized? | Yes — reduces DOM nodes and card wrappers |
| Backward compatible? | Yes — same props, same data flow |
| Edge cases? | Empty states unchanged, visitor mode unchanged |

