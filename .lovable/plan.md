
# Fix: Leaderboard Podium Mobile Layout

## Problem
On mobile, the top-3 podium in `/leaderboard` has two issues:
1. Usernames are truncated too aggressively (e.g., "Dark_Que...") because `max-w-[60px]` is too narrow
2. Pillars feel cramped due to `gap-1` on small screens

## Changes (single file: `src/pages/Leaderboard.tsx`)

### Widen name truncation limits
- 1st place: `max-w-[60px]` to `max-w-[80px]` (sm stays `max-w-[80px]` -- already fine)
- 2nd place: `max-w-[60px]` to `max-w-[75px]`
- 3rd place: `max-w-[55px]` to `max-w-[70px]`

### Increase pillar gap
- Change `gap-1 sm:gap-2` to `gap-2 sm:gap-3` for breathing room between podium columns

### Slight pillar padding adjustment
- 2nd place: `px-3` to `px-4` on mobile
- 3rd place: `px-2.5` to `px-3` on mobile

These are minimal, targeted tweaks -- no structural changes, no new dependencies.

## Safety
- Only modifies podium visual layout in Leaderboard.tsx
- No logic, data fetching, or navigation changes
- No other pages affected
