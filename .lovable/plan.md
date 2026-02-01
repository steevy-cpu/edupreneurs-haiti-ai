
# Fix: MonCash Error Handling in Payment Callback

## Problem Identified

There are two issues causing the error page:

### Issue 1: Callback ignores `error=true` parameter
When MonCash redirects back with `&error=true` (on user cancel or gateway error), the PaymentCallback page ignores this and tries to check status anyway - showing confusing "checking" then "pending" states instead of an immediate error.

**Current Behavior:**
```text
1. User clicks "Pay with MonCash"
2. Redirect to MonCash gateway
3. User cancels or MonCash has an error
4. MonCash redirects to: /payment/callback?orderId=XXX&error=true
5. PaymentCallback ignores "error=true" and calls moncash-check-status
6. Status returns "pending" (because no payment was made)
7. User sees "Pending" - confusing!
```

**Expected Behavior:**
```text
1. User clicks "Pay with MonCash"
2. Redirect to MonCash gateway
3. User cancels or MonCash has an error
4. MonCash redirects to: /payment/callback?orderId=XXX&error=true
5. PaymentCallback sees "error=true" and immediately shows "Failed" state
6. User sees clear "Payment cancelled" message
```

### Issue 2: Token expiration
MonCash sandbox payment tokens expire after 30 minutes. The last token in logs was created at 17:14:16 and expired at 17:44:16. If you're testing after this time, you need to initiate a new payment.

---

## Solution

Update `src/pages/PaymentCallback.tsx` to:
1. Check for `error=true` query parameter on mount
2. If error param exists, skip status check and show failed state immediately
3. Show appropriate error message based on context

---

## Files to Modify

### `src/pages/PaymentCallback.tsx`

**Change 1: Read error parameter from URL (line 24)**

```typescript
// BEFORE (line 24)
const orderId = searchParams.get('orderId');

// AFTER (line 24-25)
const orderId = searchParams.get('orderId');
const hasError = searchParams.get('error') === 'true';
```

**Change 2: Handle error parameter in useEffect (lines 28-36)**

```typescript
// BEFORE
useEffect(() => {
  if (!orderId) {
    setStatus('error');
    setErrorMessage('Aucun identifiant de commande trouvé');
    return;
  }

  checkPaymentStatus();
}, [orderId]);

// AFTER
useEffect(() => {
  if (!orderId) {
    setStatus('error');
    setErrorMessage('Aucun identifiant de commande trouvé');
    return;
  }

  // Check if MonCash redirected with an error (user cancelled or gateway error)
  if (hasError) {
    setStatus('failed');
    setErrorMessage('Le paiement a été annulé ou a échoué sur MonCash. Veuillez réessayer.');
    return;
  }

  checkPaymentStatus();
}, [orderId, hasError]);
```

---

## Expected Results After Fix

| Scenario | Before Fix | After Fix |
|----------|------------|-----------|
| User cancels on MonCash | Shows "Pending" (confusing) | Shows "Paiement échoué" immediately |
| MonCash gateway error | Polls 10 times, then "Pending" | Shows error immediately |
| Successful payment | Works correctly | Works correctly (no change) |
| Token expired on MonCash | User sees MonCash error page, then confused callback | User sees clear error message |

---

## Testing Instructions

1. Navigate to `/payment-demo`
2. Select Premium plan and click "Pay with MonCash"
3. On the MonCash page, click cancel/back (or wait for token to expire)
4. You should now see "Paiement échoué" with "Le paiement a été annulé" message
5. For successful flow: Use MonCash sandbox test credentials to complete payment

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Adds error handling, doesn't change success flow |
| Works with existing data? | Yes | Just reads URL params, no DB changes |
| 3G optimized? | Yes | Avoids unnecessary polling when error is known |
| Backward compatible? | Yes | Existing pending payments still work |
| User experience impact? | Positive | Clearer error messages, no confusing "pending" state |

---

## Additional Note

If you're seeing the error page **on the MonCash gateway itself** (not on your callback page), this is likely due to:
- **Expired token**: Re-initiate the payment to get a fresh token
- **Sandbox limitations**: MonCash sandbox may have availability issues
- **Network issues**: Try again in a few minutes

The fix above ensures that even when MonCash has issues, your users get a clear error message rather than a confusing "pending" state.
