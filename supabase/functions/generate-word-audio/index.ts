import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, corsPreflightResponse, secureJsonResponse, secureErrorResponse } from '../_shared/securityHeaders.ts';

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Sarah voice - clear French pronunciation
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    // Check for API key
    if (!ELEVENLABS_API_KEY) {
      return secureErrorResponse('ElevenLabs API key not configured', 500);
    }

    const { wordId, word } = await req.json();

    if (!wordId || !word) {
      return secureErrorResponse('Missing wordId or word', 400);
    }

    console.log(`Generating audio for word: "${word}" (ID: ${wordId})`);

    // Initialize Supabase client with service role for storage access
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate audio from ElevenLabs
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
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
            stability: 0.75,
            similarity_boost: 0.85,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('ElevenLabs error:', errorText);
      return secureErrorResponse(`ElevenLabs API error: ${ttsResponse.status}`, 500);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioBytes = new Uint8Array(audioBuffer);

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

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('lesson-audio')
      .getPublicUrl(filePath);

    const audioUrl = publicUrlData.publicUrl;
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

    console.log(`Successfully generated and saved audio for "${word}"`);

    return secureJsonResponse({
      success: true,
      audioUrl,
      message: `Audio generated for "${word}"`,
    });
  } catch (error) {
    console.error('Error in generate-word-audio:', error);
    return secureErrorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
