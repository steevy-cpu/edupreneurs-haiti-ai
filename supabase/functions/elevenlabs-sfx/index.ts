import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, soundType, duration } = await req.json();
    
    if (!soundType || !prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: soundType and prompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    
    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ELEVENLABS_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const storagePath = `quiz-battle/${soundType}.mp3`;

    // Check if sound already exists in storage
    const { data: existingFiles } = await supabase.storage
      .from('game-sounds')
      .list('quiz-battle', { search: `${soundType}.mp3` });
    
    const fileExists = existingFiles?.some(f => f.name === `${soundType}.mp3`);
    
    if (fileExists) {
      const { data: publicUrl } = supabase.storage
        .from('game-sounds')
        .getPublicUrl(storagePath);
      
      console.log(`[elevenlabs-sfx] Sound ${soundType} already cached, returning URL`);
      
      return new Response(
        JSON.stringify({ 
          audioUrl: publicUrl.publicUrl, 
          cached: true,
          soundType 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[elevenlabs-sfx] Generating new sound: ${soundType} with prompt: "${prompt}"`);

    // Generate with ElevenLabs Sound Effects API
    const response = await fetch('https://api.elevenlabs.io/v1/sound-generation', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: prompt,
        duration_seconds: duration || 2,
        prompt_influence: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[elevenlabs-sfx] ElevenLabs API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `ElevenLabs error: ${response.status}`, details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBytes = new Uint8Array(audioBuffer);

    console.log(`[elevenlabs-sfx] Generated audio for ${soundType}, size: ${audioBytes.length} bytes`);

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('game-sounds')
      .upload(storagePath, audioBytes, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('[elevenlabs-sfx] Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: `Upload failed: ${uploadError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: publicUrl } = supabase.storage
      .from('game-sounds')
      .getPublicUrl(storagePath);

    console.log(`[elevenlabs-sfx] Successfully generated and cached ${soundType}`);

    return new Response(
      JSON.stringify({ 
        audioUrl: publicUrl.publicUrl, 
        cached: false,
        soundType,
        size: audioBytes.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[elevenlabs-sfx] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
