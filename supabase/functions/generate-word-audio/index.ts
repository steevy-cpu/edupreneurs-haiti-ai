import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, corsPreflightResponse, secureJsonResponse, secureErrorResponse } from '../_shared/securityHeaders.ts';

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

async function generateWithElevenLabs(word: string): Promise<Uint8Array> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured');
  }

  const voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Sarah - good for French

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: word,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true, // KEY: Ensures proper volume!
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
    // Verify authentication - only founders can generate audio
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

    console.log(`Generating audio for word: "${word}" (ID: ${wordId}) using ${ttsProvider}`);

    // Initialize Supabase client with service role for storage access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate audio based on provider
    const audioBytes = ttsProvider === 'openai'
      ? await generateWithOpenAI(word)
      : await generateWithElevenLabs(word);

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

    // Update the daily_words table with the audio URL
    const { error: updateError } = await supabase
      .from('daily_words')
      .update({ audio_url: audioUrl })
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
