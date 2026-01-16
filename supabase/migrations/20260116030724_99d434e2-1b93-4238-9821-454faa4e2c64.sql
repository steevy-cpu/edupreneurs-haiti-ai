-- Create recommended videos table
CREATE TABLE IF NOT EXISTS public.passion_recommended_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  video_id TEXT NOT NULL,
  title TEXT,
  thumbnail TEXT,
  channel_title TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  UNIQUE(category_id, module_id, video_id)
);

-- Enable RLS
ALTER TABLE public.passion_recommended_videos ENABLE ROW LEVEL SECURITY;

-- Everyone can view (needed for students)
CREATE POLICY "Everyone can view recommended videos"
  ON public.passion_recommended_videos FOR SELECT
  USING (true);

-- Only editors can manage
CREATE POLICY "Editors can manage recommended videos"
  ON public.passion_recommended_videos FOR ALL
  USING (is_content_editor(auth.uid(), 'editor'::content_editor_role))
  WITH CHECK (is_content_editor(auth.uid(), 'editor'::content_editor_role));

-- Index for performance
CREATE INDEX idx_passion_recommended_category_module 
  ON public.passion_recommended_videos(category_id, module_id);