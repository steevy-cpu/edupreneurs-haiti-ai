

# Lesson Feedback Feature (Thumbs Up/Down)

## Overview

Add a feedback section at the bottom of each lesson page where users can rate content with thumbs up or thumbs down. Clicking thumbs down opens a popup asking the user to explain what went wrong. The vote is saved immediately on click; the optional comment is saved separately.

## Database Design

### New table: `lesson_feedback`

| Column | Type | Nullable | Default | Purpose |
|--------|------|----------|---------|---------|
| id | uuid | NO | gen_random_uuid() | Primary key |
| user_id | uuid | NO | - | References auth.users(id) ON DELETE CASCADE |
| lesson_id | uuid | NO | - | References lessons(id) ON DELETE CASCADE |
| rating | text | NO | - | 'up' or 'down' (checked via trigger) |
| comment | text | YES | NULL | Optional feedback text (required UX for thumbs down, but not DB-enforced) |
| created_at | timestamptz | NO | now() | When feedback was submitted |
| updated_at | timestamptz | NO | now() | When feedback was last changed |

**Unique constraint**: `(user_id, lesson_id)` -- one rating per user per lesson. If they change their mind, it updates via upsert.

### RLS Policies

Following the existing `lesson_completions` pattern:

| Policy | Command | Rule |
|--------|---------|------|
| Users can view own feedback | SELECT | `auth.uid() = user_id` |
| Users can insert own feedback | INSERT | `auth.uid() = user_id` (WITH CHECK) |
| Users can update own feedback | UPDATE | `auth.uid() = user_id` |
| Founders can view all feedback | SELECT | `public.is_founder()` (for analytics) |

This avoids any recursion risk since policies reference `auth.uid()` directly and use the existing `is_founder()` security definer function.

### Migration SQL

```sql
CREATE TABLE public.lesson_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  rating text NOT NULL CHECK (rating IN ('up', 'down')),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

ALTER TABLE public.lesson_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own feedback"
  ON public.lesson_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON public.lesson_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback"
  ON public.lesson_feedback FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Founders can view all feedback"
  ON public.lesson_feedback FOR SELECT
  USING (public.is_founder());

-- Auto-update updated_at
CREATE TRIGGER update_lesson_feedback_updated_at
  BEFORE UPDATE ON public.lesson_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

## Frontend Implementation

### New component: `LessonFeedback`

Location: `src/components/lesson/LessonFeedback.tsx`

**Behavior:**
1. Renders at the bottom of the lesson page (after AI Practice section, before the "Next Lesson" CTA)
2. Shows a card with "Cette lecon vous a-t-elle ete utile?" and two buttons (ThumbsUp / ThumbsDown)
3. On click: immediately upserts the rating to `lesson_feedback`
4. If thumbs down: opens a Dialog/Popover with a textarea asking "Qu'est-ce qui pourrait etre ameliore?" with a submit button
5. If the user already submitted feedback, shows their current selection highlighted
6. Unauthenticated users see a prompt to sign in instead

**Props:**
```typescript
interface LessonFeedbackProps {
  lessonId: string;
}
```

### Integration in `LessonPageTemplate.tsx`

Add `<LessonFeedback lessonId={lesson.id} />` between the AI Practice section and the "Next Lesson" CTA card (around line 485).

### File Changes Summary

| File | Change |
|------|--------|
| **Migration** | Create `lesson_feedback` table with RLS |
| `src/components/lesson/LessonFeedback.tsx` | **New file** -- feedback UI component |
| `src/components/LessonPageTemplate.tsx` | Import and render `LessonFeedback` at bottom |

## Safety Verification

| Check | Status |
|-------|--------|
| Breaks existing functionality? | No -- purely additive |
| RLS conflicts? | No -- uses direct auth.uid() checks + existing is_founder() |
| Works with existing data? | Yes -- new table, no data migration needed |
| 3G performance impact? | Minimal -- single small query to check existing feedback |
| Backward compatible? | Yes -- unauthenticated users simply see a sign-in nudge |
| Edge cases? | User changes vote (upsert handles it); comment is optional in DB |

