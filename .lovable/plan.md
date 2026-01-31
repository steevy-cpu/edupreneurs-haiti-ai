

# Fix Bazik.io API Integration (Based on Official Documentation)

## Problems Identified

After reviewing the official Bazik.io documentation at https://bazik.io/docs, I found several implementation issues:

---

## Issue 1: Payment Creation - Wrong Field Names

**Current (Wrong):**
```json
{
  "amount": 500,
  "orderId": "EDU-XXX"
}
```

**Correct (Per Bazik.io Docs):**
```json
{
  "gdes": 5000,
  "description": "Payment description",
  "referenceId": "YOUR_REFERENCE_ID"
}
```

| Field | Description |
|-------|-------------|
| `gdes` | Amount in Haitian Gourdes (not `amount`) |
| `description` | Payment description |
| `referenceId` | Your internal reference ID for tracking |

---

## Issue 2: Webhook Signature Verification - Wrong Algorithm

The current implementation hashes just the raw payload. Bazik.io uses a **specific format** that includes timestamp and event ID:

**Current (Wrong):**
```javascript
const signedPayload = rawPayload;
const expectedSignature = hmacSha256(signedPayload, secret);
```

**Correct (Per Bazik.io Docs):**
```javascript
const timestamp = headers['x-bazik-timestamp'];
const eventId = headers['x-bazik-event-id'];

// Signature format: timestamp.eventId.payload
const signedPayload = `${timestamp}.${eventId}.${rawBody}`;

const expectedSignature = hmacSha256(signedPayload, secret);

// Signature has v1= prefix
if (`v1=${expectedSignature}` !== headers['x-bazik-signature']) {
  throw new Error('Invalid signature');
}
```

---

## Issue 3: Webhook Payload Field Mapping

The webhook uses different field names than what we're parsing:

| Expected (Bazik) | Current Code | Notes |
|------------------|--------------|-------|
| `type` | Not checked | "payment.succeeded" or "payment.failed" |
| `orderId` | `orderId` | This is BAZIK's orderId, not ours! |
| `referenceId` | Not used | THIS is our reference ID |
| `transactionId` | `transactionId` | Correct |
| `status` | `message/status/state` | Should just be `status` |

**Critical Issue:** We're using Bazik's `orderId` to look up our transaction, but we should be using `referenceId` which is the ID we passed when creating the payment.

---

## Files to Update

| File | Changes |
|------|---------|
| `supabase/functions/moncash-create-payment/index.ts` | Fix field names (`gdes`, `referenceId`, `description`) |
| `supabase/functions/moncash-webhook/index.ts` | Fix signature verification, fix field mapping |

---

## Implementation Details

### Task 1: Update `moncash-create-payment/index.ts`

**Changes to `createBazikPayment` function:**

```typescript
// BEFORE
body: JSON.stringify({
  amount,
  orderId,
}),

// AFTER
body: JSON.stringify({
  gdes: amount,  // "gdes" not "amount"
  description: description || 'Edupreneurs Payment',
  referenceId: orderId,  // Our internal order ID becomes their referenceId
}),
```

Also update the database insert to store Bazik's orderId in metadata:
```typescript
metadata: { 
  gateway: 'bazik.io',
  bazikOrderId: data.orderId,  // Store Bazik's orderId
},
```

---

### Task 2: Update `moncash-webhook/index.ts`

**Fix signature verification:**

```typescript
function extractBazikHeaders(headers: Headers): {
  signature: string | null;
  timestamp: string | null;
  eventId: string | null;
} {
  return {
    signature: headers.get('x-bazik-signature'),
    timestamp: headers.get('x-bazik-timestamp'),
    eventId: headers.get('x-bazik-event-id'),
  };
}

async function verifyBazikSignature(
  rawBody: string,
  signature: string,
  timestamp: string,
  eventId: string,
  secret: string
): Promise<boolean> {
  // Build signed payload per Bazik docs
  const signedPayload = `${timestamp}.${eventId}.${rawBody}`;
  
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
    encoder.encode(signedPayload)
  );
  
  const calculated = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Bazik uses v1= prefix
  const expected = `v1=${calculated}`;
  
  // Timing-safe comparison
  return signature === expected;
}
```

**Fix payload parsing to use `referenceId`:**

```typescript
function validatePayload(data: unknown): { 
  valid: boolean; 
  referenceId?: string;   // Our order ID
  bazikOrderId?: string;  // Bazik's order ID
  transactionId?: string;
  amount?: number;
  status?: string;
  eventType?: string;
  error?: string;
} {
  const payload = data as Record<string, unknown>;

  // Check event type
  const eventType = payload.type as string;
  
  // referenceId is OUR order ID - this is what we use to find the transaction
  if (!payload.referenceId || typeof payload.referenceId !== 'string') {
    return { valid: false, error: 'Missing referenceId' };
  }

  return {
    valid: true,
    referenceId: payload.referenceId as string,  // OUR order ID
    bazikOrderId: payload.orderId as string,     // Bazik's order ID
    transactionId: payload.transactionId as string,
    amount: payload.amount as number,
    status: payload.status as string,            // "successful", "failed", etc.
    eventType,                                   // "payment.succeeded", etc.
  };
}
```

**Update database lookup to use `referenceId`:**

```typescript
// Look up by our order_id (which is Bazik's referenceId)
const { data: transaction } = await supabase
  .from('payment_transactions')
  .select('id, status')
  .eq('order_id', validation.referenceId)  // Use referenceId, not orderId
  .single();
```

---

## Bazik Webhook Payload Example (From Docs)

```json
{
  "type": "payment.succeeded",
  "orderId": "BZK_sandbox_c5b754a0_1758848912342_q2oz",
  "transactionId": "673219d6-5345-4f3b-a6a5-9dd646222f5d",
  "status": "successful",
  "amount": 95,
  "currency": "HTG",
  "referenceId": "S0QVRUIQ",
  "timestamp": "2025-09-26T03:38:30.165Z"
}
```

---

## Webhook Headers (From Docs)

| Header | Description |
|--------|-------------|
| `X-Bazik-Env` | Environment (sandbox or live) |
| `X-Bazik-Timestamp` | Unix timestamp when webhook was sent |
| `X-Bazik-Event-Id` | Unique identifier for the webhook event |
| `X-Bazik-Signature` | HMAC-SHA256 signature (format: `v1=hex_signature`) |

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Fixes incorrect implementation |
| Works with existing data? | Yes | Same `payment_transactions` table |
| Backward compatible? | Yes | Same function interface |
| 3G optimized? | Yes | Lightweight responses |
| Security improved? | Yes | Correct signature verification |

