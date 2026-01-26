
# Fix: Auto-Scroll to Bottom When Switching Conversations

## Problem Identified

When clicking on a conversation, the chat does not automatically scroll to the bottom to show the latest messages.

**Root Cause:** The `scrollToBottom()` function has a guard that only scrolls if the user is already near the bottom (within 150px). This is correct for incoming messages (to not interrupt reading old messages), but **incorrect for conversation switches** where you always want to see the latest messages.

| Scenario | Current Behavior | Expected Behavior |
|----------|------------------|-------------------|
| Switch to new conversation | No scroll (guard fails) | Force scroll to bottom |
| New message arrives (near bottom) | Scrolls | Scrolls |
| New message arrives (reading old) | No scroll | No scroll (correct) |
| Send a message | Force scroll | Force scroll |

---

## Current Code Flow

```text
User clicks conversation
       ↓
selectedConversation changes
       ↓
useEffect triggers loadConversation()
       ↓
fetchMessages() called → setMessages()
       ↓
useEffect [messages] triggers scrollToBottom()
       ↓
scrollToBottom() checks isNearBottom (150px check)
       ↓
isNearBottom = FALSE (from previous conversation scroll position)
       ↓
NO SCROLL HAPPENS ← BUG
```

---

## Solution

Add a forced scroll to bottom **after messages are fetched** when switching conversations. This is a simple one-line addition to the existing `loadConversation` function.

### File: `src/pages/Community.tsx`

**Location:** Lines 380-408 (inside `loadConversation` async function)

**Current Code:**
```typescript
const loadConversation = async () => {
  // ... existing code ...
  
  await fetchMessages(selectedConversation);
  await markMessagesAsRead(selectedConversation);
  await fetchReactions(selectedConversation);
};
```

**Fixed Code:**
```typescript
const loadConversation = async () => {
  // ... existing code ...
  
  await fetchMessages(selectedConversation);
  await markMessagesAsRead(selectedConversation);
  await fetchReactions(selectedConversation);
  
  // Force scroll to bottom when loading a new conversation
  // Use requestAnimationFrame to ensure DOM has updated with new messages
  requestAnimationFrame(() => {
    scrollToBottom(true);
  });
};
```

---

## Why This Works

1. `scrollToBottom(true)` passes `force = true`, bypassing the "near bottom" check
2. `requestAnimationFrame` ensures the DOM has rendered the new messages before scrolling
3. This only runs when **switching conversations**, not on every message update
4. The existing `useEffect [messages]` scroll (without force) continues to handle incremental updates correctly

---

## Alternative Considered (Not Recommended)

We could add `selectedConversation` to the dependency array of the scroll useEffect and always force scroll when it changes:

```typescript
useEffect(() => {
  scrollToBottom(true); // Force on conversation change
}, [selectedConversation]);
```

**Why not this approach:**
- Would require a separate useEffect
- Could cause double-scrolling (once from conversation change, once from messages change)
- The `loadConversation` approach is more explicit and co-located with the data fetching

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - only adds scroll behavior |
| Works with existing data? | Yes - no data changes |
| 3G optimized? | Yes - `requestAnimationFrame` is lightweight |
| Backward compatible? | Yes |
| Affects reading old messages? | No - only triggers on conversation switch |

---

## Implementation Summary

| File | Change |
|------|--------|
| `src/pages/Community.tsx` | Add `requestAnimationFrame(() => scrollToBottom(true))` after `fetchReactions()` in `loadConversation` (around line 407) |

---

## Technical Notes

- `requestAnimationFrame` is the same pattern used for sending messages (line 1421)
- No `setTimeout` delay needed here since we're already after the async `fetchMessages` completes
- The scroll will be smooth due to `behavior: 'smooth'` in the `scrollToBottom` function
