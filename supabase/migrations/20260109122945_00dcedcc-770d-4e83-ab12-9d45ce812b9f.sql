-- Final Fix: Remove anonymous access to profiles table entirely
-- Leaderboard functionality should use the leaderboard_profiles view with a SECURITY DEFINER function

-- Step 1: Drop the problematic anonymous policy
DROP POLICY IF EXISTS "Anonymous can view basic profiles for leaderboard" ON public.profiles;

-- Step 2: Create a security definer function that returns only safe leaderboard data
-- This allows anonymous access to leaderboard data without exposing the profiles table
CREATE OR REPLACE FUNCTION public.get_leaderboard_profiles(limit_count INTEGER DEFAULT 100)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  nickname TEXT,
  avatar_url TEXT,
  academic_grade TEXT,
  gold_earned INTEGER,
  affiliation_points INTEGER,
  verified BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.nickname,
    p.avatar_url,
    p.academic_grade,
    p.gold_earned,
    p.affiliation_points,
    p.verified,
    p.created_at
  FROM profiles p
  WHERE (p.is_system_account IS NULL OR p.is_system_account = false)
  ORDER BY p.gold_earned DESC
  LIMIT limit_count;
$$;

-- Step 3: Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.get_leaderboard_profiles(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_profiles(INTEGER) TO authenticated;

-- Step 4: Also create a function to get a single public profile (safe fields only)
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  nickname TEXT,
  avatar_url TEXT,
  academic_grade TEXT,
  gold_earned INTEGER,
  affiliation_points INTEGER,
  verified BOOLEAN,
  bio TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.nickname,
    p.avatar_url,
    p.academic_grade,
    p.gold_earned,
    p.affiliation_points,
    p.verified,
    p.bio,
    p.created_at
  FROM profiles p
  WHERE p.user_id = profile_user_id
  AND (p.is_system_account IS NULL OR p.is_system_account = false);
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_public_profile(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.get_public_profile(UUID) TO authenticated;