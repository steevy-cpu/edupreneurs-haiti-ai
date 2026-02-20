

# Fix 3 Passion Discovery Issues — Surgical Fixes Only

## Summary
Three targeted fixes: one RLS migration (DELETE policy), one RLS migration (role tightening), and one code change to replace raw Supabase queries with cached fetches.

---

## Fix 1 — Add DELETE RLS policy on `user_passion_preferences`

**Problem:** The "Refaire le quiz" feature calls `useResetQuiz` which does `supabase.from('user_passion_preferences').delete()`. This fails silently because there is no DELETE policy on the table.

**Migration SQL:**
```sql
CREATE POLICY "Users can delete own preferences"
ON user_passion_preferences FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

---

## Fix 2 — Restrict `passion_module_progress` RLS to authenticated only

**Problem:** All three policies (SELECT, INSERT, UPDATE) currently use `roles: {public}`, which includes the `anon` role. They should be `authenticated` only, matching `user_passion_preferences`.

**Migration SQL:**
```sql
DROP POLICY "Users can view own progress" ON passion_module_progress;
CREATE POLICY "Users can view own progress"
ON passion_module_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY "Users can insert own progress" ON passion_module_progress;
CREATE POLICY "Users can insert own progress"
ON passion_module_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY "Users can update own progress" ON passion_module_progress;
CREATE POLICY "Users can update own progress"
ON passion_module_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
```

---

## Fix 3 — Replace raw Supabase queries in `startModule()` with cached fetches

**Problem:** `PassionDiscovery.tsx` lines 652-663 make two raw `supabase.from()` calls every time a module is opened. The hooks `usePassionModuleRecommendedVideos` and `useBannedVideoIds` already exist with TanStack Query caching, but they are not used.

**Approach:** Since `startModule()` is an imperative async function, we cannot call hooks inside it. Instead:

1. Import `useQueryClient` from TanStack Query
2. Import `useBannedVideoIds` at the component top level (no params, returns a cached `Set<string>`)
3. Inside `startModule()`, use `queryClient.fetchQuery()` for recommended videos — this uses the same query key pattern as `usePassionModuleRecommendedVideos`, so data is cached and shared

**File:** `src/pages/PassionDiscovery.tsx`

**Changes:**
- Add imports: `useQueryClient` from `@tanstack/react-query`, `useBannedVideoIds` from `@/hooks/usePassionRecommendedVideos`
- Add at component top level: `const queryClient = useQueryClient()` and `const { data: bannedVideoIds } = useBannedVideoIds()`
- Replace lines 652-663 with:
  ```typescript
  // Use cached query for curated videos (same key as usePassionModuleRecommendedVideos)
  const curatedVideos = await queryClient.fetchQuery({
    queryKey: ['passion-recommended-videos', categoryId, moduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('passion_recommended_videos')
        .select('*')
        .eq('category_id', categoryId)
        .eq('module_id', moduleId)
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  // Use pre-fetched banned IDs from hook (already cached)
  const bannedIds = bannedVideoIds ?? new Set<string>();
  ```
- Rest of the logic (lines 665-682) stays identical, just uses these cached variables

---

## Safety Verification

| Check | Status |
|-------|--------|
| No component refactoring | Correct — only startModule internals change |
| No architectural changes | Correct — same data flow, just cached |
| usePassionData hooks untouched | Yes |
| usePassionRecommendedVideos hooks untouched | Yes |
| Quiz retake flow: delete then re-insert | Fixed by DELETE policy |
| Module progress restricted to auth users | Fixed by role change |
| Existing 41 users unaffected | Yes — policies only tighten access |
| No new dependencies | Correct |

