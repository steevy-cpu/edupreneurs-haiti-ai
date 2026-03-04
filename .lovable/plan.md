

## Plan: Add Drag-and-Drop & Paste Support to PDFUploader.tsx

**Single file modified:** `src/features/exams/admin/components/PDFUploader.tsx`

### Changes

1. **New state:** Add `isDragging` boolean state (line ~18 area)

2. **Extract `handleFile(file: File)`** — shared validation + `onChange` call, replacing duplicated logic in current `handleChange`

3. **Refactor `handleChange`** to delegate to `handleFile` after extracting the file from the input event

4. **Add three new handlers:**
   - `handleDrop` — extracts first file from `dataTransfer`, calls `handleFile`
   - `handleDragOver` / `handleDragLeave` — toggle `isDragging` for visual feedback
   - `handlePaste` — scans clipboard items for `application/pdf` type only, calls `handleFile`

5. **Update drop zone div (current line 79):**
   - Attach `onDrop`, `onDragOver`, `onDragLeave`, `onPaste`
   - Add `tabIndex={0}` for paste focus
   - Dynamic border styling via `cn()` — primary highlight when dragging

6. **Update helper text** to mention all three input methods (drag, paste, click) in French

### Safety

| Check | Result |
|---|---|
| Other files touched | No — only PDFUploader.tsx |
| Existing click flow | Preserved — same hidden input + label pattern |
| Validation path | Unified through `handleFile()` using same `validatePdfFile()` |
| Bundle impact | None — no new dependencies |
| 3G performance | No impact — event handlers only |

