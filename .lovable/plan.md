

# Add Recurring Payment Option for Gift Subscriptions

## Overview
On the public gift payment page (`/gift/pay/:token`), the family member will see two options: **one-time payment** ($2.00) or **monthly subscription** ($2.00/month). The monthly option means the student's subscription auto-renews every 30 days without the family member having to come back.

## Why This Needs a Webhook
For one-time payments, the current flow works: pay once, verify, activate 30 days. But for recurring monthly payments, Stripe charges the family member automatically every month. Since the payer is NOT a user on the platform, we need a Stripe webhook to listen for each monthly payment and extend the student's subscription by another 30 days. There is no other reliable way to detect renewal payments.

## Changes Required

### 1. Create a Stripe Product + Price
- Product: "Abonnement Edupreneurs - Gift Monthly"
- Price: $2.00 USD / month (recurring)
- The price ID will be hardcoded in the edge function

### 2. Database: Add `payment_mode` column to `gift_subscriptions`
- New column: `payment_mode text DEFAULT 'one_time'` (values: `one_time`, `recurring`)
- New column: `stripe_subscription_id text` (to track the Stripe subscription for cancellation/management)
- This lets us know which gifts are recurring so the webhook can process them

### 3. Modify: `stripe-gift-payment` Edge Function
- Accept new parameter: `{ token, mode: "one_time" | "recurring" }`
- If `mode === "one_time"`: current flow (unchanged, uses `price_data`)
- If `mode === "recurring"`: create checkout with `mode: "subscription"` using the recurring price ID
- Save `payment_mode` to the gift record

### 4. Modify: `verify-gift-payment` Edge Function
- For one-time: current flow (unchanged)
- For recurring: retrieve the Stripe session, get the subscription ID, save it to `stripe_subscription_id`, activate 30 days (first month)

### 5. New: `stripe-gift-webhook` Edge Function
- Listens for Stripe `invoice.paid` events (for subscription renewals)
- Looks up the subscription ID in `gift_subscriptions`
- If found and it's a renewal (not the first payment): extend the student's subscription by 30 more days
- Sends the student a notification email for each renewal
- Sends the payer a receipt email for each renewal

### 6. Modify: `GiftPayment.tsx` (Frontend)
- Add a radio group below the price: "Paiement unique" vs "Abonnement mensuel"
- One-time shows: "$2.00 - 30 jours"
- Monthly shows: "$2.00/mois - Renouvellement automatique"
- Pass the selected mode to `createGiftCheckout`

### 7. Modify: `gift.service.ts`
- Update `createGiftCheckout` to accept and pass a `mode` parameter

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/stripe-gift-payment/index.ts` | Modify | Add recurring mode support |
| `supabase/functions/verify-gift-payment/index.ts` | Modify | Handle subscription ID for recurring |
| `supabase/functions/stripe-gift-webhook/index.ts` | Create | Webhook for monthly renewal processing |
| `src/pages/GiftPayment.tsx` | Modify | Add one-time vs monthly radio selector |
| `src/auth/services/gift.service.ts` | Modify | Pass mode parameter |
| Database migration | Create | Add `payment_mode` and `stripe_subscription_id` columns |

## Safety Checklist

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- one-time is default, all existing links work unchanged |
| Backward compatible? | Yes -- `payment_mode` defaults to `one_time` |
| 3G optimized? | Yes -- only adds a radio group to the page |
| Edge cases handled? | Webhook validates signature; duplicate events ignored via idempotency |

