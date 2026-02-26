

# Fix Promo Code subscription_end_date Bug

## Problem
Users who sign up with a `grants_free_access` promo code (CSCP2026, JUDE2026) get `has_free_access: true` but `subscription_end_date: null`. This causes Settings to show the permanent green "ACCES GRATUIT" badge instead of the amber timed-access card with expiry date.

## Root Cause
In `signup.service.ts` (L145), `subscription_end_date` is only set for MonCash payments. The `redeem-promo-code` edge function (for post-signup redemption) correctly hardcodes `2026-05-02T00:00:00.000Z`, but the signup flow does not.

## Key Finding: No `promoEndDate` Field Exists
The `SignupFormData` interface has no field carrying the promo expiry date. The `validate-promo-code` edge function does not return an end date. The `promo_codes` table `expires_at` is `null` for CSCP2026/JUDE2026. The May 2 date is **hardcoded** in `redeem-promo-code/index.ts`.

The cleanest fix: mirror the same hardcoded date in `signup.service.ts`, matching what `redeem-promo-code` already does.

---

## Fix 1 -- signup.service.ts (L145)

**File:** `src/auth/services/signup.service.ts`

Replace line 145:
```typescript
subscription_end_date: isMonCash ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
```

With:
```typescript
subscription_end_date: isMonCash
  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  : (data.promoGrantsFreeAccess ? '2026-05-02T00:00:00.000Z' : null),
```

This matches the exact same date used in `redeem-promo-code/index.ts` L129.

## Fix 2 -- DB Patch for Existing Users

1 affected user found (`has_free_access=true`, `subscription_end_date IS NULL`, `promo_code_used IS NOT NULL`).

```sql
UPDATE profiles
SET subscription_end_date = '2026-05-02T00:00:00.000Z'
WHERE has_free_access = true
  AND subscription_end_date IS NULL
  AND promo_code_used IS NOT NULL;
```

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- only adds a date where null existed |
| Provider stack affected? | No |
| New dependencies? | No |
| Bundle size impact? | None |
| 3G compatible? | Yes |
| Backward compatible? | Yes -- existing MonCash and non-promo paths unchanged |
| Files modified | Only `src/auth/services/signup.service.ts` |

## Post-Implementation Confirmation
- `signup.service.ts` sets `subscription_end_date` for `promoGrantsFreeAccess` users
- DB patch applied, 1 affected user updated
- Settings page will now show amber timed-access card with May 2, 2026 expiry for these users

