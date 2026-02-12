

# Harden Exam PDF Upload Pipeline

## Issues Found

### Critical (causes breaks)

| # | Issue | Impact |
|---|-------|--------|
| 1 | **PNG at 2x scale creates massive payloads** -- each page is 2-5MB as base64 PNG. A 10-page exam sends 20-50MB to the edge function in ONE request | Timeouts on 3G, edge function payload limits hit, browser memory exhaustion |
| 2 | **No page limit** -- a 50+ page PDF will crash the browser rendering all pages to canvas simultaneously | Tab crash, unrecoverable |
| 3 | **Double PDF upload** -- `handleConfirmAndSave` re-uploads the same PDF that was already uploaded in `handleAnalyzeAndSave` | Wasted bandwidth, potential failure point |
| 4 | **No file size validation** -- users can select a 200MB scanned PDF | Browser hangs during `arrayBuffer()` |

### Moderate (fragile behavior)

| # | Issue | Impact |
|---|-------|--------|
| 5 | **Raw JSON parsing in edge function** -- AI returns free-text that must be cleaned of markdown fences, then parsed. One malformed character kills it | "Failed to parse AI response" errors |
| 6 | **No retry on AI analysis failure** -- if AI call fails, user must re-upload PDF and re-convert all pages from scratch | Frustrating UX, wasted AI credits |
| 7 | **Canvas elements never cleaned up** -- `convertPdfToImages` creates DOM canvases in a loop without removing them | Memory leaks on repeated uploads |
| 8 | **No upload progress** -- PDF upload to storage uses `supabase.storage.upload()` with no progress tracking (the project already has `uploadWithProgress` utility) | User thinks app is frozen |

### Minor (polish)

| # | Issue | Impact |
|---|-------|--------|
| 9 | **AlertDialog ref warning** -- ExistingExamsList triggers React ref warning in console | Console noise |
| 10 | **No step indicator** -- user has no idea which phase they're in (upload/convert/analyze/save) | Confusion during long operations |

---

## Plan

### 1. Optimize image conversion (pdfUtils.ts)

- Switch from **PNG to JPEG** at 0.75 quality (70-80% smaller files)
- Reduce scale from **2.0 to 1.5** (still readable for OCR, much smaller)
- Add **max page limit of 20** with a clear error message
- **Clean up canvas** elements after each page conversion
- Add **max file size check** (25MB) before processing

### 2. Cache uploaded PDF URL to avoid double upload (ExamAdminPage.tsx)

- Store the `pdfUrl` from `handleAnalyzeAndSave` in state
- In `handleConfirmAndSave`, reuse it instead of re-uploading
- Only upload again if the file changed

### 3. Add step progress indicator (ExamAdminPage.tsx)

Add a `processingStep` state that shows which phase is active:

```text
Step 1/4: Televersement du PDF...
Step 2/4: Conversion des pages (3/8)...
Step 3/4: Analyse IA en cours...
Step 4/4: Sauvegarde...
```

### 4. Switch edge function to tool calling (parse-exam-vision/index.ts)

Replace fragile JSON-in-text parsing with structured **tool calling** (same pattern already used successfully in `analyze-curriculum-pdf`). This eliminates:
- Markdown fence stripping
- JSON parse failures
- Malformed responses

### 5. Add retry logic for AI analysis (ExamAdminPage.tsx)

- If the AI call fails, offer a "Reessayer l'analyse" button
- Keep the already-uploaded PDF URL and converted images in state
- Only retry the AI step, not the whole pipeline

### 6. Fix AlertDialog ref warning (ExistingExamsList.tsx)

Wrap the component with `React.forwardRef` or restructure the AlertDialog usage to avoid the ref forwarding issue.

### 7. Use upload with progress (pdfUtils.ts)

Replace `supabase.storage.upload()` with the existing `uploadWithProgress` utility for visual feedback during PDF upload.

---

## File Changes

| Action | File | Description |
|--------|------|-------------|
| EDIT | `src/features/exams/admin/utils/pdfUtils.ts` | JPEG output, scale 1.5, page limit, file size check, canvas cleanup, progress upload |
| EDIT | `src/features/exams/admin/ExamAdminPage.tsx` | Step indicator, cached PDF URL, retry logic, no double upload |
| EDIT | `supabase/functions/parse-exam-vision/index.ts` | Switch to tool calling for reliable structured output |
| EDIT | `src/features/exams/admin/components/ExistingExamsList.tsx` | Fix AlertDialog ref warning |
| EDIT | `src/features/exams/admin/components/PDFUploader.tsx` | Show step indicator and file size warning |

---

## Safety Checklist

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- same data flow, just more robust |
| Works with existing data? | Yes -- existing exams untouched |
| 3G optimized? | Yes -- 70-80% smaller payloads, progress indicators |
| Backward compatible? | Yes -- same database schema |
| Edge cases? | Large PDFs rejected early, AI failures retryable, canvas memory freed |

