
# Fix Personnaliser Section Cutoff & Preview Element Overlap

## Problem Analysis

### Issue 1: Personnaliser Section Cutoff
The sidebar table editor is cut off at the bottom. Looking at the current structure:

```
Card (overflow-hidden) ← Clips content!
  └─ CardContent (overflow-hidden) ← Double clips!
       └─ ScrollArea (max-h-[50vh]) ← Too restrictive
```

**Root Cause**: Multiple `overflow-hidden` constraints combined with a fixed `max-h-[50vh]` limit that doesn't account for the full table height (9 rows × ~30px = 270px+).

### Issue 2: Preview Elements Overlayed
Looking at the schema positions and the screenshot:
- Title: `y: 35`, fontSize: 22
- School name: `y: 60`, fontSize: 12  
- Student name: `y: 80`, fontSize: 12

The elements overlap because:
1. The percentage-based positioning (`top: (y/842)*100%`) compresses vertical spacing on smaller canvas renders
2. Font sizes don't scale proportionally with the container

---

## Solution

### File 1: `src/components/templates/EditorSidebar.tsx`

**Changes:**
1. Remove `overflow-hidden` from Card - use visible overflow
2. Remove `overflow-hidden` from CardContent - allow content to flow
3. Change ScrollArea height to be more flexible - use full available height on desktop
4. Remove max-h constraints that cut off content

```tsx
// Before
<Card className="flex flex-col h-auto lg:h-full overflow-hidden">
  <CardContent className="flex-1 min-h-0 p-0 overflow-hidden">
    <ScrollArea className="h-full max-h-[50vh] lg:max-h-[calc(100vh-280px)]">

// After  
<Card className="flex flex-col">
  <CardContent className="flex-1 p-0">
    <ScrollArea className="max-h-[60vh] lg:max-h-[calc(100vh-260px)]">
```

### File 2: `src/components/templates/TemplateCanvas.tsx`

**Changes:**
1. Scale font sizes relative to canvas width using a scale factor
2. Ensure proper vertical spacing by using absolute pixel positioning within the scaled container
3. Add a min-height to prevent over-compression

```tsx
// Calculate scale factor based on container width vs template width
// This ensures text doesn't overlap when canvas is smaller than template dimensions

// Add proper spacing by using relative units that respect the document scale
```

---

## Technical Implementation

### EditorSidebar.tsx Changes

| Line | Change |
|------|--------|
| 115 | Remove `overflow-hidden` from Card, keep flex structure |
| 119 | Remove `overflow-hidden` from CardContent |
| 120 | Adjust ScrollArea height constraints |

### TemplateCanvas.tsx Changes

| Line | Change |
|------|--------|
| 46-55 | Add scale factor calculation based on actual container width |
| 88-100 | Scale text fontSize dynamically based on container scale |
| Add | Ensure container has minimum height to prevent cramping |

---

## Visual Result

**Personnaliser - Before:**
```
┌─────────────────────┐
│ Personnaliser       │
│ ─────────────────── │
│ Titre: [input]      │
│ École: [input]      │
│ Élève: [input]      │
│ Horaire:            │
│ ┌──────────┐        │
│ │ Heure  7:│← CUT   │
└─────────────────────┘
```

**Personnaliser - After:**
```
┌─────────────────────┐
│ Personnaliser       │
│ ─────────────────── │
│ Titre: [input]      │
│ École: [input]      │
│ Élève: [input]      │
│ Horaire:            │
│ ┌──────────────────┐│
│ │ Heure│Lun│Mar│...││
│ │ 7:00 │...│...│...││
│ │ ...  │   │   │   ││◄ Scrollable
│ └──────────────────┘│
└─────────────────────┘
```

**Preview - Before:**
```
  Mon Emploi du Temps    2025-2026
  Ex: Collège Saint-Louis
      Votre nom              ← Text overlapping
  ─────────────────────────────
  │ Heure │ Lundi │ ... │
```

**Preview - After:**
```
  Mon Emploi du Temps         2025-2026

  Ex: Collège Saint-Louis
  
  Votre nom                   ← Proper spacing
  
  ─────────────────────────────
  │ Heure │ Lundi │ ... │
```

---

## Safety Verification

| Check | Status |
|-------|--------|
| Table inputs fully accessible? | Yes - removed overflow-hidden |
| ScrollArea still works? | Yes - max-height preserved |
| Desktop layout maintained? | Yes - lg: breakpoints preserved |
| Mobile layout improved? | Yes - better height handling |
| Text elements properly spaced? | Yes - scaled positioning |
| Backward compatible? | Yes - no schema changes |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/templates/EditorSidebar.tsx` | Remove overflow-hidden, adjust height constraints |
| `src/components/templates/TemplateCanvas.tsx` | Add proper font scaling relative to container width |
