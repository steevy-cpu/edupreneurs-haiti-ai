import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { corsHeaders, securityHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";

/** Allowed context values — controls Storage path prefix and future per-context logic */
const ALLOWED_CONTEXTS = ['points-cles', 'studygram', 'onboarding', 'visitor', 'feedback'] as const;

/** storageKey must be safe for Storage paths — alphanumeric, hyphens, slashes only */
const STORAGE_KEY_REGEX = /^[a-zA-Z0-9\-\/]+$/;

/** In-memory rate limiter — resets on cold start, acceptable for abuse prevention */
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

/** Strip HTML tags from text before sending to TTS */
function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '').trim();
}

/** Check per-user rate limit — returns true if allowed */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    // New window — reset counter
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count++;
  return true;
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    // ── Auth: validate JWT via getClaims ──────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client scoped to caller for auth verification
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claimsData.claims.sub as string;

    // ── Rate limit ───────────────────────────────────────────────────────
    if (!checkRateLimit(userId)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Max 20 requests per hour.' }), {
        status: 429,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Input validation ─────────────────────────────────────────────────
    const body = await req.json();
    const { text, storageKey, context } = body;

    if (!text || typeof text !== 'string' || text.length > 500) {
      return new Response(JSON.stringify({ error: 'text required, max 500 chars' }), {
        status: 400,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!storageKey || typeof storageKey !== 'string' || !STORAGE_KEY_REGEX.test(storageKey)) {
      return new Response(JSON.stringify({ error: 'storageKey required, alphanumeric/hyphens/slashes only' }), {
        status: 400,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!context || !ALLOWED_CONTEXTS.includes(context)) {
      return new Response(JSON.stringify({ error: `context must be one of: ${ALLOWED_CONTEXTS.join(', ')}` }), {
        status: 400,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Service-role client for Storage operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const storagePath = `jude-voice/${storageKey}.mp3`;

    // ── Check if audio already exists in Storage via HEAD ─────────────────
    const { data: publicUrlData } = supabase.storage
      .from('lesson-audio')
      .getPublicUrl(storagePath);

    const existingUrl = publicUrlData.publicUrl;

    try {
      const headRes = await fetch(existingUrl, { method: 'HEAD' });
      if (headRes.ok) {
        // Audio already cached — return immediately
        console.log(`[generate-jude-voice] Cache hit: ${storagePath}`);
        return new Response(JSON.stringify({ url: existingUrl, cached: true }), {
          headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch {
      // HEAD request failed — proceed to generate
    }

    // ── Generate audio via ElevenLabs ─────────────────────────────────────
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY not configured');
    }

    const cleanText = stripHtml(text);
    if (!cleanText) {
      return new Response(JSON.stringify({ error: 'Text is empty after stripping HTML' }), {
        status: 400,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[generate-jude-voice] Generating: ${storagePath} (${cleanText.length} chars)`);

    // Eric voice, 3G-optimized format
    const ttsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/cjVigY5qzO86Huf0OWal?output_format=mp3_22050_32`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      console.error('[generate-jude-voice] ElevenLabs error:', ttsResponse.status, errorText);
      if (ttsResponse.status === 429) {
        throw new Error('ElevenLabs rate limit exceeded');
      }
      throw new Error(`ElevenLabs API error: ${ttsResponse.status}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const audioBytes = new Uint8Array(audioBuffer);
    console.log(`[generate-jude-voice] Audio generated: ${audioBytes.length} bytes`);

    // ── Upload to Storage (never overwrite existing) ─────────────────────
    const { error: uploadError } = await supabase.storage
      .from('lesson-audio')
      .upload(storagePath, audioBytes, {
        contentType: 'audio/mpeg',
        upsert: false,
      });

    if (uploadError) {
      // If file already exists (race condition), just return URL
      if (uploadError.message?.includes('already exists') || uploadError.message?.includes('Duplicate')) {
        console.log(`[generate-jude-voice] Race condition — file exists: ${storagePath}`);
        return new Response(JSON.stringify({ url: existingUrl, cached: true }), {
          headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    console.log(`[generate-jude-voice] Uploaded: ${storagePath}`);

    return new Response(JSON.stringify({ url: existingUrl, cached: false }), {
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[generate-jude-voice] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
    });
  }
});
