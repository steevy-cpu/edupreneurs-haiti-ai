-- Create storage bucket for lesson audio cache
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-audio', 'lesson-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to lesson audio files
CREATE POLICY "Public can read lesson audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-audio');

-- Allow service role to upload audio files (edge function will use service role)
CREATE POLICY "Service role can upload lesson audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lesson-audio');

CREATE POLICY "Service role can update lesson audio"
ON storage.objects FOR UPDATE
USING (bucket_id = 'lesson-audio');

CREATE POLICY "Service role can delete lesson audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'lesson-audio');