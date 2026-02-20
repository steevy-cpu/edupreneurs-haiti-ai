

# Feed Plan C -- UX Polish

## Overview

Five targeted fixes: post entry animations with network-awareness, pull-to-refresh on mobile, consolidate duplicate post creation, fix share-via-DM N+1 query, and increase content truncation to 280 characters. No changes to Plan A or Plan B code paths.

---

## Fix 1 -- Post Entry Animations

**File:** `src/pages/Feed.tsx`

Import `useNetworkAwareAnimations` and wrap each post card in a `motion.div`:

```typescript
import { useNetworkAwareAnimations } from "@/hooks/useNetworkAwareAnimations";

// Inside component:
const { shouldAnimate } = useNetworkAwareAnimations();
// Track whether we're on the initial load vs paginated load
const initialLoadCompleteRef = useRef(false);
```

In the `displayPosts.map()` block (line 1199), wrap each post card:

```tsx
{displayPosts.map((post, index) => (
  <motion.div
    key={post.id}
    initial={shouldAnimate ? { opacity: 0, y: 16 } : false}
    animate={{ opacity: 1, y: 0 }}
    transition={shouldAnimate ? {
      duration: 0.25,
      ease: "easeOut",
      // Stagger only on initial load, capped at 0.3s
      delay: !initialLoadCompleteRef.current ? Math.min(index * 0.05, 0.3) : 0,
    } : { duration: 0 }}
    className="bg-card rounded-xl shadow-sm border border-border/30 overflow-hidden"
  >
    {/* ... existing post content ... */}
  </motion.div>
))}
```

After the initial render, set `initialLoadCompleteRef.current = true` using an effect that fires once posts load. This ensures paginated posts animate in simultaneously (no stagger).

When `shouldAnimate` is false (slow connection), `initial` is set to `false` (no animation at all -- instant render).

---

## Fix 2 -- Pull-to-Refresh on Mobile

**File:** `src/pages/Feed.tsx`

Add touch event handlers to the scroll container for pull-to-refresh:

```typescript
const [pullDistance, setPullDistance] = useState(0);
const [isPulling, setIsPulling] = useState(false);
const touchStartY = useRef(0);

const handleTouchStart = (e: React.TouchEvent) => {
  // Only activate when scrolled to top
  if (scrollContainerRef.current?.scrollTop === 0) {
    touchStartY.current = e.touches[0].clientY;
    setIsPulling(true);
  }
};

const handleTouchMove = (e: React.TouchEvent) => {
  if (!isPulling) return;
  const deltaY = e.touches[0].clientY - touchStartY.current;
  if (deltaY > 0) {
    // Resistance factor: indicator moves slower than finger
    setPullDistance(deltaY * 0.4);
  }
};

const handleTouchEnd = () => {
  if (pullDistance > 60 && !isRefreshing && !isFetchingMore) {
    refreshFeed();
    toast({ title: "Actualisation...", description: "Le fil d'actualite est en cours de mise a jour." });
  }
  setPullDistance(0);
  setIsPulling(false);
};
```

Add the handlers to the scroll container section element (line 1135):

```tsx
<section
  ref={scrollContainerRef}
  className="flex-1 overflow-y-auto overscroll-contain pb-20 lg:pb-6"
  style={{ overflowAnchor: 'auto' }}
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
```

Add a pull-to-refresh indicator at the top of the section, before the max-w-2xl div:

```tsx
{/* Pull-to-refresh indicator */}
{pullDistance > 0 && (
  <div 
    className="flex justify-center py-2 transition-transform"
    style={{ transform: `translateY(${Math.min(pullDistance, 80)}px)` }}
  >
    <RefreshCw className={`h-5 w-5 text-muted-foreground ${pullDistance > 60 ? 'text-primary animate-spin' : ''}`} />
  </div>
)}
```

---

## Fix 3 -- Consolidate Duplicate Post Creation

**File:** `src/pages/Feed.tsx`

Remove the inline `createPost()` function (lines 432-548) and all its associated state:
- Remove: `newPostContent`, `isCreatingPost`, `isPublicPost`, `selectedImage`, `selectedVideo`, `imagePreview`, `videoPreview`, `fileInputRef`
- Remove: `handleImageSelect()` (lines 359-395), `handleVideoSelect()` (lines 397-430)
- These are all duplicated by `CreatePostDialog.tsx` which has better features (mentions, upload progress)

The `CreatePostDialog` is already used in the header (line 1128). Change its `onPostCreated` callback from `refreshFeed` to an optimistic prepend:

```tsx
<CreatePostDialog 
  currentUser={currentUser} 
  onPostCreated={() => {
    // Optimistic: realtime INSERT handler will prepend the new post,
    // but also refresh to ensure data consistency
    refreshFeed();
  }} 
/>
```

Note: The `onPostCreated` callback currently just calls `refreshFeed()` -- this is already correct since the realtime INSERT handler (Fix 4 from Plan A) will prepend the new post before the refresh completes if the user is at the top. No further change needed to `CreatePostDialog.tsx` itself.

The key benefit is removing ~200 lines of duplicated code from Feed.tsx that lacked @mentions, upload progress tracking, and video thumbnails.

---

## Fix 4 -- Fix Share-via-DM N+1 Query

**File:** `src/pages/Feed.tsx`

Replace the `sendPostAsMessage()` function (lines 818-896) which loops through all conversation participants (N+1 pattern) with a single `start_direct_conversation` RPC call:

```typescript
const sendPostAsMessage = async (recipientUserId: string) => {
  if (!currentUser || !selectedPostToShare) return;
  setSendingMessage(true);

  try {
    // Single RPC call finds or creates DM conversation (replaces N+1 loop)
    const { data: conversationId, error: convError } = await supabase
      .rpc("start_direct_conversation", { other_user_id: recipientUserId });

    if (convError) throw convError;

    // Send the shared post message
    const { error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content: "📝 Post partage",
        shared_post_id: selectedPostToShare.id,
      });

    if (messageError) throw messageError;

    // Record the share
    await supabase
      .from("post_shares")
      .insert({ post_id: selectedPostToShare.id, user_id: currentUser.id });

    toast({ title: "Succes", description: "Post envoye en message" });
    setShareDialogOpen(false);
    setSelectedPostToShare(null);
  } catch (error) {
    console.error("Error sending message:", error);
    toast({ title: "Erreur", description: "Impossible d'envoyer le message", variant: "destructive" });
  } finally {
    setSendingMessage(false);
  }
};
```

This replaces the N+1 loop (fetch all conversations then check participants for each) with a single `start_direct_conversation` RPC that atomically finds or creates the DM.

---

## Fix 5 -- Content Truncation to 280 Characters

**File:** `src/pages/Feed.tsx`

Change the truncation threshold from 150 to 280 in 3 places (lines 1297, 1300, 1308):

```tsx
// Add constant at top of component or module
const MAX_CONTENT_PREVIEW = 280;

// Line 1297: 
{renderContentWithLinks(post.content.length > MAX_CONTENT_PREVIEW && !expandedPosts[post.id]
  ? post.content.slice(0, MAX_CONTENT_PREVIEW)
  : post.content)}

// Line 1300:
{post.content.length > MAX_CONTENT_PREVIEW && !expandedPosts[post.id] && (

// Line 1308:
{post.content.length > MAX_CONTENT_PREVIEW && expandedPosts[post.id] && (
```

---

## Files Changed

| File | Change |
|---|---|
| `src/pages/Feed.tsx` | Post animations, pull-to-refresh, remove inline createPost, fix share RPC, 280-char truncation |

No new files. No changes to Plan A or Plan B code.

## Safety Verification

| Check | Expected Result |
|---|---|
| Post animations fade-in and slide-up on initial load with stagger | Yes -- index * 0.05 delay capped at 0.3s |
| Paginated posts animate in simultaneously (no stagger) | Yes -- initialLoadCompleteRef skips delay |
| Animations disabled on slow connections | Yes -- shouldAnimate=false sets initial to false |
| Pull-to-refresh triggers reload when pulled 60px from top | Yes -- pullDistance > 60 calls refreshFeed() |
| Pull-to-refresh disabled during loading states | Yes -- guard on isRefreshing and isFetchingMore |
| Inline createPost removed, CreatePostDialog used exclusively | Yes -- ~200 lines removed, Dialog already in header |
| New posts from dialog appear in feed | Yes -- realtime INSERT prepends + refreshFeed fallback |
| Share-via-DM uses start_direct_conversation RPC (1 query) | Yes -- replaces N+1 conversation_participants loop |
| Content truncation at 280 characters | Yes -- constant MAX_CONTENT_PREVIEW = 280 |
| Plan A features (parallel queries, lazy comments, grade tags) untouched | Yes |
| Plan B features (pagination, new post badge, scroll anchoring) untouched | Yes |

