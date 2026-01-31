

# Fix MonCash Integration for Bazik.io API

## Problem Identified

The current `moncash-create-payment` edge function is calling the **wrong API endpoints**. It's using the direct MonCash/DigiCel endpoints instead of the Bazik.io gateway.

| Current (Wrong) | Correct (Bazik.io) |
|-----------------|-------------------|
| `sandbox.moncashbutton.digicelgroup.com` | `api.bazik.io` |
| OAuth with client_id/secret | JWT token with userID/secretKey |
| Basic Auth header | JSON body authentication |

---

## What We Need to Change

### 1. Update Secrets Configuration

The current secrets use MonCash naming, but Bazik.io uses different credential names:

| Current Secret | Bazik.io Equivalent |
|---------------|---------------------|
| `MONCASH_CLIENT_ID` | Should contain `userID` (e.g., `bzk_c5b754a0_...`) |
| `MONCASH_CLIENT_SECRET` | Should contain `secretKey` (e.g., `sk_5b0ff521...`) |

**Action needed:** Verify your secrets contain Bazik.io credentials (starting with `bzk_` and `sk_`).

---

### 2. Rewrite Edge Function: `moncash-create-payment`

**File:** `supabase/functions/moncash-create-payment/index.ts`

Replace the DigiCel API calls with Bazik.io API calls:

**Authentication Flow:**
```text
Step 1: POST https://api.bazik.io/token
Body: { "userID": "bzk_xxx", "secretKey": "sk_xxx" }
Response: { "access_token": "bzk_token_xxx", ... }

Step 2: POST https://api.bazik.io/moncash/token  
Headers: Authorization: Bearer bzk_token_xxx
Body: { "amount": 500, "orderId": "EDU-XXX" }
Response: { "redirectUrl": "https://...", "referenceId": "..." }
```

**Key Changes:**
- Replace `MONCASH_ENDPOINTS` with Bazik.io base URL
- Change authentication from Basic Auth to JSON body
- Update payment creation endpoint from `/Api/v1/CreatePayment` to `/moncash/token`
- Handle Bazik.io response format

---

### 3. Update Webhook Handler (Already Correct)

The webhook handler already supports `x-bazik-signature` header - no changes needed there.

---

## Implementation Tasks

| Task | File | Action |
|------|------|--------|
| 1 | `supabase/functions/moncash-create-payment/index.ts` | **Rewrite** - Use Bazik.io API |
| 2 | Secrets | **Verify** - Ensure credentials are from Bazik dashboard |

---

## Updated Edge Function Flow

```text
┌──────────────────────────────────────────────────────────────┐
│                    moncash-create-payment                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Validate user authentication (JWT)                       │
│  2. Validate input (amount, description)                     │
│  3. Get Bazik token:                                         │
│     POST https://api.bazik.io/token                          │
│     Body: { userID, secretKey }                              │
│                                                              │
│  4. Create payment:                                          │
│     POST https://api.bazik.io/moncash/token                  │
│     Headers: Authorization: Bearer <bazik_token>             │
│     Body: { amount, orderId }                                │
│                                                              │
│  5. Store transaction in payment_transactions (pending)      │
│  6. Return redirectUrl to frontend                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Bazik.io API Reference

**Base URL:** `https://api.bazik.io`

### Authentication
```bash
POST /token
Content-Type: application/json

{
  "userID": "bzk_c5b754a0_1757383229",
  "secretKey": "sk_5b0ff521b331c73db55313dc82f17cab"
}
```

**Response:**
```json
{
  "access_token": "bzk_token_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user_id": "bzk_c5b754a0_1757383229"
}
```

### Create Payment
```bash
POST /moncash/token
Authorization: Bearer bzk_token_xxx
Content-Type: application/json

{
  "amount": 500,
  "orderId": "EDU-ML1NS6A6-ZZIJV1"
}
```

---

## Credential Verification Checklist

Before I implement, please confirm:

1. **Is your `MONCASH_CLIENT_ID` a Bazik userID?**
   - Should look like: `bzk_c5b754a0_1757383229`
   
2. **Is your `MONCASH_CLIENT_SECRET` a Bazik secretKey?**
   - Should look like: `sk_5b0ff521b331c73db55313dc82f17cab`

3. **Should `MONCASH_MODE` control sandbox vs live?**
   - Bazik.io uses a single endpoint for both
   - Mode is determined by the credentials type

---

## Safety Verification

| Check | Status | Notes |
|-------|--------|-------|
| Breaks existing functionality? | No | Updates API endpoints only |
| Works with existing data? | Yes | Same `payment_transactions` table |
| Backward compatible? | Yes | Same function interface |
| 3G optimized? | Yes | Same lightweight responses |
| Security maintained? | Yes | Same rate limiting, validation |

