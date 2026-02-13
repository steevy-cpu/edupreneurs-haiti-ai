
# Fix: Gift Tab Allows Unpaid Account Access

## Root Cause

Two issues combine to create this bypass:

### 1. `SubscriptionGate` treats `subscription_status = 'none'` as "allowed"
Line 45 of `SubscriptionGate.tsx`:
```
if (subscription_status === 'none') return children; // lets them through!
```
This was intended for legacy users who existed before subscriptions were added, but it also lets new gift-tab signups access everything without payment.

### 2. Step3 gift path bypasses all validation
In `Step3.tsx`, the gift tab sets `canSubmit = true` unconditionally and fakes `promoCodeValid: true` during submit. The account is created with `subscription_status: 'none'` -- no payment required.

---

## Fix

### A. Gate `subscription_status = 'none'` for new users
In `SubscriptionGate.tsx`, change the legacy bypass to only apply to users created **before** the subscription system was introduced (use a cutoff date). New users with `'none'` status will see the renewal/payment prompt.

```
// Legacy users (before subscription system) - allow through
// New users must have an active subscription or free access
const isLegacyUser = profile.created_at && new Date(profile.created_at) < SUBSCRIPTION_CUTOFF_DATE;
if (subscription_status === 'none' && isLegacyUser) return children;
if (subscription_status === 'none' && !isLegacyUser) show payment prompt;
```

The `created_at` field needs to be added to the subscription-status query.

### B. Update Step3 gift flow to set `subscription_status = 'pending_gift'`
Instead of creating the account with `'none'`, set a new status `'pending_gift'` so the system knows this user is waiting for a family payment. This distinguishes them from legacy users and MonCash-paid users.

In `signup.service.ts`, update the profile insert for gift-tab users:
```
subscription_status: isMonCash ? 'active' : isGift ? 'pending_gift' : 'none'
```

### C. Handle `pending_gift` in `SubscriptionGate`
Show a specific waiting message for `pending_gift` users instead of the generic "expired" prompt. This tells them their family member hasn't paid yet and provides the option to generate a new gift link.

### D. Remove the fake validation bypass in Step3
Stop sending `promoCodeValid: true` for gift-tab submissions. Instead, pass `accessMethod: 'gift'` properly and handle it in `validateStep3()`.

---

## Files to Modify

1. **`src/components/SubscriptionGate.tsx`** -- Add `created_at` to query, gate `'none'` for new users, handle `'pending_gift'` status
2. **`src/auth/services/signup.service.ts`** -- Set `subscription_status: 'pending_gift'` for gift-tab signups
3. **`src/auth/routes/signup/Step3.tsx`** -- Pass `accessMethod: 'gift'` cleanly instead of faking promo validation
4. **`src/auth/services/signup.service.ts` (`validateStep3`)** -- Add proper `'gift'` access method validation

## Safety Verification

| Check | Result |
|---|---|
| Breaks existing functionality? | No -- legacy users still pass via date cutoff |
| Works with existing data? | Yes -- existing `'none'` users predate cutoff |
| Optimized for 3G? | Yes -- no new network calls |
| Edge cases handled? | Yes -- pending_gift, legacy, expired, active |
| Backward compatible? | Yes -- additive status value |
