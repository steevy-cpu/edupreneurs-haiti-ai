-- Create user_reports table for the report system
CREATE TABLE public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL,
  reported_user_id UUID NOT NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX idx_user_reports_status ON public.user_reports(status);
CREATE INDEX idx_user_reports_created_at ON public.user_reports(created_at DESC);
CREATE INDEX idx_user_reports_reporter_id ON public.user_reports(reporter_id);
CREATE INDEX idx_user_reports_reported_user_id ON public.user_reports(reported_user_id);

-- Create is_founder security definer function
CREATE OR REPLACE FUNCTION public.is_founder(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT check_user_id IN (
    '0de08330-4183-48f9-b169-19b92f4d114f',
    '7580cd10-e18c-4b2f-ac50-def28d046c9d'
  )
$$;

-- Enable RLS
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can create reports"
ON public.user_reports FOR INSERT TO authenticated
WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
ON public.user_reports FOR SELECT TO authenticated
USING (auth.uid() = reporter_id);

-- Founders can view ALL reports
CREATE POLICY "Founders can view all reports"
ON public.user_reports FOR SELECT TO authenticated
USING (public.is_founder(auth.uid()));

-- Founders can update reports
CREATE POLICY "Founders can update reports"
ON public.user_reports FOR UPDATE TO authenticated
USING (public.is_founder(auth.uid()))
WITH CHECK (public.is_founder(auth.uid()));

-- Create timestamp update function
CREATE OR REPLACE FUNCTION public.update_user_reports_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for updated_at
CREATE TRIGGER update_user_reports_updated_at
BEFORE UPDATE ON public.user_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_user_reports_timestamp();

-- Enable realtime for reports
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_reports;