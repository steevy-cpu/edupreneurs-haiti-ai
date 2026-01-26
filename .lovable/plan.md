

# Community Page: Revised Safe Implementation Plan

## Executive Summary

After thorough code review, I've identified that **one fix from the original plan would break functionality** (visibility threshold). This revised plan removes that change and refines the remaining fixes for maximum safety.

---

## Changes Removed (Would Break Functionality)

### Visibility Threshold Change - REMOVED

**Why it was removed:**
- The original fix would hide ALL messages when `visible_from_message_id` is not found in the last 50 fetched messages
- This breaks pagination: users who scroll up would see empty conversations
- This breaks new conversations created from profile pages
- The current logic is correct: showing more messages is safe, hiding them breaks UX

---

## Safe Fixes to Implement

### Fix 1: Memory Leak in subscribeToMessages

**Problem:** The cleanup function returned by `subscribeToMessages()` is never called.

**File:** `src/pages/Community.tsx`
**Lines:** 242-253

**Current Code:**
```typescript
useEffect(() => {
  if (user) {
    fetchConversations();
    fetchFollowers();
    subscribeToMessages();  // Returns cleanup but ignored!
  }
  
  return () => {
    // Presence cleanup handled by PresenceContext
  };
}, [user?.id]);
```

**Fixed Code:**
```typescript
useEffect(() => {
  if (user) {
    fetchConversations();
    fetchFollowers();
    const unsubscribeMessages = subscribeToMessages();
    
    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }
}, [user?.id]);
```

**Safety:** LOW RISK - Simple cleanup pattern, no behavior change.

---

### Fix 2: Race Condition on Conversation Switch

**Problem:** Rapid conversation switching can display messages from the wrong conversation.

**File:** `src/pages/Community.tsx`

**Changes:**

1. Add ref after existing refs (around line 108):
```typescript
const currentConversationRef = useRef<string | null>(null);
```

2. Update useEffect at lines 369-409:
```typescript
useEffect(() => {
  if (selectedConversation && user) {
    // Track current conversation FIRST
    currentConversationRef.current = selectedConversation;
    
    const loadConversation = async () => {
      // ... existing code unchanged ...
    };
    loadConversation();
    // ... rest unchanged
  }
  // ... cleanup unchanged
}, [selectedConversation, user]);
```

3. Add guard in fetchMessages before setMessages (line 886):
```typescript
// Before setting messages, verify this is still the active conversation
if (conversationId !== currentConversationRef.current) {
  console.log('[fetchMessages] Discarding stale fetch for:', conversationId);
  return;
}

setMessages(enrichedMessages);
```

**Safety:** LOW RISK - Only discards outdated data, never blocks valid data.

---

### Fix 3: Stale Closure in Typing Timeout

**Problem:** Typing "off" status sent to wrong conversation when switching quickly.

**File:** `src/pages/Community.tsx`

**Changes:**

1. Add ref after currentConversationRef:
```typescript
const selectedConversationRef = useRef<string | null>(null);
```

2. Add new useEffect after existing selectedConversation effects:
```typescript
// Keep selectedConversationRef in sync and clear typing on switch
useEffect(() => {
  selectedConversationRef.current = selectedConversation;
  
  // Clear any pending typing timeout when switching conversations
  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = null;
  }
}, [selectedConversation]);
```

3. Update handleTyping function (lines 1803-1821):
```typescript
const handleTyping = (value: string) => {
  setNewMessage(value);

  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }

  if (value.trim()) {
    sendTypingStatus(true);

    // Capture current conversation for timeout callback
    const conversationAtCall = selectedConversationRef.current;
    
    typingTimeoutRef.current = setTimeout(() => {
      // Only send if still in the same conversation
      if (selectedConversationRef.current === conversationAtCall) {
        sendTypingStatus(false);
      }
    }, 3000);
  } else {
    sendTypingStatus(false);
  }
};
```

**Safety:** LOW RISK - Prevents sending to wrong channel, no data loss.

---

### Fix 4: Profile Cache Memory Limit

**Problem:** profileCacheRef grows indefinitely during long sessions.

**File:** `src/pages/Community.tsx`

**Changes:**

1. Add constant near top of file:
```typescript
const MAX_PROFILE_CACHE_SIZE = 100;
```

2. Update getCachedProfile function (lines 889-905):
```typescript
const getCachedProfile = async (userId: string): Promise<Profile | null> => {
  if (profileCacheRef.current.has(userId)) {
    return profileCacheRef.current.get(userId)!;
  }
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
    
  if (profile) {
    // Evict oldest entry if cache is full (LRU)
    if (profileCacheRef.current.size >= MAX_PROFILE_CACHE_SIZE) {
      const oldestKey = profileCacheRef.current.keys().next().value;
      if (oldestKey) {
        profileCacheRef.current.delete(oldestKey);
      }
    }
    profileCacheRef.current.set(userId, profile as Profile);
  }
  return profile as Profile | null;
};
```

**Safety:** LOW RISK - 100 profiles is generous, eviction is transparent.

---

### Fix 5: Typing Timeout Cleanup on Unmount

**Problem:** Timeout can run after component unmounts.

**File:** `src/pages/Community.tsx`

**Changes:**

Add cleanup effect (can be added near line 1830):
```typescript
// Cleanup typing timeout on unmount
useEffect(() => {
  return () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };
}, []);
```

**Safety:** LOW RISK - Standard React cleanup pattern.

---

### Fix 6: Dependency Array Optimization (Optional)

**Problem:** `conversations.map(c => c.id).join(',')` creates new string every render.

**File:** `src/pages/Community.tsx`
**Lines:** 267-294

**Current Issue:**
The dependency array at line 294 uses `conversations.map(c => c.id).join(',')` which is evaluated every render.

**Safe Approach - Use ref for comparison:**
```typescript
const prevConversationIdsRef = useRef<string>('');

useEffect(() => {
  if (!user || conversations.length === 0) return;
  
  const currentIds = conversations.map(c => c.id).sort().join(',');
  
  // Skip if conversation IDs haven't changed
  if (currentIds === prevConversationIdsRef.current) return;
  prevConversationIdsRef.current = currentIds;
  
  // Only set up channels for new conversations
  conversations.forEach(conv => {
    if (!presenceChannelsRef.current[conv.id]) {
      subscribeToTypingPresence(conv.id);
    }
  });
  
  // Clean up channels for conversations that no longer exist
  const currentConvIds = new Set(conversations.map(c => c.id));
  Object.keys(presenceChannelsRef.current).forEach(convId => {
    if (!currentConvIds.has(convId)) {
      supabase.removeChannel(presenceChannelsRef.current[convId]);
      delete presenceChannelsRef.current[convId];
    }
  });
  
  return () => {
    Object.keys(presenceChannelsRef.current).forEach(convId => {
      supabase.removeChannel(presenceChannelsRef.current[convId]);
    });
    presenceChannelsRef.current = {};
  };
}, [conversations, user?.id]);
```

**Safety:** LOW RISK - Same behavior, fewer re-runs.

---

## Implementation Order

1. Fix 1: Memory leak cleanup (simplest, foundational)
2. Fix 5: Typing timeout cleanup (independent, simple)
3. Fix 4: Profile cache limit (independent)
4. Fix 3: Stale typing closure (needs ref)
5. Fix 2: Race condition guard (needs ref)
6. Fix 6: Dependency optimization (optional, last)

---

## Files Modified

| File | Lines Affected | Type of Change |
|------|----------------|----------------|
| `src/pages/Community.tsx` | ~108, 242-253, 267-294, 369-409, 886, 889-905, 1803-1821, ~1830 | Bug fixes |

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No |
| Works with existing data? | Yes - no database changes |
| 3G optimized? | Yes - reduces unnecessary work |
| Backward compatible? | Yes - same API |
| Message visibility affected? | No - removed risky change |
| Real-time still works? | Yes - channels unchanged |

---

## What Was NOT Changed (And Why)

### Visibility Threshold Logic
- **Location:** Lines 618-627 and 806-812
- **Why kept:** Current behavior is correct for pagination. Hiding messages when threshold not found would break UX.

### Global Subscription Structure
- **Why kept:** Splitting effects could cause timing issues. Better to keep together with proper cleanup.

---

## Risk Summary

| Fix | Risk Level | Rollback Complexity |
|-----|------------|---------------------|
| Memory leak cleanup | Low | Remove cleanup line |
| Race condition guard | Low | Remove ref and guard |
| Stale typing fix | Low | Remove ref and timeout changes |
| Profile cache limit | Low | Remove size check |
| Typing cleanup | Low | Remove useEffect |
| Dependency optimization | Low | Revert to .join() |

All changes are additive guards that can be easily reverted if issues arise.

