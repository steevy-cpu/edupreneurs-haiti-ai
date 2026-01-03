-- Create storage bucket for user-generated avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policy: Users can upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS policy: Anyone can view user avatars (public bucket)
CREATE POLICY "Anyone can view user avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars');

-- RLS policy: Users can update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS policy: Users can delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);