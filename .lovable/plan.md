
# Gift Subscription Email Flow

## Overview
Add 3 emails triggered when a gift payment is verified successfully:

1. **Student notification email** -- "Your account has been activated by a family member!"
2. **Payer invoice/receipt email** -- Payment confirmation with amount and reference
3. **Payer thank-you email** -- "Thank you for supporting a student on Edupreneurs"

## How It Works

All 3 emails are sent from the existing `verify-gift-payment` edge function, right after the subscription is activated. No new edge functions needed -- we add email sending directly in the verification flow using the Resend API (already available via `RESEND_API_KEY`).

## Implementation Details

### Modify: `supabase/functions/verify-gift-payment/index.ts`

After the subscription activation succeeds (line ~119), add 3 email sends:

**Email 1 -- Student Activation Email**
- To: student's email (fetched from `auth.users` via service role, or from `gift.student_email`)
- Subject: "Votre abonnement a ete active! -- Edupreneurs"
- Content: Congratulations message, who paid (payer's first name or "un proche"), subscription active until date, CTA to log in

**Email 2 -- Payer Invoice/Receipt Email**
- To: `session.customer_details?.email` (from Stripe)
- Subject: "Recu de paiement -- Abonnement Edupreneurs"
- Content: Payment amount ($2.00 USD), student's first name, date, Stripe session ID as reference, standard receipt format

**Email 3 -- Payer Thank-You Email**
- To: same payer email
- Subject: "Mesi anpil! Vous soutenez l'education en Haiti -- Edupreneurs"
- Content: Heartfelt thank you, impact message (what the subscription provides: AI tutors, lessons, quizzes), Edupreneurs mission statement, CTA to visit the platform or donate

### Email Sending Pattern
Uses the Resend API directly (same pattern as `send-donation-thank-you`):
```text
fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { Authorization: Bearer RESEND_API_KEY },
  body: { from: "Edupreneurs <noreply@mon-edupreneur.com>", to, subject, html }
})
```

### Error Handling
Each email is wrapped in its own try/catch so a failure in one doesn't block the others or the payment verification response. Errors are logged but don't affect the success response to the payer.

### Data Available
- **Student name**: `gift.student_name` (first name only)
- **Student email**: `gift.student_email` (stored when link was generated)
- **Payer email**: `session.customer_details?.email` (from Stripe checkout)
- **Payer name**: `session.customer_details?.name` (from Stripe checkout)
- **Amount**: `gift.amount_usd` (200 cents = $2.00)
- **Subscription end date**: `newEnd` (calculated in the function)

## Safety Checklist

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- only adds email sends after existing logic |
| Security risk? | No -- uses existing RESEND_API_KEY, no new secrets needed |
| Backward compatible? | Yes -- existing gift flow unchanged |
| 3G optimized? | N/A -- emails sent server-side |
| Edge cases? | If payer email is null (rare), skip payer emails gracefully |

## Technical Notes
- No new edge functions, no new files -- single file modification to `verify-gift-payment/index.ts`
- No database changes needed
- Email HTML templates follow the same design language as existing emails (green gradient header, Edupreneurs branding, rounded cards)
- All emails sent in French to match the platform language
