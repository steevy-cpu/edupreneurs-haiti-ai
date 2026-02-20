

# Add Testing Promo Code Hint to Signup Step 3

## What
Add a visible hint below the promo code input field showing the testing code **cscp2026** so users can easily copy and use it during the testing period.

## Change (single file)

**File:** `src/auth/routes/signup/Step3.tsx`

Inside the promo code tab section, add a small hint message below the input/button row with the code displayed in a copyable style:

```
Utilisez le code cscp2026 pour un acces gratuit (periode de test)
```

The code itself will be styled as a clickable element that auto-fills the input field when tapped — saving users from having to type it manually.

## Technical Detail

- Add a small `<p>` or `<button>` element after the input row (around line 175)
- Clicking the code auto-fills the promo input via `handlePromoCodeChange('CSCP2026')`
- Styled with `text-xs text-muted-foreground` to keep it subtle
- The code portion uses a `font-mono bg-muted px-1 rounded cursor-pointer` style so it looks tappable

No new dependencies, no backend changes, no edge function calls.

