
# Structured Email System for All Payment Flows

## The Problem

Currently, email sending is scattered and inconsistent:

| Payment flow | User confirmation email | Invoice/receipt email | Emails sent |
|---|---|---|---|
| Gift (Stripe one-time) | Student activation | Payer invoice + thank-you | 3 emails |
| Gift (Stripe recurring) | Student renewal | Payer renewal receipt | 2 emails |
| MonCash subscription renewal | NONE | NONE | 0 emails |
| MonCash webhook (auto-verify) | NONE | NONE | 0 emails |
| NatCash admin verify | NONE | NONE | 0 emails |
| Donations (MonCash/Stripe) | Thank-you email | -- | 1 email |

The person renewing via MonCash or NatCash gets zero confirmation. No receipt, no "your subscription is extended" email. And the email code that does exist is duplicated across 4 edge functions with inline HTML templates, making it fragile.

## The Solution: Shared Email Module + Fix All Gaps

### Phase 1: Create shared email utility

**New file: `supabase/functions/_shared/emails.ts`**

A single shared module that all payment functions import. Contains:

- `sendEmail(to, subject, html)` -- the actual Resend API call (currently duplicated in 4 files)
- `buildSubscriptionConfirmationEmail(studentName, endDate, paymentMethod)` -- for the user who just got their subscription extended
- `buildSubscriptionInvoiceEmail(name, amount, currency, orderId, date, paymentMethod)` -- receipt/invoice for the payer
- `buildSubscriptionThankYouEmail(payerName, studentName)` -- thank-you for gift payers (reused from verify-gift-payment)
- `buildRenewalStudentEmail(studentName, endDate)` -- reused from stripe-gift-webhook
- `buildRenewalPayerEmail(payerEmail, studentName, amount, date)` -- reused from stripe-gift-webhook

This eliminates all inline email templates from individual functions.

### Phase 2: Add emails to MonCash verify-payment

**File: `supabase/functions/moncash-verify-payment/index.ts`**

After the subscription extension succeeds (line 182), add:

1. Fetch the user's email and name from their profile
2. Send a "Subscription confirmed" email with the new end date
3. Send an invoice/receipt email with the 200 HTG amount and order ID

### Phase 3: Add emails to MonCash webhook

**File: `supabase/functions/moncash-webhook/index.ts`**

After the subscription extension succeeds (line 348), add:

1. Fetch the user's email and name from their profile
2. Send a "Subscription confirmed" email
3. Send an invoice/receipt email

### Phase 4: Add emails to NatCash admin verify

**File: `supabase/functions/natcash-admin-verify/index.ts`**

After subscription extension on approval, add the same two emails.

### Phase 5: Deduplicate existing email code

Refactor these files to import from `_shared/emails.ts` instead of defining their own templates:

- `stripe-gift-webhook/index.ts` -- remove `sendEmail()` and `buildRenewalStudentEmail()` / `buildRenewalPayerEmail()`
- `verify-gift-payment/index.ts` -- remove `sendEmail()` and all 3 `build*Email()` functions

---

## Email Templates

### Subscription Confirmation (for the user)

Used when a user's own subscription is activated/renewed via MonCash or NatCash.

Content:
- Header: "Abonnement activé!" (or "renouvelé!")
- Body: "Votre abonnement de 30 jours est actif."
- Card showing: expiry date
- CTA: "Continuer a apprendre"
- Payment method badge (MonCash or NatCash)

### Payment Invoice/Receipt (for the payer)

Used for MonCash/NatCash self-payments (the user IS the payer).

Content:
- Header: "Recu de paiement"
- Body: Amount, date, order ID, payment method
- Note: "Conservez ce recu pour vos archives"

---

## Files Changed Summary

| File | Change | Risk |
|---|---|---|
| `_shared/emails.ts` (NEW) | Shared email utility + templates | None -- new file |
| `moncash-verify-payment/index.ts` | Add 2 emails after subscription extension | Low -- additive |
| `moncash-webhook/index.ts` | Add 2 emails after subscription extension | Low -- additive |
| `natcash-admin-verify/index.ts` | Add 2 emails after approval | Low -- additive |
| `stripe-gift-webhook/index.ts` | Import from shared instead of inline | Low -- same behavior |
| `verify-gift-payment/index.ts` | Import from shared instead of inline | Low -- same behavior |

## Safety Verification

| Check | Result |
|---|---|
| Breaks existing functionality? | No -- only adding emails where none existed, and deduplicating existing ones |
| Works with existing data? | Yes -- reads existing profile fields (email, full_name) |
| 3G optimized? | Yes -- emails are server-side; no client impact |
| Edge cases? | Missing email addresses handled with early return; Resend failures are non-blocking |
| Backward compatible? | Yes -- gift payment emails remain identical, just sourced from shared module |
| Idempotent? | Yes -- duplicate webhook calls already prevented by status checks; emails are fire-and-forget |
