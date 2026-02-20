
-- Fix 1: Update RLS policy to include document_url check
DROP POLICY IF EXISTS "Users can view message media" ON storage.objects;

CREATE POLICY "Users can view message media"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'message-media' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM messages m
      JOIN conversation_participants cp 
        ON cp.conversation_id = m.conversation_id
      WHERE cp.user_id = auth.uid()
        AND (
          m.image_url LIKE '%' || name || '%'
          OR m.video_url LIKE '%' || name || '%'
          OR m.document_url LIKE '%' || name || '%'
        )
    )
  )
);

-- Fix 5: Set bucket-level limits (50MB, allowed MIME types)
UPDATE storage.buckets
SET file_size_limit = 52428800,
    allowed_mime_types = ARRAY[
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/webm',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
WHERE id = 'message-media';

-- Fix 6a: Add thumbnail_url column
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS thumbnail_url text;
