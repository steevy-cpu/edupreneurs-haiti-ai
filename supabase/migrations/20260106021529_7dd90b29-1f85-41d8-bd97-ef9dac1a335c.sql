-- Phase 1: Create storage bucket for Jude's 3D assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('jude-3d-assets', 'jude-3d-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for jude-3d-assets bucket
CREATE POLICY "Public read access for jude-3d-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'jude-3d-assets');

CREATE POLICY "Authenticated users can upload to jude-3d-assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'jude-3d-assets' AND auth.role() = 'authenticated');

-- Phase 2: Animation configuration table
CREATE TABLE public.jude_animation_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animation_name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    trigger_keywords TEXT[],
    duration_ms INTEGER,
    loop BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.jude_animation_config ENABLE ROW LEVEL SECURITY;

-- Public read access for animation config
CREATE POLICY "Anyone can read animation config"
ON public.jude_animation_config FOR SELECT
USING (true);

-- Insert default animations
INSERT INTO public.jude_animation_config (animation_name, display_name, description, trigger_keywords, duration_ms, loop, priority) VALUES
('idle', 'Idle', 'Default standing animation', ARRAY['idle'], 3000, true, 0),
('waving', 'Waving', 'Greeting wave animation', ARRAY['bonjour', 'salut', 'hello', 'hi', 'bonsoir'], 2000, false, 2),
('talking', 'Talking', 'Speaking/explaining animation', ARRAY['explique', 'voici', 'donc', 'alors'], 0, true, 1),
('thinking', 'Thinking', 'Thinking pose animation', ARRAY['hmm', 'réfléchis', 'pense', 'calcule', 'voyons'], 2500, false, 2),
('celebrating', 'Celebrating', 'Success celebration', ARRAY['bravo', 'excellent', 'parfait', 'correct', 'félicitations', 'super'], 2000, false, 3),
('nodding', 'Nodding', 'Agreement nod animation', ARRAY['oui', 'exactement', 'c''est ça', 'bien sûr'], 1500, false, 2),
('pointing', 'Pointing', 'Pointing gesture', ARRAY['regarde', 'voir', 'ici', 'là'], 1800, false, 2);

-- Audio cache table for TTS responses
CREATE TABLE public.jude_audio_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text_hash TEXT NOT NULL UNIQUE,
    text_content TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    duration_ms INTEGER,
    phoneme_data JSONB,
    voice_id TEXT DEFAULT 'jude_haitian',
    created_at TIMESTAMPTZ DEFAULT now(),
    last_used_at TIMESTAMPTZ DEFAULT now(),
    use_count INTEGER DEFAULT 1
);

-- Enable RLS
ALTER TABLE public.jude_audio_cache ENABLE ROW LEVEL SECURITY;

-- Public read access for audio cache
CREATE POLICY "Anyone can read audio cache"
ON public.jude_audio_cache FOR SELECT
USING (true);

-- User Jude preferences table
CREATE TABLE public.user_jude_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    enable_3d BOOLEAN DEFAULT true,
    enable_voice BOOLEAN DEFAULT true,
    voice_speed NUMERIC(2,1) DEFAULT 1.0,
    preferred_language TEXT DEFAULT 'fr',
    animation_speed NUMERIC(2,1) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_jude_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read their own preferences
CREATE POLICY "Users can read own preferences"
ON public.user_jude_preferences FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
ON public.user_jude_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON public.user_jude_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Add realtime for preferences
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_jude_preferences;