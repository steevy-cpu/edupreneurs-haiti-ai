

# Feed Plan A — Performance Improvements and Grade Tags

## Overview

Five targeted fixes to the feed page: parallelize queries, lazy-load comments, remove duplicate auth, fix realtime to targeted updates, and add grade tags. No pagination, UX animation, or PostCard refactoring changes.

---

## Fix 1 — Parallelize Feed Enrichment Queries

**File:** `src/hooks/useFeedData.ts`

Current `fetchFeedPosts()` runs 7 sequential queries (lines 13-54). Restructure to 3 hops:

```text
Hop 1: auth.getUser()
Hop 2: posts SELECT (limit 50)
Hop 3: Promise.all([profiles, likes, commentCounts, shares])
```

Key changes:
- Replace the full comments fetch (lines 39-49) with a COUNT query grouped by post_id: `SELECT post_id, count(*) FROM post_comments WHERE post_id IN (...) GROUP BY post_id`
- Include `academic_grade` in the profiles SELECT (currently `select("*")` already fetches it, but we make it explicit)
- Remove `comments` and `commentProfiles` from the parallel batch entirely
- The enrichment loop sets `commentCount` from the count query and `comments: []` (empty -- loaded lazily)
- Remove the is_founder RPC call from the feed data hook (it belongs in the component, already handled there)

**Impact:** 7 sequential hops reduced to 3. On 3G (300ms RTT): ~2.1s down to ~0.9s.

---

## Fix 2 — Lazy Load Comments Per Post

**Files:** `src/hooks/useFeedData.ts`, `src/pages/Feed.tsx`

### New hook: `useLazyComments` (add to `useFeedData.ts` or a new file `src/hooks/useLazyComments.ts`)

```typescript
export const useLazyComments = () => {
  const [commentsCache, setCommentsCache] = useState<Record<string, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});

  const fetchCommentsForPost = async (postId: string) => {
    // Skip if already cached or count is 0
    if (commentsCache[postId]) return;
    
    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    
    // Fetch comments + commenter profiles in parallel
    const [commentsRes, ...] = await Promise.all([...]);
    
    // Build nested structure (top-level + replies)
    // Cache result
    setCommentsCache(prev => ({ ...prev, [postId]: result }));
    setLoadingComments(prev => ({ ...prev, [postId]: false }));
  };

  return { commentsCache, loadingComments, fetchCommentsForPost };
};
```

### Feed.tsx changes:

- Import and use `useLazyComments`
- When user clicks comment button (line 1238), call `fetchCommentsForPost(post.id)` if `commentCount > 0` and not already cached
- In the comments section (line 1267-1318):
  - If `loadingComments[post.id]` is true: show 2-3 comment skeleton rows
  - If `commentsCache[post.id]` exists: render those comments
  - If `commentCount === 0`: show "Aucun commentaire" immediately (no fetch)
- After adding a new comment successfully, append it to the local `commentsCache` for that post and increment the `commentCount` via `updatePostOptimistically`

### Update Post type in `src/types/feed.ts`:

- `comments` field becomes optional and is no longer populated by the initial fetch
- No breaking change since existing code already checks `post.comments && post.comments.length > 0`

---

## Fix 3 — Remove Duplicate Auth Call

**File:** `src/pages/Feed.tsx`

The `checkAuth()` function (line 259-270) calls `supabase.auth.getUser()` redundantly -- `useFeedData` already calls it inside `fetchFeedPosts()`.

Replace `checkAuth()` with a simpler approach:
- Use the session/user from `SessionAuthProvider` context (already available in the app) or derive `currentUser` from the feed data hook
- If not available from context, keep the auth call but deduplicate by checking if the user is already set

Simplest safe fix: Add `currentUserId` to the return value of `useFeedData` (captured during the fetch), then in Feed.tsx set `currentUser` from that instead of making a separate auth call.

---

## Fix 4 — Targeted Realtime Cache Updates

**File:** `src/pages/Feed.tsx` (lines 283-302)

Replace the current `refreshFeed()` call on any posts change with targeted handlers:

```typescript
const subscribeToNewPosts = () => {
  const channel = supabase
    .channel("posts-changes")
    .on("postgres_changes", {
      event: "INSERT", schema: "public", table: "posts",
    }, async (payload) => {
      // Fetch only the new post's author profile
      const newPost = payload.new;
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, nickname, avatar_url, verified, academic_grade")
        .eq("user_id", newPost.user_id)
        .single();
      
      // Prepend to cache with zero counts
      addPostOptimistically({
        ...newPost,
        profile,
        likes: 0, isLiked: false,
        comments: [], commentCount: 0,
        shareCount: 0, isShared: false,
      });
    })
    .on("postgres_changes", {
      event: "UPDATE", schema: "public", table: "posts",
    }, (payload) => {
      updatePostOptimistically(payload.new.id, payload.new);
    })
    .on("postgres_changes", {
      event: "DELETE", schema: "public", table: "posts",
    }, (payload) => {
      removePostOptimistically(payload.old.id);
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
};
```

Note: The INSERT handler must respect RLS -- only posts visible to the current user will arrive via realtime (RLS filters the channel). For the INSERT, we fetch the author profile (1 query) instead of refetching all 50 posts + enrichment.

---

## Fix 5 — Grade Tags on Post Cards

**File:** `src/pages/Feed.tsx` (lines 1107-1126), `src/types/feed.ts`

### Type update (`src/types/feed.ts`):

Add `academic_grade` to the Profile interface:
```typescript
export interface Profile {
  // ... existing fields
  academic_grade?: string | null;
}
```

### Grade color map (add as constant in Feed.tsx or a shared util):

```typescript
const GRADE_COLORS: Record<string, string> = {
  '7AF': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  '8AF': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  '9AF': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'NS1': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'NS2': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  'NS3': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'NS4': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  'UNIV': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};
```

### Display (in the post header, line ~1118, after the Globe icon):

```tsx
{post.profile?.academic_grade && 
 post.profile.academic_grade !== 'NONE' && 
 GRADE_COLORS[post.profile.academic_grade] && (
  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${GRADE_COLORS[post.profile.academic_grade]}`}>
    {post.profile.academic_grade}
  </span>
)}
```

Dark mode variants included via `dark:` prefixes to ensure readability in both themes.

---

## Files Changed

| File | Change |
|---|---|
| `src/types/feed.ts` | Add `academic_grade` to Profile interface |
| `src/hooks/useFeedData.ts` | Parallelize queries 3-7, replace full comments with count, expose `currentUserId` |
| `src/hooks/useLazyComments.ts` | New hook for on-demand comment loading with cache |
| `src/pages/Feed.tsx` | Wire lazy comments, remove duplicate auth, targeted realtime, grade tags |

## Safety Verification

| Check | Result |
|---|---|
| Parallel query structure correctly enriches all 50 posts | Yes -- profiles, likes, counts, shares all keyed by post_id |
| Comment counts display correctly before lazy load | Yes -- COUNT query grouped by post_id populates `commentCount` |
| Clicking comment on a post with comments shows skeleton then loads | Yes -- `loadingComments[postId]` triggers skeleton, then cache renders |
| Clicking comment on post with 0 comments shows empty state immediately | Yes -- `commentCount === 0` skips fetch, shows "Aucun commentaire" |
| Realtime INSERT prepends without full refetch | Yes -- single profile fetch + `addPostOptimistically` |
| Realtime UPDATE patches in place | Yes -- `updatePostOptimistically` |
| Realtime DELETE removes from cache | Yes -- `removePostOptimistically` |
| Grade tags display correct colors per grade | Yes -- explicit color map with dark mode support |
| Posts without `academic_grade` show no tag | Yes -- null/NONE/missing key all filtered out |
| Existing post interactions (like, share, delete, edit, report) unaffected | Yes -- no changes to those code paths |
| Visitor mode unaffected | Yes -- visitor check runs before any data fetch changes |
| localStorage persistence still works | Yes -- `persistQueryData` call unchanged |

