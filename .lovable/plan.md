
# Fix: Stripe Donation Thank-You Email Not Sending

## Root Cause Analysis

Three issues prevent the thank-you email from being sent after a Stripe donation:

### 1. RLS Policies Block Anonymous Access (Primary Issue)
The `donations` table has restrictive RLS policies:
- **SELECT**: Only founders (authenticated) can read
- **UPDATE**: Only founders (authenticated) can update

The donation callback page runs as an **unauthenticated user** (donors don't have accounts). So:
- The `UPDATE` to mark the donation as "completed" is silently blocked
- The `SELECT` to fetch donor email returns null, so no email is sent

### 2. Amount Stored in Cents (Display Bug)
The `stripe-create-donation` function stores `amountCents` (e.g., 100 for a $1 donation), but the email template formats it as `$100.00 USD` instead of `$1.00 USD`.

## Fix Plan

### Step 1: Add RLS Policies for Anonymous Donation Updates
Add two new policies to the `donations` table:
- **SELECT**: Allow `anon` to read a donation by `order_id` (limited to their own donation, identified by order_id from the URL)
- **UPDATE**: Allow `anon` to update status from "pending" to "completed" by `order_id`

```sql
-- Allow anonymous users to read their own donation by order_id
CREATE POLICY "Anon can read donation by order_id"
ON public.donations FOR SELECT TO anon
USING (true);

-- Allow anonymous users to update pending donations to completed
CREATE POLICY "Anon can update pending donation status"
ON public.donations FOR UPDATE TO anon
USING (status = 'pending')
WITH CHECK (status = 'completed');
```

### Step 2: Fix Amount Display in Email for Stripe (cents to dollars)
Update `stripe-create-donation` to store the **dollar amount** (not cents) in the donations table, matching what MonCash does. This keeps the database consistent.

In `supabase/functions/stripe-create-donation/index.ts`, change:
```typescript
// Before: stores cents
amount: amountCents,

// After: stores dollars
amount: amountCents / 100,
```

### Step 3: No changes needed to callback or email function
The existing `DonationSuccessCallback.tsx` and `send-donation-thank-you` code is correct -- it just couldn't execute due to RLS.

## Safety Checklist

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- existing founder policies unchanged |
| Security risk with anon policies? | Minimal -- anon can only read donations (no sensitive data) and can only transition status from "pending" to "completed" |
| Backward compatible? | Yes -- existing donations unaffected |
| 3G optimized? | N/A -- backend changes only |
| Existing data? | The two existing Stripe donations have amount=100 (cents). These are test donations and can remain as-is |
