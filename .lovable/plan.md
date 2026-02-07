

# Plan: Fix Stale Closure Bug for Unread Message Badge

## Problem Identified

When you're viewing the Jude conversation and Jude sends a message, the unread badge incorrectly shows "1" even though you're currently viewing that conversation. This is a **stale closure bug** in the realtime subscription.

## Root Cause Analysis

The `subscribeToMessages()` function is called **once** when the component mounts (when `user?.id` becomes truthy). The callback inside this subscription captures the value of `selectedConversation` from that moment (closure).

When you later select a conversation, the subscription's callback still sees the **old** `selectedConversation` value (likely `null`), not the current one.

**Current broken logic (line 1182):**
```typescript
const shouldIncrementUnread = 
  payload.new.sender_id !== user?.id && 
  conversationId !== selectedConversation;  // ❌ Stale closure!
```

When Jude responds:
- `conversationId` = `"jude-conv-id"` (current conversation)
- `selectedConversation` (from closure) = `null` (value at mount time)
- `"jude-conv-id" !== null` = `true` → Badge incorrectly increments

## Solution

Use `selectedConversationRef.current` instead of `selectedConversation`. The ref is already kept in sync with state (line 439), and refs work correctly inside closures because they maintain a stable reference.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/Community.tsx` | UPDATE | Replace stale `selectedConversation` with `selectedConversationRef.current` in subscription callback |

## Specific Changes

### Line 1182 (unread count logic)
**Before:**
```typescript
const shouldIncrementUnread = 
  payload.new.sender_id !== user?.id && 
  conversationId !== selectedConversation;
```

**After:**
```typescript
const shouldIncrementUnread = 
  payload.new.sender_id !== user?.id && 
  conversationId !== selectedConversationRef.current;
```

### Line 1203 (notification logic)
**Before:**
```typescript
if (payload.new.sender_id !== user?.id && conversationId !== selectedConversation) {
```

**After:**
```typescript
if (payload.new.sender_id !== user?.id && conversationId !== selectedConversationRef.current) {
```

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Backward compatible? | Yes | Uses existing ref pattern already in codebase |
| Breaks other functionality? | No | Only changes how current conversation is detected |
| Ref already synced? | Yes | Line 439 keeps ref in sync with state |
| Works with conversation switching? | Yes | Ref updates immediately on selection |
| Works with initial null state? | Yes | Both state and ref start as null |

## Why This Fix Is Correct

The codebase already uses `selectedConversationRef` for other stale closure scenarios:
- Line 1905-1910: Typing status timeout uses `selectedConversationRef.current`
- Line 1138: Reconnection logic uses `selectedConversation === conversationId`

The pattern of using refs inside subscription callbacks to avoid stale closures is already established in this codebase.

## Expected Behavior After Fix

1. Open Jude conversation
2. Send a message to Jude
3. Jude responds
4. ✅ No badge appears on Jude conversation (because you're viewing it)
5. Badge only appears if you switch away from Jude before the response arrives

