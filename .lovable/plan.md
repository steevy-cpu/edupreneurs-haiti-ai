
# Plan: Add Background Blur to HomeChatbot

## Problem Statement
The homepage chatbot (used on the landing page) has the same readability issue as the authenticated JudeChatbot. When users click on Jude to open the chat, the background text and hero section can be distracting.

The user's screenshot shows Jude on the landing page with text like "Intelligence Artificielle" and course descriptions behind it - adding a blur will improve focus on the conversation.

---

## Current Structure

### HomeChatbot.tsx Analysis
- **Location**: `src/components/HomeChatbot.tsx`
- **State**: `isOpen` controls chat visibility (line 57)
- **Hook**: Uses `useNetworkAwareLoading()` returning `{ isSlowConnection, shouldShowAnimations }` (line 71)
- **Z-Index**: Container is at `zIndex: 1000` (line 150)
- **No `cn` utility imported**: Needs to be added

### Key Difference from JudeChatbot
- HomeChatbot uses `shouldShowAnimations` (not `shouldShowBlur`)
- Both come from the same hook, but different property names
- Need to check if the hook provides a blur-specific property or use the same logic

---

## Solution Design

Apply the same pattern as JudeChatbot:
1. Add backdrop element that renders when `isOpen === true`
2. Use semi-transparent overlay with conditional blur
3. Click backdrop to close chat
4. Respect 3G performance (disable blur on slow connections)

---

## Implementation Details

### File: `src/components/HomeChatbot.tsx`

**1. Add Import:**
```tsx
import { cn } from "@/lib/utils";
```

**2. Update Hook Destructuring (line 71):**
The `useNetworkAwareLoading` hook should provide blur optimization. We'll use `isSlowConnection` to determine if blur should be applied (blur disabled on slow connections).

```tsx
const { isSlowConnection, shouldShowAnimations } = useNetworkAwareLoading();
const shouldShowBlur = !isSlowConnection; // Blur only on fast connections
```

**3. Add Backdrop Element (before the main container in return):**
Wrap the return in a fragment and add the backdrop:

```tsx
return (
  <>
    {/* Backdrop overlay when chat is open */}
    {isOpen && (
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 transition-opacity duration-200",
          shouldShowBlur ? "backdrop-blur-sm" : ""
        )}
        style={{ zIndex: 999 }} // Below HomeChatbot (1000)
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
    )}
    
    <div 
      ref={chatRef}
      style={{
        position: 'fixed',
        right: '0.5rem',
        bottom: '1rem',
        zIndex: 1000,
      }}
      // ... rest unchanged
    >
```

---

## Z-Index Strategy

| Layer | Z-Index | Component |
|-------|---------|-----------|
| HomeChatbot backdrop | 999 | New backdrop overlay |
| HomeChatbot container | 1000 | Chat + avatar (existing) |

This ensures the backdrop sits behind the chat but above all landing page content.

---

## Files to Modify

| File | Action | Changes |
|------|--------|---------|
| `src/components/HomeChatbot.tsx` | UPDATE | Add cn import, add shouldShowBlur, add backdrop element, wrap return in fragment |

---

## 3G Performance Considerations

| Aspect | Solution |
|--------|----------|
| Blur performance | Uses `!isSlowConnection` from existing hook |
| Animation | Simple CSS transition (no JS library) |
| Re-renders | Minimal - only on open/close state change |

---

## User Experience Flow

```text
Before (Current):
1. User on landing page with hero text, course cards
2. Clicks Jude avatar
3. Chat opens, background text visible/distracting

After (With Backdrop):
1. User on landing page
2. Clicks Jude avatar
3. Background dims + blurs (on fast connection)
4. Chat is clearly focused
5. Click backdrop OR X button to close
```

---

## Code Changes Summary

**Lines to modify in HomeChatbot.tsx:**
- Line 1-9: Add `cn` import
- Line 71: Add `shouldShowBlur` derived from `isSlowConnection`
- Line 143-152: Wrap in fragment, add backdrop before container

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Backward compatible? | Yes | Only adds optional overlay |
| Breaks existing flows? | No | Close button still works |
| 3G optimized? | Yes | Uses existing isSlowConnection |
| Accessibility? | Yes | aria-hidden on decorative overlay |
| z-index conflicts? | No | 999 is below 1000 container |
| Matches JudeChatbot pattern? | Yes | Same implementation approach |
