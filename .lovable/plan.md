

# "Pay for a Student" -- Gift Subscription Feature

## The Problem
Many Haitian students have family in the US who would gladly pay the 200 HTG (~$1.50 USD) subscription fee, but there is no way for them to do it remotely. The student can't pay, and the family member doesn't have a MonCash account.

## How It Works (User Flow)

**Student side (Haiti):**
1. On the signup Step 3 page (or the subscription renewal page), a new tab appears: "Lien Famille" (Family Link)
2. Student clicks "Generer un lien" -- this creates a unique gift payment link
3. Student copies the link and sends it to their family member (WhatsApp, text, etc.)
4. The student can proceed with signup using a promo code or MonCash while waiting, OR wait for the family payment

**Family member side (US or abroad):**
1. Opens the link (e.g., `/gift/pay/<token>`)
2. Sees a simple, public page (no login required): student's first name, subscription details (200 HTG / ~$1.50 USD), and a Stripe "Pay" button
3. Pays via Stripe (credit/debit card in USD)
4. On success, the student's subscription is activated automatically

```text
+------------------+      WhatsApp/SMS      +------------------+
|   Student in HT  | --------------------> |  Family in US    |
|                  |   sends gift link     |                  |
|  Signs up with   |                       |  Opens link      |
|  "pending" sub   |                       |  Pays $2 via     |
|                  |                       |  Stripe           |
|  Sub activates   | <-- webhook/callback  |  Sees "Merci!"   |
|  automatically!  |                       |                  |
+------------------+                       +------------------+
```

## Database Changes

### New table: `gift_subscriptions`
Tracks gift payment tokens and links them to students.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Auto-generated |
| token | text (unique) | Random URL-safe token (e.g., 16-char hex) |
| student_user_id | uuid | References the student's auth user |
| student_name | text | Display name shown to the payer |
| student_email | text | For linking back if needed |
| status | text | `pending`, `completed`, `expired` |
| amount_usd | integer | Amount in cents (e.g., 200 for $2.00) |
| stripe_session_id | text | Stripe checkout session ID |
| payer_email | text | Email of the person who paid |
| created_at | timestamptz | Token creation time |
| completed_at | timestamptz | When payment was confirmed |
| expires_at | timestamptz | Token expiry (7 days from creation) |

**RLS Policies:**
- Authenticated users can INSERT their own gift requests (`student_user_id = auth.uid()`)
- Authenticated users can SELECT their own records
- Anonymous users can SELECT by token (for the public payment page)
- Service role handles UPDATE on payment completion (via edge function)

## New Edge Function: `stripe-gift-payment`

Creates a Stripe Checkout session for the gift payment. This is a **public** endpoint (no auth required -- the family member is not a user).

- Accepts: `{ token: string }`
- Validates the token exists and is not expired/completed
- Creates a Stripe Checkout session for $2 USD (equivalent to 200 HTG)
- Sets `success_url` to `/gift/success?token=<token>` and `cancel_url` to `/gift/pay/<token>`
- Returns the Stripe checkout URL

## New Edge Function: `verify-gift-payment`

Called from the success callback page:
- Accepts: `{ token: string }`
- Looks up the `gift_subscriptions` record
- Checks Stripe session status
- If paid: updates `gift_subscriptions.status` to `completed`, then activates the student's subscription (same stacking logic as `moncash-verify-payment` -- adds 30 days)
- Sends a notification to the student

## New Frontend Pages

### 1. `/gift/pay/:token` -- Public Payment Page
- Clean, simple page (works on any device/browser)
- Shows: "Payez l'abonnement de [Student Name]"
- Amount: $2.00 USD (30 jours d'acces)
- Stripe "Pay" button
- No login required

### 2. `/gift/success` -- Payment Confirmation
- Thank-you message for the payer
- "L'abonnement de [Student Name] a ete active!"

### 3. Update to Step 3 (Signup) -- New "Lien Famille" Tab
- Third tab alongside "Code Promo" and "MonCash"
- Generates a gift link via an API call
- Shows the link with a "Copy" button
- Explains: "Envoyez ce lien a un proche pour qu'il paie votre abonnement par carte bancaire"
- Student can still complete signup (account is created, subscription stays `none` until gift payment comes through)

### 4. Update to Settings Subscription Card
- Add a "Lien Famille" button next to "Renouveler" for existing users who want to generate a gift link for renewal

## Files to Create/Modify

### New Files:
- `supabase/functions/stripe-gift-payment/index.ts` -- Stripe checkout for gift
- `supabase/functions/verify-gift-payment/index.ts` -- Verify and activate
- `src/pages/GiftPayment.tsx` -- Public payment page
- `src/pages/GiftPaymentSuccess.tsx` -- Thank-you page
- `src/auth/services/gift.service.ts` -- Gift link generation logic

### Modified Files:
- `src/auth/routes/signup/Step3.tsx` -- Add "Lien Famille" tab
- `src/App.tsx` -- Add routes for `/gift/pay/:token` and `/gift/success`
- `src/auth/store/authFlow.store.ts` -- Add `giftToken` to SignupFormData (optional)

## Security Considerations

- Tokens expire after 7 days to prevent stale links
- Rate limit gift link generation (max 3 per user per day)
- Rate limit payment creation by IP (reuse existing rate limiter)
- Gift payment amount is fixed server-side ($2 USD) -- cannot be manipulated
- Token is a cryptographically random 32-char hex string
- The public page shows only the student's first name (no email, no last name)

## 3G Optimization

- Gift payment page is a standalone lightweight page (no heavy app shell)
- Student-side link generation is a single API call
- Copy-to-clipboard uses the native API (no extra library)

