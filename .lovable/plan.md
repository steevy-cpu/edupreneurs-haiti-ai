
# Fix: Real-Time Unread Badge Count Update

## Problem Identified

When a new message arrives:
- The **message content** updates in real-time (working)
- The **unread badge count** does NOT update until page refresh (broken)

The screenshot shows the conversation list with last messages visible, but the unread count badge is not incrementing when new messages arrive.

## Root Cause

In the `subscribeToMessages` function (lines 1156-1173), when a new message INSERT event is received, the code updates:
- `lastMessage` (the preview text)
- `lastMessageTime` (for sorting)

But it does **NOT** update:
- `unreadCount` (the badge number)

| Field | Currently Updated | Should Update |
|-------|-------------------|---------------|
| lastMessage | Yes | Yes |
| lastMessageTime | Yes | Yes |
| unreadCount | **No** | **Yes** |

## Solution

Add `unreadCount` increment logic inside the existing `setConversations` update when:
1. The message is from another user (`payload.new.sender_id !== user?.id`)
2. The conversation is NOT the currently selected one (since viewing a conversation means reading it)

### File: `src/pages/Community.tsx`

### Location: Lines 1156-1173 (inside `subscribeToMessages` INSERT handler)

**Current Code:**
```typescript
setConversations(prev => {
  // Find and update the conversation with the new message time
  const updated = prev.map(conv => 
    conv.id === conversationId 
      ? { 
          ...conv, 
          lastMessage: payload.new.content,
          lastMessageTime: newMessageTime,
        }
      : conv
  );
  
  // Re-sort immediately
  return updated.sort((a, b) => 
    new Date(b.lastMessageTime || b.created_at).getTime() - 
    new Date(a.lastMessageTime || a.created_at).getTime()
  );
});
```

**Fixed Code:**
```typescript
setConversations(prev => {
  // Find and update the conversation with the new message time
  const updated = prev.map(conv => {
    if (conv.id !== conversationId) return conv;
    
    // Increment unread count only if:
    // 1. Message is from another user
    // 2. This is NOT the currently selected conversation
    const shouldIncrementUnread = 
      payload.new.sender_id !== user?.id && 
      conversationId !== selectedConversation;
    
    return { 
      ...conv, 
      lastMessage: payload.new.content,
      lastMessageTime: newMessageTime,
      unreadCount: shouldIncrementUnread 
        ? (conv.unreadCount || 0) + 1 
        : conv.unreadCount,
    };
  });
  
  // Re-sort immediately
  return updated.sort((a, b) => 
    new Date(b.lastMessageTime || b.created_at).getTime() - 
    new Date(a.lastMessageTime || a.created_at).getTime()
  );
});
```

## Why This Works

1. **Message from another user check**: We don't want to increment unread for our own sent messages
2. **Not current conversation check**: If the user is viewing the conversation, the message is being read immediately
3. **Increment instead of set**: We add 1 to the existing count to stack multiple unread messages
4. **Fallback to 0**: Using `(conv.unreadCount || 0) + 1` handles cases where unreadCount is undefined

## Visual Flow

```text
New message arrives from another user
        ↓
subscribeToMessages INSERT event fires
        ↓
Is sender !== current user?
    ├── No → Don't increment (our own message)
    └── Yes → Continue
        ↓
Is conversation !== selected?
    ├── No → Don't increment (already viewing)
    └── Yes → Increment unreadCount by 1
        ↓
Badge updates immediately in sidebar
```

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No - adds to existing update |
| Works with existing data? | Yes - uses existing unreadCount field |
| 3G optimized? | Yes - no additional network calls |
| Backward compatible? | Yes |
| Double counting? | No - only increments in subscribeToMessages, not conversation-specific |

## Technical Notes

- The `selectedConversation` ref is already accessible in this scope
- The badge UI component (`ConversationListItem`) already handles displaying the count when `unreadCount > 0`
- The decrement logic (lines 1259-1268) already exists for when messages are marked as read
- This creates a complete increment/decrement cycle for real-time badge updates
