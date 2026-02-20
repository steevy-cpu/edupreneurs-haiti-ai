

# Feed Plan B — Cursor-Based Pagination and New Post Badge

## Overview

Three targeted fixes: replace the hard 50-post limit with cursor-based infinite scroll (20 per page), replace realtime auto-prepend with a "Nouveau post" badge to prevent scroll jumps, and add scroll-anchoring CSS. No changes to Plan A code paths (parallel queries, lazy comments, grade tags).

---

## Fix 1 — Cursor-Based Infinite Scroll

### `src/hooks/useFeedData.ts`

Restructure the data layer to support paginated fetching:

**A) Rename `fetchFeedPosts` to accept an optional cursor parameter:**

```typescript
const PAGE_SIZE = 20;

const fetchFeedPosts = async (cursor?: string): Promise<Post[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  _lastFetchedUserId = user.id;

  // Build query with optional cursor for pagination
  let query = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data: postsData, error } = await query;
  // ... rest of enrichment unchanged (Promise.all for profiles, likes, counts, shares)
};
```

**B) Add `fetchMorePosts` and `hasMore` to the hook return:**

- Track `hasMore` by checking if the returned page has `PAGE_SIZE` items (fewer = no more)
- `fetchMorePosts()` reads the `created_at` of the last post in the current array as cursor, fetches next page, enriches it, and **appends** to the TanStack Query cache
- `isFetchingMore` loading state to show bottom spinner
- Keep `initialData` from localStorage for instant first page only
- Persist only the first page to localStorage (not accumulated pages)

**C) Update `usePrefetchNavigation` to use PAGE_SIZE:**

Just update the limit constant reference; no functional change.

### `src/pages/Feed.tsx`

**A) Add IntersectionObserver for infinite scroll:**

```typescript
const sentinelRef = useRef<HTMLDivElement>(null);
const scrollContainerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (!sentinelRef.current || isVisitor) return;
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore && !isFetchingMore) {
        fetchMorePosts();
      }
    },
    { rootMargin: '200px' } // Trigger 200px before reaching bottom
  );
  observer.observe(sentinelRef.current);
  return () => observer.disconnect();
}, [hasMore, isFetchingMore, isVisitor]);
```

**B) Add sentinel div after post list (line ~1397):**

```tsx
{displayPosts.map((post) => (
  // ... existing post cards
))}

{/* Infinite scroll sentinel */}
{isFetchingMore && (
  <div className="flex justify-center py-4">
    <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
  </div>
)}

{!hasMore && displayPosts.length > 0 && (
  <div className="text-center py-6 text-sm text-muted-foreground">
    Tu as tout vu! 🎉
  </div>
)}

{/* Invisible trigger for IntersectionObserver */}
<div ref={sentinelRef} className="h-1" />
```

---

## Fix 2 — New Post Badge Instead of Auto-Prepend

### `src/pages/Feed.tsx`

**A) Add new state for queued posts:**

```typescript
const [newPostsQueue, setNewPostsQueue] = useState<Post[]>([]);
const scrollContainerRef = useRef<HTMLDivElement>(null);
```

**B) Modify the realtime INSERT handler (line 288-306):**

Instead of calling `addPostOptimistically`, check scroll position:

```typescript
// Inside INSERT handler:
const scrollContainer = scrollContainerRef.current;
const isAtTop = scrollContainer ? scrollContainer.scrollTop < 100 : true;

if (isAtTop) {
  // User is at top — prepend directly (no scroll jump)
  addPostOptimistically(enrichedPost);
} else {
  // User is scrolling — queue for badge
  setNewPostsQueue(prev => [enrichedPost, ...prev]);
}
```

**C) Add floating badge UI (inside the section, above the post list):**

```tsx
{/* New posts badge — shown when posts arrive while user is scrolling */}
{newPostsQueue.length > 0 && (
  <motion.button
    initial={{ y: -40, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -40, opacity: 0 }}
    onClick={() => {
      // Prepend all queued posts and scroll to top
      newPostsQueue.forEach(p => addPostOptimistically(p));
      setNewPostsQueue([]);
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }}
    className="sticky top-2 z-30 mx-auto flex items-center gap-1.5 px-3 py-1.5 
               bg-primary text-primary-foreground rounded-full shadow-lg text-sm font-medium
               hover:bg-primary/90 transition-colors"
  >
    <ArrowUp className="h-3.5 w-3.5" />
    {newPostsQueue.length} nouveau{newPostsQueue.length > 1 ? 'x' : ''} post{newPostsQueue.length > 1 ? 's' : ''}
  </motion.button>
)}
```

**D) Add `ref={scrollContainerRef}` to the feed section element (line 1102).**

**E) Import `motion` from framer-motion and `ArrowUp` from lucide-react.**

---

## Fix 3 — Scroll Anchoring CSS

### `src/pages/Feed.tsx` (line 1102)

Add `overflow-anchor: auto` to the scrollable feed section and individual post cards:

```tsx
<section 
  ref={scrollContainerRef}
  className="flex-1 overflow-y-auto overscroll-contain pb-20 lg:pb-6"
  style={{ overflowAnchor: 'auto' }}
>
```

This is a one-line CSS addition that prevents scroll jumps when comments expand below the viewport.

---

## Files Changed

| File | Change |
|---|---|
| `src/hooks/useFeedData.ts` | Add cursor param, PAGE_SIZE=20, fetchMorePosts, hasMore, isFetchingMore |
| `src/pages/Feed.tsx` | IntersectionObserver, sentinel div, new post badge, scroll anchoring, ArrowUp import |

## Safety Verification

| Check | Expected Result |
|---|---|
| Initial load fetches 20 posts instead of 50 | Yes -- PAGE_SIZE = 20, limit(20) in query |
| Scrolling to bottom loads next 20 posts | Yes -- IntersectionObserver triggers fetchMorePosts with cursor |
| Enrichment (profiles, likes, counts, shares) works for each page | Yes -- same Promise.all pattern applied per page |
| New post badge appears when a followed user posts while scrolling | Yes -- scrollTop >= 100 queues post instead of prepending |
| Clicking badge prepends posts and scrolls to top | Yes -- forEach addPostOptimistically + scrollTo(0) |
| Auto-prepend when user is already at top | Yes -- scrollTop < 100 bypasses queue |
| "Tu as tout vu" message when no more posts | Yes -- hasMore=false when returned count < PAGE_SIZE |
| Existing post interactions (like, share, delete, edit) unaffected | Yes -- no changes to those handlers |
| Plan A features (parallel queries, lazy comments, grade tags) untouched | Yes -- only cursor/pagination logic added |
| localStorage persistence still works for first page | Yes -- persistQueryData called with first page only |
| Visitor mode unaffected | Yes -- visitor posts bypass all pagination logic |

