

# Switch Between Sandbox and Live MonCash Credentials

## Overview
Add separate sandbox secrets (`MONCASH_SANDBOX_CLIENT_ID` and `MONCASH_SANDBOX_SECRET_KEY`) and use the existing `MONCASH_MODE` secret to toggle which credentials the edge functions use.

## Step 1: Add Sandbox Secrets
You'll be prompted to enter two new secrets:
- **MONCASH_SANDBOX_CLIENT_ID** -- your Bazik sandbox userID (e.g., `bzk_sandbox_xxx`)
- **MONCASH_SANDBOX_SECRET_KEY** -- your Bazik sandbox secretKey (e.g., `sk_sandbox_xxx`)

## Step 2: Update Edge Functions

Both `moncash-create-payment` and `moncash-verify-payment` will be updated to read `MONCASH_MODE` and pick the right credentials:

```typescript
const mode = Deno.env.get('MONCASH_MODE') || 'sandbox';

const userID = mode === 'sandbox'
  ? Deno.env.get('MONCASH_SANDBOX_CLIENT_ID')
  : Deno.env.get('MONCASH_CLIENT_ID');

const secretKey = mode === 'sandbox'
  ? Deno.env.get('MONCASH_SANDBOX_SECRET_KEY')
  : Deno.env.get('MONCASH_SECRET_KEY');
```

## How to Switch Modes
- Set `MONCASH_MODE` to `sandbox` for testing with fake money
- Set `MONCASH_MODE` to `live` for real payments
- No code changes needed -- just update the one secret value

## Files Changed
1. `supabase/functions/moncash-create-payment/index.ts` -- credential selection logic
2. `supabase/functions/moncash-verify-payment/index.ts` -- credential selection logic

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- live credentials remain untouched |
| Works with existing data? | Yes |
| Backward compatible? | Yes -- defaults to sandbox if MONCASH_MODE not set |
| 3G optimized? | N/A -- backend only |

