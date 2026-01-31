# MonCash Integration Plan

## Status: ✅ IMPLEMENTED

All tasks have been completed:

### Completed Tasks

1. ✅ **Created `moncash-webhook` edge function**
   - File: `supabase/functions/moncash-webhook/index.ts`
   - HMAC-SHA256 signature verification
   - Updates `payment_transactions` table
   - Server-to-server only (no CORS)

2. ✅ **Updated `supabase/config.toml`**
   - Added `[functions.moncash-webhook]` with `verify_jwt = false`

3. ✅ **Created `PaymentCallback.tsx`**
   - File: `src/pages/PaymentCallback.tsx`
   - Polls `moncash-check-status` to verify payment
   - Shows loading, success, pending, or error states

4. ✅ **Added route in `App.tsx`**
   - Route: `/payment/callback`
   - Lazy-loaded with suspense fallback

5. ✅ **Wired `PaymentDemo.tsx` to real APIs**
   - Calls `moncash-create-payment` edge function
   - Redirects to MonCash portal

---

## Post-Implementation Configuration

Configure this webhook URL in the Bazik.io dashboard:

```text
https://xdyavylcmucjpueybdku.supabase.co/functions/v1/moncash-webhook
```

---

## Testing Checklist

- [ ] Test sandbox payment flow
- [ ] Verify webhook receives notifications
- [ ] Confirm database status updates
- [ ] Test callback page polling

