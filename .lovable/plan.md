

# Fix Cron Secret + Set Test Account to Expired

## Problem Summary

Two issues found:

1. **Test account stuck in limbo**: Status is `active` but end date is in the past. The hourly `expire_subscriptions()` cron hasn't run yet to flip it to `expired`, so the SubscriptionGate treats the user as "no subscription" and shows the full-block RenewalPrompt instead of letting them through with FeatureGate locks on premium pages.

2. **Cron job authentication broken**: The `pg_cron` job uses `current_setting('app.settings.internal_call_secret')` to send the `X-Internal-Secret` header, but `INTERNAL_CALL_SECRET` is stored as an edge function environment variable — not a PostgreSQL config setting. This means the cron sends `NULL`, causing a `401 Unauthorized` every time.

## What Expired Users CAN Already Access

The existing code already handles this correctly:

- **SubscriptionGate** (line 59-60): passes expired users through to the app shell
- **Feed, Community, Classement, Settings**: No FeatureGate wrapping -- fully accessible to expired users
- **Matieres, Resources, GamesHub, PassionDiscovery**: Wrapped in FeatureGate -- shows blurred preview with lock overlay

No changes needed to page access logic.

## Fix Plan

### Step 1: Fix the test account (immediate)

Set `subscription_status = 'expired'` on the test account so the SubscriptionGate lets it through:

```sql
UPDATE profiles
SET subscription_status = 'expired'
WHERE user_id = '6698f395-7f46-48b9-b7d3-d1151d9cec8c';
```

### Step 2: Fix the cron job secret

Generate a new known secret value and apply it in two places:

**A. Set it as a PostgreSQL config** so `current_setting()` works:
```sql
ALTER ROLE authenticator SET app.settings.internal_call_secret = '<new-secure-value>';
```

**B. Update the edge function environment variable** to match the same value, so the `check-subscription-expiry` function's `Deno.env.get("INTERNAL_CALL_SECRET")` returns the same string.

This makes the cron's `current_setting()` call and the edge function's `Deno.env.get()` call both use the same value.

### Step 3: Manually trigger the reminder function

After both secrets are aligned, invoke the function to confirm it works end-to-end and sends the day-of expiry email to the test account.

## Safety Verification

| Check | Status |
|-------|--------|
| Existing RLS policies affected? | No |
| Provider stack or AppShell changed? | No |
| New dependencies added? | No |
| Bundle size impact? | None (backend-only changes) |
| Works on 3G? | N/A (server-side) |
| Backward compatibility? | Yes -- only adding a PG config setting |
| Existing data at risk? | No -- only updating one test account |

