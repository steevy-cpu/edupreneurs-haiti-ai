

# MonCash Payment Integration in Signup Step 3 (with Subscription Expiry Banner)

## Overview
Integrate MonCash payment (200 HTG) as an alternative to promo codes in Step 3 of the signup flow. Users must either enter a valid promo code OR complete a MonCash payment to create their account. No free tier. Payment grants 30 days of access with manual monthly renewal. A countdown banner warns users as their subscription nears expiration.

---

## Current State
- Step 3 requires a valid promo code (mandatory)
- Promo codes with `grants_free_access = true` give full platform access
- Payment infrastructure (MonCash via Bazik.io) is fully functional and structurally hardened
- `profiles.has_free_access` column exists for promo-based access gating
- Banner priority system (`useBannerPriority`) and `FloatingLayer` already exist for centralized banner management

---

## Subscription Model

- **Price**: 200 HTG per month
- **Duration**: Each payment grants exactly 30 days of access
- **Renewal**: Manual -- when subscription expires, user sees a renewal prompt
- **Promo code users**: Unaffected -- `has_free_access = true` bypasses all subscription checks

---

## New Step 3 Design

```text
+-------------------------------------------+
|          Derniere etape !                  |
|    Choisissez votre methode d'acces        |
|                                            |
|  [Tab: Code Promo]   [Tab: MonCash]        |
|                                            |
|  --- If Promo Code selected ---            |
|  | Input field + [Verifier] button |       |
|                                            |
|  --- If MonCash selected ---               |
|  | Acces Premium          |                |
|  | 200 HTG / mois         |                |
|  | 30 jours d'acces       |                |
|  | [Payer avec MonCash]   |                |
|                                            |
|  [ ] J'accepte les politiques...           |
|  [<- Retour]    [Creer mon compte]         |
+-------------------------------------------+
```

---

## Subscription Expiry Warning Banner

A persistent banner that appears in the `FloatingLayer` when the user's subscription is close to expiring. It integrates with the existing `useBannerPriority` system so it respects dismissal rules and doesn't conflict with other banners (notification permission, PWA prompt, etc.).

### Behavior
- **Shows at 7 days remaining**: A yellow/amber banner appears at the top of the app with a live countdown timer (e.g., "Votre abonnement expire dans 6j 14h 32m")
- **Shows at 3 days remaining**: Banner turns orange/red for urgency
- **Shows at 0 days (expired)**: `SubscriptionGate` blocks access entirely with a renewal screen (no banner needed -- the gate takes over)
- **Dismissable**: User can dismiss the banner, but it reappears after 24 hours (uses `useBannerPriority` with `days = 1`)
- **Promo users**: Banner never shows (they have `has_free_access = true`)
- **Action button**: "Renouveler maintenant" triggers the MonCash renewal flow

### Timer Implementation
- Uses a `useSubscriptionCountdown` hook that reads `subscription_end_date` from the user profile
- Updates every minute (not every second -- saves battery on mobile/3G)
- Formats as "Xj Xh Xm" (days, hours, minutes)

### Banner Priority
- Registered with `useBannerPriority` at priority **2** (higher than PWA prompt, lower than critical system banners)
- When multiple banners compete, the priority system ensures only one shows at a time

---

## Technical Plan

### 1. Database Migration

Add columns to `profiles`:
- `subscription_status` (text, default `'none'`): Values: `'none'`, `'active'`, `'expired'`
- `subscription_end_date` (timestamptz, nullable): When current period expires
- `payment_order_id` (text, nullable): Links signup payment to `payment_transactions`

### 2. Update `src/auth/store/authFlow.store.ts`

Add fields to `SignupFormData`:
- `accessMethod`: `'promo'` | `'moncash'`
- `paymentCompleted`: boolean
- `paymentOrderId`: string

### 3. Rewrite `src/auth/routes/signup/Step3.tsx`

- Add tab toggle between "Code Promo" and "MonCash"
- Promo tab: keep existing promo code UI and logic unchanged
- MonCash tab: plan card (200 HTG/mois, 30 jours) + "Payer avec MonCash" button
- "Creer mon compte" enabled when either promo is valid OR payment is confirmed
- Privacy checkbox shared across both tabs

### 4. New file: `src/auth/services/payment.service.ts`

- `createSignupPayment(email)`: Calls `moncash-create-payment` with `isSignupPayment: true`
- `checkSignupPaymentStatus(orderId)`: Calls `moncash-check-status`

### 5. New file: `src/auth/routes/signup/SignupPaymentCallback.tsx`

- Reads `orderId` / `referenceId` from URL params
- Polls `moncash-check-status` for verification
- On success: saves to authFlow store, redirects back to Step 3
- On failure: shows error with retry/back options

### 6. Add route in `App.tsx`

- `/auth/signup/payment-callback` -> `SignupPaymentCallback`

### 7. Update `src/auth/services/signup.service.ts`

- If `accessMethod === 'moncash'` and `paymentCompleted`: set `subscription_status = 'active'`, `subscription_end_date = now + 30 days`
- If `accessMethod === 'promo'`: existing behavior unchanged
- `validateStep3()`: accept either valid promo OR completed payment

### 8. Update `moncash-create-payment` edge function

- Accept optional `isSignupPayment: true` + `email` in request body
- When signup mode: skip auth header requirement, store email in transaction metadata
- After account creation, link the transaction to the real user

### 9. Subscription Gate: `src/components/SubscriptionGate.tsx`

- Wraps protected content in `AppShell`
- Checks `has_free_access` (always allow) or `subscription_end_date > now()` (allow if active)
- If expired: full-screen renewal prompt with "Renouveler (200 HTG)" MonCash button
- Renewal extends `subscription_end_date` by 30 days

### 10. Expiry Warning Banner: `src/components/SubscriptionExpiryBanner.tsx`

- Reads `subscription_end_date` from user profile query
- If `has_free_access = true`: render nothing
- If 7 or fewer days remaining: render warning banner
- Contains a live countdown timer (updates every 60 seconds)
- Color: amber when > 3 days, red/orange when <= 3 days
- "Renouveler maintenant" button triggers MonCash payment
- "X" dismiss button uses `useBannerPriority.dismissBanner('subscription-expiry', 1)` (reappears after 24h)

### 11. New hook: `src/hooks/useSubscriptionCountdown.ts`

- Takes `subscription_end_date` as input
- Returns `{ daysLeft, hoursLeft, minutesLeft, isExpired, isExpiringSoon }`
- `isExpiringSoon` = true when <= 7 days remain
- Updates via `setInterval` every 60 seconds (battery-friendly for 3G)
- Cleans up interval on unmount

### 12. Register banner in `FloatingLayer`

- Add `SubscriptionExpiryBannerWrapper` to `FloatingLayer` (lazy-loaded)
- Add visibility rule: show only for authenticated, non-visitor users
- Integrate with `useBannerPriority` at priority 2

### 13. Update `src/shell/hooks/useVisibility.ts` and visibility config

- Add `showSubscriptionBanner` to the visibility result
- Show on all authenticated routes except auth pages and fullscreen modes

---

## Flow Diagrams

### Signup Flow
```text
Step 1 (Email/Password)
        |
Step 2 (Profile)
        |
Step 3 (Access Method)
   /              \
Promo Code      MonCash (200 HTG)
   |                |
Validate         Save progress
   |                |
   |           Create payment
   |                |
   |           Redirect to MonCash
   |                |
   |           Payment Callback
   |                |
   |           Verify + return to Step 3
    \              /
     \            /
   Create Account
        |
   Verify Email
        |
     Dashboard
```

### Subscription Lifecycle
```text
Day 1: Account created (subscription_status = 'active')
        |
Day 23: Banner appears (7 days left)
        "Votre abonnement expire dans 7j 0h 0m"
        [Renouveler maintenant]  [X dismiss]
        |
Day 24: User dismisses banner
        |
Day 25: Banner reappears (dismissed for only 24h)
        Banner turns orange/red (< 3 days left)
        |
Day 27: User clicks "Renouveler"
        -> MonCash payment -> extends 30 days
        |
   OR
        |
Day 30: Subscription expires
        SubscriptionGate blocks access
        Full-screen renewal prompt shown
```

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `profiles` table | Migrate | Add `subscription_status`, `subscription_end_date`, `payment_order_id` |
| `src/auth/store/authFlow.store.ts` | Modify | Add payment fields to signup form data |
| `src/auth/routes/signup/Step3.tsx` | Modify | Add MonCash tab alongside promo code |
| `src/auth/services/payment.service.ts` | Create | Signup payment service |
| `src/auth/routes/signup/SignupPaymentCallback.tsx` | Create | Payment callback for signup flow |
| `src/auth/services/signup.service.ts` | Modify | Handle MonCash path in account creation |
| `src/App.tsx` | Modify | Add payment callback route |
| `supabase/functions/moncash-create-payment/index.ts` | Modify | Support unauthenticated signup payments |
| `src/components/SubscriptionGate.tsx` | Create | Access gate for expired subscriptions |
| `src/components/SubscriptionExpiryBanner.tsx` | Create | Countdown warning banner |
| `src/hooks/useSubscriptionCountdown.ts` | Create | Countdown timer hook |
| `src/shell/FloatingLayer.tsx` | Modify | Add expiry banner to floating layer |
| `src/shell/hooks/useVisibility.ts` | Modify | Add `showSubscriptionBanner` |
| `src/shell/config/visibility.ts` | Modify | Add subscription banner visibility rules |

---

## Safety Verification

| Check | Result |
|-------|--------|
| Breaks existing promo code flow? | No -- promo path preserved as a tab option |
| Works with existing data? | Yes -- new columns default to `'none'` / null |
| Backward compatible? | Yes -- existing `has_free_access` users unaffected |
| 3G optimized? | Yes -- banner timer updates every 60s (not every second), lazy-loaded component |
| Edge case: payment succeeds but user closes tab? | Handled -- sessionStorage persists progress |
| Edge case: user refreshes during callback? | Handled -- reads from URL params + sessionStorage |
| Edge case: subscription expires mid-session? | Handled -- client-side check on app load |
| Edge case: user dismisses banner repeatedly? | Handled -- reappears every 24h via `useBannerPriority` |
| Security: unauthenticated payment creation? | Controlled -- signup mode uses email + metadata, rate-limited |
| Security: user manipulates `paymentCompleted` in storage? | Mitigated -- `createAccount` verifies order in `payment_transactions` |

