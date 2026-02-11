

# Lesson Search Bar for Subject Pages

## Overview
Add an inline search bar to each subject/course page that lets users instantly filter lessons by title without scrolling. The search is purely client-side (lessons are already loaded), so it works instantly even on 3G.

## Placement
The search bar will sit between the MonthQuickNav and the ProgressCard -- right where the user's eye lands after seeing the stats and month navigation. This keeps it visible without pushing important content down.

## Architecture

### New Component: `src/components/course/LessonSearchBar.tsx`
A standalone, focused component following the existing `src/components/course/` pattern.

**Props:**
- `searchQuery: string` -- controlled input value
- `onSearchChange: (query: string) => void` -- callback on input change
- `totalResults: number` -- how many lessons match (for feedback)
- `totalLessons: number` -- total lesson count (for context)

**Behavior:**
- Search icon on the left, clear (X) button on the right when text is present
- Debounce-free (client-side filtering is instant, no need for debounce)
- Shows result count feedback: "3 sur 39 lecons" when filtering
- Placeholder: "Rechercher une lecon..."
- Compact on mobile, slightly wider on desktop

### Modifications to `src/pages/DynamicCoursePage.tsx`
1. Add `searchQuery` state
2. Add a `filteredLessons` useMemo that filters lessons by title match (case-insensitive, accent-insensitive using `normalize('NFD')`)
3. Place `LessonSearchBar` between MonthQuickNav and ProgressCard
4. When searching: hide month sections, show a flat filtered grid instead
5. When search is empty: show normal month-based layout (no change)

### Filtering Logic (accent-insensitive for Haitian/French content)
```typescript
const normalize = (str: string) =>
  str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const filteredLessons = useMemo(() => {
  if (!searchQuery.trim()) return null; // null = show all months
  const q = normalize(searchQuery);
  return lessons.filter(l => normalize(l.title).includes(q));
}, [lessons, searchQuery]);
```

This ensures "biodegradable" matches "biodégradable".

### Export Update: `src/components/course/index.ts`
Add `LessonSearchBar` to the barrel export file.

## UI Behavior Summary

| State | What the user sees |
|-------|-------------------|
| No search query | Normal month-grouped layout (unchanged) |
| Typing a query | Month sections hidden, flat grid of matching lessons shown |
| No results | Friendly empty state: "Aucune lecon trouvee pour [query]" with a clear button |
| Clear button clicked | Returns to normal month layout |

## Technical Details

### File changes:
1. **NEW** `src/components/course/LessonSearchBar.tsx` -- search input component (~50 lines)
2. **EDIT** `src/components/course/index.ts` -- add export
3. **EDIT** `src/pages/DynamicCoursePage.tsx` -- add search state, filtering logic, conditional rendering

### Safety

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- search is additive; empty search = original layout |
| Works with existing data? | Yes -- filters the already-loaded `lessons` array |
| 3G optimized? | Yes -- no network calls, pure client-side filtering |
| Backward compatible? | Yes -- no data model changes |
| Edge cases? | Empty lessons, accent characters, partial matches all handled |
