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
    const { lessonTitle, contenu, exemplesExercices, gradeLevel, subject } = await req.json();
    
    console.log('🎨 Starting image generation for:', lessonTitle);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const RECRAFT_API_KEY = Deno.env.get('RECRAFT_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }
    
    if (!RECRAFT_API_KEY) {
      throw new Error('RECRAFT_API_KEY not configured');
    }
    
    // Step 1: Use Lovable AI to analyze content and generate image prompts
    console.log('📊 Analyzing lesson content with AI...');
    
    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en création de contenus éducatifs visuels. Analyse les leçons et identifie 2-4 concepts clés qui bénéficieraient d'une représentation visuelle.
            
Pour chaque concept, génère un prompt détaillé en anglais pour créer un diagramme ou illustration éducative.

Concentre-toi sur:
- Des concepts qui bénéficient d'une explication visuelle
- Des diagrammes, schémas et illustrations
- Des images pouvant inclure des étiquettes et texte explicatif
- Approprié pour le niveau scolaire: ${gradeLevel}
- Style: educational illustration, digital art, clean, simple, colorful

CRITIQUE: Tu dois générer AU MOINS 2 concepts, idéalement 3-4 pour enrichir le contenu.

⚠️ RÈGLES STRICTES POUR LE TEXTE DANS LES IMAGES:
- ÉVITE les bulles de dialogue (speech bubbles) sauf si absolument nécessaire
- Si le texte anglais apparaît dans l'image, il DOIT être GRAMMATICALEMENT PARFAIT
- JAMAIS de placeholders comme "Name", "other Name" - utilise des noms réels haïtiens (ex: "Jean", "Marie", "Toussaint")
- Vérifie la grammaire anglaise : "I am Marie" PAS "I am, Name"
- Si la leçon enseigne l'anglais et que des dialogues sont nécessaires, utilise des phrases COMPLÈTES et CORRECTES
- Préfère les images sans texte ou avec des labels simples plutôt que des dialogues

IMPORTANT: Retourne UNIQUEMENT un tableau JSON valide, sans texte avant ou après. Format exact:
[
  {
    "name": "Nom du concept",
    "prompt": "Prompt détaillé en anglais pour Recraft, avec instructions précises pour tout texte visible",
    "insertAt": "contenu" ou "exemples_exercices",
    "description": "Courte description en français"
  }
]`
          },
          {
            role: 'user',
            content: `Leçon: ${lessonTitle}
Matière: ${subject}
Niveau: ${gradeLevel}

Contenu principal:
${contenu?.substring(0, 1500) || 'Pas de contenu'}

Exemples et exercices:
${exemplesExercices?.substring(0, 1500) || 'Pas d\'exemples'}

Génère AU MOINS 2 concepts éducatifs (idéalement 3-4) avec des prompts détaillés en anglais pour créer des illustrations. Retourne uniquement le JSON.`
          }
        ],
        temperature: 0.7
      })
    });
    
    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('❌ Analysis API error:', analysisResponse.status, errorText);
      throw new Error(`AI analysis failed: ${analysisResponse.status}`);
    }
    
    const analysisData = await analysisResponse.json();
    console.log('✅ Analysis complete');
    
    let concepts;
    try {
      const content = analysisData.choices[0].message.content;
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        concepts = JSON.parse(jsonMatch[0]);
      } else {
        concepts = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      console.log('Raw response:', analysisData.choices[0].message.content);
      throw new Error('Failed to parse AI analysis');
    }
    
    if (!Array.isArray(concepts) || concepts.length === 0) {
      throw new Error('No concepts generated');
    }
    
    if (concepts.length < 2) {
      console.warn(`⚠️ Only ${concepts.length} concept(s) generated, expected at least 2`);
      throw new Error('Insufficient concepts generated - need at least 2 images per lesson');
    }
    
    console.log(`📝 Generated ${concepts.length} concept(s):`, concepts.map(c => c.name));
    
    // Step 2: Generate images using Recraft v3
    console.log('🎨 Generating images with Recraft v3...');
    const images = [];
    
    for (let i = 0; i < concepts.length; i++) {
      const concept = concepts[i];
      console.log(`🖼️ Generating image ${i + 1}/${concepts.length}: ${concept.name}`);
      
      try {
        const recraftResponse = await fetch('https://external.api.recraft.ai/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RECRAFT_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: concept.prompt,
            style: 'digital_illustration',
            size: '1024x1024',
            n: 1,
            response_format: 'b64_json'
          })
        });
        
        if (!recraftResponse.ok) {
          const errorText = await recraftResponse.text();
          console.error(`❌ Recraft API error for "${concept.name}":`, recraftResponse.status, errorText);
          
          // Continue to next image instead of failing completely
          continue;
        }
        
        const recraftData = await recraftResponse.json();
        
        if (recraftData.data && recraftData.data[0] && recraftData.data[0].b64_json) {
          images.push({
            concept: concept.name,
            description: concept.description,
            prompt: concept.prompt,
            base64Data: recraftData.data[0].b64_json,
            insertAt: concept.insertAt
          });
          console.log(`✅ Image generated for: ${concept.name}`);
        } else {
          console.warn(`⚠️ No image data in response for: ${concept.name}`);
        }
        
        // Rate limiting: wait 2 seconds between Recraft API calls
        if (i < concepts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (imageError) {
        console.error(`❌ Error generating image for "${concept.name}":`, imageError);
        // Continue to next image
      }
    }
    
    if (images.length === 0) {
      throw new Error('No images were successfully generated');
    }
    
    if (images.length < 2) {
      console.warn(`⚠️ Only ${images.length} image(s) successfully generated, expected at least 2`);
      throw new Error(`Only ${images.length} image(s) generated - need at least 2 images per lesson`);
    }
    
    console.log(`✅ Successfully generated ${images.length} image(s)`);
    
    return new Response(JSON.stringify({ images }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error: any) {
    console.error('❌ Error in generate-explanatory-images:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to generate explanatory images'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
