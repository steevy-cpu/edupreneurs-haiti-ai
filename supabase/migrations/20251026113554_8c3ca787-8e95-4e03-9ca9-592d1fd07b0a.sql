-- Create table for tracking user progress in passion modules
CREATE TABLE IF NOT EXISTS public.passion_module_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  progress_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id, module_id)
);

-- Enable RLS
ALTER TABLE public.passion_module_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view own progress"
ON public.passion_module_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress"
ON public.passion_module_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
ON public.passion_module_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_passion_module_progress_updated_at
BEFORE UPDATE ON public.passion_module_progress
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_passion_module_progress_user_id ON public.passion_module_progress(user_id);
CREATE INDEX idx_passion_module_progress_category ON public.passion_module_progress(category_id);

-- Add comment
COMMENT ON TABLE public.passion_module_progress IS 'Tracks user progress in passion discovery modules';