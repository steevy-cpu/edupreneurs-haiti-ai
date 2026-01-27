-- Create template categories table
CREATE TABLE public.template_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ht TEXT,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'file-text',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create templates table
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  title_ht TEXT,
  description TEXT NOT NULL,
  category TEXT NOT NULL REFERENCES public.template_categories(id) ON DELETE RESTRICT,
  tags TEXT[] DEFAULT '{}',
  language TEXT NOT NULL DEFAULT 'fr',
  thumbnail_url TEXT,
  schema JSONB NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT false,
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for faster category filtering
CREATE INDEX idx_templates_category ON public.templates(category);
CREATE INDEX idx_templates_is_published ON public.templates(is_published);
CREATE INDEX idx_templates_download_count ON public.templates(download_count DESC);

-- Enable RLS
ALTER TABLE public.template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- RLS for template_categories - public read
CREATE POLICY "Public can read template categories"
ON public.template_categories FOR SELECT
USING (true);

-- RLS for template_categories - founders can manage
CREATE POLICY "Founders can manage template categories"
ON public.template_categories FOR ALL
TO authenticated
USING (public.is_founder(auth.uid()))
WITH CHECK (public.is_founder(auth.uid()));

-- RLS for templates - public can read published
CREATE POLICY "Public can read published templates"
ON public.templates FOR SELECT
USING (is_published = true);

-- RLS for templates - founders can read all
CREATE POLICY "Founders can read all templates"
ON public.templates FOR SELECT
TO authenticated
USING (public.is_founder(auth.uid()));

-- RLS for templates - founders can manage
CREATE POLICY "Founders can manage templates"
ON public.templates FOR INSERT
TO authenticated
WITH CHECK (public.is_founder(auth.uid()));

CREATE POLICY "Founders can update templates"
ON public.templates FOR UPDATE
TO authenticated
USING (public.is_founder(auth.uid()))
WITH CHECK (public.is_founder(auth.uid()));

CREATE POLICY "Founders can delete templates"
ON public.templates FOR DELETE
TO authenticated
USING (public.is_founder(auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER update_templates_updated_at
BEFORE UPDATE ON public.templates
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create function to increment download count
CREATE OR REPLACE FUNCTION public.increment_template_downloads(template_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.templates
  SET download_count = download_count + 1
  WHERE id = template_id;
END;
$$;

-- Create storage bucket for template assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('template-assets', 'template-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can read template assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'template-assets');

CREATE POLICY "Founders can upload template assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'template-assets' AND public.is_founder(auth.uid()));

CREATE POLICY "Founders can update template assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'template-assets' AND public.is_founder(auth.uid()));

CREATE POLICY "Founders can delete template assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'template-assets' AND public.is_founder(auth.uid()));

-- Insert initial categories
INSERT INTO public.template_categories (id, name, name_ht, description, icon, order_index) VALUES
('schedule', 'Emplois du temps', 'Orè', 'Organisez votre semaine scolaire', 'calendar', 1),
('planner', 'Planificateurs', 'Planifikatè', 'Planifiez vos études et objectifs', 'clipboard-list', 2),
('budget', 'Budget', 'Bidjè', 'Gérez vos finances étudiantes', 'wallet', 3),
('certificate', 'Certificats', 'Sètifika', 'Créez des certificats personnalisés', 'award', 4),
('resume', 'CV & Lettres', 'CV ak Lèt', 'Préparez vos documents professionnels', 'file-text', 5),
('invoice', 'Factures', 'Fakti', 'Créez des factures professionnelles', 'receipt', 6);