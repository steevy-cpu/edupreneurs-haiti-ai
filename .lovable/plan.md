
# Mobile-Responsive DonationCard Fix

## Problem (from screenshot)
- Input placeholder text is truncated on mobile ("min 50 H1", "recevoir un rem", "encouragement (c")
- The card padding and spacing are too generous for small screens
- Inputs and preset buttons are oversized for mobile viewports

## Changes

### File: `src/components/donate/DonationCard.tsx`

1. **Reduce card padding on mobile**: Change `p-6 sm:p-8` to `p-4 sm:p-8` for tighter mobile fit

2. **Shorten placeholder text on mobile-friendly lengths**:
   - "Montant personnalise (min 50 HTG)" -> "Montant (min 50 HTG)" / "Amount (min $1)"
   - "Votre email (pour recevoir un remerciement)" -> "Votre email (optionnel)"
   - "Un message d'encouragement (optionnel)" -> "Message (optionnel)"

3. **Reduce spacing between form groups**: Change `space-y-6` to `space-y-4 sm:space-y-6` inside the shared content div

4. **Smaller preset buttons on mobile**: Change `py-3` to `py-2 sm:py-3` and `text-sm` to `text-xs sm:text-sm`

5. **Reduce gap in optional fields**: Change `space-y-3` to `space-y-2 sm:space-y-3`

6. **Smaller donate button on mobile**: Change `py-6 text-base` to `py-4 sm:py-6 text-sm sm:text-base`

## Safety Checklist

| Check | Result |
|-------|--------|
| Breaks existing functionality? | No -- spacing/text only |
| 3G optimized? | Yes -- no new assets |
| Backward compatible? | Yes -- desktop unchanged |
| Edge cases? | Shorter placeholders still convey meaning |
