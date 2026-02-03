
# Fix Plan: AskJudeDrawer Desktop/Tablet Display Issues

## Problem Analysis

From the screenshot, the drawer on desktop/tablet shows:
1. Content appearing in the middle without proper bottom anchoring
2. Input area getting cut off or hidden at the bottom
3. Empty state message visible but the input field is not visible

**Root Cause**: The `DrawerContent` uses `max-h-[85vh]` but the inner container with `max-h-[600px]` doesn't have a minimum height to push the input area to the bottom. On desktop, the empty state collapses the content area, causing layout issues.

---

## Solution

### File: `src/features/exams/practice/components/AskJudeDrawer.tsx`

**Changes needed:**

```typescript
// BEFORE (line 105-106):
<DrawerContent className="max-h-[85vh]">
  <div className="flex flex-col h-full max-h-[600px]">

// AFTER:
<DrawerContent className="max-h-[85vh] min-h-[400px]">
  <div className="flex flex-col h-[70vh] max-h-[600px]">
```

**Key changes:**

| Change | Purpose |
|--------|---------|
| Add `min-h-[400px]` to DrawerContent | Ensures drawer has minimum height on all devices |
| Change inner div from `h-full` to `h-[70vh]` | Forces explicit height so flexbox can properly push input to bottom |
| Keep `max-h-[600px]` | Still caps maximum height for usability |

**Additional fix for the messages area (line 123):**

```typescript
// BEFORE:
<div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>

// AFTER:
<div className="flex-1 overflow-y-auto p-4 min-h-[200px]" ref={scrollRef}>
```

Adding `min-h-[200px]` to the messages area ensures the scrollable content zone always has height, pushing the input area to the visible bottom.

---

## File Changes Summary

| Operation | File | Lines | Description |
|-----------|------|-------|-------------|
| Modify | `src/features/exams/practice/components/AskJudeDrawer.tsx` | 105-106 | Add min-h to DrawerContent, change inner div to explicit height |
| Modify | `src/features/exams/practice/components/AskJudeDrawer.tsx` | 123 | Add min-h to messages area |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Only CSS class adjustments |
| Mobile view affected? | No | Already working, min-h provides safety |
| Desktop/Tablet fixed? | Yes | Explicit heights ensure proper layout |
| 3G optimized? | Yes | No additional downloads |
| Backward compatible? | Yes | Pure CSS addition |

---

## Implementation Time

~5 minutes - CSS class modifications to fix height constraints
