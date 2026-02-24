

# Studygram Text Overflow and Color Contrast — 2 Surgical Fixes

## Scope

**1 file modified:** `src/features/matieres/components/tabs/LessonStudygramTab.tsx`
No new dependencies. No database changes.

---

## Fix 1 — Prevent Node Overflow and Clipping

**Problem:** Nodes using `rounded-full` grow into circles when text is long, causing them to overflow section containers and clip into adjacent cards.

**Changes:**

1. **MindMapNode component (lines 76-117):**
   - `highlight` node (line 83): change `rounded-full` to `rounded-2xl`, add `max-w-full break-words`
   - `mindmap` node (line 90): change `rounded-full` to `rounded-2xl`, add `max-w-full break-words`
   - `outline` node (line 97): add `max-w-full break-words`
   - `quote` node (line 104): add `max-w-full break-words`
   - `plain` node (line 112): add `max-w-full break-words`

2. **BranchNode component (line 136):** Add `min-w-0` to the `flex-1` wrapper so flex children can shrink below content size

3. **RadialMindMapCluster (lines 178-223):**
   - Central node (line 194): change `rounded-full` to `rounded-2xl`, add `max-w-full break-words`
   - Child pills (line 213): change `rounded-full` to `rounded-2xl`, remove `max-w-[140px]` (was causing text clipping), add `break-words`

4. **Central title pill (line 361):** change `rounded-full` to `rounded-2xl`, add `max-w-full break-words`

---

## Fix 2 — Fix White Text on Light Backgrounds

**Problem:** `text-white` on `bg-{color}-500` nodes becomes invisible when nodes sit on light card backgrounds or overflow container bounds.

**Changes to SECTION_COLORS (lines 22-68):**

Update all 4 color schemes with new node color values. Section headers (`headerBg`) stay unchanged (saturated bg + white text is fine there).

```text
For each color (blue, purple, emerald, amber):

highlightBg:  CHANGE from 'bg-{color}-500 dark:bg-{color}-600'
              TO     'bg-{color}-100 dark:bg-{color}-900/40'
              (was used with text-white, now paired with dark text)

Add new field:
highlightText: 'text-{color}-900 dark:text-{color}-100'

mindmapBg:    KEEP   'bg-{color}-100 dark:bg-{color}-900/50' (already light)
mindmapText:  KEEP   'text-{color}-700 dark:text-{color}-200' (already dark)

nodeBg:       KEEP   'bg-{color}-50 dark:bg-{color}-950/40'
nodeText:     KEEP   'text-{color}-900 dark:text-{color}-100'
```

**Changes to MindMapNode (lines 76-117):**
- `highlight` case (line 83): replace `text-white` with `${colors.highlightText}`, add `font-semibold border ${colors.border}`
- `quote` case (line 104): change `border-l-3` to `border-l-4`, use `${colors.nodeBg}` (already light), keep `text-muted-foreground`
- `plain` case (line 112): keep as-is (already uses `nodeText` which is dark)

**Changes to RadialMindMapCluster (lines 178-223):**
- Central node (line 194): replace `${colors.highlightBg} text-white` with `${colors.highlightBg} ${colors.highlightText}` + border
- Child pills (line 213): already use `mindmapBg`/`mindmapText` which are light bg + dark text — no change needed

**What stays white text:** Only the section header bars (lines 157, 186) keep `text-white` since they sit on saturated `bg-{color}-500` backgrounds with sufficient contrast.

---

## Updated Color Type

Add `highlightText` field to the SECTION_COLORS type definition (line 23):

```text
Record<string, {
  headerBg: string;
  border: string;
  nodeBg: string;
  nodeText: string;
  highlightBg: string;
  highlightText: string;   // NEW
  mindmapBg: string;
  mindmapText: string;
}>
```

---

## Summary of All Affected Lines

```text
src/features/matieres/components/tabs/LessonStudygramTab.tsx
  Lines 22-68:   SECTION_COLORS — update highlightBg values, add highlightText field
  Line 83:       highlight node — rounded-2xl, dark text, max-w-full, break-words
  Line 90:       mindmap node — rounded-2xl, max-w-full, break-words
  Line 97:       outline node — max-w-full, break-words
  Line 104:      quote node — border-l-4, max-w-full, break-words
  Line 112:      plain node — max-w-full, break-words
  Line 136:      BranchNode wrapper — add min-w-0
  Line 194:      radial central node — rounded-2xl, dark text, max-w-full, break-words
  Line 213:      radial child pills — rounded-2xl, remove max-w-[140px], break-words
  Line 361:      central title pill — rounded-2xl, max-w-full, break-words
```

---

## Verification

| Check | Result |
|---|---|
| Existing functionality broken? | No -- same data, same layout structure |
| New dependencies? | None |
| Bundle size impact? | Zero -- only class name changes |
| 3G performance? | No impact -- CSS only |
| Section headers affected? | No -- keep saturated bg + white text |
| Dark mode contrast? | Maintained via dark: variants on all nodes |
| Node shapes preserved? | Yes -- rounded-2xl keeps pill aesthetic without circular overflow |
