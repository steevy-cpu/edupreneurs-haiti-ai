

# Fix MonCash Payment: Add Success/Error URL Parameters

## Problem Identified

Looking at the Bazik.io API response in the logs:

```json
{
  "successUrl": "noolock.com",
  "errorUrl": "noolock.com",
  "redirectUrl": "http://moncashbutton.digicelgroup.com/..."
}
```

The `successUrl` and `errorUrl` are set to "noolock.com" - this is an invalid placeholder URL configured in the Bazik.io dashboard. When MonCash tries to redirect after payment, it fails because these URLs are not valid.

---

## Solution

Pass `successUrl` and `errorUrl` parameters in the API request to override the dashboard defaults. Based on the PGecom documentation (which uses the same Bazik.io API), these parameters are accepted:

```json
{
  "gdes": 500,
  "description": "Payment description",
  "referenceId": "YOUR_ORDER_ID",
  "successUrl": "https://your-app.com/payment/callback?orderId=XXX",
  "errorUrl": "https://your-app.com/payment/callback?orderId=XXX&error=true"
}
```

---

## Implementation

### File to Update

`supabase/functions/moncash-create-payment/index.ts`

### Changes Required

1. Accept the app base URL (we'll use the published URL or derive it)
2. Add `successUrl` and `errorUrl` to the Bazik API request

**Before (lines 76-80):**
```typescript
body: JSON.stringify({
  gdes: amount,
  description: `Edupreneurs Payment - ${orderId}`,
  referenceId: orderId,
}),
```

**After:**
```typescript
// Build callback URLs
const baseUrl = 'https://edupreneurs-haiti-ai.lovable.app';
const successUrl = `${baseUrl}/payment/callback?orderId=${orderId}`;
const errorUrl = `${baseUrl}/payment/callback?orderId=${orderId}&error=true`;

body: JSON.stringify({
  gdes: amount,
  description: description || `Edupreneurs Payment - ${orderId}`,
  referenceId: orderId,
  successUrl: successUrl,
  errorUrl: errorUrl,
}),
```

---

## Why This Matters

| Without URLs | With URLs |
|--------------|-----------|
| Uses dashboard defaults ("noolock.com") | Uses our valid app URLs |
| MonCash fails to redirect | MonCash redirects correctly |
| User sees "System Error" | User sees payment result page |

---

## Updated Function Signature

The `createBazikPayment` function will be updated to accept additional parameters:

```typescript
async function createBazikPayment(
  token: string,
  amount: number,
  orderId: string,
  description: string,
  successUrl: string,
  errorUrl: string
): Promise<{ redirectUrl: string; bazikOrderId?: string; transactionId?: string }>
```

---

## Full Code Changes

### Updated `createBazikPayment` function:

```typescript
async function createBazikPayment(
  token: string,
  amount: number,
  orderId: string,
  description: string,
  successUrl: string,
  errorUrl: string
): Promise<{ redirectUrl: string; bazikOrderId?: string; transactionId?: string }> {
  console.log(`Creating Bazik MonCash payment: amount=${amount}, orderId=${orderId}`);
  console.log(`Success URL: ${successUrl}`);
  console.log(`Error URL: ${errorUrl}`);
  
  const response = await fetch(`${BAZIK_API_BASE}/moncash/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      gdes: amount,
      description: description,
      referenceId: orderId,
      successUrl: successUrl,
      errorUrl: errorUrl,
    }),
  });

  // ... rest of the function unchanged
}
```

### Updated function call in main handler:

```typescript
// Build callback URLs using the published app URL
const baseUrl = 'https://edupreneurs-haiti-ai.lovable.app';
const successUrl = `${baseUrl}/payment/callback?orderId=${finalOrderId}`;
const errorUrl = `${baseUrl}/payment/callback?orderId=${finalOrderId}&error=true`;

// Step 2: Create payment via Bazik.io with callback URLs
const { redirectUrl, bazikOrderId, transactionId } = await createBazikPayment(
  bazikToken,
  amount,
  finalOrderId,
  description || 'Edupreneurs Payment',
  successUrl,
  errorUrl
);
```

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Adds optional parameters |
| Works with existing data? | Yes | Same database structure |
| Backward compatible? | Yes | Uses same API, adds parameters |
| 3G optimized? | Yes | No extra network calls |
| Security risk? | No | URLs are hardcoded to our domain |

---

## Testing After Fix

1. Go to `/payment-demo`
2. Fill out the form and select a plan
3. Click "Payer avec MonCash"
4. You should be redirected to MonCash (no more "System Error")
5. After payment, you should return to `/payment/callback?orderId=XXX`

---

## Alternative: Make Base URL Configurable

For flexibility between preview and production environments, we could also pass the base URL from the frontend. This would require:

1. Frontend sends `callbackBaseUrl` in the request body
2. Edge function uses this URL to build success/error URLs

This approach would be more flexible for testing in preview vs production environments.

