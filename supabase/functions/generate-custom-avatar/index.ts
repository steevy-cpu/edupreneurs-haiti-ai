
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { corsHeaders, securityHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Helper: attempt image generation with a specific model
async function tryGenerateImage(model: string, prompt: string, apiKey: string) {
  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      modalities: ['image', 'text']
    }),
  });
  return response;
}

// Input validation schema
const avatarSchema = z.object({
  style: z.enum(['anime', 'manga', 'chibi', 'cartoon', 'realistic']).optional().default('anime'),
  hairColor: z.string().max(50).optional().default('black'),
  eyeColor: z.string().max(50).optional().default('brown'),
  expression: z.string().max(100).optional().default('friendly smile'),
  accessories: z.array(z.string().max(50)).max(5).optional().default([]),
  skinTone: z.string().max(50).optional().default('medium'),
  gender: z.enum(['male', 'female']),
}).strict();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get auth token - require authentication for avatar generation
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
      );
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
    const validation = avatarSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors }),
        { status: 400, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { style, hairColor, eyeColor, expression, accessories, skinTone, gender } = validation.data;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build accessory string
    const accessoryList = accessories && accessories.length > 0 
      ? accessories.join(', ') 
      : 'none';

    const prompt = `CRITICAL INSTRUCTIONS - You MUST follow these characteristics EXACTLY:

CHARACTER SPECIFICATIONS (DO NOT DEVIATE):
- Gender: ${gender} (MUST be clearly ${gender}, this is NON-NEGOTIABLE)
- Skin tone: ${skinTone} (EXACT shade required - if "dark" use dark skin, if "light" use light skin)
- Hair color: ${hairColor} (MUST be this EXACT color: ${hairColor}, not similar, not close - EXACTLY this color)
- Eye color: ${eyeColor} (MUST be this EXACT color: ${eyeColor}, clearly visible)
- Facial expression: ${expression}
- Accessories: ${accessoryList === 'none' ? 'NO accessories at all - the character must have NO glasses, NO headwear, NO earrings, NOTHING' : `MUST include these and ONLY these: ${accessoryList}`}

STYLE: ${style} style avatar portrait
${style === 'anime' || style === 'manga' ? '- Japanese anime/manga art style with large expressive eyes, clean lines' : ''}
${style === 'chibi' ? '- Cute chibi style with oversized head, small body, very cute proportions' : ''}
${style === 'cartoon' ? '- Western cartoon style with bold outlines, bright saturated colors' : ''}
${style === 'realistic' ? '- Semi-realistic digital art style with detailed features, natural proportions' : ''}

MANDATORY REQUIREMENTS:
- Head and shoulders portrait, centered composition
- Clean, vibrant colors with professional quality
- Suitable for social media profile picture
- Soft lighting with subtle gradient background
- Square aspect ratio (1:1)
- NO text or watermarks
- The character MUST match ALL specified characteristics EXACTLY as described above
- Double-check: Hair is ${hairColor}, Eyes are ${eyeColor}, Skin is ${skinTone}, Gender is ${gender}`;

    console.log('Generating avatar with prompt:', prompt);

    // Try primary model, fall back to alternative on 500
    const PRIMARY_MODEL = 'google/gemini-2.5-flash-image';
    const FALLBACK_MODEL = 'google/gemini-3-pro-image-preview';

    let response = await tryGenerateImage(PRIMARY_MODEL, prompt, LOVABLE_API_KEY);

    // Retry with fallback model if primary returns 500 (upstream issue)
    if (response.status === 500) {
      console.warn(`Primary model ${PRIMARY_MODEL} returned 500, trying fallback ${FALLBACK_MODEL}`);
      response = await tryGenerateImage(FALLBACK_MODEL, prompt, LOVABLE_API_KEY);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract the image from the response
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageData) {
      console.error('No image in response:', JSON.stringify(data));
      throw new Error('No image generated');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl: imageData,
        message: data.choices?.[0]?.message?.content || 'Avatar generated successfully'
      }),
      { headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating avatar:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate avatar' 
      }),
      { status: 500, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
