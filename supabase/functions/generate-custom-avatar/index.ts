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

    const prompt = `Create a high-quality ${style || 'anime'} style avatar portrait with these exact characteristics:
- Gender: ${gender}
- Skin tone: ${skinTone || 'medium'}
- Hair: ${hairColor || 'black'} colored hair, styled attractively and matching the ${gender} gender
- Eyes: ${eyeColor || 'brown'} colored eyes, expressive and vibrant
- Expression: ${expression || 'friendly smile'}
- Accessories: ${accessoryList}

Style requirements:
- Clean, vibrant colors with professional quality
- Avatar suitable for social media profile picture
- Head and shoulders portrait view, centered composition
- Soft lighting with slight gradient background
- ${style === 'anime' || style === 'manga' ? 'Japanese anime/manga art style with large expressive eyes' : ''}
- ${style === 'chibi' ? 'Cute chibi style with oversized head and small body' : ''}
- ${style === 'cartoon' ? 'Western cartoon style with bold outlines and bright colors' : ''}
- ${style === 'realistic' ? 'Semi-realistic style with anime influences, detailed features' : ''}
- No text or watermarks
- Square aspect ratio (1:1)

Generate a single avatar portrait that looks professional and appealing.`;

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
