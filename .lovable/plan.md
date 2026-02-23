

# Migrate Existing Free Access Users to Timed Expiry

## What This Does

Set `subscription_end_date = '2026-05-02T00:00:00.000Z'` on all existing free access users who don't already have an end date, while explicitly excluding the two founder accounts.

## SQL to Execute (Data Update)

```sql
UPDATE profiles
SET subscription_end_date = '2026-05-02T00:00:00.000Z'
WHERE has_free_access = true
  AND subscription_end_date IS NULL
  AND user_id NOT IN (
    '0de08330-4183-48f9-b169-19b92f4d114f',
    '7580cd10-e18c-4b2f-ac50-def28d046c9d'
  );
```

## Safety

- Founders excluded via `NOT IN` clause
- Only touches rows where `subscription_end_date IS NULL` (no double-write risk)
- Does NOT change `has_free_access` or `subscription_status` -- only adds the expiry date
- After this, these users will see the amber info card in Settings instead of the green permanent card
- The hourly `expire_subscriptions()` cron will auto-expire them after May 2, 2026

## Post-Migration Verification

Query to confirm the update and verify founders were untouched:

```sql
-- Check updated users
SELECT user_id, has_free_access, subscription_end_date, subscription_status
FROM profiles
WHERE has_free_access = true;
```

