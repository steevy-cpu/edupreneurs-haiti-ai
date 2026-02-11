

# Fix: "Payer avec MonCash" Button Should Not Depend on Privacy Checkbox

## Problem
The "Payer avec MonCash" button is currently disabled until the user checks the privacy policy checkbox. This is confusing because the user might want to pay first and then accept the policy before clicking "Creer mon compte."

## Solution
Remove `!privacy` from the MonCash button's `disabled` condition. Only the "Creer mon compte" submit button should be gated by the privacy checkbox.

## Change

**File: `src/auth/routes/signup/Step3.tsx`** (line 249)

Change:
```tsx
disabled={isCreatingPayment || !privacy}
```
To:
```tsx
disabled={isCreatingPayment}
```

This restores the original behavior where the MonCash pay button is always clickable (unless a payment is already in progress), and the privacy checkbox only gates the final "Creer mon compte" button.

