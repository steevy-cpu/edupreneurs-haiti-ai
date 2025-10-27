-- Add last_seen column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN last_seen timestamp with time zone DEFAULT now();

-- Create index for better query performance
CREATE INDEX idx_profiles_last_seen ON public.profiles(last_seen);

-- Create function to update last_seen
CREATE OR REPLACE FUNCTION public.update_user_last_seen()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.last_seen = now();
  RETURN NEW;
END;
$$;

-- Note: We'll update last_seen from the application code when user goes offline
-- RLS policies already allow users to update their own profile