

# Fix Lesson Page Routing Issue

## Problem Identified

The "Leçon non trouvée" error is caused by using `.single()` in `DynamicLessonPage.tsx` which throws an error when no row is found, instead of gracefully handling the missing record.

### Root Causes

1. **Supabase `.single()` throws errors** - When a subject or lesson isn't found, `.single()` throws a `PGRST116` error rather than returning `null`. This error gets caught silently and results in `lesson` and `subject` being `null`, showing "Leçon non trouvée".

2. **Missing `is_published` filter** - The lesson detail query (line 100-105) does NOT filter by `is_published = true`, while the navigation query does. This could cause the navigation to show a lesson, but the detail query might find a different version or no results depending on data state.

3. **Edge case with Series slugs** - Some NS3 subjects like `anglais-ns3` (LLA series) don't have a `-lla` suffix, potentially causing confusion in navigation.

---

## Solution: Apply Defensive Error Handling

Following the project's error handling strategy (see memory: `architecture/stability/error-handling-strategy-v12`), replace `.single()` with `.maybeSingle()` and add explicit null checks.

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/DynamicLessonPage.tsx` | Replace `.single()` with `.maybeSingle()` for both subject and lesson queries |

---

## Implementation Details

### Change 1: Subject Query (Line 50-54)

**Before:**
```typescript
const { data: subjectData, error: subjectError } = await supabase
  .from('subjects')
  .select('*')
  .eq('slug', decodedSubjectSlug)
  .single();

if (subjectError) throw subjectError;
```

**After:**
```typescript
const { data: subjectData, error: subjectError } = await supabase
  .from('subjects')
  .select('*')
  .eq('slug', decodedSubjectSlug)
  .maybeSingle();

if (subjectError) throw subjectError;
if (!subjectData) {
  console.warn('Subject not found:', decodedSubjectSlug);
  setIsLoading(false);
  return;
}
```

### Change 2: Lesson Query (Line 100-105)

**Before:**
```typescript
const { data: lessonData, error: lessonError } = await supabase
  .from('lessons')
  .select('*')
  .eq('slug', decodedLessonSlug)
  .eq('subject_id', subjectData.id)
  .single();

if (lessonError) throw lessonError;
```

**After:**
```typescript
const { data: lessonData, error: lessonError } = await supabase
  .from('lessons')
  .select('*')
  .eq('slug', decodedLessonSlug)
  .eq('subject_id', subjectData.id)
  .eq('is_published', true)
  .maybeSingle();

if (lessonError) throw lessonError;
if (!lessonData) {
  console.warn('Lesson not found:', decodedLessonSlug);
  setIsLoading(false);
  return;
}
```

---

## Safety Verification

| Check | Status |
|-------|--------|
| Will this break existing functionality? | No - `.maybeSingle()` returns `null` instead of throwing, making error handling explicit |
| Are there logical errors? | No - Adding explicit null checks prevents silent failures |
| Does this work with existing data? | Yes - Published lessons will still be found normally |
| Is this optimized for 3G? | Yes - No additional queries added |
| Are edge cases handled? | Yes - Null cases are now explicit with console warnings for debugging |
| Is backward compatibility maintained? | Yes - Same UI behavior, just more stable |

---

## Additional Recommendation

For extra debugging, add console logging when lessons aren't found:

```typescript
if (!lessonData) {
  console.warn('Lesson not found:', {
    lessonSlug: decodedLessonSlug,
    subjectSlug: decodedSubjectSlug,
    subjectId: subjectData.id
  });
  setIsLoading(false);
  return;
}
```

This will help identify if users are accessing:
- Old/stale links
- Unpublished lessons
- Invalid subject/lesson combinations

---

## Testing

After implementation, verify:
1. Navigate to a valid published lesson → Should display correctly
2. Navigate to an unpublished lesson → Should show "Leçon non trouvée" gracefully
3. Navigate to a non-existent slug → Should show "Leçon non trouvée" without console errors
4. Console should show warnings (not errors) for not-found cases

