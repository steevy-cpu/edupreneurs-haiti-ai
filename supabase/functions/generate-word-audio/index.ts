/**
 * generate-word-audio
 * Generates TTS audio for daily words using ElevenLabs or OpenAI.
 * Founder-only endpoint with RESOURCE_INTENSIVE rate limiting.
 *
 * Security: JWT via getUser() + founder check + RESOURCE_INTENSIVE rate limit
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, corsPreflightResponse, secureJsonResponse, secureErrorResponse } from '../_shared/securityHeaders.ts';
import { checkRateLimit, RATE_LIMITS, getClientIp, rateLimitResponse } from '../_shared/rateLimiter.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// Founder/Super User IDs - only these users can regenerate audio
const FOUNDER_USER_IDS = [
  '0de08330-4183-48f9-b169-19b92f4d114f', // Steevy
  '7580cd10-e18c-4b2f-ac50-def28d046c9d', // Djood
];

type TTSProvider = 'openai' | 'elevenlabs';

async function generateWithOpenAI(word: string): Promise<Uint8Array> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1-hd',
      voice: 'nova',
      input: word,
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI TTS error:', errorText);
    throw new Error(`OpenAI TTS API error: ${response.status}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

// Generates French TTS using Eric voice — accepts optional definition for better language detection
async function generateWithElevenLabs(word: string, definition?: string): Promise<Uint8Array> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  // Eric — French male voice, same as generate-jude-voice
  const voiceId = 'cjVigY5qzO86Huf0OWal';

  // Include definition for richer French context; fallback to word alone
  const ttsText = definition ? `${word}. ${definition}` : word;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: ttsText,
        model_id: 'eleven_multilingual_v2',
        // Force French language detection for Creole/French words
        language_code: 'fr',
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
    console.error('ElevenLabs TTS error:', errorText);
    throw new Error(`ElevenLabs TTS API error: ${response.status}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    // ── JWT Authentication (existing getUser pattern) ───────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return secureErrorResponse('Unauthorized - No token provided', 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return secureErrorResponse('Unauthorized - Invalid token', 401);
    }

    // Check if user is a founder
    if (!FOUNDER_USER_IDS.includes(user.id)) {
      console.log(`User ${user.id} attempted to generate audio - not authorized`);
      return secureErrorResponse('Forbidden - Founders only', 403);
    }

    console.log(`Founder ${user.id} authorized to generate audio`);

    // ── Rate Limiting (added) ───────────────────────────────────────────────
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const clientIp = getClientIp(req);
    const rlResult = await checkRateLimit(serviceClient, RATE_LIMITS.RESOURCE_INTENSIVE, user.id, clientIp);
    if (!rlResult.allowed) {
      return rateLimitResponse(rlResult.retryAfter ?? 60, rlResult.remaining, corsHeaders);
    }

    // ── Business Logic ──────────────────────────────────────────────────────
    const { wordId, word, provider = 'elevenlabs' } = await req.json();
    const ttsProvider: TTSProvider = provider === 'openai' ? 'openai' : 'elevenlabs';

    if (!wordId || !word) {
      return secureErrorResponse('Missing wordId or word', 400);
    }

    // Validate API key for selected provider
    if (ttsProvider === 'openai' && !OPENAI_API_KEY) {
      return secureErrorResponse('OpenAI API key not configured', 500);
    }
    if (ttsProvider === 'elevenlabs' && !ELEVENLABS_API_KEY) {
      return secureErrorResponse('ElevenLabs API key not configured', 500);
    }

    // Initialize Supabase client with service role for storage access
    const supabase = serviceClient;

    // Fetch definition from daily_words for richer French TTS context
    const { data: wordData } = await supabase
      .from('daily_words')
      .select('definition')
      .eq('id', wordId)
      .single();
    const definition = wordData?.definition || '';

    console.log(`Generating audio for word: "${word}" (ID: ${wordId}) using ${ttsProvider}, definition: "${definition.slice(0, 50)}..."`);

    // Generate audio based on provider — pass definition for ElevenLabs French context
    const audioBytes = ttsProvider === 'openai'
      ? await generateWithOpenAI(word)
      : await generateWithElevenLabs(word, definition);

    console.log(`Audio generated, size: ${audioBytes.length} bytes`);

    // Upload to Supabase Storage
    const filePath = `word-of-day/${wordId}.mp3`;
    
    const { error: uploadError } = await supabase.storage
      .from('lesson-audio')
      .upload(filePath, audioBytes, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return secureErrorResponse(`Storage upload failed: ${uploadError.message}`, 500);
    }

    // Get public URL with cache-busting timestamp
    const { data: publicUrlData } = supabase.storage
      .from('lesson-audio')
      .getPublicUrl(filePath);

    // Add cache-busting timestamp to force browser to fetch new audio
    const cacheBuster = `?t=${Date.now()}`;
    const audioUrl = publicUrlData.publicUrl + cacheBuster;
    console.log(`Audio uploaded to: ${audioUrl}`);

    // Update the daily_words table with the audio URL and source provider
    const { error: updateError } = await supabase
      .from('daily_words')
      .update({ audio_url: audioUrl, audio_source: ttsProvider })
      .eq('id', wordId);

    if (updateError) {
      console.error('Database update error:', updateError);
      return secureErrorResponse(`Database update failed: ${updateError.message}`, 500);
    }

    console.log(`Successfully generated and saved audio for "${word}" using ${ttsProvider}`);

    return secureJsonResponse({
      success: true,
      audioUrl,
      provider: ttsProvider,
      message: `Audio generated for "${word}" using ${ttsProvider}`,
    });
  } catch (error) {
    console.error('Error in generate-word-audio:', error);
    return secureErrorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
