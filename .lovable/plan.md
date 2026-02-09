

# Fix Awkward Text Wrapping on Mobile

## Problem

The text "Votre avis compte — cette lecon vous a-t-elle ete utile?" is too long for narrow mobile screens, causing a mid-word break ("a-t-elle" splitting across lines).

## Solution

Shorten the question text to fit better on small screens. Replace:

```
Votre avis compte — cette lecon vous a-t-elle ete utile?
```

With:

```
Cette lecon vous a-t-elle ete utile?
```

The "Votre avis compte" prefix is unnecessary -- the accent border, icon, and card styling already signal importance. Removing it shortens the text enough to prevent wrapping issues on most mobile widths.

## Technical Detail

### File: `src/components/lesson/LessonFeedback.tsx` (line ~133)

```tsx
// From:
<p className="text-sm text-foreground font-medium">
  Votre avis compte — cette lecon vous a-t-elle ete utile?
</p>

// To:
<p className="text-sm text-foreground font-medium">
  Cette lecon vous a-t-elle ete utile?
</p>
```

One line change. No structural or logic changes.

## Safety

| Check | Status |
|-------|--------|
| Breaks functionality? | No |
| Anti-vibe compliant? | Yes |
| 3G impact? | None |
