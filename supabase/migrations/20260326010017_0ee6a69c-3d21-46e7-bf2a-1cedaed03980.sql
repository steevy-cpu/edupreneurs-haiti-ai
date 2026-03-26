-- Update all 4 pg_cron jobs to use get_internal_secret() from app_internal_config table
-- instead of current_setting('app.settings.internal_call_secret') which returns NULL

-- Job 4: check-onboarding-emails
SELECT cron.alter_job(
  4,
  command := $CMD$
  SELECT net.http_post(
    url:='https://xdyavylcmucjpueybdku.supabase.co/functions/v1/check-onboarding-emails',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Internal-Secret', public.get_internal_secret()
    ),
    body:='{}'::jsonb
  ) AS request_id;
  $CMD$
);

-- Job 3: check-subscription-expiry
SELECT cron.alter_job(
  3,
  command := $CMD$
  SELECT net.http_post(
    url:='https://xdyavylcmucjpueybdku.supabase.co/functions/v1/check-subscription-expiry',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Internal-Secret', public.get_internal_secret()
    ),
    body:='{}'::jsonb
  ) AS request_id;
  $CMD$
);

-- Job 6: check-jude-motivations
SELECT cron.alter_job(
  6,
  command := $CMD$
  SELECT net.http_post(
    url := 'https://xdyavylcmucjpueybdku.supabase.co/functions/v1/check-jude-motivations',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-secret', public.get_internal_secret()
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $CMD$
);

-- Job 7: daily-word-notification
SELECT cron.alter_job(
  7,
  command := $CMD$
  SELECT net.http_post(
    url := 'https://xdyavylcmucjpueybdku.supabase.co/functions/v1/send-daily-word-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-secret', public.get_internal_secret()
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $CMD$
);