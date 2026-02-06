-- Create RPC function to persist last_seen timestamp
-- This is called explicitly by the frontend on presence lifecycle events

CREATE OR REPLACE FUNCTION public.persist_last_seen(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE profiles 
  SET last_seen = now() 
  WHERE user_id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.persist_last_seen(UUID) TO authenticated;