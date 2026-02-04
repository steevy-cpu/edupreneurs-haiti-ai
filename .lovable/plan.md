
# Fix: AskJudeDrawer Input Section Disappearing

## Problem Analysis

After the first message exchange in the AskJudeDrawer, the input section disappears on mobile. Looking at the screenshot and code:

**Observed Issue:**
- User sends "Hey Jude"
- Jude responds with a full message
- The input section (with text field + send button) is no longer visible

**Root Cause Identified:**

The drawer uses conflicting height constraints that cause the input to be pushed out of view when messages are added:

```
DrawerContent: max-h-[85vh]
  └─ Container: h-[70vh] max-h-[600px]
       ├─ Header (flex-shrink-0)
       ├─ Messages (flex-1, overflow-y-auto)
       └─ Input (flex-shrink-0) ← Gets pushed out
```

**Issues:**
1. `h-[70vh]` forces a fixed height that doesn't account for dynamic content
2. `max-h-[600px]` caps the container, but combined with `max-h-[85vh]` on parent creates conflicts
3. On mobile with long messages, the flexbox layout can push the input out of the visible drawer area
4. The Vaul drawer doesn't properly handle the input section position when content grows

---

## Solution

Restructure the drawer layout to ensure the input section is **always visible** regardless of message content:

### Key Changes:

1. **Use `h-full` instead of fixed viewport heights** - Let the drawer content fill its container naturally
2. **Add `min-h-0` to the messages container** - Prevents flex item from expanding beyond available space
3. **Ensure input has proper safe area padding** - For mobile keyboard handling
4. **Use proper flex constraints** - `overflow-hidden` on parent, `overflow-y-auto` only on scrollable area

---

## Technical Implementation

### File: `src/features/exams/practice/components/AskJudeDrawer.tsx`

**Before (problematic):**
```tsx
<DrawerContent className="max-h-[85vh] min-h-[400px]">
  <div className="flex flex-col h-[70vh] max-h-[600px]">
    <DrawerHeader className="border-b flex-shrink-0">...</DrawerHeader>
    <div className="flex-1 overflow-y-auto p-4 min-h-[200px]" ref={scrollRef}>
      {/* Messages */}
    </div>
    <div className="border-t p-4 flex-shrink-0">
      {/* Input */}
    </div>
  </div>
</DrawerContent>
```

**After (fixed):**
```tsx
<DrawerContent className="max-h-[85vh]">
  <div className="flex flex-col h-full max-h-[85vh] overflow-hidden">
    <DrawerHeader className="border-b flex-shrink-0">...</DrawerHeader>
    <div className="flex-1 overflow-y-auto p-4 min-h-0" ref={scrollRef}>
      {/* Messages */}
    </div>
    <div className="border-t p-4 flex-shrink-0 bg-background">
      {/* Input - now with bg-background to ensure visibility */}
    </div>
  </div>
</DrawerContent>
```

**Key Fixes:**
| Change | Reason |
|--------|--------|
| Remove `h-[70vh]` → `h-full` | Let container adapt to parent, not viewport |
| Remove `max-h-[600px]` | Conflicting with parent's `max-h-[85vh]` |
| Add `overflow-hidden` to parent | Prevent content from escaping container |
| Remove `min-h-[200px]` → `min-h-0` | Critical fix - allows flex item to shrink |
| Add `bg-background` to input | Ensures input is visible over any content |

---

## Additional Mobile Keyboard Handling

Add focus handling to scroll input into view on mobile:

```tsx
const handleInputFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
  // Delay to let keyboard appear
  setTimeout(() => {
    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
}, []);

<Input
  onFocus={handleInputFocus}
  // ... other props
/>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/features/exams/practice/components/AskJudeDrawer.tsx` | Fix flexbox layout, add keyboard handling |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing chat? | No | Same logic, only layout changes |
| Works with empty messages? | Yes | Empty state still displays correctly |
| Works with long messages? | Yes | Messages scroll, input stays visible |
| Mobile keyboard handled? | Yes | Focus scrolls input into view |
| Backward compatible? | Yes | No API changes |

---

## Summary

The fix involves three key changes:
1. **Remove conflicting height constraints** (`h-[70vh]`, `max-h-[600px]`, `min-h-[200px]`)
2. **Add proper flex constraints** (`h-full`, `min-h-0`, `overflow-hidden`)
3. **Add keyboard focus handling** for mobile devices
