

# Donation Page - "Aidez Jude a transformer l'education"

## Overview

A public-facing donation page themed around Jude (the AI mascot) asking visitors to support Haitian education. Two payment methods: MonCash (already integrated) and Stripe (to be set up later). The page will be accessible without login and optimized for 3G connections.

## Page Structure

```text
/donate
+-------------------------------------------------------+
|  HeaderNav (reuse from Index page)                     |
+-------------------------------------------------------+
|                                                        |
|  [Jude Avatar]  "Ede m transfome edikasyon ann Ayiti!" |
|  Subtitle explaining the mission                       |
|                                                        |
|  +---------------------------------------------------+ |
|  |  Impact Stats (animated counters)                  | |
|  |  [Students helped] [Lessons created] [Hours saved] | |
|  +---------------------------------------------------+ |
|                                                        |
|  +---------------------------------------------------+ |
|  |  DONATION CARD                                     | |
|  |                                                    | |
|  |  Preset Amount Buttons:                            | |
|  |  [100 HTG] [250 HTG] [500 HTG] [1000 HTG]        | |
|  |                                                    | |
|  |  [Custom amount input field]                       | |
|  |                                                    | |
|  |  Payment Method Tabs:                              | |
|  |  [MonCash] | [Stripe (USD)]                       | |
|  |                                                    | |
|  |  MonCash tab:                                      | |
|  |    [Payer avec MonCash] button                     | |
|  |                                                    | |
|  |  Stripe tab:                                       | |
|  |    [Donate with Card] button (USD conversion)     | |
|  |                                                    | |
|  +---------------------------------------------------+ |
|                                                        |
|  "Where your donation goes" - 3 impact cards           |
|  [Teachers] [Tech/Servers] [Content Creation]          |
|                                                        |
|  Thank-you / transparency note from Jude               |
|                                                        |
+-------------------------------------------------------+
|  Footer (reuse)                                        |
+-------------------------------------------------------+
```

## File Structure (5 new files, 2 modified)

### New Files

1. **`src/pages/Donate.tsx`** - Page orchestrator
   - Reuses HeaderNav and Footer from the home page
   - Imports and composes all donation sub-components
   - Public route, no auth required
   - Helmet meta tags for SEO and social sharing

2. **`src/components/donate/DonateHero.tsx`** - Jude-focused hero section
   - Jude's avatar (reuse `getAvatarUrl('jude')`)
   - Motivational headline in Creole/French
   - Brief mission statement paragraph

3. **`src/components/donate/DonationCard.tsx`** - Core donation form
   - Preset amount buttons: 100, 250, 500, 1000 HTG
   - Custom amount input with validation (min 50 HTG)
   - Tabbed payment methods (MonCash / Stripe)
   - MonCash tab: calls existing `moncash-create-payment` edge function with a `isDonation: true` flag
   - Stripe tab: placeholder UI with "Coming soon" message until Stripe is enabled; once active, will use Stripe Checkout
   - Donor name field (optional) and message field (optional)

4. **`src/components/donate/ImpactSection.tsx`** - "Where your donation goes"
   - Three cards explaining fund allocation (Teachers, Technology, Content)
   - Simple icons, short descriptions
   - Lightweight -- no heavy animations

5. **`src/components/donate/DonationSuccessCallback.tsx`** - Post-payment landing
   - Similar pattern to PaymentCallback.tsx
   - Shows Jude celebrating with a thank-you message
   - Confetti animation (already installed: canvas-confetti)

### Modified Files

6. **`src/App.tsx`** - Add two new public routes:
   - `/donate` pointing to Donate page
   - `/donate/callback` pointing to DonationSuccessCallback

7. **`supabase/functions/moncash-create-payment/index.ts`** - Support donation payments
   - Add `isDonation: true` flag handling (similar to `isSignupPayment`)
   - Donations are unauthenticated, rate-limited by IP
   - Store with `description: 'Donation'` and donation metadata
   - Return URL points to `/donate/callback`

## Database

### New table: `donations`

Separate from `payment_transactions` for clean tracking:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Default gen_random_uuid() |
| order_id | text | Links to payment_transactions |
| amount | integer | In HTG |
| currency | text | HTG or USD |
| provider | text | moncash or stripe |
| donor_name | text (nullable) | Optional display name |
| donor_message | text (nullable) | Optional message |
| status | text | pending, completed, failed |
| created_at | timestamptz | Default now() |

RLS: INSERT allowed for anon (to create donation records), SELECT restricted to founders only (for admin view).

## Stripe Plan

Stripe is **not being configured now** -- the structure will be built with a clear integration point:

- The Stripe tab in DonationCard will show a friendly "Bientot disponible" (Coming soon) message
- When you're ready, you'll provide your Stripe secret key
- We'll then create a `stripe-create-donation` edge function using Stripe Checkout Sessions
- The flow will convert HTG amounts to USD at a configurable rate

**What you'll need for Stripe later:**
- A Stripe account (stripe.com)
- Your Stripe Secret Key (starts with `sk_live_` or `sk_test_`)
- That's it -- we handle the rest (products, checkout sessions, webhooks)

## 3G Performance Considerations

- No heavy images beyond Jude's avatar (already cached)
- No client-side animation libraries for the impact section (CSS only)
- Confetti only fires on success callback (lazy-loaded)
- Page is lazy-loaded in App.tsx like other public routes

## Safety Checklist

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- additive only, new route + new table |
| Works with existing payment infra? | Yes -- reuses moncash-create-payment with new flag |
| Backward compatible? | Yes -- existing payment flows unchanged |
| 3G optimized? | Yes -- minimal assets, lazy loading |
| Edge cases handled? | Min amount validation, rate limiting by IP, optional fields |
| Security (public page)? | IP-based rate limiting, input validation, RLS on donations table |

