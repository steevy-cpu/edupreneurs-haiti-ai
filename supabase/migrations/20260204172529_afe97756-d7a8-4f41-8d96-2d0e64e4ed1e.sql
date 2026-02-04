
-- Add validation_details_json column to store full validation API responses
ALTER TABLE public.lessons ADD COLUMN validation_details_json JSONB DEFAULT NULL;

-- Create index for better query performance when filtering by validation details
CREATE INDEX idx_lessons_validation_details ON public.lessons USING GIN(validation_details_json);
