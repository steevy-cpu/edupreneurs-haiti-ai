

# Fix: Collapsible Objectif Section

## Problem
`line-clamp-2` doesn't work on the objectif content because the HTML contains block-level elements (paragraphs, list items, headings). CSS line-clamp only works on a single text block -- it cannot clamp across multiple `<p>` or `<li>` elements.

## Solution
Replace `line-clamp-2` with a `max-height` + `overflow-hidden` approach. When collapsed, limit the container to roughly 2 lines of text height (~3.5rem) with a gradient fade-out overlay to indicate more content. When expanded, remove the height limit.

## Changes

**File: `src/components/LessonPageTemplate.tsx`**

In both the mobile and desktop objectif sections (lines 258-264 and 315-321):

- Remove `line-clamp-2` class
- When collapsed: apply `max-h-[3.5em] overflow-hidden` to hard-limit visible height
- Add a gradient overlay div (fades to background) at the bottom when collapsed, signaling truncation
- When expanded: no height restriction

### Before
```tsx
<div className={cn("text-muted-foreground ...", !isObjectifExpanded && "line-clamp-2")}
  dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.objectif) }}
/>
```

### After
```tsx
<div className="relative">
  <div className={cn("text-muted-foreground ...", !isObjectifExpanded && "max-h-[3.5em] overflow-hidden")}
    dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.objectif) }}
  />
  {!isObjectifExpanded && (
    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
  )}
</div>
```

This applies to 4 locations: mobile math, mobile non-math, desktop math, desktop non-math.

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- same toggle logic, just different CSS approach |
| Works with HTML block elements? | Yes -- max-height works regardless of child element types |
| 3G optimized? | Yes -- no extra downloads, pure CSS |
| Backward compatible? | Yes -- same expand/collapse behavior |
