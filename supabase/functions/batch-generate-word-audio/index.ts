/**
 * @file batch-generate-word-audio
 * Batch-generates ElevenLabs TTS audio for daily_words missing audio_url.
 * Processes up to 30 words per invocation with 500ms delay between each.
 * 
 * Auth: X-Internal-Secret header OR JWT founder check.
 * Returns: { processed, failed, remaining, total }
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, corsPreflightResponse, secureJsonResponse, secureErrorResponse } from '../_shared/securityHeaders.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
const INTERNAL_CALL_SECRET = Deno.env.get('INTERNAL_CALL_SECRET');

// Max words per invocation — keeps within edge function timeout
const BATCH_SIZE = 30;
// Delay between ElevenLabs calls to respect rate limits
const DELAY_MS = 500;
// Eric voice — consistent with generate-word-audio and Jude voice infra
const VOICE_ID = 'cjVigY5qzO86Huf0OWal';

// Founder UUIDs — same source of truth as founderConstants.ts
const FOUNDER_USER_IDS = [
  '0de08330-4183-48f9-b169-19b92f4d114f',
  '7580cd10-e18c-4b2f-ac50-def28d046c9d',
  'a72154dd-97ae-4dfe-a939-b48ecc7764fb',
];

/** Generate French TTS via ElevenLabs — includes definition for richer context */
async function generateTTS(word: string, definition: string): Promise<Uint8Array> {
  const ttsText = definition ? `${word}. ${definition}` : word;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: ttsText,
        model_id: 'eleven_multilingual_v2',
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
    throw new Error(`ElevenLabs API ${response.status}: ${errorText.slice(0, 200)}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

/** Simple delay helper */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    // ── Auth: X-Internal-Secret OR JWT founder ────────────────────────────
    const internalSecret = req.headers.get('x-internal-secret');
    let isAuthorized = false;

    if (internalSecret && INTERNAL_CALL_SECRET && internalSecret === INTERNAL_CALL_SECRET) {
      // Internal call from Control Center or cron — trusted
      isAuthorized = true;
      console.log('Authorized via X-Internal-Secret');
    } else {
      // Fall back to JWT founder check
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
        if (!authError && user && FOUNDER_USER_IDS.includes(user.id)) {
          isAuthorized = true;
          console.log(`Authorized via JWT founder: ${user.id}`);
        }
      }
    }

    if (!isAuthorized) {
      return secureErrorResponse('Unauthorized — founders or internal calls only', 403);
    }

    // ── Pre-check: ElevenLabs key must be configured ──────────────────────
    if (!ELEVENLABS_API_KEY) {
      return secureErrorResponse('ELEVENLABS_API_KEY not configured', 500);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Count total missing before processing ─────────────────────────────
    const { count: totalMissing } = await supabase
      .from('daily_words')
      .select('id', { count: 'exact', head: true })
      .is('audio_url', null)
      .eq('is_active', true);

    // ── Fetch batch of words without audio ─────────────────────────────────
    const { data: wordsToProcess, error: fetchError } = await supabase
      .from('daily_words')
      .select('id, word, definition')
      .is('audio_url', null)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return secureErrorResponse(`Database query failed: ${fetchError.message}`, 500);
    }

    if (!wordsToProcess || wordsToProcess.length === 0) {
      return secureJsonResponse({
        processed: 0,
        failed: [],
        remaining: 0,
        total: totalMissing ?? 0,
        message: 'All active words already have audio',
      });
    }

    console.log(`Processing batch of ${wordsToProcess.length} words (${totalMissing} total missing)`);

    // ── Process each word sequentially with delay ──────────────────────────
    let processed = 0;
    const failed: { id: string; word: string; error: string }[] = [];

    for (const wordRow of wordsToProcess) {
      try {
        console.log(`Generating audio for \"${wordRow.word}\" (${wordRow.id})`);

        // Generate TTS audio bytes
        const audioBytes = await generateTTS(wordRow.word, wordRow.definition || '');
        console.log(`  → ${audioBytes.length} bytes`);

        // Upload to storage — upsert replaces any stale file
        const filePath = `word-of-day/${wordRow.id}.mp3`;
        const { error: uploadError } = await supabase.storage
          .from('lesson-audio')
          .upload(filePath, audioBytes, {
            contentType: 'audio/mpeg',
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Storage upload: ${uploadError.message}`);
        }

        // Get public URL (no cache-buster for batch — clean URL stored)
        const { data: publicUrlData } = supabase.storage
          .from('lesson-audio')
          .getPublicUrl(filePath);

        const audioUrl = publicUrlData.publicUrl;

        // Update daily_words with new audio URL and source
        const { error: updateError } = await supabase
          .from('daily_words')
          .update({ audio_url: audioUrl, audio_source: 'elevenlabs' })
          .eq('id', wordRow.id);

        if (updateError) {
          throw new Error(`DB update: ${updateError.message}`);
        }

        processed++;
        console.log(`  ✓ Done: \"${wordRow.word}\"`);
      } catch (err) {
        // Log and continue — never stop the batch for a single failure
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        console.error(`  ✗ Failed \"${wordRow.word}\": ${errorMsg}`);
        failed.push({ id: wordRow.id, word: wordRow.word, error: errorMsg });
      }

      // Rate-limit delay between words (skip after last word)
      if (wordsToProcess.indexOf(wordRow) < wordsToProcess.length - 1) {
        await delay(DELAY_MS);
      }
    }

    // remaining = total missing minus what we successfully processed
    const remaining = Math.max(0, (totalMissing ?? 0) - processed);

    console.log(`Batch complete: ${processed} processed, ${failed.length} failed, ${remaining} remaining`);

    return secureJsonResponse({
      processed,
      failed,
      remaining,
      total: totalMissing ?? 0,
    });
  } catch (error) {
    console.error('Error in batch-generate-word-audio:', error);
    return secureErrorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
