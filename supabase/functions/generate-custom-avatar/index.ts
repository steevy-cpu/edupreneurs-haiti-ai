import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { style, hairColor, eyeColor, expression, accessories, skinTone, gender } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Validate gender
    if (!gender || (gender !== 'male' && gender !== 'female')) {
      throw new Error('Gender must be either "male" or "female"');
    }

    // Build accessory string
    const accessoryList = accessories && accessories.length > 0 
      ? accessories.join(', ') 
      : 'none';

    const prompt = `CRITICAL INSTRUCTIONS - You MUST follow these characteristics EXACTLY:

CHARACTER SPECIFICATIONS (DO NOT DEVIATE):
- Gender: ${gender} (MUST be clearly ${gender}, this is NON-NEGOTIABLE)
- Skin tone: ${skinTone || 'medium'} (EXACT shade required - if "dark" use dark skin, if "light" use light skin)
- Hair color: ${hairColor || 'black'} (MUST be this EXACT color: ${hairColor || 'black'}, not similar, not close - EXACTLY this color)
- Eye color: ${eyeColor || 'brown'} (MUST be this EXACT color: ${eyeColor || 'brown'}, clearly visible)
- Facial expression: ${expression || 'friendly smile'}
- Accessories: ${accessoryList === 'none' ? 'NO accessories at all - the character must have NO glasses, NO headwear, NO earrings, NOTHING' : `MUST include these and ONLY these: ${accessoryList}`}

STYLE: ${style || 'anime'} style avatar portrait
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
- Double-check: Hair is ${hairColor || 'black'}, Eyes are ${eyeColor || 'brown'}, Skin is ${skinTone || 'medium'}, Gender is ${gender}`;

    console.log('Generating avatar with prompt:', prompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [{ role: 'user', content: prompt }],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Usage limit reached. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating avatar:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate avatar' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
