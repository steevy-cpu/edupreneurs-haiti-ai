

# Plan: Add Background Blur When Jude Chat Opens

## Problem Statement
When users click on Jude to open the chat, the background content can be distracting, especially on busy pages like `/matieres`. Adding a blur overlay will:
- Improve text readability in the chat
- Create visual focus on the conversation
- Follow existing UI patterns in the codebase (modals, popups)

---

## Current Architecture

### Z-Index Hierarchy (Relevant)
```text
z-[9999] - NavigationProgress, FirstTimeUserWelcome
z-[9998] - AvatarGenerationStep  
z-[1100] - Drawer component
z-[1005] - Highlighted nav items
z-[1004] - VisitorTour, FirstTimeUserTour
z-[1002] - VisitorBanner, CookieConsent
z-[1001] - AppSidebar mobile button, JudeChatbot ← Current
z-[1000] - MobileBottomNav, AppSidebar
```

### JudeChatbot Structure
- Location: `src/components/JudeChatbot.tsx`
- State: `isOpen` controls chat visibility
- Positioning: Fixed position with `zIndex: 1001`
- FloatingLayer: Renders JudeChatbot via lazy loading

---

## Solution Design

### Approach: Internal Backdrop within JudeChatbot

Add a semi-transparent backdrop with blur effect that:
1. Renders only when `isOpen === true`
2. Positioned behind the chat but above page content
3. Clicking the backdrop closes the chat (same as clicking Jude avatar)
4. Respects 3G optimization (uses `shouldShowBlur` from existing hook)

### Why Not FloatingLayer?
The backdrop state is tightly coupled to `isOpen` in JudeChatbot. Keeping it in the same component:
- Avoids prop drilling or new context
- Uses existing `setIsOpen` callback
- Follows single responsibility (Jude manages its own overlay)

---

## Implementation Details

### File: `src/components/JudeChatbot.tsx`

Add a backdrop element that renders when the chat is open:

**New Backdrop Element (inside the return, before the main container):**
```tsx
{/* Backdrop overlay when chat is open */}
{isOpen && (
  <div 
    className={cn(
      "fixed inset-0 bg-black/40 transition-opacity duration-200",
      shouldShowBlur ? "backdrop-blur-sm" : ""
    )}
    style={{ zIndex: 1000 }} // Below Jude (1001), above page content
    onClick={() => setIsOpen(false)}
    aria-hidden="true"
  />
)}
```

**Add Import:**
```tsx
import { cn } from "@/lib/utils";
```

**Animation Enhancement (optional for smooth UX):**
- The existing transition in `getContainerStyles()` handles smooth movement
- Backdrop uses `transition-opacity duration-200` for fade effect

---

## Component Structure After Change

```text
JudeChatbot (fixed, z-1001)
├── Backdrop (fixed, z-1000, inset-0) ← NEW
│   └── Semi-transparent + blur
│   └── onClick → close chat
├── Avatar + Tooltip
└── Chat Interface (when open)
    ├── FAQ Quick Actions
    ├── Messages Area
    └── Input Area
```

---

## Files to Modify

| File | Action | Changes |
|------|--------|---------|
| `src/components/JudeChatbot.tsx` | UPDATE | Add backdrop element, import cn utility |

---

## 3G Performance Considerations

| Aspect | Solution |
|--------|----------|
| Blur performance | Conditional via `shouldShowBlur` (already available from `useNetworkAwareLoading`) |
| Animation | Simple CSS transition (no JS animation library) |
| Re-renders | Minimal - only state change on open/close |

The codebase already has `shouldShowBlur` from `useNetworkAwareLoading()` hook (line 97), which returns `false` on slow connections. This is already used for message bubbles.

---

## User Experience Flow

```text
Before (Current):
1. User on /matieres with busy background
2. Clicks Jude avatar
3. Chat opens, but background is distracting
4. Text readability is reduced

After (With Backdrop):
1. User on /matieres with busy background
2. Clicks Jude avatar
3. Background dims + blurs (on fast connection)
4. Chat is clearly focused
5. User can click backdrop OR avatar to close
```

---

## Visual Reference

The user's screenshot shows:
- Jude avatar with "Cliquez sur moi" tooltip
- Busy background (course cards, images)
- Need for visual focus when chat opens

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Backward compatible? | Yes | Only adds optional overlay |
| Breaks existing flows? | No | Click behavior preserved |
| 3G optimized? | Yes | Uses existing shouldShowBlur |
| Accessibility? | Yes | aria-hidden on decorative overlay |
| Mobile keyboard? | Yes | Backdrop behind chat, keyboard logic unchanged |
| Draggable behavior? | Yes | Only applies when not dragging |
| z-index conflicts? | No | z-1000 is correct layer |

---

## Technical Notes

### Z-Index Strategy
- Backdrop at `z-1000` (same as MobileBottomNav/Sidebar)
- Jude container at `z-1001` (above backdrop)
- This ensures backdrop doesn't cover Jude's avatar or chat

### Click Handler
- Backdrop click calls `setIsOpen(false)` - same as clicking avatar when open
- Prevents event propagation issues

### Animation Timing
- `duration-200` matches existing UI transitions
- Complements `transition: 'all 0.2s ease-out'` in container styles

