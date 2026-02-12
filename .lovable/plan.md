
# Exam Practice Page Refinements

## 3 Changes

### 1. Hide the question progress bubbles on mobile (desktop only)
The `ExamProgressBar` component (the grid of numbered circles showing exercise progress) takes up valuable screen space on mobile. Hide it on small screens using `hidden lg:block`.

**File:** `src/pages/ExamPreparation.tsx`
- Wrap the `<ExamProgressBar>` section (around line 280) with `hidden lg:block`

### 2. Rename "Document PDF" tab to "Examen PDF"
Simple text change in `ExamPreparation.tsx`.

**File:** `src/pages/ExamPreparation.tsx`
- Change "Document PDF" to "Examen PDF" (line ~293)

### 3. Hide Jude Chatbot + QuickMessage FAB on exam practice pages
The floating Jude chatbot bubble is redundant since Jude is already embedded in the tutor panel. Add the exam practice route pattern to the visibility config.

**File:** `src/shell/config/visibility.ts`
- Add `/^\/exams\/practice\//` to `jude.hideOnPatterns`
- Add `/^\/exams\/practice\//` to `quickMessage.hideOnPatterns`

---

## Technical Details

```tsx
// ExamPreparation.tsx - Progress bar wrapper
// Before:
{exam && exercises.length > 0 && (
  <ExamProgressBar ... />
)}

// After:
<div className="hidden lg:block">
  {exam && exercises.length > 0 && (
    <ExamProgressBar ... />
  )}
</div>
```

```tsx
// ExamPreparation.tsx - Tab label
// Before:
Document PDF

// After:
Examen PDF
```

```ts
// visibility.ts - add to jude.hideOnPatterns:
/^\/exams\/practice\//,

// visibility.ts - add to quickMessage.hideOnPatterns:
/^\/exams\/practice\//,
```

## Safety Checklist

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- CSS visibility + text + config only |
| Works with existing data? | Yes -- no data changes |
| 3G optimized? | Yes -- no new assets |
| Backward compatible? | Yes |
| Mobile UX impact? | Positive -- more screen space, less clutter |
