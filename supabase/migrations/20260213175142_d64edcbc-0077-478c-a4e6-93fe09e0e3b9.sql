-- Drop the old 2-param overload of verify_email_code
-- The new 7-param version (with DEFAULT params) handles 2-param calls automatically
DROP FUNCTION IF EXISTS public.verify_email_code(uuid, text);