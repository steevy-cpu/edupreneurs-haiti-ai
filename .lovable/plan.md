

# Notifications Plan A — Fix 3 Critical Issues

## Overview

Three targeted fixes across 3 files. No new tables, no new edge functions, no new dependencies.

## Fix 1 — Replace cosmetic Settings toggles with real category groups

**File:** `src/pages/Settings.tsx`

### Remove old infrastructure
- Delete `DEFAULT_NOTIFICATION_CATEGORIES` constant (lines 81-86) with its 4 fake categories
- Delete `notificationCategories` state (line 126) and `savingNotification` state (line 127)
- Delete the merge logic in `fetchUserData` (lines 225-234) that maps saved prefs to fake categories
- Delete `debouncedNotificationUpdate` (lines 397-422) and `handleNotificationToggle` (lines 424-436)

### Add new group-based infrastructure

New constant defining the 5 real groups:

```
NOTIFICATION_GROUPS = [
  { key: 'interactions', categories: ['like','comment','share','mention'], label: 'Interactions', description: 'Likes, commentaires, partages et mentions' },
  { key: 'social', categories: ['follow'], label: 'Social', description: 'Nouvelles abonnements et demandes de suivi' },
  { key: 'messages', categories: ['message'], label: 'Messages', description: 'Messages prives et messages de groupe' },
  { key: 'contenu', categories: ['post','lesson','word_of_day'], label: 'Contenu', description: 'Nouveaux posts, commentaires de lecons et mot du jour' },
  { key: 'system', categories: ['system'], label: 'Systeme', description: "Renouvellements d'abonnement et annonces" },
]
```

New state: `groupToggles: Record<string, boolean>` initialized to all `true`.

On mount (inside `fetchUserData`): query all `notification_preferences` rows for this user. For each group, check if ANY of its categories have `enabled: false`. If so, that group toggle is OFF. Otherwise ON.

Toggle OFF handler: for all categories in the group, upsert rows with `enabled: false`.

Toggle ON handler: delete all rows for that group's categories (revert to implicit default = enabled).

### UI replacement

Replace the existing `notificationCategories.map(...)` block (lines 1212-1234) with a `NOTIFICATION_GROUPS.map(...)` rendering the same Switch layout but using the group key, label, description, and the new toggle handler.

### Cleanup migration

A one-time DELETE to remove orphaned cosmetic rows:
```sql
DELETE FROM notification_preferences WHERE category IN ('email', 'lesson_reminders', 'achievements', 'weekly_progress');
```

This only affects fake categories. The 1 real row (`message`, `enabled: true`) is untouched.

## Fix 2 — Add user filter to AppShell realtime listener

**File:** `src/shell/AppShell.tsx` (lines 131-139)

Current code subscribes to ALL inserts on `notifications` table with no filter. Add a server-side filter:

```
filter: `user_id=eq.${userId}`
```

This matches the pattern already used for the messages channel (line 112 uses `filter: sender_id=neq.${userId}`). The notification callback already works correctly with the filtered payload — no other changes needed.

The toast notification behavior (sound + toast with action link) is unchanged because the callback logic is identical; it just stops firing for other users' notifications.

## Fix 3 — Add ownership check to mark-notification-read

**File:** `supabase/functions/mark-notification-read/index.ts`

After the user is authenticated (line 36) and after input validation (line 62), add:

1. Require authentication — return 401 if `userId` is null
2. Query the notification by ID: `SELECT user_id FROM notifications WHERE id = notificationId`
3. If not found, return 404
4. If `notification.user_id !== userId`, return 403 `{ error: "Forbidden" }`
5. Only then proceed with the UPDATE

This does not break the service worker's mark-as-read flow because the SW sends the user's own auth token, which matches the notification's `user_id`.

## Files Changed

| File | Change |
|---|---|
| `src/pages/Settings.tsx` | Replace 4 cosmetic toggles with 5 real group toggles |
| `src/shell/AppShell.tsx` | Add `user_id` filter to realtime subscription |
| `supabase/functions/mark-notification-read/index.ts` | Add ownership check before update |

## Safety Verification

| Check | Status |
|---|---|
| Implicit default preserved (no row = enabled) | Yes — toggle ON deletes rows, reverting to default |
| Existing users with no pref rows still get all notifications | Yes — no rows means all groups show as ON |
| The 1 real `message` row is not deleted by cleanup | Yes — cleanup only targets 4 fake category names |
| AppShell filter does not break toast behavior | Yes — same callback, just scoped to current user |
| Ownership check does not break SW mark-as-read | Yes — SW uses the legitimate user's auth token |
| No new dependencies | Correct |
| No data layer changes beyond cleanup DELETE | Correct |
| 3G performance | Improved — fewer realtime events processed |

