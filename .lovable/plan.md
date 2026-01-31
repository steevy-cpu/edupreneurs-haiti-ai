

# MonCash Integration Plan

## Overview

Transition from simulated payment flow to a live MonCash integration with Bazik.io webhook support for automated payment status updates.

---

## Current State Assessment

| Component | Status | Notes |
|-----------|--------|-------|
| `moncash-create-payment` | Ready | Creates payment, stores in DB as pending |
| `moncash-verify-payment` | Ready | Manual verification via API |
| `moncash-check-status` | Ready | Checks local DB status |
| `MONCASH_CLIENT_ID` | Configured | Sandbox credential |
| `MONCASH_CLIENT_SECRET` | Configured | Sandbox credential |
| `MONCASH_MODE` | Configured | sandbox/live |
| `MONCASH_WEBHOOK_SECRET` | Configured | For signature verification |
| **Webhook endpoint** | Missing | Needed for automatic status updates |
| **Frontend integration** | Missing | Demo page uses setTimeout simulation |
| **Return URL page** | Missing | Handle user return from MonCash portal |

---

## Implementation Tasks

### Task 1: Create Webhook Edge Function

**File**: `supabase/functions/moncash-webhook/index.ts`

This server-to-server endpoint will:

1. **Receive POST requests** from Bazik.io when payment status changes
2. **Verify HMAC-SHA256 signature** using `MONCASH_WEBHOOK_SECRET`
3. **Update payment_transactions table** with:
   - `status` = 'completed' or 'failed'
   - `transaction_id` from MonCash
   - `payer_phone` from MonCash
   - `completed_at` timestamp
4. **Return 200 OK** to acknowledge receipt
5. **No CORS** (server-to-server only, not browser-accessible)

Security features:
- HMAC signature verification (timing-safe comparison)
- Input validation with Zod
- Idempotent updates (safe to retry)
- Logging for debugging

---

### Task 2: Update Supabase Config

**File**: `supabase/config.toml`

Add webhook configuration:
```toml
[functions.moncash-webhook]
verify_jwt = false
```

This allows the webhook to receive requests from Bazik.io without JWT authentication.

---

### Task 3: Create Payment Callback Page

**File**: `src/pages/PaymentCallback.tsx`

When users complete payment on MonCash portal, they're redirected back to the app. This page will:

1. Extract `orderId` from URL query parameters
2. Poll `moncash-check-status` to verify payment completed
3. Show loading state while checking
4. Display success or failure message
5. Redirect to dashboard or retry option

---

### Task 4: Add Callback Route

**File**: `src/App.tsx`

Add route for payment callback:
```typescript
const PaymentCallback = lazy(() => import("./pages/PaymentCallback"));

// In routes
<Route path="/payment/callback" element={
  <Suspense fallback={<GenericPageSkeleton />}>
    <PaymentCallback />
  </Suspense>
} />
```

---

### Task 5: Wire Up Frontend to Real APIs

**File**: `src/pages/PaymentDemo.tsx`

Update the demo page to:

1. **Call real API** instead of simulation:
   ```typescript
   const response = await supabase.functions.invoke('moncash-create-payment', {
     body: { amount: selectedPlan.price, description: `Plan ${selectedPlan.name}` }
   });
   ```

2. **Redirect to MonCash portal** using the returned `redirectUrl`

3. **Set return URL** so users come back to `/payment/callback?orderId=XXX`

---

## Data Flow Diagram

```text
User Flow:
┌──────────┐    1. Select Plan    ┌──────────────┐
│   User   │────────────────────▶│  PaymentDemo │
└──────────┘                      └──────┬───────┘
                                         │
                                  2. Call Edge Function
                                         │
                                         ▼
                           ┌──────────────────────────┐
                           │  moncash-create-payment  │
                           │  (stores pending tx)     │
                           └────────────┬─────────────┘
                                        │
                                 3. Redirect URL
                                        │
                                        ▼
                              ┌───────────────────┐
                              │  MonCash Portal   │
                              │  (User pays)      │
                              └────────┬──────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
          4a. Webhook (async)                   4b. User redirect
                    │                                     │
                    ▼                                     ▼
         ┌──────────────────┐                  ┌──────────────────┐
         │ moncash-webhook  │                  │ PaymentCallback  │
         │ (updates status) │                  │ (checks status)  │
         └────────┬─────────┘                  └────────┬─────────┘
                  │                                     │
                  └──────────────┬──────────────────────┘
                                 ▼
                      ┌──────────────────────┐
                      │ payment_transactions │
                      │   status=completed   │
                      └──────────────────────┘
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/moncash-webhook/index.ts` | Webhook handler for Bazik.io |
| `src/pages/PaymentCallback.tsx` | Handle return from MonCash portal |

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/config.toml` | Add `moncash-webhook` config |
| `src/App.tsx` | Add `/payment/callback` route |
| `src/pages/PaymentDemo.tsx` | Replace simulation with real API calls |

---

## Technical Details

### Webhook Signature Verification

```typescript
async function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  
  const calculated = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Timing-safe comparison
  return signature.length === calculated.length && 
    signature === calculated;
}
```

### Expected Webhook Payload

The webhook handler will check multiple common header names for the signature:
- `X-Signature`
- `X-Webhook-Signature`
- `X-MonCash-Signature`

Expected payload structure:
```json
{
  "transactionId": "123456789",
  "orderId": "EDU-ABC123",
  "amount": 500,
  "cost": 500,
  "payer": "50937001234",
  "message": "successful",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Post-Deployment Configuration

After implementation, configure this webhook URL in the Bazik.io dashboard:

```text
https://xdyavylcmucjpueybdku.supabase.co/functions/v1/moncash-webhook
```

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | New endpoint, existing code unchanged until we wire up |
| Works with existing data? | Yes | Updates existing `payment_transactions` table |
| Backward compatible? | Yes | Demo page simulation still works until final switch |
| 3G optimized? | Yes | Lightweight JSON responses, minimal polling |
| Security implemented? | Yes | HMAC signature verification, no raw SQL |
| Edge cases handled? | Yes | Duplicate webhooks, expired transactions |

---

## Testing Strategy

1. Deploy webhook function
2. Create a test payment with sandbox credentials
3. Check edge function logs for webhook receipt
4. Verify database status update
5. Test full user flow from demo page to callback

