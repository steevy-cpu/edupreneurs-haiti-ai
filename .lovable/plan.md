

# Fix: Change greeting in donation thank-you email

## What

In `supabase/functions/send-donation-thank-you/index.ts`, the email body currently says `Bonjour <strong>${displayName}</strong>,`. Change it to `Salut <strong>${displayName}</strong>,`.

## Change

**File:** `supabase/functions/send-donation-thank-you/index.ts`  
**Line ~42:** Replace `Bonjour` with `Salut`

```
// Before
Bonjour <strong>${displayName}</strong>,

// After
Salut <strong>${displayName}</strong>,
```

One line, one file. No other changes needed.

