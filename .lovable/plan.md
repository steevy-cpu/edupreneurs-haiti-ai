

# MonCash Shared Payment Link (Gift-Style for MonCash)

## Summary

Extend the existing "Gift Link" concept (currently Stripe-only) to support MonCash payments. A user generates a temporary, shareable MonCash payment link. A third party (e.g., family member in Haiti) opens it, pays 200 HTG via MonCash, and the student's subscription activates automatically.

## Architecture Decision: Reuse `gift_subscriptions` Table

Rather than creating a new table, we extend `gift_subscriptions` with a `payment_gateway` column. This keeps the data model unified -- a "gift" is the concept (someone pays on behalf of a student), and the gateway (Stripe vs MonCash) is just the payment rail.

This avoids duplicating token generation, expiry logic, status tracking, and activation code across two tables.

## Database Changes

### Migration: Extend `gift_subscriptions`

```sql
-- Add payment gateway discriminator
ALTER TABLE public.gift_subscriptions
ADD COLUMN IF NOT EXISTS payment_gateway text NOT NULL DEFAULT 'stripe';

-- Add MonCash-specific fields
ALTER TABLE public.gift_subscriptions
ADD COLUMN IF NOT EXISTS moncash_order_id text,
ADD COLUMN IF NOT EXISTS amount_htg integer;

-- Index for MonCash order lookups
CREATE INDEX IF NOT EXISTS idx_gift_subs_moncash_order
ON public.gift_subscriptions (moncash_order_id)
WHERE moncash_order_id IS NOT NULL;
```

### Column Purpose

| Column | Purpose |
|---|---|
| `payment_gateway` | `'stripe'` or `'moncash'` -- determines which verification path to use |
| `moncash_order_id` | The Bazik/MonCash order ID for payment tracking |
| `amount_htg` | Amount in HTG (200) -- separate from `amount_cents` which is USD cents for Stripe |

No RLS changes needed -- existing anon INSERT and the `get_gift_info_by_token` SECURITY DEFINER function already cover the access patterns.

## Lifecycle Flow

```text
1. GENERATE
   Student (during signup or from settings) clicks "Lien MonCash"
   -> Client generates token, inserts into gift_subscriptions
      with payment_gateway='moncash', expires_at=NOW()+15min, amount_htg=200
   -> Returns shareable URL: /gift/moncash/:token

2. OPEN LINK
   Third party opens /gift/moncash/:token
   -> Page calls get_gift_info_by_token RPC to show student name + status
   -> If expired or completed, show appropriate message
   -> If valid, show "Payer 200 HTG via MonCash" button

3. INITIATE PAYMENT
   Third party clicks pay
   -> Client calls new edge function: moncash-gift-payment
   -> Function validates token, checks expiry, creates Bazik payment
   -> Saves moncash_order_id to gift record
   -> Returns MonCash redirect URL
   -> Third party completes payment on MonCash

4. RETURN & VERIFY
   MonCash redirects to /gift/moncash/callback?orderId=X&token=T
   -> Callback page calls new edge function: verify-moncash-gift
   -> Function verifies payment via Bazik API
   -> On success: activates subscription (same stacking logic as verify-gift-payment)
   -> Sends emails
   -> Returns success

5. EXPIRY
   If 15 minutes pass without payment:
   -> get_gift_info_by_token returns expired status
   -> UI shows "Lien expiré" with option for student to regenerate
```

## New Files

### 1. Edge Function: `supabase/functions/moncash-gift-payment/index.ts`

**Purpose**: Public endpoint (no auth). Accepts a gift token, creates a MonCash payment via Bazik, saves the order ID.

Key behavior:
- Validate token exists, is not expired, is not completed, has `payment_gateway='moncash'`
- Rate limit by IP (reuse existing `checkRateLimit`)
- Call `getBazikToken()` + create payment via Bazik API (reuse shared `bazik.ts`)
- Set `returnUrl` to `/gift/moncash/callback?orderId=X&token=T`
- Save `moncash_order_id` to the gift record
- Return `{ redirectUrl }` to client

### 2. Edge Function: `supabase/functions/verify-moncash-gift/index.ts`

**Purpose**: Public endpoint. Called after MonCash redirect. Verifies payment and activates subscription.

Key behavior:
- Accept `{ token, orderId }`
- Look up gift by token, verify `payment_gateway='moncash'`
- Verify payment via Bazik API (reuse `verifyViaBazik` pattern from `moncash-verify-payment`)
- If completed:
  - Update gift status to `'completed'`, set `completed_at`
  - Resolve `student_user_id` (same logic as `verify-gift-payment`)
  - Activate/extend subscription (same 30-day stacking logic)
  - Create notification
  - Send emails (student activation + payer receipt via shared `emails.ts`)
- If pending: return `{ success: false, status: 'pending' }` so UI can poll
- If failed: return error

### 3. Frontend Service: `src/auth/services/gift-moncash.service.ts`

Three functions mirroring the Stripe gift service:

```typescript
// Generate a MonCash gift link (15-min expiry)
export async function generateMonCashGiftLink(
  studentName: string, studentEmail: string
): Promise<{ success: boolean; token?: string; giftUrl?: string; error?: string }>

// Initiate MonCash payment for a gift token
export async function createMonCashGiftPayment(
  token: string
): Promise<{ success: boolean; redirectUrl?: string; error?: string }>

// Verify MonCash gift payment after redirect
export async function verifyMonCashGiftPayment(
  token: string, orderId: string
): Promise<{ success: boolean; studentName?: string; error?: string }>
```

### 4. Page: `src/pages/GiftMonCashPayment.tsx` (route: `/gift/moncash/:token`)

Public page for the third party. Shows:
- Student name and amount (200 HTG)
- "Payer via MonCash" button
- Handles expired/completed/error states
- Redirects to MonCash on click

### 5. Page: `src/pages/GiftMonCashCallback.tsx` (route: `/gift/moncash/callback`)

Callback after MonCash redirect. Reads `orderId` and `token` from URL params. Calls `verifyMonCashGiftPayment`. Shows success/pending/error states.

### 6. UI Tab: Update `GiftLinkTab.tsx`

Add a second option alongside the existing Stripe gift link:
- "Lien Famille (Carte)" -- existing Stripe flow, 7-day expiry
- "Lien Famille (MonCash)" -- new MonCash flow, 15-min expiry

The MonCash variant calls `generateMonCashGiftLink` instead of `generateGiftLink`.

### 7. Route Registration

Add two new routes in the router config:
- `/gift/moncash/:token` -> `GiftMonCashPayment`
- `/gift/moncash/callback` -> `GiftMonCashCallback`

## Email Flow

### On Payment Success (in `verify-moncash-gift`)

| Email | Recipient | Template |
|---|---|---|
| Subscription activation | Student (`student_email`) | Reuse `buildGiftStudentEmail` with payer name from MonCash data |
| Payment receipt | Student email (MonCash has no payer email) | Reuse `buildSubscriptionInvoiceEmail` with "200 HTG" and "MonCash" method |

Note: Unlike Stripe, MonCash does not capture the payer's email. So we only send emails to the student. If the student wants the payer notified, they can share the success verbally/via WhatsApp.

### On Link Generation (optional enhancement)

No email on link creation -- the student copies and shares the link manually via WhatsApp/SMS, which is the natural channel in Haiti.

## Security Considerations

| Concern | Mitigation |
|---|---|
| Link reuse after payment | Gift record status checked before payment creation; `completed` status blocks repeat use |
| Wrong account activation | Token uniquely maps to `student_email`; `student_user_id` resolved from auth.users by email match |
| Expired link abuse | `expires_at` checked both client-side (RPC) and server-side (edge function) before creating payment |
| Brute-force token guessing | 32-char hex token = 128 bits of entropy; rate limiting by IP on payment creation |
| Race condition (double payment) | Edge function checks gift status before creating Bazik payment; Bazik order ID saved atomically |
| Link sharing interception | MonCash redirect URL contains Bazik's own session -- interceptor would need to complete payment (which is the desired action) |

## Expiration Strategy

- **MonCash gift links**: 15 minutes (MonCash payments are real-time, no reason for long windows)
- **Stripe gift links**: Keep existing 7 days (Stripe checkout sessions are long-lived)
- **Regeneration**: Student can regenerate from the same UI; old expired tokens remain in DB with `expired` status (no cleanup needed)

## Config Changes

### `supabase/config.toml`

Add `verify_jwt = false` for both new functions:

```toml
[functions.moncash-gift-payment]
verify_jwt = false

[functions.verify-moncash-gift]
verify_jwt = false
```

## Files Summary

| File | Action | Description |
|---|---|---|
| `supabase/migrations/...` | Create | Add `payment_gateway`, `moncash_order_id`, `amount_htg` columns |
| `supabase/functions/moncash-gift-payment/index.ts` | Create | Public endpoint to create MonCash payment for a gift token |
| `supabase/functions/verify-moncash-gift/index.ts` | Create | Public endpoint to verify MonCash payment and activate subscription |
| `src/auth/services/gift-moncash.service.ts` | Create | Frontend service for MonCash gift flow |
| `src/pages/GiftMonCashPayment.tsx` | Create | Public payment page for third party |
| `src/pages/GiftMonCashCallback.tsx` | Create | Callback page after MonCash redirect |
| `src/auth/routes/signup/GiftLinkTab.tsx` | Edit | Add MonCash option alongside Stripe |
| Router config | Edit | Add two new routes |
| `supabase/functions/_shared/emails.ts` | No change | Reuse existing templates |
| `supabase/functions/_shared/bazik.ts` | No change | Reuse existing Bazik utilities |

## Safety Verification

| Check | Result |
|---|---|
| Breaks existing Stripe gift flow? | No -- new column defaults to `'stripe'`; existing code untouched |
| Works with existing gift_subscriptions data? | Yes -- default value on new column handles existing rows |
| 3G optimized? | Yes -- single RPC call to load page; single edge function call per action |
| Backward compatible? | Yes -- all new code paths; existing paths unchanged |
| Security? | Token entropy + expiry + status checks + rate limiting |
| Long-term maintainability? | Unified table avoids drift; shared Bazik/email utilities prevent duplication |

