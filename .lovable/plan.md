

# Fix Plan: Resolve Duplicate Messages in Chat Persistence

## Problem Summary

The current implementation has a **duplicate message bug**. When the user sends a message:

1. An optimistic message is added to the UI (with temp ID like `temp-user-1234`)
2. The message is saved to the database (gets real UUID)
3. The optimistic message is never replaced with the real one

When the drawer is reopened or the component re-renders, messages are loaded from the database AND the optimistic messages remain in state, causing duplicates.

---

## Root Cause

In `AskJudeDrawer.tsx`:
```typescript
// Current flow (problematic):
addOptimisticMessage(optimisticUserMsg);     // Adds temp-user-123
await saveUserMessage(userContent);           // Saves to DB, gets UUID
// But never replaces temp-user-123 with the real message!
```

When messages are reloaded from DB, we get both the real message AND the temp message still in state.

---

## Solution

### Option A: Replace Optimistic Messages (Recommended)

After saving to the database, replace the temporary message with the real one:

```typescript
// AskJudeDrawer.tsx - handleSend function

// Save user message and replace optimistic
const savedUserMsg = await saveUserMessage(userContent);
if (savedUserMsg) {
  replaceOptimisticMessage(optimisticUserMsg.id, savedUserMsg);
}
```

Add a new function to the hook:
```typescript
// useExamTutorChat.ts
const replaceOptimisticMessage = useCallback((tempId: string, realMessage: ChatMessage) => {
  setMessages(prev => prev.map(msg => 
    msg.id === tempId ? realMessage : msg
  ));
}, []);
```

### Option B: Simpler - No Optimistic for DB Messages

Since we're persisting to DB, just wait for the save to complete before showing:

```typescript
// No optimistic - just save and update state from returned data
const savedMsg = await saveUserMessage(userContent);
if (savedMsg) {
  setMessages(prev => [...prev, savedMsg]); // Already returns the real message
}
```

---

## Recommended Fix (Option A)

### File Changes

**1. Update `useExamTutorChat.ts`**

Add `replaceOptimisticMessage` function:

```typescript
// After addOptimisticMessage (line 97), add:
const replaceOptimisticMessage = useCallback((tempId: string, realMessage: ChatMessage) => {
  setMessages(prev => prev.map(msg => 
    msg.id === tempId ? realMessage : msg
  ));
}, []);
```

Update return object to include the new function.

**2. Update `AskJudeDrawer.tsx`**

Update `handleSend` to use the replace function:

```typescript
const handleSend = async () => {
  if (!input.trim() || isSending) return;

  const userContent = input.trim();
  setInput('');
  setIsSending(true);

  const tempUserId = `temp-user-${Date.now()}`;
  const optimisticUserMsg: ChatMessage = {
    id: tempUserId,
    role: 'user',
    content: userContent,
    timestamp: new Date(),
  };
  addOptimisticMessage(optimisticUserMsg);

  try {
    // Save user message to DB and replace optimistic
    const savedUserMsg = await saveUserMessage(userContent);
    if (savedUserMsg) {
      replaceOptimisticMessage(tempUserId, savedUserMsg);
    }

    // Call the tutor API
    const response = await onAskJude(userContent);

    if (response) {
      const tempAssistantId = `temp-assistant-${Date.now()}`;
      const optimisticAssistantMsg: ChatMessage = {
        id: tempAssistantId,
        role: 'assistant',
        content: response.response || '',
        blocks: response.blocks,
        timestamp: new Date(),
      };
      addOptimisticMessage(optimisticAssistantMsg);

      // Save assistant response and replace optimistic
      const savedAssistantMsg = await saveAssistantMessage(response.response || '', response.blocks);
      if (savedAssistantMsg) {
        replaceOptimisticMessage(tempAssistantId, savedAssistantMsg);
      }
    }
  } catch (error) {
    console.error('Error asking Jude:', error);
  } finally {
    setIsSending(false);
  }
};
```

---

## File Changes Summary

| File | Change | Lines |
|------|--------|-------|
| `src/features/exams/practice/hooks/useExamTutorChat.ts` | Add `replaceOptimisticMessage` function | ~10 lines |
| `src/features/exams/practice/components/AskJudeDrawer.tsx` | Use replace function after DB save | Modify ~15 lines |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Additive change only |
| Works with existing messages? | Yes | Old messages already saved correctly |
| 3G optimized? | Yes | Same number of network requests |
| Backward compatible? | Yes | No data schema changes |

---

## Implementation Time

~10 minutes - Small changes to two files

