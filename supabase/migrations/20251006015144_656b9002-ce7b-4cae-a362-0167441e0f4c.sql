-- Add parent_comment_id to support nested replies
ALTER TABLE public.post_comments
ADD COLUMN parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_post_comments_parent_id ON public.post_comments(parent_comment_id);