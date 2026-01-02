import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, subjectSlug, lessonSlug, voiceId } = await req.json();

    if (!text || !subjectSlug || !lessonSlug) {
      throw new Error('Missing required parameters: text, subjectSlug, lessonSlug');
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    // Initialize Supabase client with service role for storage access
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check if audio already exists in cache
    const audioPath = `${subjectSlug}/${lessonSlug}.mp3`;
    
    const { data: existingFile } = await supabase.storage
      .from('lesson-audio')
      .list(subjectSlug, {
        search: `${lessonSlug}.mp3`
      });

    if (existingFile && existingFile.length > 0) {
      // Return the cached audio URL
      const { data: publicUrl } = supabase.storage
        .from('lesson-audio')
        .getPublicUrl(audioPath);

      console.log('Returning cached audio:', publicUrl.publicUrl);
      
      return new Response(
        JSON.stringify({ 
          audioUrl: publicUrl.publicUrl,
          cached: true 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating new audio for:', audioPath);

    // Generate audio using ElevenLabs
    const selectedVoiceId = voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Sarah - clear and friendly voice
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2', // Best for French content
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBytes = new Uint8Array(audioBuffer);

    console.log('Audio generated, size:', audioBytes.length, 'bytes');

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('lesson-audio')
      .upload(audioPath, audioBytes, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Failed to cache audio: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from('lesson-audio')
      .getPublicUrl(audioPath);

    console.log('Audio cached successfully:', publicUrl.publicUrl);

    return new Response(
      JSON.stringify({ 
        audioUrl: publicUrl.publicUrl,
        cached: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in elevenlabs-tts function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
