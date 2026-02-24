

# Dons and Paiements Critical Fixes -- Plan A

## Overview

Three surgical fixes addressing: (1) broken RLS on payment_transactions, (2) reliable Stripe donation completion via webhook, and (3) a new secret for webhook signature verification. No architecture changes.

## Pre-requisite: New Secret

A new secret `STRIPE_WEBHOOK_SECRET_DONATION` is needed for the webhook signature verification. You will need to:
1. Go to your Stripe Dashboard > Developers > Webhooks
2. Create a new webhook endpoint pointing to your edge function URL
3. Copy the signing secret and add it when prompted

## Fix 1 -- Add founder RLS policies to payment_transactions

**Migration SQL:**

```text
-- Founders can view ALL payment transactions (fixes empty Paiements tab)
CREATE POLICY "Founders can view all payment transactions"
  ON payment_transactions FOR SELECT
  USING (public.is_founder());

-- Founders can update ALL payment transactions (verify/approve/reject)
CREATE POLICY "Founders can update all payment transactions"
  ON payment_transactions FOR UPDATE
  USING (public.is_founder())
  WITH CHECK (public.is_founder());
```

This automatically fixes:
- The Paiements tab showing empty for founders
- The badge count query in `modules.ts` (lines 35-39) -- it already uses the authenticated Supabase client, so the new RLS policy will allow it to see all rows

**No code changes needed for Fix 1** -- the existing queries work correctly once RLS permits access.

## Fix 2 -- Create stripe-donation-webhook edge function

**New file:** `supabase/functions/stripe-donation-webhook/index.ts`

Follows the existing pattern from `supabase/functions/stripe-gift-webhook/index.ts`:
- Receives raw body + `stripe-signature` header
- Verifies signature using `STRIPE_WEBHOOK_SECRET_DONATION`
- Handles `checkout.session.completed` events only
- Extracts `order_id` from `session.metadata`
- Updates `donations` table: `SET status = 'completed' WHERE order_id = order_id AND status = 'pending'`
- Sends thank-you email via `send-donation-thank-you` edge function (same logic as the callback page)
- Returns 200 on success, 400 on signature failure

The existing `stripe-create-donation/index.ts` already passes `order_id` in session metadata (line 118), so no changes needed there.

**Config entry added to `supabase/config.toml`:**

```text
[functions.stripe-donation-webhook]
verify_jwt = false
```

## Fix 3 -- Update DonationSuccessCallback for idempotency

Since the webhook may complete before the user hits the callback page, the callback's status update (`pending` -> `completed`) could silently fail. The callback at `src/components/donate/DonationSuccessCallback.tsx` (line 57) already scopes the update to `.eq("status", "pending")`, so if the webhook already set it to `completed`, the update affects 0 rows but does not error. The callback will then read the donation row, see it is `completed`, and show success. No code change needed -- the existing logic is already idempotent.

## Files Modified

| File | Change |
|------|--------|
| Database migration | Add 2 RLS policies on `payment_transactions` |
| `supabase/functions/stripe-donation-webhook/index.ts` | New webhook edge function |
| `supabase/config.toml` | Add `stripe-donation-webhook` entry (auto-managed) |

## Files NOT Modified

- `src/pages/control-center/modules.ts` -- badge query works once RLS is fixed
- `supabase/functions/stripe-create-donation/index.ts` -- metadata already includes `order_id`
- `src/components/donate/DonationSuccessCallback.tsx` -- already idempotent
- No changes to Matieres, grade selection, or lesson pages

## Secret Required

`STRIPE_WEBHOOK_SECRET_DONATION` -- the signing secret from Stripe's webhook endpoint configuration. You will be prompted to add this before the webhook is deployed.

## Safety Verification

| Check | Status |
|-------|--------|
| Existing functionality affected? | No -- additive RLS policies, new function only |
| Bundle size impact? | None -- server-side only |
| RLS security | Founder-only access, consistent with all other admin tables |
| Idempotency | Webhook + callback are both safe to fire for same donation |
| 3G performance | No client-side impact |
| Backward compatibility | Yes -- existing donations unaffected |

