

# Fix: Switch stripe-donation-webhook to STRIPE_WEBHOOK_SECRET_DONATION

## Change

**File:** `supabase/functions/stripe-donation-webhook/index.ts`

Two edits:

1. **Line 10 (comment):** Change `STRIPE_WEBHOOK_SECRET_GIFT` back to `STRIPE_WEBHOOK_SECRET_DONATION`
2. **Line 30 (code):** Change `Deno.env.get("STRIPE_WEBHOOK_SECRET_GIFT")` to `Deno.env.get("STRIPE_WEBHOOK_SECRET_DONATION")`

No other files touched.

## Safety Verification

| Check | Status |
|-------|--------|
| Gift webhook affected? | No -- stays on STRIPE_WEBHOOK_SECRET_GIFT |
| Existing donations affected? | No -- webhook was not yet live |
| Bundle size | No change -- server-side only |

