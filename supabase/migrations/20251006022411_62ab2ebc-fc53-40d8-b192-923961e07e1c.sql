-- Add shared_post_id column to messages table to track shared posts
ALTER TABLE public.messages
ADD COLUMN shared_post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE;