

# Subscription Renewal: Add Stripe + Shareable MonCash Link

## Problem

Currently, the Settings subscription card only offers **MonCash** and **NatCash** for renewal. Two gaps:

1. **No Stripe option** -- users with access to international cards (or diaspora family) cannot renew via card.
2. **No shareable link for renewal** -- the existing "Lien Famille" concept (gift links) only exists during signup. An authenticated user who wants someone else to renew for them has no way to generate a payment link.

## Design Principle: Structural Reuse

The gift link system (`gift_subscriptions` table) already handles "someone pays on behalf of a student" with full support for both Stripe and MonCash gateways. Rather than building a parallel renewal system, we **reuse the same infrastructure** for renewal links.

The key insight: a renewal gift link is identical to a signup gift link, except:
- The `student_user_id` is already known (the authenticated user)
- The `student_email` comes from the session, not a form
- The student already has an account, so activation extends rather than creates

The existing edge functions (`stripe-gift-payment`, `verify-gift-payment`, `moncash-gift-payment`, `verify-moncash-gift`) already handle the `student_user_id` resolution and subscription stacking. No changes needed there.

## Architecture

```text
Settings Subscription Card
  |
  +-- Tab: MonCash (direct pay) ......... existing, no change
  +-- Tab: NatCash (direct pay) ......... existing, no change
  +-- Tab: Stripe (direct pay) .......... NEW - self-pay via card
  +-- Section: "Lien Famille" ........... NEW - generate shareable link
        +-- MonCash link (200 HTG, 15min)
        +-- Stripe link ($2 USD, 7 days)
```

## Implementation

### 1. New Component: `src/components/subscription/RenewalGiftLink.tsx`

A self-contained component for authenticated users to generate a shareable renewal link. Structurally mirrors `GiftLinkTab.tsx` but:
- Uses the authenticated user's name/email from the session profile
- Sets `student_user_id` on the gift record immediately (since the user exists)
- Offers both MonCash and Stripe link options
- Includes copy-to-clipboard with WhatsApp/SMS sharing hint

This component calls the existing `generateGiftLink()` and `generateMonCashGiftLink()` services, but with a small enhancement: we pass `studentUserId` so the gift record is pre-linked.

### 2. Update Services: Add `studentUserId` Parameter

**`src/auth/services/gift.service.ts`**: Add optional `studentUserId` parameter to `generateGiftLink()`. When provided, insert it into `student_user_id` field instead of `null`.

**`src/auth/services/gift-moncash.service.ts`**: Same change to `generateMonCashGiftLink()`.

This is backward-compatible -- signup flow continues passing `null` (user doesn't exist yet).

### 3. New Edge Function: `supabase/functions/create-stripe-renewal/index.ts`

For direct Stripe self-pay (authenticated user pays for themselves). This is distinct from the gift flow because:
- It requires authentication (the user is paying for their own account)
- It creates a Stripe Checkout session with `mode: "payment"` for a one-time $2 charge
- On success, the callback verifies payment and extends the subscription

Key behavior:
- Authenticate user via Authorization header
- Check for existing Stripe customer by email
- Create Checkout session with success_url = `/payment/stripe-renewal-callback?session_id={CHECKOUT_SESSION_ID}`
- Return `{ url }` for redirect

### 4. New Edge Function: `supabase/functions/verify-stripe-renewal/index.ts`

Called from the callback page after Stripe redirects back:
- Accept `{ sessionId }` 
- Verify payment status via `stripe.checkout.sessions.retrieve()`
- If paid: extend subscription by 30 days (same stacking logic as MonCash verify)
- Record in `payment_transactions` table
- Send confirmation + invoice emails via shared `emails.ts`
- Return `{ success, subscriptionEnd }`

### 5. New Page: `src/pages/StripeRenewalCallback.tsx`

Route: `/payment/stripe-renewal-callback`

Simple callback page that:
- Reads `session_id` from URL params
- Calls `verify-stripe-renewal` edge function
- Shows success/error state
- Auto-redirects to dashboard after 3 seconds on success

### 6. Update Settings Subscription Card

Transform the payment method tabs from 2 options to 3:

```text
[ MonCash ] [ NatCash ] [ Carte ]
```

Add the Stripe tab content: a single "Renouveler avec Carte -- $2 USD" button that calls `create-stripe-renewal` and redirects to Stripe Checkout.

Below the payment tabs (in both active and expired states), add a collapsible "Lien Famille" section using the new `RenewalGiftLink` component.

### 7. Update `SubscriptionGate.tsx` Renewal Prompt

The `RenewalPrompt` component (shown when subscription is expired) currently only has a single button pointing to Settings. Enhance it to show all 3 payment options inline, plus the shareable link option. This gives expired users immediate access to renewal without navigating to Settings.

### 8. Route Registration

Add to `App.tsx`:
- `/payment/stripe-renewal-callback` -> `StripeRenewalCallback` (lazy loaded)

### 9. Config Update

Add to `supabase/config.toml`:
```toml
[functions.create-stripe-renewal]
verify_jwt = false

[functions.verify-stripe-renewal]
verify_jwt = false
```

(JWT verified manually in code for `create-stripe-renewal`; `verify-stripe-renewal` uses session ID validation.)

## Files Summary

| File | Action | Description |
|---|---|---|
| `src/components/subscription/RenewalGiftLink.tsx` | Create | Shareable gift link generator for authenticated users |
| `src/components/subscription/StripeRenewalButton.tsx` | Create | Stripe self-pay button component |
| `supabase/functions/create-stripe-renewal/index.ts` | Create | Authenticated Stripe Checkout for self-renewal |
| `supabase/functions/verify-stripe-renewal/index.ts` | Create | Verify Stripe payment and extend subscription |
| `src/pages/StripeRenewalCallback.tsx` | Create | Callback page after Stripe redirect |
| `src/auth/services/gift.service.ts` | Edit | Add optional `studentUserId` param |
| `src/auth/services/gift-moncash.service.ts` | Edit | Add optional `studentUserId` param |
| `src/pages/Settings.tsx` | Edit | Add Stripe tab + RenewalGiftLink section |
| `src/components/SubscriptionGate.tsx` | Edit | Enhance RenewalPrompt with all payment options |
| `src/App.tsx` | Edit | Add Stripe callback route |
| `supabase/config.toml` | Edit | Add new function configs |

## What Does NOT Change

- Existing MonCash renewal flow (Settings direct pay)
- Existing NatCash renewal flow
- Existing gift link pages (`/gift/pay/:token`, `/gift/moncash/:token`)
- Existing gift edge functions (they already handle the activation correctly)
- Existing signup flow
- Database schema (no migration needed -- `gift_subscriptions` already has all required columns)

## Safety Verification

| Check | Result |
|---|---|
| Breaks existing MonCash/NatCash renewal? | No -- existing tabs preserved, just adding a third |
| Breaks existing gift link signup flow? | No -- `studentUserId` param is optional with default `null` |
| Works with existing data? | Yes -- no schema changes |
| 3G optimized? | Yes -- Stripe redirect is external; gift link generation is a single DB insert |
| Backward compatible? | Yes -- all additive changes |
| Edge cases: double payment? | Stripe session is one-use; gift tokens check status before payment creation |
| Security: auth on self-pay? | Yes -- `create-stripe-renewal` validates JWT; gift links are public by design |

