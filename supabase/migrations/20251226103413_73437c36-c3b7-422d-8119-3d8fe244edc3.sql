-- Create table for passion activity videos
CREATE TABLE public.passion_activity_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  activity_id TEXT NOT NULL,
  youtube_url TEXT,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID,
  UNIQUE(category_id, module_id, activity_id)
);

-- Enable RLS
ALTER TABLE public.passion_activity_videos ENABLE ROW LEVEL SECURITY;

-- Editors can manage passion videos
CREATE POLICY "Editors can manage passion videos" 
ON public.passion_activity_videos
FOR ALL 
USING (is_content_editor(auth.uid(), 'editor'::content_editor_role))
WITH CHECK (is_content_editor(auth.uid(), 'editor'::content_editor_role));

-- Everyone can view passion videos
CREATE POLICY "Everyone can view passion videos" 
ON public.passion_activity_videos
FOR SELECT 
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_passion_activity_videos_updated_at
BEFORE UPDATE ON public.passion_activity_videos
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();