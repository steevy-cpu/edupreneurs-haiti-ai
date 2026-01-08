-- Add hardware_fingerprint column for browser-agnostic device matching
ALTER TABLE user_trusted_devices 
ADD COLUMN IF NOT EXISTS hardware_fingerprint TEXT;

-- Create index for faster lookups by hardware fingerprint
CREATE INDEX IF NOT EXISTS idx_user_trusted_devices_hardware_fingerprint 
ON user_trusted_devices(user_id, hardware_fingerprint);