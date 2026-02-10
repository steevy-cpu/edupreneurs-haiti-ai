

# Fix MonCash Post-Payment Redirect

## Problem
After completing a MonCash payment, users are redirected to the raw Supabase URL (`https://woiozlzhpcukncixwpma.supabase.co/?orderId=...`) instead of your app's payment callback page. This happens because no return URL is passed to Bazik.io when creating the payment.

Also, all transactions remain in `pending` status because users never reach `/payment/callback` to trigger verification.

## Root Cause
In `moncash-create-payment/index.ts`, the `createBazikPayment` function sends `gdes`, `description`, and `referenceId` to Bazik -- but no `successUrl` or `returnUrl`. The Bazik API needs to know where to send users after they pay.

## Solution

### 1. Update `moncash-create-payment` edge function
Pass a `returnUrl` to the Bazik API that points to your app's callback page:

```typescript
// In createBazikPayment(), add returnUrl to the request body:
body: JSON.stringify({
  gdes: amount,
  description: description,
  referenceId: orderId,
  returnUrl: returnUrl,  // NEW
}),
```

The `returnUrl` will be constructed in the main handler using `SITE_URL` or a new secret, pointing to:
`https://edupreneurs-haiti-ai.lovable.app/payment/callback?orderId={orderId}`

### 2. Accept `returnUrl` from frontend (or build it server-side)
The edge function will construct the callback URL:

```typescript
const siteUrl = Deno.env.get('SITE_URL') || 'https://edupreneurs-haiti-ai.lovable.app';
const returnUrl = `${siteUrl}/payment/callback?orderId=${finalOrderId}`;
```

A `SITE_URL` secret will need to be configured with value `https://edupreneurs-haiti-ai.lovable.app`.

### 3. Update `PaymentCallback.tsx` to also trigger verification
Currently `/payment/callback` only calls `moncash-check-status` (which reads from DB). After redirect, it should also call `moncash-verify-payment` to confirm with MonCash/Bazik and update the transaction status from `pending` to `completed`.

Flow:
1. User returns to `/payment/callback?orderId=XXX`
2. Page calls `moncash-verify-payment` with the orderId
3. That function checks with Bazik/MonCash API and updates DB status
4. Page then calls `moncash-check-status` to display the result

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/moncash-create-payment/index.ts` | Add `returnUrl` to Bazik API request body |
| `src/pages/PaymentCallback.tsx` | Call `moncash-verify-payment` first, then check status |
| New secret: `SITE_URL` | Set to `https://edupreneurs-haiti-ai.lovable.app` |

### Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- adds missing redirect behavior |
| Works with existing data? | Yes -- pending transactions can still be verified via "J'ai deja paye" button |
| Backward compatible? | Yes |
| 3G optimized? | Yes -- minimal extra API call on callback page |
| Edge cases? | If Bazik ignores returnUrl, the "J'ai deja paye" manual flow still works as fallback |

