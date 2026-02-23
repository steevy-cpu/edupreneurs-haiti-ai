-- Add sent_expiry_reminders column to track which renewal reminder emails have been sent
-- Stores an array of reminder keys like ["7days", "3days", "0days"]
-- Resets to [] on subscription renewal to allow fresh reminders next cycle
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS sent_expiry_reminders jsonb DEFAULT '[]'::jsonb;