
# Fix PDF Table Black Cells Issue

## Root Cause Analysis

The screenshot shows a specific pattern:
- First cell of header row (Heure) is visible with gray background
- First cell of data rows (7:00 - 8:00) is visible with white background  
- ALL subsequent cells in EVERY row are solid black

This pattern reveals that jsPDF's color state is being corrupted **after each `text()` call**. When `text()` renders, it may internally modify drawing states, causing the next `rect()` to use incorrect fill color (defaulting to black).

**The fix**: Call `setFillColor()` immediately before **every** `rect()` call, not just once per row.

---

## Solution

Move the `setFillColor()` calls inside the column loops so they execute before each individual cell rectangle is drawn.

### Current Code (Broken)
```typescript
// Render header row
pdf.setFillColor(245, 245, 245); // Set once before loop
for (let col = 0; col < columns; col++) {
  pdf.rect(x, currentY, colWidth, rowHeight, 'FD'); // 2nd+ cells use corrupted state
  pdf.text(headers[col]); // Corrupts fill state
}

// Render data rows
pdf.setFillColor(255, 255, 255); // Set once before loop
for (const row of data) {
  for (let col = 0; col < columns; col++) {
    pdf.rect(x, currentY, colWidth, rowHeight, 'FD'); // 2nd+ cells use corrupted state
    pdf.text(cellValue); // Corrupts fill state
  }
}
```

### Fixed Code
```typescript
// Render header row
for (let col = 0; col < columns; col++) {
  pdf.setFillColor(245, 245, 245); // Set BEFORE each rect
  pdf.setTextColor(0, 0, 0);       // Reset text color too
  pdf.rect(x, currentY, colWidth, rowHeight, 'FD');
  pdf.text(headers[col]);
}

// Render data rows
for (const row of data) {
  for (let col = 0; col < columns; col++) {
    pdf.setFillColor(255, 255, 255); // Set BEFORE each rect
    pdf.setTextColor(0, 0, 0);        // Reset text color too
    pdf.rect(x, currentY, colWidth, rowHeight, 'FD');
    pdf.text(cellValue);
  }
}
```

---

## Technical Changes

### File: `supabase/functions/export-template/index.ts`

| Location | Change |
|----------|--------|
| Lines 188-201 | Move `setFillColor` and `setTextColor` inside the header column loop |
| Lines 210-220 | Move `setFillColor` and `setTextColor` inside the data cell loop |

**Specific edits:**

1. **Header row loop** (around line 193):
   - Move `pdf.setFillColor(245, 245, 245);` inside the `for (let col = 0; col < columns; col++)` loop
   - Add `pdf.setTextColor(0, 0, 0);` before `pdf.text()`

2. **Data row loop** (around line 211):
   - Move `pdf.setFillColor(255, 255, 255);` inside the nested `for (let col = 0; col < columns; col++)` loop
   - Add `pdf.setTextColor(0, 0, 0);` before `pdf.text()`

---

## Expected Result

**Before (Black cells):**
```text
| Heure       | ████████ | ████████ | ████████ | ████████ | ████████ |
| 7:00 - 8:00 | ████████ | ████████ | ████████ | ████████ | ████████ |
```

**After (All cells visible):**
```text
| Heure       | Lundi    | Mardi    | Mercredi | Jeudi    | Vendredi |
| 7:00 - 8:00 |          |          |          |          |          |
| 8:00 - 9:00 |          |          |          |          |          |
```

---

## Safety Verification

| Check | Status |
|-------|--------|
| PNG export still works? | Yes - unaffected (client-side) |
| PDF branding preserved? | Yes - no changes to applyBranding |
| Performance impact? | Minimal - setFillColor is lightweight |
| Backward compatible? | Yes - same output, just correct colors |
| 3G optimized? | Yes - no change to file size |
