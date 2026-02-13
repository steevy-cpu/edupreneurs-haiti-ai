
# Send Thank-You Email After Donation

## Overview
Create a new edge function `send-donation-thank-you` that sends a beautiful, branded thank-you email to donors after a successful donation. Then integrate it into the donation callback flow for both MonCash and Stripe payments.

## What Changes

### 1. New Edge Function: `supabase/functions/send-donation-thank-you/index.ts`
- Beautiful HTML email template matching Edupreneurs branding (green gradient, Haitian Creole touch)
- Accepts: `donorName`, `donorEmail`, `amount`, `currency` (HTG or USD), `orderId`
- Uses Resend (same as all other email functions)
- Includes rate limiting and input validation (following existing patterns from `_shared/`)
- Email content highlights:
  - Warm "Mesi anpil!" greeting with the donor's name (or "Ami(e) d'Edupreneurs" if anonymous)
  - Donation amount and currency displayed prominently
  - Brief impact statement (what their donation helps fund)
  - Order reference for their records
  - Link back to the platform

### 2. Update: `src/components/donate/DonationSuccessCallback.tsx`
- Add Stripe handling: detect `?stripe=success&order=...` params and mark donation as completed
- After confirming payment success (MonCash or Stripe), trigger the thank-you email by calling the new edge function
- Only send email if `donor_email` exists in the donation record (it's optional)

### 3. Update: `supabase/functions/_shared/validation.ts`
- Add a `donationThankYouSchema` for input validation of the new edge function

## Flow

```text
User completes payment (MonCash/Stripe)
  --> Redirected to /donate/callback
  --> Callback verifies payment status
  --> If success + donor_email exists:
      --> Call send-donation-thank-you edge function
  --> Show success UI with confetti
```

## Email Template Design
- Header: Green gradient with a heart emoji and "Mesi anpil!" (Thank you in Creole)
- Body: Personalized greeting, donation summary (amount + currency + order ID)
- Impact section: Two cards showing "Technologie" and "Contenu educatif" (matching the donation page's fund transparency)
- Footer: Edupreneurs branding and copyright

## Safety Checklist

| Check | Result |
|-------|--------|
| Breaks existing functionality? | No -- existing MonCash flow preserved, Stripe handling added |
| 3G optimized? | Yes -- email sent server-side, no impact on page load |
| Backward compatible? | Yes -- email only sent if donor_email exists |
| Edge cases? | Anonymous donors (no email) skip email silently; Stripe callback now handled properly |
| Existing data? | Compatible -- reads from existing `donations` table |

## Technical Details

### New validation schema (in `_shared/validation.ts`):
```typescript
export const donationThankYouSchema = z.object({
  donorName: z.string().max(100).optional(),
  donorEmail: z.string().email().max(255),
  amount: z.number().positive(),
  currency: z.enum(["HTG", "USD"]),
  orderId: z.string().max(100),
});
```

### Stripe callback detection (in `DonationSuccessCallback.tsx`):
```typescript
const isStripe = searchParams.get("stripe") === "success";
const orderId = searchParams.get("order") || searchParams.get("orderId") || searchParams.get("referenceId");

// For Stripe: mark donation as completed directly (Stripe handles payment confirmation)
// For MonCash: verify via moncash-check-status as before
```

### Files to create:
- `supabase/functions/send-donation-thank-you/index.ts`

### Files to modify:
- `src/components/donate/DonationSuccessCallback.tsx` -- add Stripe handling + trigger thank-you email
- `supabase/functions/_shared/validation.ts` -- add donation thank-you schema
