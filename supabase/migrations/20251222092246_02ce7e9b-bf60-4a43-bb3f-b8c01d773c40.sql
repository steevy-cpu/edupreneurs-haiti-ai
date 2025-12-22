-- Fix foreign key constraints to allow user deletion by setting references to NULL

-- Fix content_editor_roles.granted_by
ALTER TABLE public.content_editor_roles 
DROP CONSTRAINT IF EXISTS content_editor_roles_granted_by_fkey;

ALTER TABLE public.content_editor_roles 
ADD CONSTRAINT content_editor_roles_granted_by_fkey 
  FOREIGN KEY (granted_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix subjects.created_by
ALTER TABLE public.subjects 
DROP CONSTRAINT IF EXISTS subjects_created_by_fkey;

ALTER TABLE public.subjects 
ADD CONSTRAINT subjects_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix lessons.created_by  
ALTER TABLE public.lessons 
DROP CONSTRAINT IF EXISTS lessons_created_by_fkey;

ALTER TABLE public.lessons 
ADD CONSTRAINT lessons_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix lessons.reviewed_by
ALTER TABLE public.lessons 
DROP CONSTRAINT IF EXISTS lessons_reviewed_by_fkey;

ALTER TABLE public.lessons 
ADD CONSTRAINT lessons_reviewed_by_fkey 
  FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix content_change_log.changed_by
ALTER TABLE public.content_change_log 
DROP CONSTRAINT IF EXISTS content_change_log_changed_by_fkey;

ALTER TABLE public.content_change_log 
ADD CONSTRAINT content_change_log_changed_by_fkey 
  FOREIGN KEY (changed_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Fix banned_youtube_videos.banned_by
ALTER TABLE public.banned_youtube_videos 
DROP CONSTRAINT IF EXISTS banned_youtube_videos_banned_by_fkey;

ALTER TABLE public.banned_youtube_videos 
ADD CONSTRAINT banned_youtube_videos_banned_by_fkey 
  FOREIGN KEY (banned_by) REFERENCES auth.users(id) ON DELETE SET NULL;