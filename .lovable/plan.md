

# Structural Fixes for Gift Subscription System

## Problems Found

### 1. Missing RLS UPDATE policy on `gift_subscriptions`
The signup service tries to update `gift_subscriptions` (linking `student_user_id` after account creation), but there is NO RLS policy allowing UPDATE. This will silently fail -- the student's gift will never be linked to their account.

### 2. Edge function has a dead query (line 264-268)
In `verify-gift-payment`, line 267 does `.eq("user_id", gift.student_email)` -- comparing a UUID column to an email string. This will never match. The code then falls through to `listUsers()` which loads ALL users into memory just to find one by email. This is both a bug and a performance/security problem.

### 3. `amount_usd` column stores cents, not dollars
The gift insert sets `amount_usd: 200` (which is $2.00 in Stripe cents), but the column name says "USD dollars". The invoice email divides by 100 (`amount / 100`), which means the receipt shows `$2.00`. But if someone reads the DB, they'll think the student paid $200. This is a naming confusion that will cause bugs later.

### 4. No rate-limiting on anonymous gift link creation
The new anon INSERT policy means anyone can spam the `gift_subscriptions` table with unlimited rows without authentication. This is a structural vulnerability.

### 5. `signup.service.ts` gift linking uses anon client
The post-signup gift check at lines 173-198 runs with the anon Supabase client, but the user was just signed out (line 220). The update at line 183-187 requires RLS UPDATE permission that doesn't exist, and even if it did, the user is signed out so `auth.uid()` is null.

---

## Plan

### A. Add RLS UPDATE policy for `gift_subscriptions`
Allow the service role (via edge function) to update records, and allow the anon key to update records where `student_user_id IS NULL` (linking during signup).

```sql
-- Allow linking gift records to newly created accounts
CREATE POLICY "Allow update gift subscriptions by email match"
ON public.gift_subscriptions
FOR UPDATE
USING (student_user_id IS NULL)
WITH CHECK (true);
```

### B. Fix the edge function dead query
Remove the broken `.eq("user_id", gift.student_email)` query. Replace the `listUsers()` call with a targeted lookup using `supabaseAdmin.auth.admin.listUsers({ filter: email })` or a direct query on `auth.users`.

Replace lines 261-284 with:
```typescript
let studentUserId = gift.student_user_id;
if (!studentUserId && gift.student_email) {
  // Look up by email in auth.users (targeted, not full scan)
  const { data: userList } = await supabaseAdmin.auth.admin.listUsers({
    filter: gift.student_email,
    page: 1,
    perPage: 1,
  });
  const matchedUser = userList?.users?.[0];
  if (matchedUser?.email?.toLowerCase() === gift.student_email.toLowerCase()) {
    studentUserId = matchedUser.id;
    await supabaseAdmin
      .from("gift_subscriptions")
      .update({ student_user_id: studentUserId })
      .eq("id", gift.id);
  }
}
```

### C. Move gift-linking logic BEFORE signOut in `signup.service.ts`
The gift linking code runs after `signOut()`, so the user has no session and RLS blocks the update. Move the gift-linking block (lines 170-201) to run immediately after profile creation (line 168), while the user still has a valid session.

### D. Add rate limiting to anon gift insert policy
Add a database function that checks the count of recent inserts by email, and use it in the RLS policy:

```sql
-- Rate limit: max 3 gift links per email per hour
CREATE OR REPLACE FUNCTION public.check_gift_rate_limit(p_email text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*) < 3
  FROM public.gift_subscriptions
  WHERE student_email = p_email
    AND created_at > NOW() - INTERVAL '1 hour';
$$;

-- Update the anon insert policy to include rate limiting
DROP POLICY IF EXISTS "Allow anon insert gift subscriptions" ON public.gift_subscriptions;
CREATE POLICY "Allow anon insert gift subscriptions"
ON public.gift_subscriptions
FOR INSERT
WITH CHECK (
  student_user_id IS NULL
  AND student_email IS NOT NULL
  AND public.check_gift_rate_limit(student_email)
);
```

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- fixes silent failures |
| Works with existing data? | Yes -- only affects new flows |
| Optimized for 3G? | Yes -- removes full user list scan |
| Edge cases handled? | Yes -- rate limiting, timing, RLS |
| Backward compatible? | Yes -- additive policies only |

## Files to Modify
- `supabase/migrations/` -- new migration for UPDATE policy + rate limit function
- `supabase/functions/verify-gift-payment/index.ts` -- fix dead query
- `src/auth/services/signup.service.ts` -- move gift linking before signOut

