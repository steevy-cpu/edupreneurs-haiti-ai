-- Add unique constraint to prevent duplicate reports on same post
CREATE UNIQUE INDEX idx_user_reports_unique_post_report 
ON public.user_reports (reporter_id, reported_user_id, post_id) 
WHERE post_id IS NOT NULL;

-- Add unique constraint for user-only reports (when post_id is NULL)
CREATE UNIQUE INDEX idx_user_reports_unique_user_report 
ON public.user_reports (reporter_id, reported_user_id) 
WHERE post_id IS NULL;