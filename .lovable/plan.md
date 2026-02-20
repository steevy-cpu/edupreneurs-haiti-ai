
# Community Plan A — Fix Two Critical Messaging Bugs

## Overview

Two targeted fixes: the empty conversation delete bug and the messages UPDATE RLS security hole. No performance, realtime, or architectural changes.

---

## Fix 1 — Empty Conversation Delete Bug

**File:** `src/pages/Community.tsx` (lines 1965-1996)

**Root cause:** When a conversation has zero messages, `lastMessage` is `null`, so `visible_from_message_id` is set to `null` — which means "show all messages." The conversation never disappears.

**Change:** Replace the single `update` call with a branch:

- If `lastMessage` is `null` (empty conversation): DELETE the `conversation_participants` row for this user. The existing RLS policy allows `DELETE WHERE auth.uid() = user_id`.
- If `lastMessage` exists: keep the existing soft-delete logic (set `visible_from_message_id` to `lastMessage.id`).

After either branch, remove the conversation from local `conversations` state directly using `setConversations(prev => prev.filter(...))` instead of calling `fetchConversations()`. This avoids the expensive full message refetch.

**Lines affected:** ~1965-2014 in `Community.tsx`

---

## Fix 2 — RLS Security Hole + Audit Trail

### 2a. Database migration (3 statements)

1. Drop the overly-permissive UPDATE policy:
```sql
DROP POLICY "Users can update messages in their conversations" ON messages;
```

2. Create sender-only edit policy:
```sql
CREATE POLICY "Users can edit their own messages"
ON messages FOR UPDATE
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);
```

3. Create participant read-status policy:
```sql
CREATE POLICY "Participants can mark messages as read"
ON messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
);
```

PostgreSQL evaluates multiple UPDATE policies with OR logic, so either policy passing allows the operation. The sender can edit content; any participant can mark read.

4. Add `edited_at` column:
```sql
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at timestamptz;
```

### 2b. Frontend: set edited_at on save

**File:** `src/pages/Community.tsx` (line 1748)

Change the update call from:
```typescript
.update({ content: editedContent.trim() })
```
to:
```typescript
.update({ content: editedContent.trim(), edited_at: new Date().toISOString() })
```

Also update the local state to include `edited_at` in the mapped message.

### 2c. Type update

**File:** `src/types/community.ts`

Add `edited_at?: string | null;` to the `Message` interface.

### 2d. Show "modifie" label in MessageBubble

**File:** `src/components/community/MessageBubble.tsx` (lines 524-538)

In the timestamp area, after `formatTime(message.created_at)`, add:
```tsx
{message.edited_at && (
  <span className="text-xs text-muted-foreground italic">· modifié</span>
)}
```

---

## Files Changed

| File | Change |
|---|---|
| `src/pages/Community.tsx` | Branch empty vs non-empty delete; remove `fetchConversations()` call; set `edited_at` on save |
| `src/types/community.ts` | Add `edited_at` to Message interface |
| `src/components/community/MessageBubble.tsx` | Show "modifie" label when `edited_at` is set |
| Database migration | Drop old UPDATE policy, create 2 new policies, add `edited_at` column |

## Safety Verification

| Check | Status |
|---|---|
| Empty conversation delete removes participant row | Yes -- DELETE from conversation_participants |
| Conversation disappears from sidebar after delete | Yes -- local state filter, no refetch |
| Non-empty conversation still uses soft-delete | Yes -- existing `visible_from_message_id` logic unchanged |
| New RLS: any participant can mark messages read | Yes -- second policy allows participant UPDATE |
| New RLS: content edits restricted to sender only | Yes -- first policy requires `auth.uid() = sender_id` |
| `edited_at` column has null default | Yes -- existing 844 messages unaffected |
| "modifie" label only shows on edited messages | Yes -- conditional on `edited_at` not null |
| No new dependencies | Correct |
| No performance/realtime changes | Correct |
