-- Create lesson_videos table for multiple videos per lesson
CREATE TABLE public.lesson_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  youtube_url TEXT NOT NULL,
  video_id TEXT NOT NULL,
  title TEXT,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  added_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lesson_videos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view lesson videos"
  ON public.lesson_videos FOR SELECT USING (true);

CREATE POLICY "Editors can create lesson videos"
  ON public.lesson_videos FOR INSERT
  WITH CHECK (is_content_editor(auth.uid(), 'editor'::content_editor_role));

CREATE POLICY "Editors can update lesson videos"
  ON public.lesson_videos FOR UPDATE
  USING (is_content_editor(auth.uid(), 'editor'::content_editor_role));

CREATE POLICY "Editors can delete lesson videos"
  ON public.lesson_videos FOR DELETE
  USING (is_content_editor(auth.uid(), 'editor'::content_editor_role));

-- Indexes for faster lookups
CREATE INDEX idx_lesson_videos_lesson_id ON public.lesson_videos(lesson_id);
CREATE INDEX idx_lesson_videos_order ON public.lesson_videos(lesson_id, order_index);

-- Trigger for updated_at
CREATE TRIGGER update_lesson_videos_updated_at
  BEFORE UPDATE ON public.lesson_videos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Migrate existing youtube_url values to the new table
INSERT INTO public.lesson_videos (lesson_id, youtube_url, video_id, is_primary, order_index, added_by)
SELECT 
  id as lesson_id,
  youtube_url,
  CASE 
    WHEN youtube_url ~ 'youtube\.com/watch\?v=([^&]+)' 
      THEN substring(youtube_url from 'v=([^&]+)')
    WHEN youtube_url ~ 'youtu\.be/([^?]+)'
      THEN substring(youtube_url from 'youtu\.be/([^?]+)')
    WHEN youtube_url ~ '^[a-zA-Z0-9_-]{11}$'
      THEN youtube_url
    ELSE split_part(youtube_url, '/', -1)
  END as video_id,
  true as is_primary,
  0 as order_index,
  created_by as added_by
FROM public.lessons
WHERE youtube_url IS NOT NULL AND youtube_url != '';