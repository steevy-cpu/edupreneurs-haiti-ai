
-- Fix 1A: Create atomic rate limit check-and-increment function
-- Replaces the TOCTOU-vulnerable SELECT→INSERT/UPDATE pattern with a single atomic UPSERT
CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_key TEXT,
  p_window_seconds INT,
  p_max_requests INT
)
RETURNS TABLE(request_count INT, allowed BOOLEAN, expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_row RECORD;
BEGIN
  -- Single atomic UPSERT: eliminates TOCTOU race condition
  -- ON CONFLICT handles concurrent first-requests safely
  INSERT INTO rate_limits (key, request_count, window_start, expires_at)
  VALUES (
    p_key,
    1,
    now(),
    now() + (p_window_seconds || ' seconds')::interval
  )
  ON CONFLICT (key) DO UPDATE SET
    -- If window expired, reset; otherwise increment
    request_count = CASE
      WHEN rate_limits.expires_at < now() THEN 1
      ELSE rate_limits.request_count + 1
    END,
    window_start = CASE
      WHEN rate_limits.expires_at < now() THEN now()
      ELSE rate_limits.window_start
    END,
    expires_at = CASE
      WHEN rate_limits.expires_at < now()
        THEN now() + (p_window_seconds || ' seconds')::interval
      ELSE rate_limits.expires_at
    END
  RETURNING rate_limits.request_count, rate_limits.expires_at
  INTO v_row;

  -- Return result with allowed flag computed from the post-upsert count
  RETURN QUERY SELECT
    v_row.request_count,
    (v_row.request_count <= p_max_requests),
    v_row.expires_at;
END;
$$;

-- Fix 1B: Drop redundant index (unique constraint rate_limits_key_key already covers lookups)
DROP INDEX IF EXISTS idx_rate_limits_key;

-- Fix 1C: Purge all expired rows immediately
DELETE FROM rate_limits WHERE expires_at < now();
