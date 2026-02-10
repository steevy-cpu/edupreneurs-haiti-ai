

# Payment System Structural Hardening

## Issues Found

### Issue 1: `.single()` crash risk in `moncash-check-status` (HIGH)
`moncash-check-status/index.ts` line 87 uses `.single()` which throws an error if no row is found. Per project rules, this must be `.maybeSingle()`. If a user lands on the callback with a mismatched orderId, the function crashes with a Postgres error instead of returning a clean 404.

**Fix:** Replace `.single()` with `.maybeSingle()` and handle `null` result gracefully.

### Issue 2: Dead MonCash fallback code in `moncash-verify-payment` (MEDIUM)
Lines 160-218 of `moncash-verify-payment` attempt a "direct MonCash API" fallback using `clientId`/`clientSecret`. But these are **Bazik.io credentials**, not MonCash credentials. The MonCash API requires separate `client_id`/`client_secret` from the Digicel portal. This fallback will silently fail every time -- it is dead code that adds complexity and false confidence.

**Fix:** Remove the entire direct MonCash fallback block. Bazik.io is the sole payment gateway; the verify function should only use Bazik's API. If Bazik fails, return `unknown` and let the polling retry.

### Issue 3: Duplicated `getBazikToken` function (LOW)
`getBazikToken` is copy-pasted identically in `moncash-create-payment` and `moncash-verify-payment`. This violates DRY and means any future fix must be applied in two places.

**Fix:** Extract to `_shared/bazik.ts` and import from both functions.

### Issue 4: `moncash-verify-payment` has no authentication (MEDIUM)
The verify function uses `SUPABASE_SERVICE_ROLE_KEY` (admin access) and has no auth check. Any unauthenticated request can trigger payment verification and update transaction statuses. While the damage is limited (it can only mark things as completed if Bazik confirms), it's an unnecessary attack surface.

**Fix:** Add optional auth validation -- if an auth header is present, validate it. If not, still allow the call (needed for the redirect flow where the session may not be attached), but log it.

### Issue 5: Console logs left in production paths (LOW)
Both edge functions have `console.log` statements logging full payment responses including potentially sensitive data (payer phone, amounts). Per project rules, production-critical paths should minimize logging.

**Fix:** Reduce to essential status logs only, remove response body dumps.

---

## Plan

### File 1: `supabase/functions/_shared/bazik.ts` (NEW)
Extract shared Bazik utilities:
- `BAZIK_API_BASE` constant
- `getBazikToken(userID, secretKey)` function
- `getMonCashCredentials(mode)` helper that returns the correct client ID and secret key based on mode

### File 2: `supabase/functions/moncash-create-payment/index.ts`
- Import `getBazikToken` and `getMonCashCredentials` from `_shared/bazik.ts`
- Remove local `getBazikToken` function
- Remove local credential selection logic (replaced by shared helper)

### File 3: `supabase/functions/moncash-verify-payment/index.ts`
- Import `getBazikToken` and `getMonCashCredentials` from `_shared/bazik.ts`
- Remove local `getBazikToken` function
- **Remove the entire direct MonCash API fallback block** (lines 160-218) -- dead code
- Remove local credential selection logic
- Clean up excessive console.log statements

### File 4: `supabase/functions/moncash-check-status/index.ts`
- Change `.single()` to `.maybeSingle()` on line 87
- Handle `null` transaction with a proper 404 response

### No changes needed:
- `PaymentCallback.tsx` -- the recent fixes (referenceId priority, useRef for single verification) are solid
- `PaymentDemo.tsx` -- the "J'ai deja paye" button correctly passes our internal `orderId` which PaymentCallback reads via the fallback path

---

## Safety Verification

| Check | Result |
|-------|--------|
| Breaks existing functionality? | No -- only removing dead code and fixing crash risk |
| Works with existing data? | Yes -- no schema changes |
| Backward compatible? | Yes |
| 3G optimized? | Yes -- removing dead fallback code reduces edge function execution time |
| Edge cases handled? | Yes -- `.maybeSingle()` handles missing transactions gracefully |

