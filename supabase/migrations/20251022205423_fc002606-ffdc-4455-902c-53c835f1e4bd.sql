-- Phase 1: Database Structure for Content Management System

-- Create enum for content editor roles
CREATE TYPE public.content_editor_role AS ENUM ('admin', 'editor', 'viewer');

-- Create content_editor_roles table (SECURITY CRITICAL - separate from profiles)
CREATE TABLE public.content_editor_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role content_editor_role NOT NULL DEFAULT 'viewer',
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on content_editor_roles
ALTER TABLE public.content_editor_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check content editor permissions
CREATE OR REPLACE FUNCTION public.is_content_editor(_user_id UUID, _min_role content_editor_role DEFAULT 'editor')
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.content_editor_roles
    WHERE user_id = _user_id
      AND (
        (role = 'admin') OR
        (_min_role = 'editor' AND role IN ('admin', 'editor')) OR
        (_min_role = 'viewer' AND role IN ('admin', 'editor', 'viewer'))
      )
  )
$$;

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT,
  color TEXT,
  grade_level TEXT NOT NULL,
  lesson_count INTEGER DEFAULT 0,
  exercise_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on subjects
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  objectif TEXT,
  introduction TEXT,
  contenu TEXT,
  exemples_exercices TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  grade_level TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(subject_id, slug)
);

-- Enable RLS on lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Create content_change_log table for audit trail
CREATE TABLE public.content_change_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  change_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'publish', 'unpublish'
  previous_content JSONB,
  new_content JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on content_change_log
ALTER TABLE public.content_change_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_editor_roles
CREATE POLICY "Only admins can view editor roles"
ON public.content_editor_roles FOR SELECT
TO authenticated
USING (public.is_content_editor(auth.uid(), 'admin'));

CREATE POLICY "Only admins can grant roles"
ON public.content_editor_roles FOR INSERT
TO authenticated
WITH CHECK (public.is_content_editor(auth.uid(), 'admin'));

CREATE POLICY "Only admins can revoke roles"
ON public.content_editor_roles FOR DELETE
TO authenticated
USING (public.is_content_editor(auth.uid(), 'admin'));

-- RLS Policies for subjects
CREATE POLICY "Everyone can view published subjects"
ON public.subjects FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Editors can create subjects"
ON public.subjects FOR INSERT
TO authenticated
WITH CHECK (public.is_content_editor(auth.uid(), 'editor'));

CREATE POLICY "Editors can update subjects"
ON public.subjects FOR UPDATE
TO authenticated
USING (public.is_content_editor(auth.uid(), 'editor'));

CREATE POLICY "Admins can delete subjects"
ON public.subjects FOR DELETE
TO authenticated
USING (public.is_content_editor(auth.uid(), 'admin'));

-- RLS Policies for lessons
CREATE POLICY "Everyone can view published lessons"
ON public.lessons FOR SELECT
TO authenticated
USING (is_published = true OR public.is_content_editor(auth.uid(), 'viewer'));

CREATE POLICY "Editors can create lessons"
ON public.lessons FOR INSERT
TO authenticated
WITH CHECK (public.is_content_editor(auth.uid(), 'editor'));

CREATE POLICY "Editors can update lessons"
ON public.lessons FOR UPDATE
TO authenticated
USING (public.is_content_editor(auth.uid(), 'editor'));

CREATE POLICY "Admins can delete lessons"
ON public.lessons FOR DELETE
TO authenticated
USING (public.is_content_editor(auth.uid(), 'admin'));

-- RLS Policies for content_change_log
CREATE POLICY "Editors can view change log"
ON public.content_change_log FOR SELECT
TO authenticated
USING (public.is_content_editor(auth.uid(), 'viewer'));

CREATE POLICY "System can create log entries"
ON public.content_change_log FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = changed_by);

-- Triggers for updated_at
CREATE TRIGGER update_subjects_updated_at
BEFORE UPDATE ON public.subjects
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Grant initial admin access to Steeve Andolf Celestin and Djoodooson Florent
-- We'll insert these after getting their user_ids from profiles
INSERT INTO public.content_editor_roles (user_id, role, granted_by)
SELECT p.user_id, 'admin'::content_editor_role, p.user_id
FROM public.profiles p
WHERE p.full_name IN ('Steeve Andolf Celestin', 'Djoodooson Florent')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin'::content_editor_role;