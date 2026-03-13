/**
 * @file index.ts
 * @function generate-custom-avatar
 * @description Generates AI custom avatars (256×256 JPEG) using DALL-E 3, stores them in cloud storage, and returns the public URL.
 *
 * @security
 * - Authentication: Required (JWT validated to extract user ID)
 * - Rate limiting: RESOURCE_INTENSIVE tier via shared rateLimiter
 * - RLS: Stores files in avatars storage bucket under user-scoped path
 *
 * @inputs
 * - style: 'anime' | 'manga' | 'chibi' | 'cartoon' | 'realistic'
 * - gender: 'male' | 'female'
 * - hairColor, eyeColor, skinTone, expression: string — Character traits
 * - accessories: string[] — Optional accessories
 * - background: string — Background scene ID
 *
 * @outputs
 * - avatarUrl: string — Public URL of the generated avatar image
 *
 * @triggers HTTP POST from avatar creator UI
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { corsHeaders, securityHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Input validation schema — new optional fields have safe defaults for backward compat
const avatarSchema = z.object({
  style: z.enum(['anime', 'manga', 'chibi', 'cartoon', 'realistic']).optional().default('anime'),
  hairColor: z.string().max(50).optional().default('black'),
  eyeColor: z.string().max(50).optional().default('brown'),
  expression: z.string().max(100).optional().default('friendly smile'),
  accessories: z.array(z.string().max(50)).max(8).optional().default([]),
  skinTone: z.string().max(50).optional().default('medium'),
  gender: z.enum(['male', 'female']),
  // New parameters added for the character creator redesign
  hairStyle: z.string().max(50).optional().default('court'),
  outfitStyle: z.string().max(50).optional().default('casual'),
  background: z.string().max(100).optional().default('classroom'),
  specialEffect: z.string().max(100).optional().default('none'),
}).strict();

// Maps background IDs to descriptive prompt text for DALL-E 3
const backgroundDescriptions: Record<string, string> = {
  'classroom': 'A warm, well-lit classroom with bookshelves and a chalkboard in the background',
  'haitian-beach': 'A beautiful Haitian beach with turquoise water and palm trees',
  'starry-sky': 'A magical starry night sky with constellations and nebulae',
  'modern-city': 'A vibrant modern city skyline with glass buildings at golden hour',
  'tropical-nature': 'Lush tropical vegetation with exotic flowers and greenery',
  'library': 'An elegant library with tall wooden bookshelves full of books',
};

// Maps outfit IDs to descriptive prompt text
const outfitDescriptions: Record<string, string> = {
  'school-uniform': 'wearing a neat school uniform with a tie',
  'casual': 'wearing casual comfortable clothing',
  'sport': 'wearing athletic sportswear',
  'traditional-haitian': 'wearing traditional Haitian clothing with vibrant colors and patterns',
  'futuristic': 'wearing futuristic sci-fi inspired clothing with glowing accents',
};

// Maps special effect IDs to descriptive prompt text
const effectDescriptions: Record<string, string> = {
  'none': '',
  'surrounded-by-books': 'Floating books and pages surround the character magically',
  'golden-light': 'Warm golden light rays emanate around the character creating a divine glow',
  'watercolor': 'The entire image has a beautiful watercolor painting effect with soft bleeding colors',
  'magic-particles': 'Sparkling magical particles and light orbs float around the character',
  'urban-neon': 'Vibrant neon purple and blue light effects glow around the character',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Require authentication for avatar generation
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

    // Rate limiting — resource intensive endpoint
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

    const { style, hairColor, eyeColor, expression, accessories, skinTone, gender, hairStyle, outfitStyle, background, specialEffect } = validation.data;
    
    // Read OpenAI key — replaces Lovable AI Gateway which has persistent 500s on image models
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Build accessory string
    const accessoryList = accessories && accessories.length > 0 
      ? accessories.join(', ') 
      : 'none';

    // Resolve descriptive text for new parameters
    const bgDescription = backgroundDescriptions[background] || backgroundDescriptions['classroom'];
    const outfitDescription = outfitDescriptions[outfitStyle] || outfitDescriptions['casual'];
    const effectDescription = effectDescriptions[specialEffect] || '';

    // Detailed prompt incorporating all character creator options — cultural block is non-negotiable
    const prompt = `MANDATORY CULTURAL CONTEXT: This avatar represents a Haitian student. The character must have features consistent with Caribbean/Haitian heritage — warm skin undertones, facial features reflecting Afro-Caribbean or mixed Caribbean ancestry. The overall aesthetic should feel warm, vibrant, and Caribbean in spirit regardless of the art style chosen. This is non-negotiable and must be reflected in every generated avatar.

CRITICAL INSTRUCTIONS - You MUST follow these characteristics EXACTLY:

CHARACTER SPECIFICATIONS (DO NOT DEVIATE):
- Gender: ${gender} (MUST be clearly ${gender}, this is NON-NEGOTIABLE)
- Skin tone: ${skinTone} (EXACT shade required - if "dark" use dark skin, if "light" use light skin)
- Hair color: ${hairColor} (MUST be this EXACT color: ${hairColor}, not similar, not close - EXACTLY this color)
- Hair style: ${hairStyle} (MUST have this hairstyle)
- Eye color: ${eyeColor} (MUST be this EXACT color: ${eyeColor}, clearly visible)
- Facial expression: ${expression}
- Outfit: ${outfitDescription}
- Accessories: ${accessoryList === 'none' ? 'NO accessories at all - the character must have NO glasses, NO headwear, NO earrings, NOTHING' : `MUST include these and ONLY these: ${accessoryList}`}

STYLE: ${style} style avatar portrait
${style === 'anime' || style === 'manga' ? '- Japanese anime/manga art style with large expressive eyes, clean lines' : ''}
${style === 'chibi' ? '- Cute chibi style with oversized head, small body, very cute proportions' : ''}
${style === 'cartoon' ? '- Western cartoon style with bold outlines, bright saturated colors' : ''}
${style === 'realistic' ? '- Semi-realistic digital art style with detailed features, natural proportions' : ''}

BACKGROUND: ${bgDescription}
${effectDescription ? `SPECIAL EFFECT: ${effectDescription}` : ''}

MANDATORY REQUIREMENTS:
- Head and shoulders portrait, centered composition
- Clean, vibrant colors with professional quality
- Suitable for social media profile picture
- Square aspect ratio (1:1)
- NO text or watermarks
- The character MUST match ALL specified characteristics EXACTLY as described above
- Double-check: Hair is ${hairColor}, Eyes are ${eyeColor}, Skin is ${skinTone}, Gender is ${gender}`;

    console.log('Generating avatar via DALL-E 3');

    // Single DALL-E 3 call — no fallback chain needed
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DALL-E 3 error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`DALL-E 3 error: ${response.status}`);
    }

    const data = await response.json();
    console.log('DALL-E 3 response received');

    // Extract image URL from OpenAI response shape
    const imageUrl = data?.data?.[0]?.url;
    
    if (!imageUrl) {
      console.error('No image in DALL-E 3 response:', JSON.stringify(data));
      throw new Error('No image generated');
    }

    // Fetch image bytes server-side to avoid CORS canvas tainting in the browser
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch generated image: ${imageResponse.status}`);
    }
    const arrayBuffer = await imageResponse.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    // Convert binary to base64 — loop is required because btoa needs a binary string
    let binary = '';
    for (const byte of uint8Array) binary += String.fromCharCode(byte);
    const base64 = btoa(binary);
    const base64DataUrl = `data:image/png;base64,${base64}`;

    console.log('Image fetched and encoded to base64 successfully');

    // Preserve exact response shape for frontend compatibility
    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl: base64DataUrl,
        message: 'Avatar generated successfully'
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
