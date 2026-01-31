
# Fix: MonCash Sandbox Mode - Response Path Mismatch

## Problem Identified

The sandbox mode IS working correctly - Bazik.io creates payments in sandbox mode and returns a redirect URL. However, when the user returns from MonCash to the callback page, the status check fails because of a **response path mismatch**:

| Component | Expects | Receives |
|-----------|---------|----------|
| `PaymentCallback.tsx` | `data.status` | `data.transaction.status` |

### Evidence from Logs

```javascript
// moncash-check-status returns:
{
  success: true,
  transaction: {
    orderId: "EDU-ML2K5ZG1-PM0E1X",
    status: "pending",  // <-- Status is nested here
    ...
  }
}

// PaymentCallback.tsx reads:
const paymentStatus = data?.status;  // <-- Reads wrong path (undefined)
```

This causes `paymentStatus` to be `undefined`, which triggers the "unknown status" error path.

---

## Files to Modify

### 1. `src/pages/PaymentCallback.tsx`

**Fix the response path to read from `data.transaction.status` instead of `data.status`:**

```typescript
// Line 60 - BEFORE
const paymentStatus = data?.status;

// Line 60 - AFTER  
const paymentStatus = data?.transaction?.status;
```

**Also update error message handling (line 65-66):**

```typescript
// BEFORE
setErrorMessage(data?.message || 'Le paiement a échoué');

// AFTER
setErrorMessage(data?.transaction?.description || data?.error || 'Le paiement a échoué');
```

---

## Additional Context: Why Sandbox Appears to "Not Work"

### What's Actually Happening

1. User clicks "Pay with MonCash" on payment-demo page
2. Edge function creates payment via Bazik.io (sandbox mode) - SUCCESS
3. User is redirected to `http://moncashbutton.digicelgroup.com/...` - the real MonCash payment page
4. MonCash shows the payment screen but:
   - In sandbox, you need MonCash test credentials to complete
   - Without completing, the user navigates away or MonCash redirects with error
5. User lands on `/payment/callback?orderId=XXX`
6. Callback page calls `moncash-check-status` - works correctly
7. **BUG**: Callback reads `data.status` (undefined) instead of `data.transaction.status`
8. Falls into "unknown status" error case

### The Fix

Once we correct the response path, the callback page will properly:
- Show "pending" status if payment is still pending
- Show "completed" if MonCash webhook updated the status
- Allow manual retry/verification

---

## Changes Summary

| File | Line | Change |
|------|------|--------|
| `PaymentCallback.tsx` | 60 | Read `data?.transaction?.status` |
| `PaymentCallback.tsx` | 65-66 | Read error from `data?.transaction?.description` or `data?.error` |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Fixes the broken status check |
| Database changes needed? | No | Just frontend path fix |
| Works with existing data? | Yes | Pending transactions in DB will be correctly read |
| Backward compatible? | Yes | Same data, corrected access path |
| 3G optimized? | N/A | No change to network behavior |

---

## Testing After Fix

1. Navigate to `/payment-demo`
2. Complete signup and select Premium plan
3. Click "Pay with MonCash" - should redirect to MonCash
4. Navigate back or wait for redirect to `/payment/callback?orderId=XXX`
5. Should now see "Pending" status (yellow clock icon) instead of error
6. "Vérifier à nouveau" button should work to poll for status updates
