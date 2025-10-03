-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

-- Create a function to create conversations that bypasses RLS
CREATE OR REPLACE FUNCTION public.create_conversation()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_conversation_id uuid;
BEGIN
  -- Only allow authenticated users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Insert the conversation
  INSERT INTO public.conversations (id, created_at, updated_at)
  VALUES (gen_random_uuid(), now(), now())
  RETURNING id INTO new_conversation_id;

  RETURN new_conversation_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_conversation() TO authenticated;