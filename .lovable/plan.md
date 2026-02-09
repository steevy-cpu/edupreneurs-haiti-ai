
# Lesson Feedback Module for Centre de Controle

## Overview

Add a new "Feedback" tab to the Control Center that lets super users review lesson feedback. Negative feedback shows the user's name, email, and comment. Positive feedback shows only name and email.

## Architecture

### 1. Database Function (Security Definer)

Since email lives in `auth.users` (not in `profiles`), we need a server-side function that joins the tables. This function will:
- Only be callable by founders (using `is_founder()`)
- Join `lesson_feedback` + `profiles` + `auth.users` + `lessons`
- Return: rating, comment, user full_name, user nickname, user email, lesson title, created_at

```sql
CREATE OR REPLACE FUNCTION public.get_lesson_feedback_for_admin(
  p_rating_filter TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  rating TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ,
  user_id UUID,
  full_name TEXT,
  nickname TEXT,
  avatar_url TEXT,
  email TEXT,
  lesson_id UUID,
  lesson_title TEXT,
  lesson_slug TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT is_founder() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  RETURN QUERY
  SELECT
    lf.id, lf.rating, lf.comment, lf.created_at,
    lf.user_id, p.full_name, p.nickname, p.avatar_url,
    au.email::TEXT,
    lf.lesson_id, l.title, l.slug
  FROM lesson_feedback lf
  JOIN profiles p ON p.user_id = lf.user_id
  JOIN auth.users au ON au.id = lf.user_id
  LEFT JOIN lessons l ON l.id = lf.lesson_id
  WHERE (p_rating_filter IS NULL OR lf.rating = p_rating_filter)
  ORDER BY lf.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
```

A second function for the count (for pagination and badge):

```sql
CREATE OR REPLACE FUNCTION public.count_lesson_feedback_for_admin(
  p_rating_filter TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result INTEGER;
BEGIN
  IF NOT is_founder() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT COUNT(*)::INTEGER INTO result
  FROM lesson_feedback lf
  WHERE (p_rating_filter IS NULL OR lf.rating = p_rating_filter);

  RETURN result;
END;
$$;
```

### 2. New Module File: `src/pages/control-center/modules/FeedbackModule.tsx`

Following the exact same structural patterns as `ContactModule.tsx`:
- Status filter (All / Positive / Negative)
- Table with columns: User (avatar + name), Email, Lesson, Rating badge, Date
- Click row to open detail Dialog
- For negative feedback: show the comment in the detail view
- For positive feedback: show just name + email
- Pagination (15 items per page)
- Loading skeleton states

### 3. Register Module: `src/pages/control-center/modules.ts`

Add a new entry to `CONTROL_CENTER_MODULES`:
- id: `"feedback"`
- label: `"Feedback Lecons"`
- shortLabel: `"Feedback"`
- icon: `MessageSquare` (already imported)
- component: `lazy(() => import("./modules/FeedbackModule"))`
- badge: count of negative ("down") feedback (calls `count_lesson_feedback_for_admin('down')`)

### 4. Types Update: `src/pages/control-center/types.ts`

Add `LessonFeedbackAdmin` interface and `FEEDBACK_RATING_OPTIONS` constant.

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| Database migration | Create | Two security-definer functions for fetching feedback data with email |
| `src/pages/control-center/modules/FeedbackModule.tsx` | Create | New module component following ContactModule pattern |
| `src/pages/control-center/modules.ts` | Edit | Register new feedback module tab |
| `src/pages/control-center/types.ts` | Edit | Add feedback-related types |

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- additive only |
| Security: email access? | Protected by `is_founder()` check inside security-definer function |
| Works with existing data? | Yes -- queries existing `lesson_feedback` table |
| 3G optimized? | Yes -- paginated, no heavy assets |
| Backward compatible? | Yes -- no schema changes to existing tables |
| RLS respected? | Yes -- function uses security definer with founder check |
