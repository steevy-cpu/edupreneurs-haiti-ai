/**
 * Translation Edge Function
 * 
 * Provides AI-powered translation between English, Creole, French, and Spanish.
 * Uses Lovable AI Gateway with google/gemini-2.5-flash for fast, accurate translations.
 * 
 * Security:
 * - Rate limited via RATE_LIMITS.GENERAL (20 req/min for anon)
 * - Input validation with Zod schema
 * - No hardcoded API keys
 * - CORS configured for web access
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { translateSchema, validateInput, validationErrorResponse } from "../_shared/validation.ts";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Language names for the AI prompt
const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ht: 'Haitian Creole (Kreyòl Ayisyen)',
  fr: 'French',
  es: 'Spanish',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Initialize Supabase client for rate limiting
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limit check (anonymous endpoint)
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(
      supabase,
      RATE_LIMITS.GENERAL,
      null, // No user ID for public endpoint
      clientIp
    );

    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfter || 60, rateLimit.remaining, corsHeaders);
    }

    // Parse and validate input
    const body = await req.json();
    const validation = validateInput(translateSchema, body);

    if (!validation.success) {
      return validationErrorResponse(validation.errors, corsHeaders);
    }

    const { text, sourceLang, targetLang } = validation.data;

    // Get Lovable API key
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'Service de traduction indisponible' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build translation prompt
    const sourceLangName = LANGUAGE_NAMES[sourceLang];
    const targetLangName = LANGUAGE_NAMES[targetLang];

    const systemPrompt = `You are a professional translator. Your ONLY task is to translate the given text from ${sourceLangName} to ${targetLangName}.

CRITICAL RULES:
1. Return ONLY the translated text - no explanations, no notes, no commentary
2. Preserve the original formatting (line breaks, punctuation, capitalization style)
3. For Haitian Creole: Use official Haitian Creole orthography (e.g., "ou" not "w", "mwen" not "m'")
4. Maintain the tone and register of the original text
5. If the text contains proper nouns, keep them as-is unless there's a standard translation
6. Do NOT add quotation marks around the translation
7. Do NOT prefix with "Translation:" or any label`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.3, // Lower temperature for more consistent translations
        max_tokens: 8000,
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporairement indisponible. Veuillez réessayer plus tard.' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', status, errorText);
      
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la traduction. Veuillez réessayer.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const translatedText = aiData.choices?.[0]?.message?.content?.trim();

    if (!translatedText) {
      console.error('Empty translation response:', aiData);
      return new Response(
        JSON.stringify({ error: 'Traduction échouée. Veuillez réessayer.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return successful translation
    return new Response(
      JSON.stringify({
        translatedText,
        sourceLang,
        targetLang,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    );

  } catch (error) {
    console.error('Translation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Une erreur inattendue est survenue' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
