

# Test Subscription Expiry Banner

## Current State
- **User**: Test02 (`celestinsteeve80@gmail.com`)
- **user_id**: `96a8e5bc-09bb-48a8-b8a0-86d1c853a492`
- **has_free_access**: `true` (bypasses all subscription checks)
- **subscription_status**: `none`
- **subscription_end_date**: `null`

## Changes Needed (Data Update)

Run the following SQL update on the `profiles` table:

```sql
UPDATE profiles
SET 
  has_free_access = false,
  subscription_status = 'active',
  subscription_end_date = NOW() + INTERVAL '6 hours'
WHERE user_id = '96a8e5bc-09bb-48a8-b8a0-86d1c853a492';
```

This sets the subscription to expire in **6 hours**, which will:
- Trigger the **urgent** (red) banner since it's less than 3 days away
- Show a countdown like **"0j 6h 0m"**
- The "Renouveler" button will invoke the MonCash payment flow

## What to Expect
1. Log in with `celestinsteeve80@gmail.com`
2. A **red banner** appears at the top: "Votre abonnement expire dans 0j Xh Xm"
3. The banner has a "Renouveler" button that triggers MonCash payment
4. The "X" dismiss button hides it for 24 hours

## Reverting After Testing
To restore the account to its original state:
```sql
UPDATE profiles
SET 
  has_free_access = true,
  subscription_status = 'none',
  subscription_end_date = NULL
WHERE user_id = '96a8e5bc-09bb-48a8-b8a0-86d1c853a492';
```

