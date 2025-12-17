-- Add DELETE policy for official_exams table to allow content editors to delete exams
CREATE POLICY "Editors can delete exams" 
ON public.official_exams 
FOR DELETE 
USING (is_content_editor(auth.uid(), 'editor'::content_editor_role));