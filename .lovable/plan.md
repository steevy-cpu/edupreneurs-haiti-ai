

# Highlight the Lesson Feedback Section

## Goal

Make the feedback card visually distinct so users don't scroll past it, while staying within anti-vibe standards (no sparkles, no pulses, no emojis -- just a clean, intentional visual accent).

## Approach

### 1. Add a subtle left accent border

Replace the generic `border-border/50` with a left-side accent stripe using `border-l-4 border-l-primary`. This draws the eye without being flashy -- similar to how callout boxes work in documentation.

### 2. Slightly stronger background

Change `bg-card/50` to `bg-primary/5` -- a faint primary tint that differentiates this card from all other lesson content cards. Subtle but noticeable.

### 3. Add a small icon header

Add a `MessageSquare` icon next to the question text to give the section a visual anchor. This signals "feedback" at a glance before reading the text.

### 4. Bolder question text

Change the question from `text-muted-foreground` to `text-foreground` so it reads as a real prompt, not a footnote.

## What This Looks Like

```
|  [MessageSquare icon]  Cette lecon vous a-t-elle ete utile?    [ThumbsUp] [ThumbsDown]
```

The card will have a faint primary-tinted background with a solid primary-colored left border stripe -- clean, professional, impossible to miss.

## Technical Details

### File: `src/components/lesson/LessonFeedback.tsx`

**Card styling** (line 126):
```tsx
// From:
<Card className="border-border/50 bg-card/50">

// To:
<Card className="border-l-4 border-l-primary border-border/30 bg-primary/5">
```

**Question text** (lines 129-131):
```tsx
// From:
<p className="text-sm sm:text-base text-muted-foreground font-medium ...">
  Cette lecon vous a-t-elle ete utile?
</p>

// To:
<div className="flex items-center gap-2">
  <MessageSquare className="h-4 w-4 text-primary shrink-0" />
  <p className="text-sm sm:text-base text-foreground font-medium ...">
    Votre avis compte -- cette lecon vous a-t-elle ete utile?
  </p>
</div>
```

**Import**: Add `MessageSquare` to the lucide-react import.

## Files Changed

| File | Change |
|------|--------|
| `src/components/lesson/LessonFeedback.tsx` | Card accent border + tinted bg, icon + bolder text |

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- CSS and text only |
| Anti-vibe compliant? | Yes -- no sparkles, pulses, emojis, or purple gradients |
| 3G impact? | None |
| Backward compatible? | Yes |

