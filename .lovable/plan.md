
# Improve ActionRow Mobile Layout

## Problem
The action buttons (Precedent, Indice, Voir la reponse, Question suivante) use `flex-wrap` with `min-w-[100px]`, causing an awkward 2-row layout on mobile where buttons wrap unevenly -- "Precedent" and "Indice" on row 1, "Voir la reponse" and "Question suivante" on row 2, with inconsistent sizing.

## Solution
Restructure into a clean 2-row grid layout on mobile:
- **Row 1**: Previous + Indice (navigation + help)
- **Row 2**: Voir la reponse + Question suivante (action buttons, full width)

On desktop, keep everything in a single row.

## Technical Details

**File:** `src/features/exams/practice/components/ActionRow.tsx`

Replace the current `flex flex-wrap` container with a grid-based layout:

```tsx
<div className="p-3 border-t bg-muted/30 space-y-2">
  {/* Row 1: Previous + Hint */}
  <div className="flex gap-2">
    {onPrevious && (
      <Button variant="ghost" size="sm" onClick={onPrevious}
        disabled={!canGoPrevious || isLoading} className="flex-shrink-0">
        <ChevronLeft className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Precedent</span>
      </Button>
    )}
    <Button variant="outline" size="sm" onClick={onHint}
      disabled={hintDisabled} className="flex-1">
      ...Indice...
    </Button>
  </div>

  {/* Row 2: Reveal + Next (always full width, equal split) */}
  <div className="grid grid-cols-2 gap-2">
    <Button variant="secondary" size="sm" ...>
      Voir la reponse
    </Button>
    <Button size="sm" ...>
      Question suivante
    </Button>
  </div>
</div>
```

Key changes:
- Use `space-y-2` for consistent vertical spacing between rows
- Row 1: `flex` with Previous as shrink-0 and Indice as flex-1
- Row 2: `grid grid-cols-2` so both buttons are always equal width
- Hide "Precedent" text on very small screens (icon only) with `hidden sm:inline`
- Remove `min-w-[100px]` constraints that caused uneven wrapping

## Safety Checklist

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- same buttons, same handlers |
| Works with existing data? | Yes -- no data changes |
| 3G optimized? | Yes -- no new assets |
| Backward compatible? | Yes |
| Mobile UX impact? | Positive -- clean, predictable layout |
