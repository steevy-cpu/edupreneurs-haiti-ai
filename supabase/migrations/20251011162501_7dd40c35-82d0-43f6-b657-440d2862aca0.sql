-- Add video support to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS video_url text;

-- Add media support to messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS video_url text;

-- Create storage bucket for message media if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-media', 'message-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for message media
CREATE POLICY "Users can upload their own message media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'message-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view message media they have access to"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'message-media' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE (m.image_url LIKE '%' || name OR m.video_url LIKE '%' || name)
      AND cp.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can delete their own message media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'message-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Update storage policies for post-images to include videos
CREATE POLICY "Users can upload videos to post-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view post videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

CREATE POLICY "Users can delete their own post videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);