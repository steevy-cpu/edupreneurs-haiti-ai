

# Fix: Video Double-Save Issue in Content Editor

## Problem Identified

Super users must save a video twice for it to appear in the UI because the query cache invalidation is not awaited. The mutation completes and UI updates before the refetch finishes.

## Root Cause Analysis

In `src/hooks/usePassionVideos.ts`, the `onSuccess` callback for both `useSavePassionVideo` and `useDeletePassionVideo` mutations does NOT await the invalidation promises:

```typescript
// CURRENT CODE (lines 91-95)
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['passion-videos'] });      // Fire & forget
  queryClient.invalidateQueries({ queryKey: ['passion-videos-all'] });  // Fire & forget
  toast.success("Vidéo enregistrée avec succès");
},
```

When `mutateAsync` resolves, the refetch is still in-flight. The UI reacts to the mutation completing, but `allVideos` data hasn't updated yet.

### Timeline of First Save (Broken)

```text
1. User clicks Save
2. mutateAsync sends data to Supabase
3. Supabase responds with success
4. onSuccess fires:
   - invalidateQueries() called (starts refetch in background)
   - toast.success() shows
5. mutateAsync Promise resolves
6. Component's finally block: setSavingActivity(null)
7. UI shows "saved" but allVideos is STILL the old data
8. ~200ms later: refetch completes, allVideos updates, but UI already showed "not configured"
```

### Timeline of Second Save (Works)

```text
1. User clicks Save again
2. This time allVideos ALREADY has the data from the background refetch
3. UI correctly shows configured status
```

---

## Solution

Make the `onSuccess` callback `async` and await the invalidation promises using `Promise.all`. This ensures the mutation doesn't resolve until the fresh data is available.

---

## Files to Modify

### 1. `src/hooks/usePassionVideos.ts`

**Change 1: useSavePassionVideo - lines 91-95**

```typescript
// BEFORE
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['passion-videos'] });
  queryClient.invalidateQueries({ queryKey: ['passion-videos-all'] });
  toast.success("Vidéo enregistrée avec succès");
},

// AFTER
onSuccess: async () => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['passion-videos'] }),
    queryClient.invalidateQueries({ queryKey: ['passion-videos-all'] })
  ]);
  toast.success("Vidéo enregistrée avec succès");
},
```

**Change 2: useDeletePassionVideo - lines 126-130**

```typescript
// BEFORE
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['passion-videos'] });
  queryClient.invalidateQueries({ queryKey: ['passion-videos-all'] });
  toast.success("Vidéo supprimée avec succès");
},

// AFTER
onSuccess: async () => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['passion-videos'] }),
    queryClient.invalidateQueries({ queryKey: ['passion-videos-all'] })
  ]);
  toast.success("Vidéo supprimée avec succès");
},
```

### 2. `src/hooks/usePassionRecommendedVideos.ts`

Apply the same fix to recommended videos for consistency:

**Change 3: useSavePassionRecommendedVideo - lines 124-127**

```typescript
// AFTER
onSuccess: async () => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['passion-recommended-videos'] }),
    queryClient.invalidateQueries({ queryKey: ['passion-recommended-videos-all'] })
  ]);
  toast.success("Vidéo recommandée ajoutée avec succès");
},
```

**Change 4: useDeletePassionRecommendedVideo - lines 149-153**

```typescript
// AFTER
onSuccess: async () => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['passion-recommended-videos'] }),
    queryClient.invalidateQueries({ queryKey: ['passion-recommended-videos-all'] })
  ]);
  toast.success("Vidéo recommandée supprimée");
},
```

---

## Technical Explanation

`invalidateQueries()` returns a Promise that resolves when the refetch completes. By awaiting it:

1. The `onSuccess` callback becomes async
2. React Query waits for the callback to complete before resolving `mutateAsync`
3. The component's `finally` block runs AFTER fresh data is available
4. `allVideos` is updated when the loading state clears
5. The `categoryTree` useMemo recalculates with fresh data
6. UI shows the correct configured status immediately

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Same logic, just awaited |
| Increases latency? | Slightly | ~100-200ms for refetch, but ensures correct UI |
| User experience impact? | Positive | Spinner stays active until data is ready |
| Error handling preserved? | Yes | onError still catches errors properly |
| 3G optimization? | Maintained | No additional network calls, same refetch pattern |
| Backward compatible? | Yes | No API changes to hooks |

---

## Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| Double-save required | `invalidateQueries` not awaited | Add `async/await` to `onSuccess` |
| Stale UI after save | Refetch in-flight when UI updates | Use `Promise.all` to wait for refetch |
| Affects both hooks | Same pattern in both files | Fix both `usePassionVideos` and `usePassionRecommendedVideos` |

