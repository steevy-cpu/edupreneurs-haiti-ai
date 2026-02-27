
# Fix: BatchGenerationValidation showing 1000 instead of actual count

## Problem
When clicking "Lancer generation" with "Sections vides uniquement" enabled:
1. `fetchLessons()` queries ALL lessons (capped at 1000 by default Supabase limit)
2. The confirmation dialog shows `lessons.length` = 1000 (the pre-filter count)
3. The `onlyEmpty` filter is applied client-side AFTER the dialog, so users see a misleading "1000 lecons" warning
4. Even if there were fewer than 1000, the query still fetches unnecessary data on 3G connections

## Solution
Two changes in `fetchLessons()` inside `BatchGenerationValidation.tsx`:

### Change 1: Move `onlyEmpty` filter to SQL (server-side)
When `onlyEmpty` is true and no specific lessons are selected, add `.or()` filters to the query so only lessons with missing content are returned. This replaces the client-side filter at lines 367-371.

```typescript
// Before building the query, if onlyEmpty is true, add SQL filters
if (onlyEmpty && selectedLessonIds.length === 0 && selectedSections.length > 0) {
  // Build OR clause: section IS NULL or section = ''
  const orClauses = selectedSections.map(s => `${s}.is.null,${s}.eq.`).join(',');
  query = query.or(orClauses);
}
```

### Change 2: Remove the client-side fallback filter
Delete lines 367-371 (the `if (onlyEmpty && ...)` block) since it's now handled server-side.

### Change 3: Add explicit row limit with pagination awareness
Add `.limit(2000)` to avoid silent truncation, and if more than 2000 lessons match, show a warning asking the user to narrow their filters.

## Files Modified
- `src/components/content-editor/BatchGenerationValidation.tsx` — `fetchLessons()` function only

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- same data, filtered earlier |
| Affects Provider Stack / AppShell? | No |
| New dependencies? | No |
| Works on 3G? | Better -- less data transferred |
| RLS impact? | None |
| Backward compatible? | Yes |
