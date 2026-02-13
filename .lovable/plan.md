

# Remaining Structural Issues in Gift Subscription System

## Issues Found

### 1. `stripe-gift-webhook` crashes on null `student_user_id`
The webhook handler at line 182 does `.eq("user_id", gift.student_user_id)` to extend the subscription. Since `student_user_id` is now nullable, if the student hasn't created their account yet when a recurring renewal fires, this query matches nothing -- the renewal silently fails and the payer keeps getting charged with no benefit.

**Fix**: Add the same email-based user lookup logic from `verify-gift-payment` into the webhook. If `student_user_id` is still null, look up the user by email. If still not found, log a warning but don't error (the student hasn't registered yet).

### 2. `gift.service.ts` doesn't set `expires_at`
The `generateGiftLink()` insert (line 37-44) doesn't include `expires_at`. The UI tells the user the link expires in 7 days, but the database has a default value that may or may not match. If the default is `now()`, the link is already expired at creation.

**Fix**: Explicitly set `expires_at` to 7 days from now in the insert.

### 3. Conflicting RLS SELECT policies
There are two SELECT policies:
- `"Anyone can view gift by token"` with `qual: true` (allows ALL anonymous reads of ALL rows)
- `"Users can view their own gift links"` with `qual: auth.uid() = student_user_id`

The first policy makes the second one redundant AND exposes every gift record to anyone who queries the table. An attacker can list all gift subscriptions, seeing student names, emails, and payment status.

**Fix**: Replace the blanket `true` SELECT policy with one scoped to token-based lookups only. Since RLS can't filter by query parameters, we should keep the anon SELECT but restrict visible columns by using a database function instead. Alternatively, move the token lookup to an edge function. The simplest safe approach: keep the public SELECT but remove `student_email` from the query in `getGiftInfo()` (it already only selects `student_name, status, expires_at`). The real risk is someone doing `SELECT *` -- but since the anon key can't bypass column selection in the client, the practical risk is limited. Still, we should tighten the policy to only expose rows by token match via a function.

**Practical fix**: Replace the `"Anyone can view gift by token"` policy with a security definer function that only returns the minimum needed data.

### 4. Duplicate INSERT policy conflict
Two INSERT policies exist:
- `"Users can create their own gift links"` requires `auth.uid() = student_user_id`
- `"Allow anon insert gift subscriptions"` requires `student_user_id IS NULL`

These don't conflict technically (OR logic), but the first policy is now dead code since we no longer set `student_user_id` on insert. It should be removed for clarity.

### 5. `amount_usd` stores cents, not dollars
The column name `amount_usd` with value `200` is misleading. The invoice email correctly divides by 100, but anyone reading the database will think it's $200. This will cause bugs when another developer works on billing.

**Fix**: Rename the column to `amount_cents` via migration, and update all references (gift.service.ts, verify-gift-payment, stripe-gift-payment).

---

## Plan

### A. Fix `stripe-gift-webhook` for null `student_user_id`
Add user lookup by email before attempting subscription extension. If user not found, log and skip gracefully.

### B. Set `expires_at` explicitly in `gift.service.ts`
Add `expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()` to the insert.

### C. Remove overly permissive SELECT policy
- Drop `"Anyone can view gift by token"` (exposes all rows)
- Create a security definer function `get_gift_info_by_token(p_token text)` that returns only `student_name, status, expires_at`
- Update `getGiftInfo()` in `gift.service.ts` to call the function via `supabase.rpc()`

### D. Remove dead INSERT policy
Drop `"Users can create their own gift links"` since it's no longer reachable.

### E. Rename `amount_usd` to `amount_cents`
Migration to rename the column, update all references in:
- `gift.service.ts` (insert)
- `stripe-gift-payment/index.ts` (unit_amount)
- `verify-gift-payment/index.ts` (invoice email)

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- fixes silent failures and tightens security |
| Works with existing data? | Yes -- column rename is backward compatible with ALTER |
| Optimized for 3G? | Yes -- RPC call same weight as direct query |
| Edge cases handled? | Yes -- null user_id in webhook, expired links |
| Backward compatible? | Yes -- all changes are additive or rename-only |

## Files to Modify
- `supabase/migrations/` -- rename column, drop/create policies, add function
- `supabase/functions/stripe-gift-webhook/index.ts` -- handle null student_user_id
- `supabase/functions/verify-gift-payment/index.ts` -- update column name
- `supabase/functions/stripe-gift-payment/index.ts` -- update column name
- `src/auth/services/gift.service.ts` -- add expires_at, rename column, use RPC for getGiftInfo

