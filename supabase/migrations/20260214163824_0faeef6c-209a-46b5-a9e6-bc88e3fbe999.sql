CREATE POLICY "Anyone can read active tracks"
ON public.study_music_tracks FOR SELECT
TO anon
USING (is_active = true);