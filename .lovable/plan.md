

# Notifications Plan B — Connect Missing Push Notifications and Clean Up Dead Code

## Overview

5 fixes across multiple files. Connects push notifications to events that currently only create in-app notifications, adds missing UI rendering, and removes unused utility files.

## Pre-Implementation Findings

Key discoveries from the audit:

- **Fix 2 scope correction**: The user's prompt mentions `subscription_renewed` in `verify-moncash-gift`, `verify-gift-payment`, and `stripe-gift-webhook`, but these 3 functions actually use `gift_payment` as the notification type, not `subscription_renewed`. Only `verify-stripe-renewal` uses `subscription_renewed`. The plan adds push calls to all 4 functions, matching each one's actual notification type.
- **Type map gap**: Neither `subscription_renewed` nor `gift_payment` exist in the `getCategoryFromType()` map in `send-push-notification`. Both must be added, mapping to the `system` category (controlled by the Systeme toggle from Plan A).
- **Fix 4 confirmed safe**: Zero imports of `sendPushNotification` or `pushNotificationService` exist anywhere in the codebase. All call sites use `supabase.functions.invoke()` directly.

## Fix 1 — Add push notification for new_post

**File:** `src/components/feed/CreatePostDialog.tsx` (lines 410-431, after mention processing)

The DB trigger `notify_followers_on_new_post()` creates in-app notifications for all followers when a post is inserted. But no push is sent.

**Approach:** After the post is successfully created (line 410) and mentions processed (line 431), query the user's accepted followers from the `follows` table, then fire a push notification to each follower. This matches the pattern used for likes (Feed.tsx line 563) and comments (Feed.tsx line 641).

Add after the mention processing block (after line 431):

```typescript
// Send push notification to followers for the new post
// The DB trigger handles in-app notifications; this adds browser push
try {
  const { data: followers } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', currentUser.id)
    .eq('status', 'accepted');

  if (followers && followers.length > 0) {
    // Fire-and-forget — don't block UI on push delivery
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

**Safety**: The DB trigger already targets followers only (not the post author). The push mirrors this by querying `following_id = currentUser.id` with `status = 'accepted'`. The push uses `type: 'new_post'` which maps to category `post` in the edge function, controlled by the **Contenu** toggle from Plan A.

## Fix 2 — Add push notifications for subscription renewal/gift payment

**4 edge functions** need push calls added after their in-app notification inserts. Also need to add `subscription_renewed` and `gift_payment` to the type map.

### 2a. Update type map in `send-push-notification`

**File:** `supabase/functions/send-push-notification/index.ts` (lines 94-117)

Add two entries to `getCategoryFromType()`:
```
'subscription_renewed': 'system',
'gift_payment': 'system',
```

### 2b. Add push to `verify-stripe-renewal`

**File:** `supabase/functions/verify-stripe-renewal/index.ts` (after line 154, inside the notification try block)

```typescript
// Send push notification for subscription renewal
await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push-notification`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
  },
  body: JSON.stringify({
    recipientUserId: userId,
    title: 'Abonnement renouvelé!',
    body: `Votre abonnement est actif jusqu'au ${newEnd.toLocaleDateString("fr-FR")}`,
    type: 'subscription_renewed',
    url: '/settings?tab=compte',
  }),
});
```

### 2c. Add push to `verify-gift-payment` (after line 170)

Same pattern, using `type: 'gift_payment'`.

### 2d. Add push to `verify-moncash-gift` (after line 209)

Same pattern, using `type: 'gift_payment'`.

### 2e. Add push to `stripe-gift-webhook` (after line 169)

Same pattern, using `type: 'gift_payment'`.

All 4 use `fetch()` to call the push edge function internally (server-to-server), which is the standard Deno pattern since `supabase.functions.invoke()` is not available server-side.

## Fix 3 — Add UI rendering for subscription_renewed and gift_payment

**File:** `src/pages/Notifications.tsx`

### 3a. Update the Notification type union (line 43)

Add `subscription_renewed` and `gift_payment` to the type union string.

### 3b. Add icon case in `getNotificationIcon()` (after line 351)

```typescript
case "subscription_renewed":
case "gift_payment":
  return <CheckCircle size={16} className="text-green-500" />;
```

Import `CheckCircle` from `lucide-react` (add to existing import on line 6).

### 3c. Add text case in `getNotificationText()` (after line 384)

```typescript
case "subscription_renewed":
  return "Ton abonnement a ete renouvele avec succes! 🎉";
case "gift_payment":
  return notification.content || "Un proche a paye votre abonnement! 🎁";
```

## Fix 4 — Delete duplicate push utility files

**Confirmed zero imports:**
- `src/utils/sendPushNotification.ts` — zero imports anywhere
- `src/utils/pushNotificationService.ts` — zero imports anywhere

Both files define helper functions that wrap `supabase.functions.invoke('send-push-notification')`, but every actual call site uses `supabase.functions.invoke()` directly. Both files are dead code.

**Action:** Delete both files.

## Fix 5 — Add push notification for group_deleted

**File:** `src/components/GroupInfoDialog.tsx` (after line 361, after the `notify_group_deletion` RPC call)

The `notify_group_deletion()` DB function creates in-app notifications for all group members except the admin. After this RPC completes, send push to each affected member.

```typescript
// Send push notifications to group members for group deletion
// DB function already created in-app notifications; this adds browser push
try {
  const { data: members } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)
    .neq('user_id', currentUserId);

  if (members && members.length > 0) {
    Promise.all(
      members.map(m =>
        supabase.functions.invoke('send-push-notification', {
          body: {
            recipientUserId: m.user_id,
            actorId: currentUserId,
            type: 'group_deleted',
            title: 'Groupe supprime',
            body: `Le groupe "${group?.name}" a ete supprime`,
            url: '/community',
          }
        })
      )
    ).catch(err => console.error('Push error for group_deleted:', err));
  }
} catch (pushErr) {
  console.error('Error sending group_deleted push:', pushErr);
}
```

**Note:** This query must happen BEFORE the group is actually deleted (line 364-367), because cascade delete will remove `group_members` rows. The code is correctly positioned after the RPC call but before the DELETE.

## Files Changed

| File | Change |
|---|---|
| `src/components/feed/CreatePostDialog.tsx` | Add push to followers after post creation |
| `supabase/functions/send-push-notification/index.ts` | Add `subscription_renewed` and `gift_payment` to type map |
| `supabase/functions/verify-stripe-renewal/index.ts` | Add push call after in-app notification |
| `supabase/functions/verify-gift-payment/index.ts` | Add push call after in-app notification |
| `supabase/functions/verify-moncash-gift/index.ts` | Add push call after in-app notification |
| `supabase/functions/stripe-gift-webhook/index.ts` | Add push call after in-app notification |
| `src/pages/Notifications.tsx` | Add icon + text for `subscription_renewed` and `gift_payment` |
| `src/utils/sendPushNotification.ts` | Delete (zero imports) |
| `src/utils/pushNotificationService.ts` | Delete (zero imports) |
| `src/components/GroupInfoDialog.tsx` | Add push to members after group deletion notification |

## Safety Verification

| Check | Status |
|---|---|
| new_post push targets followers, not author | Yes — queries `following_id = currentUser.id` |
| subscription_renewed maps to `system` category | Yes — added to type map, controlled by Systeme toggle |
| gift_payment maps to `system` category | Yes — same mapping |
| Both utility files have zero imports | Confirmed — safe to delete |
| subscription_renewed UI renders for existing DB rows | Yes — case added to both icon and text functions |
| gift_payment UI renders for existing DB rows | Yes — case added, falls back to notification.content |
| group_deleted push fires before cascade DELETE | Yes — positioned after RPC, before DELETE query |
| No new dependencies added | Correct |
| 3G impact | Minimal — push calls are fire-and-forget, non-blocking |
| Existing functionality unchanged | Yes — all changes are additive |

