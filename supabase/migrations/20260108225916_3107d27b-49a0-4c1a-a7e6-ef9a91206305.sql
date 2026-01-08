-- Add column to track avatar regeneration timing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_avatar_generated_at TIMESTAMP WITH TIME ZONE;