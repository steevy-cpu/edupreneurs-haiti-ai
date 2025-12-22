-- Add NatCash-specific columns to payment_transactions
ALTER TABLE public.payment_transactions
ADD COLUMN IF NOT EXISTS receipt_url text,
ADD COLUMN IF NOT EXISTS natcash_phone text,
ADD COLUMN IF NOT EXISTS natcash_reference text,
ADD COLUMN IF NOT EXISTS admin_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verification_notes text,
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone;

-- Create storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-receipts', 
  'payment-receipts', 
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for payment receipts
CREATE POLICY "Users can upload their own receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-receipts' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-receipts'
  AND EXISTS (
    SELECT 1 FROM public.content_editor_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);