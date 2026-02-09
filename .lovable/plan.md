

# Lesson Feedback UI -- Anti-Vibe Compliance Polish

## Current State

The `LessonFeedback` component is already built and functional. The structure is clean: a Card with two thumb buttons, a Dialog for comments on thumbs-down. However, there are a few anti-vibe violations to fix.

## Changes Required

### 1. Remove Emojis from Toast Messages

Current:
- `"Merci pour votre retour! 🎉"` (line 81)
- `"Merci pour vos commentaires! On va s'améliorer 💪"` (line 111)

Replace with clean, professional text:
- `"Merci pour votre retour."`
- `"Merci pour vos commentaires."`

### 2. Add `ease-out` to Transitions

Current buttons use `transition-all` without a timing curve. Per anti-vibe standards, all transitions should include `ease-out`.

Change: `"gap-2 transition-all"` to `"gap-2 transition-all ease-out"`

### 3. Subtle Hover States

The green/destructive button active states are fine (functional color coding), but the outline buttons should have a controlled hover lift. Add `hover:scale-[1.02]` to the thumb buttons for a subtle, non-flashy interaction feel.

## File Changes

| File | Change |
|------|--------|
| `src/components/lesson/LessonFeedback.tsx` | Remove emojis from toasts, add `ease-out` to transitions, add subtle `hover:scale-[1.02]` to buttons |

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- purely visual tweaks |
| Logical errors? | None -- text and CSS class changes only |
| 3G impact? | None |
| Backward compatible? | Yes |

