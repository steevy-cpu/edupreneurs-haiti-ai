
# Plan: Fix Visitor Tour Issues

## Problem Summary

Two issues reported with the Visitor Tour:

1. **Inaccurate Highlights**: The spotlight overlay is highlighting the entire page instead of specific elements (visible in screenshots as a teal border around the whole content area)
2. **React Errors on "Suivant" Button**: `TypeError: Cannot read properties of null (reading 'useState')` when clicking the next button to navigate between tour steps

## Root Cause Analysis

### Issue 1: Inaccurate Highlights

The spotlight overlay in `VisitorTour.tsx` (lines 136-171) uses:
- A `clipPath` polygon to create a "spotlight" effect
- `getBoundingClientRect()` to calculate element positions
- Targets like `[data-tour='feed-content']`

**Problems:**
- Target elements may not exist or have incorrect `data-tour` attributes
- The `getBoundingClientRect()` values are static and don't account for scroll
- The complex clip-path calculation is error-prone and creates visual artifacts

**Solution:** Remove the spotlight overlay entirely as requested - the tour dialog provides sufficient context without highlighting.

### Issue 2: React Dispatcher Error

The `VisitorTour` component is lazy-loaded in `FloatingLayer.tsx` but **lacks the stability guard pattern** that was added to the FirstTimeUser components (`FirstTimeUserWelcome`, `AvatarGenerationStep`, `FirstTimeUserTour`).

When clicking "Suivant":
1. `nextTourStep()` is called → increments `tourStep`
2. `useEffect` triggers navigation to new path
3. Navigation causes module isolation issues during the unstable transition
4. Hooks are called before React's dispatcher is fully initialized

**Solution:** Apply the same double `requestAnimationFrame` stability guard pattern to `VisitorTour`.

---

## Implementation

### File: `src/components/visitor/VisitorTour.tsx`

**Change 1: Add stability guard (at component start)**

Add state and effect to delay rendering until React is stable:

```tsx
export const VisitorTour = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // STABILITY GUARD: Prevent null dispatcher errors during lazy load transitions
  const [isStable, setIsStable] = useState(false);
  
  // Wait for React dispatcher to stabilize after lazy load
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsStable(true);
      });
    });
    return () => cancelAnimationFrame(timer);
  }, []);
  
  // Rest of hooks...
  const { isVisitor, tourStep, tourActive, ... } = useVisitor();
  // ...other hooks
  
  // Early return AFTER all hooks (prevents hook count mismatch)
  if (!isStable) return null;
  if (!isVisitor || !tourActive || tourCompleted || !currentStep) return null;
```

**Change 2: Remove spotlight overlay entirely**

Remove lines 136-171 (the spotlight overlay and highlight border) since:
- The highlights are inaccurate and visually distracting
- The tour dialog provides sufficient guidance
- Simpler is better for 3G performance

The JSX will simplify to just the tour dialog:

```tsx
return (
  <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:bottom-4 sm:w-96 z-[1004] animate-slide-up">
    {/* Tour dialog content - same as before */}
  </div>
);
```

**Change 3: Remove unused state and effect for highlighting**

Remove:
- `const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);`
- The `useEffect` that finds and highlights elements (lines 92-109)

---

## Files Modified

| File | Changes |
|------|---------|
| `src/components/visitor/VisitorTour.tsx` | Add stability guard, remove spotlight overlay, remove unused highlight state/effects |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Backward compatible? | Yes | Tour still functions, just without visual highlights |
| Breaks existing flow? | No | Same navigation, same tour steps |
| 3G performance | Improved | Less DOM manipulation, no `getBoundingClientRect()` calls |
| Works with dark mode? | Yes | No changes to theming |
| Accessibility? | Yes | No changes to ARIA or interaction patterns |
| Hook count stable? | Yes | All hooks called unconditionally before early returns |

---

## Expected Result

After implementation:
- "Suivant" button works without React errors
- Tour dialog appears cleanly without distracting spotlight overlays
- Smoother navigation between tour steps
- Consistent behavior across all devices and connection speeds
