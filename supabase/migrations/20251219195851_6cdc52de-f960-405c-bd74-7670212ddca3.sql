-- Add unique constraint to prevent duplicate goals for the same user, type, and start date
-- This prevents the same weekly goal from being created multiple times

-- First, clean up any existing duplicates by keeping only the most recent goal per user/type/date
DELETE FROM user_goals a
USING user_goals b
WHERE a.id < b.id
  AND a.user_id = b.user_id
  AND a.goal_type = b.goal_type
  AND a.start_date = b.start_date;

-- Create unique constraint on user_id, goal_type, and start_date
ALTER TABLE user_goals 
ADD CONSTRAINT unique_user_goal_per_period 
UNIQUE (user_id, goal_type, start_date);