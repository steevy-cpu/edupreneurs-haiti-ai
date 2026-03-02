
-- Activity-based streak trigger: fires BEFORE UPDATE of gold_earned on profiles.
-- Replaces login-based edge function call with automatic DB-level streak tracking.

CREATE OR REPLACE FUNCTION public.update_streak_on_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := CURRENT_DATE;
  v_last_date date;
  v_current_streak integer;
  v_longest_streak integer;
  v_freeze_count integer;
  v_new_streak integer;
  v_milestone RECORD;
BEGIN
  -- Only fire when gold_earned actually increased
  IF NEW.gold_earned <= OLD.gold_earned THEN
    RETURN NEW;
  END IF;

  -- Skip founders — no streak tracking for platform owners
  IF public.is_founder(NEW.user_id) THEN
    RETURN NEW;
  END IF;

  -- Idempotent guard — already updated streak today, skip recalculation
  IF NEW.last_activity_date = v_today THEN
    RETURN NEW;
  END IF;

  v_last_date := NEW.last_activity_date;
  v_current_streak := COALESCE(NEW.current_streak, 0);
  v_longest_streak := COALESCE(NEW.longest_streak, 0);
  v_freeze_count := COALESCE(NEW.streak_freeze_count, 0);

  -- Determine new streak value based on gap since last activity
  IF v_last_date = v_today - INTERVAL '1 day' THEN
    -- Consecutive day — increment streak
    v_new_streak := v_current_streak + 1;
  ELSIF v_last_date IS NULL THEN
    -- First ever activity — start at 1
    v_new_streak := 1;
  ELSIF v_last_date = v_today - INTERVAL '2 days' AND v_freeze_count > 0 THEN
    -- Missed exactly 1 day with freeze available — protect streak
    v_new_streak := v_current_streak;
    NEW.streak_freeze_count := v_freeze_count - 1;
  ELSE
    -- Missed day(s), no freeze — reset to 1
    v_new_streak := 1;
  END IF;

  -- Apply streak fields atomically on the same row (BEFORE trigger)
  NEW.current_streak := v_new_streak;
  NEW.longest_streak := GREATEST(v_longest_streak, v_new_streak);
  NEW.last_activity_date := v_today;

  -- Check and award milestones inline (mirrors STREAK_MILESTONES from streakConstants.ts)
  FOR v_milestone IN
    SELECT days, badge_title, badge_icon_url, freeze_reward
    FROM (VALUES
      (3,   'Débutant',    'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/sprout.gif',  0),
      (7,   'Guerrier',    'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/sword.gif',   1),
      (14,  'Persévérant', 'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/shield.gif',  0),
      (30,  'Conquérant',  'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/crown.gif',   1),
      (60,  'Champion',    'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/trophy.gif',  1),
      (100, 'Légende',     'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/star.gif',    1),
      (365, 'Immortel',    'https://xdyavylcmucjpueybdku.supabase.co/storage/v1/object/public/streak-icons/diamond.gif', 2)
    ) AS m(days, badge_title, badge_icon_url, freeze_reward)
    WHERE m.days = v_new_streak
  LOOP
    -- Insert milestone if not already earned (ON CONFLICT uses unique(user_id, milestone_days))
    INSERT INTO public.streak_milestones (user_id, milestone_days, badge_title, badge_icon_url)
    VALUES (NEW.user_id, v_milestone.days, v_milestone.badge_title, v_milestone.badge_icon_url)
    ON CONFLICT (user_id, milestone_days) DO NOTHING;

    -- Award freeze reward for this milestone
    IF v_milestone.freeze_reward > 0 THEN
      NEW.streak_freeze_count := COALESCE(NEW.streak_freeze_count, 0) + v_milestone.freeze_reward;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

-- Attach trigger: fires BEFORE UPDATE of gold_earned column only
CREATE TRIGGER trigger_streak_on_gold_earned
  BEFORE UPDATE OF gold_earned ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_streak_on_activity();
