-- Create storage bucket for lesson images
INSERT INTO storage.buckets (id, name, public)
VALUES ('lesson-images', 'lesson-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for lesson-images bucket
CREATE POLICY "Anyone can view lesson images"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-images');

CREATE POLICY "Content editors can upload lesson images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lesson-images' 
  AND is_content_editor(auth.uid(), 'editor'::content_editor_role)
);

CREATE POLICY "Content editors can update lesson images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lesson-images' 
  AND is_content_editor(auth.uid(), 'editor'::content_editor_role)
);

CREATE POLICY "Content editors can delete lesson images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lesson-images' 
  AND is_content_editor(auth.uid(), 'editor'::content_editor_role)
);