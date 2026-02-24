

# Onboarding Drip Email Sequence

## Overview

Build a 3-email automated onboarding sequence for new users, triggered daily via pg_cron. Mirrors the existing `check-subscription-expiry` pattern exactly: internal secret auth, JSONB dedup tracking, service-role Supabase client.

## Changes

### Fix 1 -- Database Migration: Add tracking column

```sql
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS sent_onboarding_emails jsonb DEFAULT '[]'::jsonb;
```

Same dedup pattern as `sent_expiry_reminders`. Stores `["day1", "day3", "day7"]` as emails are sent.

### Fix 2 -- New Edge Function: `supabase/functions/check-onboarding-emails/index.ts`

Secured with `X-Internal-Secret` header (identical to `check-subscription-expiry`).

**Query target:** Profiles where `onboarding_tour_completed = true` AND `sent_onboarding_emails` does not yet contain all 3 keys. Limited to 100 per run.

**Day calculation:** Days since `onboarding_tour_completed_at`, normalized to Haiti timezone.

**Email logic per user:**

| Key | Trigger | Extra condition | Subject | CTA link |
|-----|---------|-----------------|---------|----------|
| `day1` | daysAgo >= 1 | None | "Ta premiere lecon t'attend!" | /matieres |
| `day3` | daysAgo >= 3 | No rows in `lesson_completions` for this user | "Tu n'as pas encore commence -- Jude t'attend" | /matieres |
| `day7` | daysAgo >= 7 | At least 1 row in `lesson_completions` | "Tu as complete une lecon -- essaie le Quiz Battle!" | /quiz-battle |

**Key behaviors:**
- Day 3 only sends to users who have NOT started any lesson (nudge email)
- Day 7 only sends to users who HAVE completed at least one lesson (progression email)
- Uses `getTimeAwareGreeting()` from `_shared/emailGreeting.ts`
- Uses `sendEmail()` from `_shared/emails.ts`
- Each send appends the key to `sent_onboarding_emails` JSONB array (dedup)
- Individual user failures logged and skipped (does not abort the batch)

**Email template style:**
- Purple/amber gradient header (platform brand colors)
- Footer: "Tu recois cet email car tu es inscrit sur Mon Edupreneurs"
- Same HTML table layout as subscription reminder emails

### Fix 3 -- Config entry

Add to `supabase/config.toml`:
```toml
[functions.check-onboarding-emails]
verify_jwt = false
```

### Fix 4 -- pg_cron job (data insert, not migration)

```sql
SELECT cron.schedule(
  'check-onboarding-emails',
  '15 14 * * *',
  $$
  SELECT net.http_post(
    url:='https://xdyavylcmucjpueybdku.supabase.co/functions/v1/check-onboarding-emails',
    headers:=jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Internal-Secret', current_setting('app.settings.internal_call_secret', true)
    ),
    body:='{}'::jsonb
  ) AS request_id;
  $$
);
```

Runs at 14:15 UTC = 10:15 AM Haiti time (offset from expiry check at 14:00 UTC to avoid overlap).

## Safety Verification

| Check | Status |
|-------|--------|
| Existing functionality affected? | No -- new column with default, new function, no existing code touched |
| RLS impact? | None -- column read/written via service-role client only |
| Bundle size? | Zero -- edge function only, no frontend changes |
| 3G performance? | N/A -- server-side cron, no client impact |
| Provider stack / AppShell? | Untouched |
| Backward compatibility? | Yes -- default `'[]'` means existing users start fresh |

## Files Created/Modified

1. **Migration SQL** -- adds `sent_onboarding_emails` column
2. **`supabase/functions/check-onboarding-emails/index.ts`** -- new edge function (~250 lines)
3. **`supabase/config.toml`** -- add verify_jwt entry (auto-managed, noted for completeness)
4. **Data insert SQL** -- pg_cron schedule

