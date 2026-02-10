

# Fix MonCash/Bazik.io Integration Bugs

## Critical Issues Found

Comparing the current code against the Bazik API documentation you provided, there are **2 critical bugs** that would prevent payments from working:

### Bug 1: Payment Response Parsing (CRITICAL)

The Bazik API returns payment data nested inside a `data` object:

```text
Actual Bazik response:
{
  "success": true,
  "data": {
    "userID": "bzk_...",
    "referenceId": "...",
    "orderId": "BZK_production_...",
    "redirectUrl": "https://moncashbutton.digicelgroup.com/...",
    "receiver": "95"
  }
}

Current code reads:  data.redirectUrl        --> undefined
Should read:         data.data.redirectUrl   --> correct URL
```

This means **every payment attempt fails** with "No redirect URL received from Bazik.io".

### Bug 2: Token Response Field Order (Minor)

The docs show the token comes as `access_token`. Current code checks `data.token || data.access_token` -- should prioritize `access_token` first.

### Bug 3: Unsupported Parameters

The code sends `successUrl` and `errorUrl` to `/moncash/token`, but the Bazik docs only show `gdes`, `description`, and `referenceId` as accepted fields. These extra params are likely silently ignored by Bazik.

This means **after payment on MonCash, the user won't be redirected back to your app** -- they'll stay on the MonCash page. We need to handle this differently.

## Fix Plan

### File: `supabase/functions/moncash-create-payment/index.ts`

**Change 1 -- Fix `getBazikToken` (line 51):**
- Change token extraction order to `data.access_token || data.token`

**Change 2 -- Fix `createBazikPayment` function:**
- Remove `successUrl` and `errorUrl` parameters (not supported by Bazik API)
- Only send `gdes`, `description`, `referenceId` in the request body
- Fix response parsing to read from `data.data.redirectUrl` (nested `data` object)
- Extract `data.data.orderId` for the Bazik order ID

**Change 3 -- Remove callback URL construction (lines 202-205):**
- Remove the `successUrl`/`errorUrl` building code since Bazik doesn't support them

### File: `src/pages/PaymentDemo.tsx`

**Change 4 -- Add post-redirect instructions:**
- Since MonCash won't redirect back automatically, update the processing step text to tell users to return to the app after paying
- Add a "J'ai deja paye" (I already paid) button that navigates to `/payment/callback?orderId=XXX`
- Store the orderId in state when payment is created so we can build the callback URL

### File: `src/pages/PaymentCallback.tsx`

No changes needed -- it already polls the database correctly.

## Summary of Changes

| File | Change | Impact |
|------|--------|--------|
| `moncash-create-payment/index.ts` | Fix `data.data.redirectUrl` parsing | Payments will actually get redirect URLs |
| `moncash-create-payment/index.ts` | Remove unsupported `successUrl`/`errorUrl` params | Cleaner API call |
| `moncash-create-payment/index.ts` | Fix token field priority | Correct token extraction |
| `PaymentDemo.tsx` | Add "I already paid" return flow | Users can verify payment after MonCash |

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- fixes broken functionality |
| Works with existing data? | Yes -- no DB changes |
| 3G optimized? | Yes -- no new network calls |
| Backward compatible? | Yes -- same DB schema |
| Edge cases? | MonCash redirect handled; user can manually return |

