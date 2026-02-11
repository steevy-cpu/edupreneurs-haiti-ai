

# Fix: Collapsible Objectif -- Plain Text Excerpt Approach

## Root Cause
The objectif field contains richly styled HTML (padded containers, colored borders, headings, ordered lists). Using `max-height` + `overflow-hidden` on this content clips the styled box awkwardly, leaving visible padding, backgrounds, and borders -- making it look broken even when "truncated."

## Solution
When collapsed, extract and display a **plain text preview** (first ~120 characters) instead of rendering the full styled HTML. When expanded, show the full rich HTML as before.

This completely avoids the clipping problem because plain text has no padding, borders, or backgrounds to clip through.

## Changes

**File: `src/components/LessonPageTemplate.tsx`**

1. Add a helper function to strip HTML tags and extract plain text:
```typescript
const stripHtmlToText = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').trim();
};
```

2. In both mobile and desktop objectif sections, replace the current truncation logic:

**When collapsed** (`!isObjectifExpanded`): render a single line of plain text (first ~120 chars + "...")
**When expanded** (`isObjectifExpanded`): render the full sanitized HTML or MathContent as before

```tsx
<div className="relative">
  {isObjectifExpanded ? (
    // Full rich content when expanded
    isMathSubject(subjectName) ? (
      <MathContent content={lesson.objectif} className="text-muted-foreground text-sm sm:text-base" />
    ) : (
      <div 
        className="text-muted-foreground lesson-content text-sm sm:text-base"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.objectif) }}
      />
    )
  ) : (
    // Plain text preview when collapsed
    <p className="text-muted-foreground text-sm sm:text-base line-clamp-2">
      {stripHtmlToText(lesson.objectif).slice(0, 150)}...
    </p>
  )}
</div>
```

3. Remove the gradient overlay div -- no longer needed since plain text truncates cleanly.

This applies to both the mobile (around line 258) and desktop (around line 319) objectif sections.

## Result
- **Collapsed**: Clean single/two-line text preview, no clipped styled boxes
- **Expanded**: Full rich HTML with all styling intact
- **Toggle**: "Lire plus..." / "Lire moins" button works the same

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing? | No -- same data, just different render mode when collapsed |
| 3G optimized? | Yes -- less HTML rendered when collapsed |
| Works with all content types? | Yes -- plain text extraction works on any HTML |
| Math subjects? | Yes -- handled with conditional rendering |
| Backward compatible? | Yes -- lessons without objectif still work |
