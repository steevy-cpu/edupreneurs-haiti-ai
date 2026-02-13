

# Fix: Remove Authentication Requirement from Gift Link Generation

## Problem
The "Famille" tab in signup Step 3 calls `generateGiftLink()` which requires an authenticated user (`supabase.auth.getUser()`). But the account is only created **after** Step 3 is submitted. This makes it impossible to generate a gift link during signup.

## Solution
Generate gift links without authentication during signup, using only the student's name and email from the form. After the account is created and verified, link the gift subscription to the new user.

## Changes

### 1. Database Migration
- Make `student_user_id` **nullable** in `gift_subscriptions` table
- This allows creating a gift record before the account exists

### 2. Update `gift.service.ts` - `generateGiftLink()`
- Remove the `supabase.auth.getUser()` call entirely
- Insert into `gift_subscriptions` with `student_user_id: null` and rely on `student_email` to link later
- Use the student's name and email passed from the signup form (already available from `getSignupProgress()`)

### 3. Update `verify-gift-payment` Edge Function
- When a gift payment is completed and `student_user_id` is null, look up the student by `student_email` in the `profiles` table
- If found, update the gift record with the correct `student_user_id` and activate the subscription
- If the student hasn't created their account yet, mark payment as completed but leave activation pending

### 4. Update `GiftLinkTab.tsx`
- Remove the error about needing to be connected
- Keep the existing name/email validation from signup progress (already works)

### 5. Add Account Creation Hook
- After successful account creation in `signup.service.ts`, check for any pending completed gift payments matching the student's email
- If found, automatically activate the student's subscription

---

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- existing gift links with user IDs still work |
| Works with existing data? | Yes -- only new rows will have null user_id |
| Optimized for 3G? | Yes -- removes an unnecessary auth call |
| Edge cases handled? | Yes -- handles both "paid before signup" and "paid after signup" |
| Backward compatible? | Yes -- nullable column, old records unaffected |

---

## Technical Details

**Migration SQL:**
```sql
ALTER TABLE public.gift_subscriptions 
ALTER COLUMN student_user_id DROP NOT NULL;
```

**Updated `generateGiftLink` flow:**
1. Generate token client-side (no auth needed)
2. Insert row with `student_user_id: null`, `student_email`, `student_name`
3. Return the gift URL

**Post-payment linking (two paths):**
- **Path A**: Student creates account first, then family pays -- `verify-gift-payment` looks up user by email and activates
- **Path B**: Family pays first, then student creates account -- `signup.service.ts` checks for completed gifts and activates on account creation
