-- Create storage bucket for game sounds
INSERT INTO storage.buckets (id, name, public)
VALUES ('game-sounds', 'game-sounds', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to game sounds
CREATE POLICY "Game sounds are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'game-sounds');

-- Allow authenticated users to upload game sounds (for admin generation)
CREATE POLICY "Authenticated users can upload game sounds"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'game-sounds' AND auth.role() = 'authenticated');

-- Allow service role to manage game sounds
CREATE POLICY "Service role can manage game sounds"
ON storage.objects FOR ALL
USING (bucket_id = 'game-sounds')
WITH CHECK (bucket_id = 'game-sounds');