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
    const { text, lessonId, sectionName, voiceId } = await req.json();

    if (!text || !lessonId || !sectionName) {
      throw new Error('Missing required parameters: text, lessonId, sectionName');
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    // Initialize Supabase client with service role for storage access
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get lesson and subject info for the path
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('slug, subjects(slug)')
      .eq('id', lessonId)
      .single();

    if (lessonError || !lessonData) {
      throw new Error(`Lesson not found: ${lessonError?.message}`);
    }

    const subjectSlug = (lessonData.subjects as any)?.slug || 'unknown';
    const lessonSlug = lessonData.slug;
    const audioPath = `${subjectSlug}/${lessonSlug}-${sectionName}.mp3`;

    console.log(`Generating audio for: ${audioPath}`);

    // Generate audio using ElevenLabs
    // Sarah - clear and friendly voice, great for educational content
    const selectedVoiceId = voiceId || 'EXAVITQu4vr4xnSDxMaL';
    
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
      
      // Handle rate limiting
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment before generating more audio.');
      }
      
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

    const audioUrl = publicUrl.publicUrl;
    console.log('Audio cached successfully:', audioUrl);

    // Map sectionName to the correct column
    const columnMap: Record<string, string> = {
      'objectif': 'audio_objectif_url',
      'introduction': 'audio_introduction_url',
      'contenu': 'audio_contenu_url',
      'exemples': 'audio_exemples_url',
    };

    const columnName = columnMap[sectionName];
    if (!columnName) {
      throw new Error(`Unknown section name: ${sectionName}`);
    }

    // Update the lesson record with the audio URL
    const updateData: Record<string, any> = {
      [columnName]: audioUrl,
      audio_generated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from('lessons')
      .update(updateData)
      .eq('id', lessonId);

    if (updateError) {
      console.error('Lesson update error:', updateError);
      throw new Error(`Failed to update lesson: ${updateError.message}`);
    }

    console.log(`Lesson ${lessonId} updated with ${columnName}`);

    return new Response(
      JSON.stringify({ 
        audioUrl,
        sectionName,
        success: true 
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
