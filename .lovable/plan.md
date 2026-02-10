

# Critical Bugs in MonCash Post-Payment Flow

## Issues Found

### Bug 1: Wrong `orderId` from redirect URL (CRITICAL)

From your test, Bazik.io redirected to:
```
https://...supabase.co/?orderId=BZK_production_73ec3c80_...&referenceId=EDU-MLH1DIAF-F9NIVC
```

Bazik **overwrites** the query parameters in the returnUrl with its own:
- `orderId` = Bazik's internal ID (`BZK_production_...`)
- `referenceId` = Our internal ID (`EDU-...`)

But `PaymentCallback.tsx` reads `orderId` from the URL:
```typescript
const orderId = searchParams.get('orderId');
// Gets: "BZK_production_73ec3c80_..." (Bazik's ID)
// Expected: "EDU-MLH1DIAF-F9NIVC" (our internal ID)
```

Then it passes this Bazik orderId to `moncash-check-status`, which looks up:
```typescript
.eq('order_id', orderId)  // Looking for "BZK_production_..."
// But our DB stores "EDU-MLH1DIAF-F9NIVC"
// Result: Transaction NOT FOUND
```

**Fix:** Read `referenceId` as fallback (that's our internal ID):
```typescript
const orderId = searchParams.get('referenceId') || searchParams.get('orderId');
```

---

### Bug 2: Stale closure on `attempts` causes repeated verification calls

In `PaymentCallback.tsx`:
```typescript
const checkPaymentStatus = async () => {
  setAttempts(prev => prev + 1);
  if (attempts === 0) {  // <-- stale closure!
    // Triggers moncash-verify-payment
  }
  // ...
  setTimeout(checkPaymentStatus, pollInterval); // same closure, attempts still 0
};
```

Every retry call reuses the same function closure where `attempts` is always `0`. This means `moncash-verify-payment` gets called on **every single retry** (up to 10 times), not just once. This wastes API calls and could trigger rate limiting.

**Fix:** Use a ref to track whether verification has been triggered:
```typescript
const verifiedRef = useRef(false);
// ...
if (!verifiedRef.current) {
  verifiedRef.current = true;
  // call moncash-verify-payment
}
```

---

### Bug 3: Verify function uses wrong API for Bazik-created payments (RISK)

The `moncash-verify-payment` function talks directly to MonCash's API (`moncashbutton.digicelgroup.com/Api/v1/RetrieveOrderPayment`), but the payment was created through Bazik.io. MonCash may not recognize the orderId (whether it's our `EDU-...` or Bazik's `BZK_...`).

**Fix:** The verify function should also check Bazik.io's API for payment status, or at minimum, we should confirm whether MonCash recognizes the Bazik-assigned orderId. For now, we should add a Bazik verification fallback.

---

## Plan

### File 1: `src/pages/PaymentCallback.tsx`
1. Read `referenceId` from URL as primary source (our internal ID), fall back to `orderId`
2. Replace stale closure with a `useRef` to ensure verification only triggers once
3. Pass both `orderId` (Bazik's) and `referenceId` (ours) to verify function for maximum compatibility

### File 2: `supabase/functions/moncash-verify-payment/index.ts`
1. Accept both `orderId` and `bazikOrderId` parameters
2. Try Bazik.io verification endpoint first (since payment was created via Bazik)
3. Fall back to direct MonCash API if Bazik doesn't provide status
4. Look up the transaction in DB using our internal `referenceId`/`order_id`

### File 3: `supabase/functions/moncash-create-payment/index.ts`
No changes needed -- the `returnUrl` fix is already in place.

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- "J'ai deja paye" manual flow unaffected |
| Works with existing data? | Yes -- pending transactions use our internal EDU- orderId |
| Backward compatible? | Yes |
| 3G optimized? | Yes -- eliminates 9 unnecessary API calls from retry bug |
| Edge cases handled? | Yes -- falls back gracefully if Bazik params missing |

