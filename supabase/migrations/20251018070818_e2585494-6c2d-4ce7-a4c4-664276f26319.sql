-- Phase 1: Database Schema Updates for Push Notifications

-- 1.1 Update push_subscriptions table to support multiple devices per user
ALTER TABLE push_subscriptions DROP CONSTRAINT IF EXISTS push_subscriptions_user_id_key;

-- Add device tracking columns
ALTER TABLE push_subscriptions 
ADD COLUMN IF NOT EXISTS device_id TEXT,
ADD COLUMN IF NOT EXISTS browser TEXT,
ADD COLUMN IF NOT EXISTS os TEXT,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ DEFAULT NOW();

-- Create unique index for user + device combination
CREATE UNIQUE INDEX IF NOT EXISTS push_subscriptions_user_device_idx 
ON push_subscriptions(user_id, device_id);

-- Update timestamp on subscription updates
CREATE OR REPLACE FUNCTION update_push_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_used_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_push_subscription_last_used
BEFORE UPDATE ON push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_push_subscription_timestamp();

-- 1.2 Create notification_preferences table for user category toggles
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('message', 'comment', 'like', 'post', 'mention', 'follow', 'group')),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Enable RLS on notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view own preferences" 
ON notification_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" 
ON notification_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" 
ON notification_preferences FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" 
ON notification_preferences FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger to update updated_at on notification_preferences
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- 1.3 Add notification read tracking via API
-- (notifications table already exists with read column, no changes needed)

-- 1.4 Create helper function to get user notification preferences
CREATE OR REPLACE FUNCTION get_notification_preference(p_user_id UUID, p_category TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_enabled BOOLEAN;
BEGIN
  SELECT enabled INTO v_enabled
  FROM notification_preferences
  WHERE user_id = p_user_id AND category = p_category;
  
  -- If no preference set, default to true
  RETURN COALESCE(v_enabled, true);
END;
$$;