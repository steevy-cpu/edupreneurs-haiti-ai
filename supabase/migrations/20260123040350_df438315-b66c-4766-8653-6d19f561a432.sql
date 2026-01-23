-- Create blog_authors table
CREATE TABLE public.blog_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on blog_authors
ALTER TABLE public.blog_authors ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can read authors
CREATE POLICY "Public read access for blog authors"
ON public.blog_authors FOR SELECT
TO anon, authenticated
USING (true);

-- RLS: Only founders can manage authors
CREATE POLICY "Founders can manage blog authors"
ON public.blog_authors FOR ALL
TO authenticated
USING (public.is_founder(auth.uid()))
WITH CHECK (public.is_founder(auth.uid()));

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.blog_authors(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can read published posts
CREATE POLICY "Public read access for published blog posts"
ON public.blog_posts FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- RLS: Founders can see all posts for management
CREATE POLICY "Founders can see all blog posts"
ON public.blog_posts FOR SELECT
TO authenticated
USING (public.is_founder(auth.uid()));

-- RLS: Only founders can insert/update/delete
CREATE POLICY "Founders can manage blog posts"
ON public.blog_posts FOR ALL
TO authenticated
USING (public.is_founder(auth.uid()))
WITH CHECK (public.is_founder(auth.uid()));

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Slug generation helper function
CREATE OR REPLACE FUNCTION public.generate_blog_slug(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
AS $$
DECLARE
  base_slug TEXT;
BEGIN
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  RETURN base_slug;
END;
$$;

-- Create blog-images storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Anyone can view blog images
CREATE POLICY "Public read access for blog images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'blog-images');

-- Storage RLS: Only founders can upload/manage blog images
CREATE POLICY "Founders can manage blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images' AND public.is_founder(auth.uid()));

CREATE POLICY "Founders can update blog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images' AND public.is_founder(auth.uid()));

CREATE POLICY "Founders can delete blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images' AND public.is_founder(auth.uid()));

-- Enable realtime for blog_posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts;