-- =====================================================
-- LECTURE (E-BOOK LIBRARY) FEATURE - DATABASE SETUP
-- =====================================================

-- 1. Create storage buckets for ebooks
INSERT INTO storage.buckets (id, name, public)
VALUES ('ebook-files', 'ebook-files', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('ebook-covers', 'ebook-covers', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage policies for ebook-files bucket
CREATE POLICY "Public read access for ebook files"
ON storage.objects FOR SELECT
USING (bucket_id = 'ebook-files');

CREATE POLICY "Content editors can upload ebook files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ebook-files');

CREATE POLICY "Content editors can update ebook files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ebook-files');

CREATE POLICY "Content editors can delete ebook files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ebook-files');

-- 3. Storage policies for ebook-covers bucket
CREATE POLICY "Public read access for ebook covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'ebook-covers');

CREATE POLICY "Content editors can upload ebook covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ebook-covers');

CREATE POLICY "Content editors can update ebook covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ebook-covers');

CREATE POLICY "Content editors can delete ebook covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ebook-covers');

-- 4. Create ebooks table
CREATE TABLE IF NOT EXISTS public.ebooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT,
  description TEXT,
  language TEXT NOT NULL DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
  category TEXT CHECK (category IN ('roman', 'poesie', 'sciences', 'histoire', 'biographie', 'philosophie', 'autre')),
  cover_url TEXT,
  file_url TEXT NOT NULL,
  page_count INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  uploaded_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Create ebook_comments table
CREATE TABLE IF NOT EXISTS public.ebook_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ebook_id UUID NOT NULL REFERENCES public.ebooks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Create ebook_reading_progress table
CREATE TABLE IF NOT EXISTS public.ebook_reading_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ebook_id UUID NOT NULL REFERENCES public.ebooks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  current_page INTEGER NOT NULL DEFAULT 1,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ebook_id, user_id)
);

-- 7. Enable RLS on all tables
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebook_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebook_reading_progress ENABLE ROW LEVEL SECURITY;

-- 8. RLS policies for ebooks table
CREATE POLICY "Anyone can read published ebooks"
ON public.ebooks FOR SELECT
USING (is_published = true);

CREATE POLICY "Content editors can read all ebooks"
ON public.ebooks FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.content_editor_roles
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Content editors can create ebooks"
ON public.ebooks FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.content_editor_roles
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Content editors can update ebooks"
ON public.ebooks FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.content_editor_roles
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can delete ebooks"
ON public.ebooks FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.content_editor_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 9. RLS policies for ebook_comments table
CREATE POLICY "Authenticated users can read ebook comments"
ON public.ebook_comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create ebook comments"
ON public.ebook_comments FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own ebook comments"
ON public.ebook_comments FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- 10. RLS policies for ebook_reading_progress table
CREATE POLICY "Users can read their own reading progress"
ON public.ebook_reading_progress FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own reading progress"
ON public.ebook_reading_progress FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reading progress"
ON public.ebook_reading_progress FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- 11. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ebooks_is_published ON public.ebooks(is_published);
CREATE INDEX IF NOT EXISTS idx_ebooks_language ON public.ebooks(language);
CREATE INDEX IF NOT EXISTS idx_ebooks_category ON public.ebooks(category);
CREATE INDEX IF NOT EXISTS idx_ebook_comments_ebook_id ON public.ebook_comments(ebook_id);
CREATE INDEX IF NOT EXISTS idx_ebook_comments_user_id ON public.ebook_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_ebook_reading_progress_user_id ON public.ebook_reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_ebook_reading_progress_ebook_id ON public.ebook_reading_progress(ebook_id);

-- 12. Create trigger for updated_at on ebooks using existing function
CREATE TRIGGER update_ebooks_updated_at
BEFORE UPDATE ON public.ebooks
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();