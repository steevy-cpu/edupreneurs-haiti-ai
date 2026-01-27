

# Fix Template Canvas Preview Cutoff

## Problem Analysis

The template preview canvas cuts off the left side of the schedule table. Looking at the screenshot:
- "Heure" and "Lundi" columns are completely hidden
- Only "ardi" (part of "Mardi"), "Mercredi", "Jeudi", "Vendredi" are visible

**Root Cause**: In `TemplateCanvas.tsx`, all elements use `transform: 'translate(-50%, 0)'` which horizontally centers them at their x-coordinate. This works for centered text (title at x=297) but breaks for elements positioned near edges:

- The table is at `x: 40, y: 110` (near left edge)
- With `translate(-50%, 0)`, the table's center is placed at x=40
- This pushes the left half of the table outside the container
- The container has `overflow-hidden`, clipping the overflow

---

## Solution

Apply smart positioning based on element type and alignment:

| Element Type | Current Behavior | Fixed Behavior |
|--------------|------------------|----------------|
| Text (centered) | Center at x | Keep centered |
| Text (left-aligned) | Center at x ❌ | Left edge at x |
| Text (right-aligned) | Center at x ❌ | Right edge at x |
| Table | Center at x ❌ | Left edge at x |

---

## Implementation

### File: `src/components/templates/TemplateCanvas.tsx`

**Changes:**

1. Determine transform based on element type and text alignment
2. Remove `overflow-hidden` from container, use `overflow-auto` 
3. Tables and left-aligned text: no horizontal transform (left edge at x)
4. Centered text: `translate(-50%, 0)` (center at x)
5. Right-aligned text: `translate(-100%, 0)` (right edge at x)

```tsx
// Calculate transform based on element type and alignment
const getTransform = (element) => {
  if (element.type === 'table') {
    // Tables: position left edge at x
    return 'translate(0, 0)';
  }
  
  if (element.type === 'text') {
    const align = element.style?.textAlign || 'left';
    if (align === 'center') return 'translate(-50%, 0)';
    if (align === 'right') return 'translate(-100%, 0)';
    return 'translate(0, 0)'; // left-aligned
  }
  
  // Default for checkbox, date, image
  return 'translate(0, 0)';
};
```

---

## Visual Result

**Before:**
```
| [Mon Emploi...]       2025-2026 |
|                                 |
| ardi | Merc | Jeudi | Vendredi  |  <- "Heure", "Lundi" cut off
```

**After:**
```
| [Mon Emploi...]          2025-2026 |
|                                    |
| Heure | Lundi | Mardi | Merc | ... |  <- Full table visible
```

---

## Safety Verification

| Check | Status |
|-------|--------|
| Centered text elements still center? | Yes (title, school name, student name) |
| Right-aligned text still aligns right? | Yes (year field at x=520) |
| Tables fully visible from left edge? | Yes |
| No regression on other template types? | Yes (same logic applies) |
| Backward compatible with existing schemas? | Yes (uses existing position data) |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/templates/TemplateCanvas.tsx` | Fix element positioning logic |

