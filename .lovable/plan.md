
# Plan: Jude Typing/Thinking Animations in Community Chat

## Problem Analysis

### Current User Experience (Broken)
1. User sends message to Jude in Community page
2. Message appears, but no feedback that Jude is processing
3. After 2-5 seconds, Jude's response suddenly appears (jarring)
4. No visual indication of AI thinking or typing

### Desired User Experience
1. User sends message to Jude
2. Immediately shows "Jude réfléchit..." with animated dots
3. When response arrives, shows typewriter effect (character by character)
4. Smooth, engaging experience matching JudeChatbot behavior

---

## Architecture Overview

### Key Insight
The Community page uses a **fire-and-forget** pattern for Jude messages, unlike JudeChatbot which uses a **synchronous** pattern. This requires a different approach:

```text
Current Flow (fire-and-forget):
User sends → Edge function runs → Inserts to DB → Realtime picks up

Required State Tracking:
User sends to Jude → Set "awaiting Jude" → Realtime receives Jude msg → Clear + Typewriter
```

---

## Solution Design

### Part 1: Create JudeTypingIndicator Component

**New File: `src/components/community/JudeTypingIndicator.tsx`**

A specialized indicator for when Jude AI is thinking/responding. Follows the established patterns from JudeCoachBanner and HomeChatbot:

Key features:
- Shows Jude's avatar with "Jude réfléchit..." text
- Network-aware animations (bouncing dots on fast connection, spinner on slow)
- Same styling as existing TypingIndicator but branded for Jude
- Reuses `animate-typing-wave` CSS animation

Structure:
```typescript
interface JudeTypingIndicatorProps {
  isThinking: boolean;
}

// Uses:
// - Jude's avatar (eric-ai-helper.png or dashboard00.png)
// - "Jude réfléchit..." text
// - Animated dots (same as HomeChatbot)
// - Network-aware fallback to Loader2 spinner
```

### Part 2: Create MessageTypewriter Component

**New File: `src/components/community/MessageTypewriter.tsx`**

Extract and adapt the TypewriterText pattern for Community messages:

Key features:
- Wraps ChatMessageRenderer for markdown/KaTeX support
- Character-by-character reveal with blinking cursor
- Network-aware speed (faster on slow connections to reduce perceived latency)
- Callback when typing completes (to update state)

Structure:
```typescript
interface MessageTypewriterProps {
  content: string;
  speed?: number;
  onComplete?: () => void;
}

// Follows HomeChatbot/JudeChatbot TypewriterText pattern
// Uses ChatMessageRenderer after completion for proper rendering
```

### Part 3: Add Jude Response Tracking State to Community.tsx

**File: `src/pages/Community.tsx`**

Add state to track when we're waiting for Jude's response:

New state variables:
```typescript
// Track pending Jude response
const [isAwaitingJudeResponse, setIsAwaitingJudeResponse] = useState(false);

// Track which message is currently showing typewriter effect
const [typewriterMessageId, setTypewriterMessageId] = useState<string | null>(null);
```

### Part 4: Set "Awaiting Jude" State on Send

**File: `src/pages/Community.tsx`**

When user sends a message to Jude, set the awaiting state:

Location: Inside `sendMessage()` function, after inserting user's message

Logic:
```typescript
// After inserting user message to DB
if (conversation?.otherUser?.user_id === JUDE_USER_ID) {
  setIsAwaitingJudeResponse(true);
  
  // Call Jude in background
  supabase.functions.invoke('eric-chat', {...})
    .catch(err => {
      logger.error('Jude chat error:', err);
      setIsAwaitingJudeResponse(false); // Clear on error
    });
} else if (...) {
```

### Part 5: Clear State and Trigger Typewriter on Jude Response

**File: `src/pages/Community.tsx`**

In the realtime subscription handler for new messages, detect Jude's response:

Location: Inside the `postgres_changes` INSERT handler

Logic:
```typescript
// After adding message to state
if (payload.new.sender_id === JUDE_USER_ID) {
  // Jude responded - clear waiting state
  setIsAwaitingJudeResponse(false);
  
  // Trigger typewriter effect for this message
  setTypewriterMessageId(payload.new.id);
}
```

### Part 6: Update MessageBubble to Support Typewriter

**File: `src/components/community/MessageBubble.tsx`**

Add optional typewriter mode to MessageBubble:

New props:
```typescript
interface MessageBubbleProps {
  // ... existing props
  isTypewriting?: boolean;
  onTypewriterComplete?: () => void;
}
```

Render logic update:
```typescript
// In message content area
{isTypewriting ? (
  <MessageTypewriter 
    content={message.content}
    speed={isSlowConnection ? 5 : 15}
    onComplete={onTypewriterComplete}
  />
) : (
  <ChatMessageRenderer content={message.content} />
)}
```

### Part 7: Render JudeTypingIndicator in Messages Area

**File: `src/pages/Community.tsx`**

Add the indicator after messages, before regular typing indicators:

Location: After the messages map, before the existing TypingIndicator logic

```typescript
{/* Jude AI Thinking Indicator */}
{isJudeConversation && isAwaitingJudeResponse && (
  <JudeTypingIndicator isThinking={true} />
)}

{/* Regular User Typing Indicators */}
{(() => {
  // existing typing indicator logic
})()}
```

### Part 8: Pass Typewriter Props to MessageBubble

**File: `src/pages/Community.tsx`**

Update MessageBubble rendering to include typewriter state:

```typescript
<MessageBubble
  key={message.id}
  message={message}
  // ... existing props
  isTypewriting={message.id === typewriterMessageId}
  onTypewriterComplete={() => setTypewriterMessageId(null)}
/>
```

### Part 9: Export New Components

**File: `src/components/community/index.ts`**

Add exports for new components:

```typescript
export { JudeTypingIndicator } from './JudeTypingIndicator';
export { MessageTypewriter } from './MessageTypewriter';
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/community/JudeTypingIndicator.tsx` | CREATE | Jude-specific thinking indicator |
| `src/components/community/MessageTypewriter.tsx` | CREATE | Typewriter effect for messages |
| `src/components/community/MessageBubble.tsx` | UPDATE | Add typewriter mode support |
| `src/components/community/index.ts` | UPDATE | Export new components |
| `src/pages/Community.tsx` | UPDATE | Add state tracking + render indicators |

---

## 3G Performance Considerations

| Aspect | Solution |
|--------|----------|
| Animation CPU | Use `animate-typing-wave` CSS (GPU-accelerated) |
| Slow connection | Fallback to Loader2 spinner (less CPU) |
| Typewriter speed | 5ms on slow connection, 15ms on fast |
| Network detection | Reuse `useNetworkAwareLoading` hook |
| Reduced motion | Respect `prefers-reduced-motion` via existing CSS |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing typing indicators? | No | New components are additive |
| Works with existing message flow? | Yes | Hooks into realtime subscription |
| Handles errors gracefully? | Yes | Clears state on edge function error |
| Group chat support? | Yes | "Hey Jude" mentions also trigger indicator |
| Memory leaks? | No | State cleared on response or error |
| Multiple rapid messages? | Safe | Only tracks latest pending Jude response |

---

## Technical Details

### JudeTypingIndicator Component

```typescript
// Uses same avatar as existing Jude references
const ericAiHelper = "/images/eric-ai-helper.png";

// Styling matches existing TypingIndicator but with Jude branding
// Glow effect uses --time-accent CSS variable for consistency
```

### MessageTypewriter Component

```typescript
// Based on TypewriterText from JudeChatbot
// Key difference: Uses ChatMessageRenderer after completion
// This ensures proper markdown/KaTeX rendering

// During typing: raw text with cursor
// After complete: full ChatMessageRenderer output
```

### State Flow Diagram

```text
User sends to Jude
        │
        ▼
┌───────────────────────┐
│ setIsAwaitingJudeResponse(true) │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│ Show JudeTypingIndicator │
│ "Jude réfléchit..."   │
└───────────────────────┘
        │
        ▼ (Realtime: Jude message arrives)
┌───────────────────────┐
│ setIsAwaitingJudeResponse(false) │
│ setTypewriterMessageId(msg.id) │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│ MessageBubble renders │
│ with typewriter effect │
└───────────────────────┘
        │
        ▼ (Typewriter completes)
┌───────────────────────┐
│ setTypewriterMessageId(null) │
│ Normal message display │
└───────────────────────┘
```

---

## Edge Cases Handled

| Case | Solution |
|------|----------|
| User leaves conversation before Jude responds | State cleared on conversation change |
| Edge function times out | Error handler clears awaiting state |
| Multiple Jude responses (group chat) | Each response triggers typewriter |
| Fast response (< 100ms) | Still shows brief indicator + typewriter |
| User scrolls during typewriter | Auto-scroll to bottom continues |
| Long Jude response | Typewriter speed appropriate for length |

---

## UI Preview

### While Jude is thinking:
```
┌─────────────────────────────────────┐
│ [User message bubble]               │
│                                     │
│ 👤 What is the Pythagorean theorem? │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ [Jude avatar] Jude réfléchit •••    │
│              (animated dots)         │
└─────────────────────────────────────┘
```

### When Jude responds (typewriter):
```
┌─────────────────────────────────────┐
│ [User message bubble]               │
│                                     │
│ 👤 What is the Pythagorean theorem? │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ [Jude message bubble]               │
│                                     │
│ 🤖 The Pythagorean theorem sta|     │
│    (blinking cursor)                │
└─────────────────────────────────────┘
```
