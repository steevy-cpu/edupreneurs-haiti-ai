import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { corsHeaders, securityHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Input validation schema
const ttsSchema = z.object({
  text: z.string().min(1).max(10000),
  lessonId: z.string().uuid(),
  sectionName: z.enum(['objectif', 'introduction', 'contenu', 'exemples']),
  voiceId: z.string().max(100).optional(),
}).strict();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get auth token
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Rate limiting - resource intensive
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(
      supabase,
      RATE_LIMITS.RESOURCE_INTENSIVE,
      userId,
      clientIp
    );

    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfter!, rateLimit.remaining, corsHeaders);
    }

    // Validate input
    const body = await req.json();
    const validation = ttsSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { text, lessonId, sectionName, voiceId } = validation.data;

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

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
      { headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in elevenlabs-tts function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
