
# NatCash Automated Payments + Payouts via Bazik Transfer API

## What We're Building

Two new capabilities using Bazik.io's `/natcash/transfers` endpoint:

1. **Payouts (Sending)**: Admin can send money to users' NatCash wallets (rewards, refunds)
2. **Improved Payments (Receiving)**: Users pay via NatCash with auto-verification via webhook instead of manual receipt upload

---

## Phase 1: NatCash Payouts (Admin sends money to users)

### Database: New `natcash_transfers` table

Tracks all outgoing NatCash transfers separately from `payment_transactions` (which is for incoming payments).

```sql
CREATE TABLE public.natcash_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,                    -- recipient user
  initiated_by UUID NOT NULL,               -- admin who initiated
  amount NUMERIC NOT NULL,                  -- delivery amount (what user receives)
  fees NUMERIC DEFAULT 0,                   -- Bazik 5% platform fee
  total NUMERIC DEFAULT 0,                  -- amount + fees (charged to wallet)
  currency TEXT DEFAULT 'HTG',
  wallet TEXT NOT NULL,                     -- recipient NatCash phone (8 digits)
  recipient_first_name TEXT NOT NULL,
  recipient_last_name TEXT NOT NULL,
  recipient_email TEXT,
  description TEXT,
  reference_id TEXT NOT NULL UNIQUE,        -- our internal reference
  bazik_transaction_id TEXT,                -- Bazik's transaction_id
  status TEXT DEFAULT 'pending',            -- pending, completed, failed
  transfer_type TEXT DEFAULT 'payout',      -- payout, refund, reward, prize
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.natcash_transfers ENABLE ROW LEVEL SECURITY;

-- Only founders/admins can view transfers (via content_editor_roles)
CREATE POLICY "Admins can manage transfers"
  ON public.natcash_transfers FOR ALL TO authenticated
  USING (public.is_content_editor(auth.uid(), 'admin'));

-- Users can view their own received transfers
CREATE POLICY "Users can view own transfers"
  ON public.natcash_transfers FOR SELECT TO authenticated
  USING (user_id = auth.uid());
```

### Shared Utility: Update `_shared/bazik.ts`

Add a `createNatCashTransfer()` helper function that:
- Takes an access token + transfer details
- Calls `POST /natcash/transfers`
- Returns the Bazik response (transaction_id, status, fees, total)

This keeps all Bazik API calls centralized in one file.

### New Edge Function: `natcash-create-transfer`

Admin-only endpoint to send money to a user's NatCash wallet.

```text
POST /natcash-create-transfer
Body: {
  userId: UUID,          -- target user
  amount: number,        -- HTG to send
  wallet: string,        -- 8-digit NatCash phone
  firstName: string,
  lastName: string,
  email?: string,
  description?: string,
  transferType: "payout" | "refund" | "reward" | "prize"
}
```

Flow:
1. Verify caller is admin (via `content_editor_roles`)
2. Validate input with Zod
3. Authenticate with Bazik (reuse `getBazikToken`)
4. Call Bazik `/natcash/transfers`
5. Store result in `natcash_transfers` table
6. Return transfer details

### New Edge Function: `natcash-check-transfer`

Check transfer status from Bazik (for polling/refresh).

### Admin UI: Add Payouts Tab to `PaymentsModule.tsx`

Add a "Virements" (Transfers) section with:
- Button to initiate a new transfer (opens dialog)
- Transfer form: user lookup, amount, wallet number, description
- Transfer history list with status badges
- Total sent / fees summary

---

## Phase 2: Improved NatCash Payments (User sends money, auto-verified)

### Updated Edge Function: `natcash-create-order`

Changes:
- Add `natcashPhone` as a required field (user's phone, for auto-matching)
- Store phone in transaction for matching
- Return cleaner USSD instructions (no more "upload receipt" as primary step)

### Updated Webhook: `moncash-webhook` --> handles NatCash too

The existing `moncash-webhook` already verifies Bazik signatures. Extend it to also handle NatCash transfer notifications:
- When Bazik notifies of a completed NatCash transfer, match by amount + phone number
- Auto-update `payment_transactions` status to `completed`
- Auto-extend user subscription (reuse the stacking logic from `moncash-verify-payment`)

### New UI: `NatCashPaymentFlow.tsx`

A streamlined component for NatCash payments (used in Settings subscription renewal):
1. User enters their NatCash phone number
2. System shows USSD instructions with platform's wallet number
3. User performs the transfer via USSD on their Digicel phone
4. Component polls for auto-confirmation (every 5s for 3 min)
5. On success: subscription extended, confetti
6. Fallback: "Pas encore confirme? Televerser votre recu" button (existing flow)

### Settings Page: Add NatCash Tab

In the subscription renewal card, add a tab alongside MonCash:
- "MonCash" tab: existing flow (redirect to MonCash app)
- "NatCash" tab: new inline flow (enter phone, follow USSD steps, auto-confirm)

---

## File Changes Summary

| Action | File | Description |
|--------|------|-------------|
| MIGRATE | Database | New `natcash_transfers` table with RLS policies |
| EDIT | `supabase/functions/_shared/bazik.ts` | Add `createNatCashTransfer()` helper |
| NEW | `supabase/functions/natcash-create-transfer/index.ts` | Admin payout edge function |
| NEW | `supabase/functions/natcash-check-transfer/index.ts` | Transfer status check |
| EDIT | `supabase/functions/natcash-create-order/index.ts` | Require phone, improve instructions |
| EDIT | `supabase/functions/moncash-webhook/index.ts` | Handle NatCash transfer webhooks |
| EDIT | `supabase/functions/natcash-admin-verify/index.ts` | Add subscription extension on approve (bug fix) |
| EDIT | `supabase/config.toml` | Register new edge functions |
| NEW | `src/components/subscription/NatCashPaymentFlow.tsx` | User-facing NatCash payment component |
| EDIT | `src/pages/Settings.tsx` | Add NatCash tab in subscription card |
| EDIT | `src/pages/control-center/modules/PaymentsModule.tsx` | Add Payouts/Transfers section |

---

## Bug Fix Discovered

The `natcash-admin-verify` function approves NatCash payments but **never extends the user's subscription**. The MonCash flow does this in `moncash-verify-payment` (lines 147-188), but the NatCash admin approval path skips it entirely. This will be fixed as part of this work.

---

## Safety Checklist

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- existing manual NatCash flow preserved as fallback |
| Works with existing data? | Yes -- new table, no schema changes to existing tables |
| 3G optimized? | Yes -- polling with backoff, no heavy assets |
| Backward compatible? | Yes -- receipt upload flow still works |
| Edge cases handled? | Duplicate transfers, insufficient balance (402), partial matches |
| Security | Admin-only payouts via content_editor_roles check, rate limiting, Zod validation |
| No new secrets needed? | Correct -- reuses existing Bazik credentials |
