-- Create table to store trusted devices for smart login notifications
CREATE TABLE public.user_trusted_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_fingerprint text NOT NULL,
  device_name text,
  browser text,
  os text,
  ip_address text,
  last_login_at timestamptz DEFAULT now(),
  first_login_at timestamptz DEFAULT now(),
  is_trusted boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, device_fingerprint)
);

-- Enable RLS
ALTER TABLE public.user_trusted_devices ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only manage their own devices
CREATE POLICY "Users can view their own devices" 
ON public.user_trusted_devices
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices" 
ON public.user_trusted_devices
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices" 
ON public.user_trusted_devices
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices" 
ON public.user_trusted_devices
FOR DELETE USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX idx_user_trusted_devices_user_fingerprint 
ON public.user_trusted_devices(user_id, device_fingerprint);