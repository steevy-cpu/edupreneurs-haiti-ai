
-- Allow anonymous users to read donations by order_id
CREATE POLICY "Anon can read donation by order_id"
ON public.donations FOR SELECT TO anon
USING (true);

-- Allow anonymous users to update pending donations to completed
CREATE POLICY "Anon can update pending donation status"
ON public.donations FOR UPDATE TO anon
USING (status = 'pending')
WITH CHECK (status = 'completed');
