-- Phase 1: Clean up orphaned follow records
-- Delete follows where follower doesn't exist in profiles
DELETE FROM follows 
WHERE follower_id NOT IN (SELECT user_id FROM profiles);

-- Delete follows where following user doesn't exist in profiles
DELETE FROM follows 
WHERE following_id NOT IN (SELECT user_id FROM profiles);

-- Phase 2: Create cleanup trigger for future data integrity
-- Create function to clean up follows on profile deletion
CREATE OR REPLACE FUNCTION public.cleanup_follows_on_profile_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete all follows where this user was a follower
  DELETE FROM follows WHERE follower_id = OLD.user_id;
  -- Delete all follows where this user was being followed
  DELETE FROM follows WHERE following_id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach trigger to profiles table
DROP TRIGGER IF EXISTS on_profile_delete_cleanup_follows ON profiles;
CREATE TRIGGER on_profile_delete_cleanup_follows
BEFORE DELETE ON profiles
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_follows_on_profile_delete();