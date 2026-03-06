-- Backfill existing 'none' status users (post-launch, no payment, no promo) with 7-day trial
-- LEAST() ensures users who signed up long ago get at least 1 day of trial access
UPDATE profiles
SET 
  subscription_status = 'timed_free',
  has_free_access = true,
  subscription_end_date = LEAST(
    created_at + INTERVAL '7 days',
    NOW() + INTERVAL '1 day'
  )
WHERE 
  subscription_status = 'none'
  AND created_at > '2026-02-10T00:00:00Z'
  AND payment_order_id IS NULL
  AND (promo_code_used IS NULL OR promo_code_used = '');