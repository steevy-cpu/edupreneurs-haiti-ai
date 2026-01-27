

# Apply Missing PDF Fix - Move Color Setters Inside Loops

## What Happened

The previous fix attempt did not update the correct lines. The `setFillColor` and `setTextColor` calls are still **outside** the column loops, which causes jsPDF state corruption after each `text()` call.

## Current State (Broken - Lines 188-223)

```typescript
// Header: color set ONCE before loop
pdf.setFillColor(245, 245, 245);  // Line 190
pdf.setTextColor(0, 0, 0);        // Line 191
for (let col = 0; col < columns; col++) {
  pdf.rect(...);  // 2nd cell gets corrupted state
  pdf.text(...);  // Corrupts state for next cell
}

// Data: same problem
pdf.setFillColor(255, 255, 255);  // Line 207
pdf.setTextColor(0, 0, 0);        // Line 208
for (const row of data) {
  for (let col = 0; col < columns; col++) {
    pdf.rect(...);  // 2nd cell gets corrupted state
    pdf.text(...);  // Corrupts state for next cell
  }
}
```

## Required Fix

Move the color state setters **inside** the column loops:

### Header Row (Lines 188-202)
```typescript
if (headers.length > 0) {
  pdf.setFont('helvetica', 'bold');
  
  for (let col = 0; col < columns; col++) {
    // Reset colors BEFORE each cell
    pdf.setFillColor(245, 245, 245);
    pdf.setTextColor(0, 0, 0);
    
    const x = element.position.x + col * colWidth;
    pdf.rect(x, currentY, colWidth, rowHeight, 'FD');
    pdf.text(headers[col] || '', x + cellPadding, currentY + cellPadding + fontSize * 0.8);
  }
  currentY += rowHeight;
}
```

### Data Rows (Lines 205-223)
```typescript
pdf.setFont('helvetica', 'normal');

for (const row of data) {
  for (let col = 0; col < columns; col++) {
    // Reset colors BEFORE each cell
    pdf.setFillColor(255, 255, 255);
    pdf.setTextColor(0, 0, 0);
    
    const x = element.position.x + col * colWidth;
    pdf.rect(x, currentY, colWidth, rowHeight, 'FD');
    
    const cellValue = row[col] || '';
    const maxWidth = colWidth - cellPadding * 2;
    const truncated = pdf.splitTextToSize(cellValue, maxWidth)[0] || '';
    
    pdf.text(truncated, x + cellPadding, currentY + cellPadding + fontSize * 0.8);
  }
  currentY += rowHeight;
}
```

---

## File to Modify

**`supabase/functions/export-template/index.ts`**

| Lines | Change |
|-------|--------|
| 188-202 | Restructure header loop with colors inside |
| 205-223 | Restructure data loop with colors inside |

---

## Expected Result

All table cells will render correctly:
- Header cells: light gray background (#F5F5F5), black text
- Data cells: white background (#FFFFFF), black text
- No more black boxes

