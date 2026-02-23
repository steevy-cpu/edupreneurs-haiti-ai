

# Realtime Plan A — Add Server-Side Filters to Unfiltered Channels

## Overview
Surgical fixes to reduce unnecessary realtime event processing across 5 areas. Each fix adds server-side filtering or debouncing without changing any other realtime logic.

---

## Fix 1 — useSidebarBadges.ts (4 channels)

**File:** `src/hooks/useSidebarBadges.ts`, lines 115-149

| Channel | Current Filter | New Filter | Rationale |
|---------|---------------|------------|-----------|
| `sidebar-badges-messages` | None | `sender_id=neq.${userId}` | Skip own messages — badge only cares about others' messages |
| `sidebar-badges-follows` | None | `following_id=eq.${userId}` | Only follow requests targeting this user matter |
| `sidebar-badges-notifications` | None | `user_id=eq.${userId}` | Only this user's notifications matter |
| `sidebar-badges-posts` | None (INSERT only) | Keep unfiltered + add 2s debounce | Can't filter meaningfully since all public posts are relevant |

For the posts debounce: wrap the `refetch()` callback with a `setTimeout`/clear pattern using a ref, so rapid INSERTs only trigger one refetch per 2-second window.

---

## Fix 2 — Community reactions channel (cannot filter server-side)

**File:** `src/pages/Community.tsx`, lines 1756-1791

**Limitation discovered:** The `message_reactions` table schema has columns: `id`, `message_id`, `user_id`, `emoji`, `created_at`. There is **no `conversation_id` column**, so we cannot add a server-side filter to scope reactions to the current conversation.

**What we CAN do:** The channel name already includes `conversationId` (`reactions-${conversationId}`), and there's already a client-side guard at line 1770 that checks if the message belongs to the current conversation. The only improvement possible without a schema change is to document that this is intentionally client-filtered. **No code change for this fix.**

---

## Fix 3 — Community messages UPDATE listener

**File:** `src/pages/Community.tsx`, lines 1286-1306

The UPDATE listener has no filter. Add `sender_id=neq.${user?.id}` — the user doesn't need to receive UPDATE events for their own messages being marked as read (the unread count logic at line 1295 only cares about other users' messages being read).

**Note:** We cannot filter by conversation_id list since Supabase filters only support single-column equality. The `sender_id=neq` filter still provides meaningful reduction.

---

## Fix 4 — ChessPublicMatches

**File:** `src/components/chess/ChessPublicMatches.tsx`, lines 81-98

**Limitation:** Supabase realtime filters only support **one filter per listener** — we cannot combine `status=eq.waiting AND is_public=eq.true`. 

**Best option:** Add `is_public=eq.true` as the filter (this eliminates all private match events). The `status=waiting` filtering is already handled by the `fetchMatches()` query that runs on each event. This is the better filter since `is_public` eliminates more irrelevant events than `status` alone.

---

## Fix 5 — PresenceContext verbose logging

**File:** `src/contexts/PresenceContext.tsx`

Replace all `console.log('[Presence]...')` calls with the existing `logger` utility from `src/utils/logger.ts`, which only logs in development mode. Affected lines: ~63, 66, 72, 76, 126, 130, 133, 137, 141, 147, 150, 155, 163.

Import `import { logger } from '@/utils/logger';` and change all `console.log(` to `logger.log(`.

---

## Files Modified

| File | Change |
|------|--------|
| `src/hooks/useSidebarBadges.ts` | Add filters to 3 channels + debounce on posts channel |
| `src/pages/Community.tsx` | Add `sender_id=neq` filter to UPDATE listener (line 1288) |
| `src/components/chess/ChessPublicMatches.tsx` | Add `is_public=eq.true` filter (line 87) |
| `src/contexts/PresenceContext.tsx` | Replace `console.log` with `logger.log` |

## Safety Verification

| Check | Status |
|-------|--------|
| Existing functionality preserved | Yes — filters only reduce noise, never block needed events |
| No schema changes needed | Correct |
| No new dependencies | Correct |
| Provider stack unaffected | Yes |
| RLS policies unchanged | Yes |
| Works on 3G | Yes — reduces traffic, improves 3G performance |
| Cleanup logic unchanged | Yes — no changes to subscription cleanup |
| Backward compatible | Yes |

## Not Changed (and why)

| Item | Reason |
|------|--------|
| Reactions channel (Fix 2) | `message_reactions` table has no `conversation_id` column — server-side filter impossible without schema change |
| Feed subscription | Out of scope for this plan |
| Content editor realtime | Out of scope — low volume |
| Reconnection logic | Out of scope — separate concern |

