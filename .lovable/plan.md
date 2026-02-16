

# Fix: RLS Policy Blocking Renewal Gift Link Creation

## Root Cause

The `gift_subscriptions` table has an INSERT RLS policy that **requires `student_user_id IS NULL`**:

```sql
-- Current policy (blocks authenticated renewal links)
CREATE POLICY "Allow anon insert gift subscriptions" ON gift_subscriptions
  FOR INSERT WITH CHECK (
    student_user_id IS NULL 
    AND student_email IS NOT NULL 
    AND check_gift_rate_limit(student_email)
  );
```

This was intentionally designed for the signup flow where the user doesn't exist yet. But `RenewalGiftLink.tsx` passes `user.id` as `studentUserId`, so the insert fails with error code `42501`.

## Fix

Add a second INSERT policy that allows **authenticated users to create gift links for themselves**:

```sql
CREATE POLICY "Authenticated users can create own gift links"
  ON gift_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_user_id = auth.uid()
    AND student_email IS NOT NULL
  );
```

This is secure because:
- Only authenticated users can use it (role = `authenticated`)
- Users can only create links for their own account (`student_user_id = auth.uid()`)
- The existing anonymous policy remains unchanged for signup flow
- No rate limit needed here since authentication itself is the gate

## Changes

| Item | Action |
|---|---|
| Database migration | Add one new RLS policy on `gift_subscriptions` |

No code changes needed -- the services and components are already correct. The only blocker was this missing policy.

## Safety Verification

| Check | Result |
|---|---|
| Breaks anonymous signup gift links? | No -- existing policy untouched |
| Security risk? | No -- users can only insert for their own `auth.uid()` |
| Works with existing data? | Yes -- additive policy only |
| Backward compatible? | Yes |

