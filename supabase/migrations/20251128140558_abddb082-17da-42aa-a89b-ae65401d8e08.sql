-- Create storage bucket for exam documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('exam-documents', 'exam-documents', true);

-- Create RLS policies for exam documents
CREATE POLICY "Anyone can view exam documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'exam-documents');

CREATE POLICY "Editors can upload exam documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'exam-documents' 
  AND is_content_editor(auth.uid(), 'editor'::content_editor_role)
);

CREATE POLICY "Editors can update exam documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'exam-documents' 
  AND is_content_editor(auth.uid(), 'editor'::content_editor_role)
);

CREATE POLICY "Editors can delete exam documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'exam-documents' 
  AND is_content_editor(auth.uid(), 'editor'::content_editor_role)
);