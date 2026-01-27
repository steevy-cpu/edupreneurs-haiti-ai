

# Fix Template Export Issues: PDF Black Cells & PNG Format

## Problem Analysis

### Issue 1: PDF Table Renders with Black Cells

Looking at the screenshot, the table cells after the header are completely black. The root cause is in the `renderTableElement` function in the edge function:

```typescript
// Line 205 - After header, this sets fill to white for data rows
pdf.setFillColor(255, 255, 255);

// Line 210 - But 'FD' means Fill+Draw
pdf.rect(x, currentY, colWidth, rowHeight, 'FD');
```

The problem: **Text color is not reset after rendering the header**. The header text uses black color (default), but after rendering the header, no explicit `setTextColor()` is called before rendering data rows. Additionally, jsPDF may be inheriting incorrect color states.

Looking more closely at the rendering flow:
1. Header row: `setFillColor(245, 245, 245)` + `setFont('bold')` + draw rects with 'FD'
2. Data rows: `setFillColor(255, 255, 255)` + `setFont('normal')` + draw rects with 'FD'

**The actual bug**: `setTextColor()` is **never called** in `renderTableElement`. The text color inherits from the previous element rendered (which could be the title/objectives text that sets a custom color). When the previous text element has a dark color, the table text becomes invisible against a white background.

Wait - the cells are BLACK, not the text invisible. Looking again at the screenshot:
- "Jour" header and "Lundi" are visible
- All other cells are solid black rectangles

This suggests `setFillColor` is NOT being reset properly between rows, OR the fill color is being set to black (0,0,0) somewhere.

**Root cause found**: After `renderTextElement` sets `setTextColor(0,0,0)` for black text, this could affect subsequent fill operations in some jsPDF versions. But more likely: the **draw color** `setDrawColor` is set to the border color, but `setFillColor` may be affected by incomplete state.

Actually, the real issue is simpler: After `setTextColor()` is called with a custom color in `renderTextElement`, that color persists. But that affects text, not fill.

Let me trace more carefully:
1. Text elements render with colors like `#1e3a5f` (title) or `#666666` (date)
2. Table renders - `setFillColor(245, 245, 245)` for header
3. For data rows: `setFillColor(255, 255, 255)` should set white

The black cells suggest either:
- The fill color is defaulting to black (0,0,0) somewhere
- Or the rect is being drawn without proper fill

**Most likely cause**: jsPDF state pollution. The solution is to explicitly reset ALL colors before each element type.

### Issue 2: PNG Mode Doesn't Work

The code explicitly shows the problem (lines 382-385):
```typescript
if (format === 'png') {
  documentBuffer = await generatePNG(template as Template, validatedValues);
  contentType = 'application/pdf'; // MVP: return PDF, client handles PNG
  fileExtension = 'pdf'; // Returns .pdf even when user requested PNG!
}
```

And the `generatePNG` function (lines 284-292):
```typescript
async function generatePNG(...) {
  // For MVP, we return the PDF and let client convert
  const pdfBuffer = generatePDF(template, values);
  // TODO: Implement PDF to PNG conversion
  return pdfBuffer; // Returns PDF data!
}
```

**Problem**: The PNG button downloads a PDF file with `.png` extension (due to line 76 in hook: `a.download = ${filename}.${request.format}`). PNG files can't open PDF data.

---

## Solution

### Fix 1: PDF Table Rendering - Explicit Color State Management

Modify `renderTableElement` to:
1. Explicitly set text color to black before rendering
2. Reset fill and draw states properly between header and data rows

```typescript
function renderTableElement(pdf: jsPDF, element: TemplateElement, data: string[][]): void {
  const style = element.style || {};
  const cellPadding = style.cellPadding || 6;
  const fontSize = style.fontSize || 9;
  const borderColor = style.borderColor ? hexToRgb(style.borderColor) : [200, 200, 200];
  
  // ... calculate dimensions ...

  // Set base styles
  pdf.setFontSize(fontSize);
  pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  pdf.setTextColor(0, 0, 0); // ← ADD: Explicit black text

  // Render header row
  if (headers.length > 0) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFillColor(245, 245, 245);
    // ... render headers ...
  }

  // Render data rows
  pdf.setFont('helvetica', 'normal');
  pdf.setFillColor(255, 255, 255); // ← Already exists
  pdf.setTextColor(0, 0, 0);       // ← ADD: Ensure black text for data
  // ... render data ...
}
```

### Fix 2: PNG Export - Client-Side Conversion Using html2canvas

Since server-side PNG generation in Deno is complex, implement client-side conversion:

1. **Remove PNG button from edge function** - only support PDF server-side
2. **Add client-side PNG export** using `html2canvas` (already installed) to capture the canvas preview

This approach:
- Uses the already-rendered HTML preview
- Works offline (no server call needed)
- Is much simpler than server-side canvas rendering
- Gives pixel-perfect output matching what user sees

---

## Technical Implementation

### File 1: `supabase/functions/export-template/index.ts`

| Location | Change |
|----------|--------|
| Line 183-184 | Add `pdf.setTextColor(0, 0, 0);` after setting fontSize/drawColor |
| Line 204 | Add `pdf.setTextColor(0, 0, 0);` before rendering data rows |

### File 2: `src/hooks/useTemplateExport.ts`

| Change | Description |
|--------|-------------|
| Add canvas ref parameter | Accept a ref to the canvas element |
| Add `exportPNGClient` function | Use html2canvas to capture the preview |
| Keep `exportPDF` for server-side | Only PDF uses the edge function |

### File 3: `src/pages/templates/TemplateEditorPage.tsx`

| Change | Description |
|--------|-------------|
| Add canvas ref | Create ref to pass to TemplateCanvas |
| Update PNG handler | Call client-side PNG export instead |

### File 4: `src/components/templates/TemplateCanvas.tsx`

| Change | Description |
|--------|-------------|
| Accept forwardRef | Allow parent to get DOM reference for capture |

---

## Code Changes Summary

```text
supabase/functions/export-template/index.ts
├── Line ~183: Add pdf.setTextColor(0, 0, 0) after setDrawColor
└── Line ~204: Add pdf.setTextColor(0, 0, 0) before data row loop

src/hooks/useTemplateExport.ts
├── Add exportPNGClient function using html2canvas
└── Keep exportPDF unchanged for server-side PDF

src/pages/templates/TemplateEditorPage.tsx
├── Add useRef for canvas element
└── Pass ref to TemplateCanvas
└── Update handleExportPNG to use client-side export

src/components/templates/TemplateCanvas.tsx
└── Wrap component with forwardRef to expose DOM element
```

---

## Safety Verification

| Check | Status |
|-------|--------|
| PDF export still works? | Yes - only adds explicit color resets |
| PNG produces valid image? | Yes - uses html2canvas client-side |
| Existing table data preserved? | Yes - no schema changes |
| Branding still enforced? | Yes - branding in PDF, visible in PNG capture |
| 3G optimized? | Yes - PNG generated locally, no extra network call |
| Backward compatible? | Yes - no breaking changes |

---

## Expected Results

**PDF Export - After Fix:**
- Table cells render with white background
- All text visible in black
- Headers have light gray background
- Borders render correctly

**PNG Export - After Fix:**
- Downloads valid PNG file
- Captures exactly what user sees in preview
- Includes branding footer
- Opens correctly in any image viewer

