

# Fix: Secret Name Mismatch

## Problem
The edge function looks for `MONCASH_CLIENT_SECRET` but your secret is stored as `MONCASH_SECRET_KEY`. This causes every payment attempt to fail with "Service de paiement non configure".

## Fix

### File: `supabase/functions/moncash-create-payment/index.ts`

Change line 126 from:
```
const secretKey = Deno.env.get('MONCASH_CLIENT_SECRET');
```
to:
```
const secretKey = Deno.env.get('MONCASH_SECRET_KEY');
```

### File: `supabase/functions/moncash-verify-payment/index.ts`

Same fix on line 120 -- change `MONCASH_CLIENT_SECRET` to `MONCASH_SECRET_KEY` for consistency.

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- fixes it |
| Works with existing data? | Yes |
| 3G optimized? | N/A -- backend only |
| Backward compatible? | Yes |

