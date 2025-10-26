-- Créer une table pour stocker les vidéos YouTube bannies
CREATE TABLE IF NOT EXISTS public.banned_youtube_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT NOT NULL UNIQUE,
  banned_by UUID NOT NULL REFERENCES auth.users(id),
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reason TEXT
);

-- Enable RLS
ALTER TABLE public.banned_youtube_videos ENABLE ROW LEVEL SECURITY;

-- Les éditeurs peuvent voir les vidéos bannies
CREATE POLICY "Editors can view banned videos"
ON public.banned_youtube_videos
FOR SELECT
TO authenticated
USING (is_content_editor(auth.uid(), 'viewer'::content_editor_role));

-- Les éditeurs peuvent bannir des vidéos
CREATE POLICY "Editors can ban videos"
ON public.banned_youtube_videos
FOR INSERT
TO authenticated
WITH CHECK (
  is_content_editor(auth.uid(), 'editor'::content_editor_role) 
  AND auth.uid() = banned_by
);

-- Les admins peuvent débannir des vidéos
CREATE POLICY "Admins can unban videos"
ON public.banned_youtube_videos
FOR DELETE
TO authenticated
USING (is_content_editor(auth.uid(), 'admin'::content_editor_role));

-- Créer un index pour améliorer les performances
CREATE INDEX idx_banned_youtube_videos_video_id ON public.banned_youtube_videos(video_id);