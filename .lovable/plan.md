

# Redesign Main Leaderboard with Podium Layout

## Goal
Restyle `src/pages/Leaderboard.tsx` to match the Quiz Battle Leaderboard design: a **top-3 podium** section with avatar pillars, followed by the **full ranked list** with rank icons, level info, and gold count.

## What changes

**File:** `src/pages/Leaderboard.tsx` only. No data-fetching or hook changes needed — `useLeaderboardData` already provides everything.

### 1. Add Top-3 Podium Section (new section between header and list)

A visual podium showing positions 1st (center, tallest), 2nd (left), 3rd (right) — same layout as `QuizBattleLeaderboard.tsx` lines 268-312:

- **1st place:** Gold ring avatar (h-12/h-16), yellow pillar, Crown icon, name + gold count
- **2nd place:** Silver ring avatar (h-10/h-14), gray pillar, Medal icon
- **3rd place:** Bronze ring avatar (h-9/h-12), amber pillar, Medal icon
- Pillar heights staggered (1st tallest, 3rd shortest)
- Only renders when `leaderboard.length >= 3`
- Mobile-responsive with `sm:` breakpoints matching the quiz battle version

### 2. Restyle List Rows

Replace the current `Card > CardContent` per-row with the cleaner bordered-row pattern from the quiz battle leaderboard:

- Rank icon (Crown/Medal) for top 3, `#N` text for others
- Avatar with lazy loading (already present)
- User info: nickname + academic grade (keep existing data)
- Right side: gold count with trophy emoji
- Current user gets `ring-2 ring-primary ring-offset-2` highlight
- Remove the outer Card wrapper per row — use a single Card containing all rows (matching quiz battle pattern)

### 3. Keep Everything Else

- Header gradient, ThemeToggle, hint bar, visitor logic, auth check — all untouched
- `useLeaderboardData` hook — untouched
- Empty state — keep existing
- `handleUserClick` navigation — keep existing
- `getAvatarUrl` usage — keep existing

## Technical Details

### Podium rendering logic
```
if (!isLoading && leaderboard.length >= 3) {
  // Render podium: leaderboard[1] left, leaderboard[0] center, leaderboard[2] right
}
```

### Row styling (matching quiz battle pattern)
Each row uses `cn()` with rank-based gradient backgrounds and border colors, inside a single wrapping `<Card>`.

### No dependency or data changes
- Same imports, just reorganized JSX
- Uses existing `getRankIcon` and `getRankBgColor` (slightly adjusted for podium colors)
- No new components, no new hooks, no new queries

## Safety Verification

| Check | Status |
|-------|--------|
| useLeaderboardData hook untouched | Yes |
| Visitor mode still works | Yes |
| Auth redirect untouched | Yes |
| Profile click navigation preserved | Yes |
| getAvatarUrl still used for avatars | Yes |
| No new dependencies | Yes |
| Mobile responsive (3G-friendly) | Yes — same pattern as quiz battle |
| Current user highlight preserved | Yes |
| Empty state preserved | Yes |

