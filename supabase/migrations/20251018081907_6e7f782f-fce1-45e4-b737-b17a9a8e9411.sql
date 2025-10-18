-- Clean up old push subscriptions without device info
-- These are from before device tracking was implemented
DELETE FROM push_subscriptions 
WHERE device_id IS NULL OR browser IS NULL OR os IS NULL;

-- Add index for better performance on device lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_device 
ON push_subscriptions(user_id, device_id);