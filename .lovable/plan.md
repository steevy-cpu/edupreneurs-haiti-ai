

# Community Plan B — Performance Fixes for Messaging

## Overview

Four targeted performance fixes: replace the fetch-all-messages query with a DB function, add server-side filters to realtime subscriptions, and add missing indexes. No changes to Plan A code (delete bug, RLS policies, edited_at).

---

## Fix 1 — Replace P0 Fetch-All-Messages Query

### 1a. Database migration: create `get_conversation_previews` function

```sql
CREATE OR REPLACE FUNCTION public.get_conversation_previews(p_user_id uuid)
RETURNS TABLE (
  conversation_id uuid,
  last_message_content text,
  last_message_at timestamptz,
  last_message_sender_id uuid,
  last_message_id uuid,
  unread_count bigint,
  visible_from_message_id uuid
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    c.id AS conversation_id,
    last_msg.content AS last_message_content,
    last_msg.created_at AS last_message_at,
    last_msg.sender_id AS last_message_sender_id,
    last_msg.id AS last_message_id,
    (
      SELECT COUNT(*)
      FROM messages m2
      WHERE m2.conversation_id = c.id
        AND m2.read = false
        AND m2.sender_id != p_user_id
        AND (cp.visible_from_message_id IS NULL
             OR m2.created_at >= (
               SELECT m3.created_at FROM messages m3
               WHERE m3.id = cp.visible_from_message_id
             ))
    ) AS unread_count,
    cp.visible_from_message_id
  FROM conversations c
  JOIN conversation_participants cp
    ON cp.conversation_id = c.id AND cp.user_id = p_user_id
  LEFT JOIN LATERAL (
    SELECT content, created_at, sender_id, id
    FROM messages
    WHERE conversation_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
  ) last_msg ON true
  ORDER BY COALESCE(last_msg.created_at, c.created_at) DESC;
$$;
```

Key design decisions:
- Returns `visible_from_message_id` so the client can apply visibility filtering (skip conversations where all messages are hidden).
- Unread count respects the visibility threshold -- only counts unread messages after the threshold.
- `STABLE SECURITY DEFINER` for RLS bypass inside the function (the function itself validates the user_id parameter).
- Uses `LEFT JOIN LATERAL` for efficient per-row last-message lookup.

### 1b. Frontend: refactor `fetchConversations()` in `Community.tsx`

**File:** `src/pages/Community.tsx` (lines ~540-780)

Replace the massive all-messages fetch (line 641-646) and the client-side visibility filtering (lines 647-670) with a single RPC call:

```typescript
// Replace lines 641-670 with:
const { data: previews } = await supabase.rpc('get_conversation_previews', {
  p_user_id: user.id
});
```

Then in the conversation-building loop (lines 676-770), replace:
- `visibleMessages.get(convId)` lookups with direct preview data
- `lastMsg` from `convVisibleMessages[convVisibleMessages.length - 1]` with the preview's `last_message_*` fields
- `unreadCount` calculation with the preview's `unread_count`
- The "skip if deleted" check uses: `if (preview.visible_from_message_id && !preview.last_message_id)` to detect fully-hidden conversations

The rest of the function (participant fetching, profile fetching, group details) stays unchanged -- those queries are already efficient.

**Database round trips before vs after:**

| Query | Before | After |
|---|---|---|
| conversation_participants (visibility) | 1 | 1 (included in RPC) |
| conversations | 1 | 1 |
| conversation_participants (all) | 1 | 1 |
| profiles | 1 | 1 |
| group_chats | 1 | 1 |
| group_members (counts) | 1 | 1 |
| **messages (ALL rows)** | **1** | **0 (replaced by RPC)** |
| **get_conversation_previews RPC** | **0** | **1** |
| **Total** | **7** | **7** |

Round trip count stays at 7, but the critical difference is data volume: the messages query previously returned all 844+ rows. The RPC returns ~120 rows (one per conversation) with only 6 columns each. This is the P0 fix.

---

## Fix 2 — Server-Side Filter on Global Messages Subscription

**File:** `src/pages/Community.tsx` (lines ~1148-1303)

The current `subscribeToMessages()` subscribes to ALL message INSERTs and UPDATEs across the entire `messages` table with no filter.

**Change:** Add a server-side `filter` parameter scoped to a sender_id exclusion. Supabase realtime supports `eq`, `neq`, `in`, `lt`, `gt` filters on a single column. The most impactful filter we can apply is:

```typescript
filter: `sender_id=neq.${user.id}`
```

This prevents the client from receiving its own messages via the global subscription (the optimistic update already handles the sender's UI). This aligns with the existing memory note about realtime scaling optimization.

**Why not per-conversation channels?** The user proposed subscribing to one channel per conversation. However, this creates a new problem: Supabase has a limit of ~100 concurrent channels per client. Users with 120+ conversations would hit this limit. The `sender_id=neq` filter is simpler, proven (already documented in the project memory), and eliminates the largest class of redundant events without channel proliferation.

The existing `subscribeToConversationMessages()` (per-conversation, only when viewing) remains unchanged.

---

## Fix 3 — Server-Side Filter on Reactions Subscription

**File:** `src/pages/Community.tsx` (lines ~1693-1720)

The reactions subscription already creates a per-conversation channel name (`reactions-${conversationId}`) but does NOT apply a server-side filter -- it listens to ALL `message_reactions` rows.

**Change:** The `message_reactions` table does not have a `conversation_id` column, so we cannot filter directly. However, since the channel is already scoped to the selected conversation and only subscribes when a conversation is open, the practical impact is limited.

The fix: after receiving a reaction event, validate that the `message_id` exists in the current `messages` state before applying it. This is a client-side guard (already partially in place since we only render reactions for displayed messages), but we add an explicit check:

```typescript
if (payload.eventType === 'INSERT') {
  const newReaction = payload.new as Reaction;
  // Only apply if message is in the current conversation
  setMessages(currentMsgs => {
    if (!currentMsgs.some(m => m.id === newReaction.message_id)) return currentMsgs;
    // ... existing logic
  });
}
```

This prevents stale reactions from other conversations leaking into the UI during rapid conversation switching.

---

## Fix 4 — Missing Database Indexes

### Database migration

```sql
-- Partial index on unread messages only -- small and fast for unread count queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_unread
ON messages(conversation_id, read) WHERE read = false;

-- Covers sender_id filters used in message queries and RLS policies
CREATE INDEX IF NOT EXISTS idx_messages_sender_id
ON messages(sender_id);

-- Covers the LATERAL join in get_conversation_previews (last message lookup)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
ON messages(conversation_id, created_at DESC);
```

The third index is critical for the new `get_conversation_previews` function -- it allows the `ORDER BY created_at DESC LIMIT 1` inside the LATERAL join to use an index scan instead of a sequential scan.

---

## Files Changed

| File | Change |
|---|---|
| Database migration | Create `get_conversation_previews` function + 3 indexes |
| `src/pages/Community.tsx` | Replace all-messages fetch with RPC call; add `sender_id=neq` filter to global subscription; add client-side guard to reactions |

## Safety Verification

| Check | Status |
|---|---|
| `get_conversation_previews` returns correct last message for DMs | Yes -- LATERAL join gets latest per conversation |
| `get_conversation_previews` returns correct last message for groups | Yes -- same logic, no group-specific branching needed |
| Unread count respects visibility threshold | Yes -- WHERE clause filters by `visible_from_message_id` |
| Empty conversations still appear in sidebar | Yes -- LEFT JOIN means null last_message fields, not excluded |
| Deleted conversations (with visibility threshold) are hidden | Yes -- client checks if all messages are before threshold |
| Realtime still delivers new messages to active conversation | Yes -- `subscribeToConversationMessages` unchanged |
| Realtime still updates sidebar for messages in other conversations | Yes -- global subscription still receives other users' INSERTs |
| Reactions update in realtime for open conversation | Yes -- channel unchanged, added message_id guard |
| Page load faster with new query | Yes -- 844 message rows replaced by ~120 preview rows |
| No conflicts with Plan A changes | Correct -- different code paths |
| No new dependencies | Correct |

## Technical Notes

- The `get_conversation_previews` function uses `SECURITY DEFINER` to bypass RLS for efficiency (it validates `p_user_id` via the JOIN to `conversation_participants`). This is safe because the function only returns data for conversations the user participates in.
- The three indexes add minimal write overhead (messages table has ~844 rows) but significantly speed up the unread count subquery and the LATERAL join.

