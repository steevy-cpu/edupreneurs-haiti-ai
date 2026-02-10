

# Implementation Review: MonCash Payment + Subscription System

## Status: Mostly Complete -- 3 Issues Found

### What's Done Correctly
- Database migration: `subscription_status`, `subscription_end_date`, `payment_order_id` columns added
- `authFlow.store.ts`: Payment fields (`accessMethod`, `paymentCompleted`, `paymentOrderId`) added
- `Step3.tsx`: Tabbed UI with Promo Code and MonCash tabs, fully wired
- `payment.service.ts`: Signup payment service created
- `SignupPaymentCallback.tsx`: Payment callback created and handles verification
- `signup.service.ts`: `validateStep3()` and `createAccount()` updated for MonCash path
- `moncash-create-payment/index.ts`: Supports unauthenticated signup payments with `isSignupPayment`
- `SubscriptionExpiryBanner.tsx`: Countdown banner with amber/red states
- `useSubscriptionCountdown.ts`: Timer hook updating every 60s
- `SubscriptionExpiryBannerWrapper.tsx`: Reads profile data and passes to banner
- `FloatingLayer.tsx`: Banner registered and rendering
- `visibility.ts`: `subscriptionBanner` visibility rules configured
- `useVisibility.ts`: `showSubscriptionBanner` exposed
- `App.tsx`: `/auth/signup/payment-callback` route added

### Issues to Fix

#### 1. SubscriptionGate is NOT integrated into AppShell (Critical)
`SubscriptionGate` was created but never wrapped around the authenticated content in `AppShell.tsx`. Without this, expired users can freely access the platform -- the gate does nothing.

**Fix**: Wrap the `<Outlet />` content inside `AppShell` with `<SubscriptionGate>`.

#### 2. Renewal buttons point to `/payment-demo` instead of a real renewal flow
Both `SubscriptionGate.tsx` (line 59) and `SubscriptionExpiryBanner.tsx` (line 33) navigate to `/payment-demo`, which is a standalone demo page -- not a proper renewal flow for authenticated users.

**Fix**: Create a proper renewal handler that:
- Calls `moncash-create-payment` (authenticated mode, not signup mode)
- Uses `returnUrl = /payment/callback` (existing callback page)
- On successful payment verification, updates `subscription_end_date += 30 days` and `subscription_status = 'active'`

Or at minimum, point to a route that initiates the MonCash flow directly instead of the demo page.

#### 3. Privacy checkbox not checked before MonCash redirect
In `Step3.tsx`, clicking "Payer avec MonCash" redirects immediately without checking if the privacy checkbox is ticked. The privacy checkbox state is saved but not validated before redirect. This means a user could pay, come back, and still need to check privacy before submitting -- which is fine functionally, but the UX could be confusing.

**Fix (minor)**: No code change strictly needed since privacy is validated at submit time, but consider disabling the MonCash pay button until privacy is checked for clearer UX.

### Recommended Fix Plan

1. **Integrate SubscriptionGate into AppShell** -- wrap `<Outlet />` with `<SubscriptionGate>` so expired subscriptions are actually blocked
2. **Wire renewal flow** -- replace `/payment-demo` links in `SubscriptionGate` and `SubscriptionExpiryBanner` with a proper MonCash payment creation call for authenticated users, using the existing `/payment/callback` return URL
3. (Optional) **Privacy UX** -- disable MonCash pay button until privacy is checked

### Technical Details

**AppShell integration** -- In `src/shell/AppShell.tsx`, find where `<Outlet />` renders and wrap it:
```tsx
import { SubscriptionGate } from '@/components/SubscriptionGate';

// Inside render:
<SubscriptionGate>
  <Outlet />
</SubscriptionGate>
```

**Renewal handler** -- In both `SubscriptionGate.tsx` and `SubscriptionExpiryBanner.tsx`, replace `window.location.href = '/payment-demo'` with a function that:
1. Calls `supabase.functions.invoke('moncash-create-payment', { body: { amount: 200, description: 'Renouvellement Edupreneurs - 30 jours' } })`
2. Redirects to the returned `redirectUrl`
3. The existing `/payment/callback` page handles verification and should update the profile's `subscription_end_date`

