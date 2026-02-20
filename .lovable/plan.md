

# Fix: Add new_post push to Feed.tsx inline post form

## Problem

The inline quick-post form in `Feed.tsx` inserts posts at line 434 but has no follower push notification — only `CreatePostDialog.tsx` was updated in Plan B.

## One required tweak

The current insert at line 434 uses:
```typescript
const { error } = await supabase.from("posts").insert({...});
```

It does not call `.select().single()`, so there is no `newPost.id` available for the `entityId` field. The fix must change the insert to return the created row:

```typescript
const { data: newPost, error } = await supabase.from("posts").insert({...}).select().single();
```

Then add the identical follower push block from `CreatePostDialog.tsx` after the success path (after line 462, before the closing `};` on line 463).

## Changes (single file)

**File:** `src/pages/Feed.tsx`

1. **Line 434** — Change destructuring from `{ error }` to `{ data: newPost, error }` and append `.select().single()` to the insert chain.

2. **After line 462** (after the success toast) — Insert the follower push block:

```typescript
// Send push notification to followers for the new post
// DB trigger handles in-app notifications; this adds browser push
try {
  const { data: followers } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', currentUser.id)
    .eq('status', 'accepted');

  if (followers && followers.length > 0 && newPost) {
    Promise.all(
      followers.map(f =>
        supabase.functions.invoke('send-push-notification', {
          body: {
            recipientUserId: f.follower_id,
            actorId: currentUser.id,
            type: 'new_post',
            entityId: newPost.id,
            url: '/feed',
          }
        })
      )
    ).catch(err => console.error('Push notification error for new_post:', err));
  }
} catch (pushErr) {
  console.error('Error sending new_post push notifications:', pushErr);
}
```

## Safety

| Check | Status |
|---|---|
| Existing insert behavior unchanged | Yes — `.select().single()` returns the same row, error handling identical |
| Push targets followers only, not author | Yes — `following_id = currentUser.id` with `status = 'accepted'` |
| Null-safe if insert somehow returns no data | Yes — `newPost` guard added |
| No new dependencies | Correct |
| No other files touched | Correct |

