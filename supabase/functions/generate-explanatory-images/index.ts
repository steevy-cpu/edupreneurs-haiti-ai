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
    const { lessonTitle, contenu, exemplesExercices, gradeLevel, subject, model } = await req.json();
    
    console.log('🎨 Starting image generation for:', lessonTitle);
    
    // Get API keys
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Only require OPENAI_API_KEY if using OpenAI model
    if (model === 'openai' && !OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    
    // Step 1: Use Lovable AI to analyze content and generate image prompts
    console.log('📊 Analyzing lesson content with AI...');
    
    // Determine the language for text in images based on subject
    const subjectLower = subject.toLowerCase();
    let imageTextLanguage = 'French';
    let languageInstruction = 'ALL text, labels, and captions in the images MUST be in French (français).';
    
    if (subjectLower.includes('kreyòl') || subjectLower.includes('creole')) {
      imageTextLanguage = 'Haitian Creole';
      languageInstruction = 'ALL text, labels, and captions in the images MUST be in Haitian Creole (Kreyòl Ayisyen).';
    } else if (subjectLower.includes('anglais') || subjectLower.includes('english')) {
      imageTextLanguage = 'English';
      languageInstruction = 'ALL text, labels, and captions in the images MUST be in English.';
    } else if (subjectLower.includes('espagnol') || subjectLower.includes('spanish')) {
      imageTextLanguage = 'Spanish';
      languageInstruction = 'ALL text, labels, and captions in the images MUST be in Spanish (Español).';
    }
    
    console.log(`🌐 Image text language set to: ${imageTextLanguage}`);
    
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
            
Pour chaque concept, génère un prompt détaillé mais CONCIS en anglais pour créer un diagramme ou illustration éducative.

Concentre-toi sur:
- Des concepts qui bénéficient d'une explication visuelle
- Des diagrammes, schémas et illustrations
- Des images pouvant inclure des étiquettes et texte explicatif
- Approprié pour le niveau scolaire: ${gradeLevel}
- Style: educational illustration, digital art, clean, simple, colorful

CRITIQUE: Tu dois générer AU MOINS 2 concepts, idéalement 3-4 pour enrichir le contenu.

🌐 LANGUE DU TEXTE DANS LES IMAGES (RÈGLE ABSOLUE #1):
${languageInstruction}
This is NON-NEGOTIABLE. Every single word, label, caption, or text element in the image MUST be in ${imageTextLanguage}.

🎯 RÈGLES CRITIQUES POUR LE TEXTE DANS LES IMAGES (PRIORITÉ ABSOLUE):

1. TEXT ACCURACY IS THE #1 PRIORITY - The text must be 100% grammatically correct and properly spelled in ${imageTextLanguage}
2. In your prompt, you MUST specify the EXACT TEXT that should appear in the image IN ${imageTextLanguage.toUpperCase()}
3. Use this format in your prompt: "The image must show these exact words IN ${imageTextLanguage.toUpperCase()}: '[EXACT TEXT IN ${imageTextLanguage.toUpperCase()} HERE]'"
4. Every word must be grammatically perfect in ${imageTextLanguage} - NO ERRORS ALLOWED
5. Prefer simple labels and captions over complex dialogue bubbles
6. If dialogue is needed, write out the COMPLETE, CORRECT sentences explicitly in ${imageTextLanguage}
7. Use real Haitian names (Jean, Marie, Toussaint, Claude, Rose) for characters
8. Double-check grammar and spelling in ${imageTextLanguage}
9. For scientific terms, use the correct terminology in ${imageTextLanguage}
10. Make sure all text is clearly visible and readable

PROMPT STRUCTURE EXAMPLE:
"Educational illustration showing [concept]. The image must display these exact words in ${imageTextLanguage}: '[EXACT TEXT IN ${imageTextLanguage}]'. The text must be clearly visible, properly capitalized, and grammatically perfect in ${imageTextLanguage}. Use clean, readable fonts. Style: colorful, friendly, educational illustration for Haitian students."

IMPORTANT: Retourne UNIQUEMENT un tableau JSON valide, sans texte avant ou après. Format exact:
[
  {
    "name": "Nom du concept",
    "prompt": "Prompt détaillé en anglais pour OpenAI avec le texte EXACT en ${imageTextLanguage} à afficher spécifié clairement",
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
    
    // Step 2: Generate images using OpenAI gpt-image-1
    console.log(`🖼️ Generating images with ${model === 'openai' ? 'OpenAI' : 'Lovable AI'}...`);
    const images = [];
    
    for (let i = 0; i < concepts.length; i++) {
      const concept = concepts[i];
      console.log(`Generating image ${i + 1}/${concepts.length}: ${concept.name}`);
      
      try {
        let base64Data: string;
        
        if (model === 'openai') {
          // Generate image using OpenAI
          const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-image-1',
              prompt: concept.prompt,
              n: 1,
              size: '1024x1024',
              quality: 'high',
              output_format: 'png'
            })
          });
          
          if (!openaiResponse.ok) {
            const errorText = await openaiResponse.text();
            console.error(`❌ OpenAI API error for "${concept.name}":`, openaiResponse.status, errorText);
            continue;
          }
          
          const openaiData = await openaiResponse.json();
          
          if (openaiData.data && openaiData.data[0] && openaiData.data[0].b64_json) {
            base64Data = openaiData.data[0].b64_json;
          } else if (openaiData.data && openaiData.data[0] && openaiData.data[0].url) {
            // If OpenAI returns a URL instead, fetch and convert to base64
            const imageResponse = await fetch(openaiData.data[0].url);
            const imageBuffer = await imageResponse.arrayBuffer();
            base64Data = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
          } else {
            console.warn(`⚠️ No image data in OpenAI response for: ${concept.name}`);
            continue;
          }
        } else {
          // Generate image using Lovable AI (Nano banana)
          const lovableResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${LOVABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash-image-preview',
              messages: [
                {
                  role: 'user',
                  content: concept.prompt
                }
              ],
              modalities: ['image', 'text']
            })
          });

          if (!lovableResponse.ok) {
            const errorText = await lovableResponse.text();
            console.error(`❌ Lovable AI error for "${concept.name}":`, lovableResponse.status, errorText);
            continue;
          }

          const lovableData = await lovableResponse.json();
          const imageUrl = lovableData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          
          if (!imageUrl) {
            console.error(`⚠️ No image data in Lovable AI response for: ${concept.name}`);
            continue;
          }

          // Extract base64 from data URL format (data:image/png;base64,...)
          base64Data = imageUrl.includes(',') ? imageUrl.split(',')[1] : imageUrl;
        }
        
        images.push({
          concept: concept.name,
          description: concept.description,
          prompt: concept.prompt,
          base64Data: base64Data,
          insertAt: concept.insertAt
        });
        console.log(`✅ Image generated for: ${concept.name}`);
        
        // Rate limiting: wait 1 second between API calls
        if (i < concepts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (imageError) {
        console.error(`❌ Error generating image for "${concept.name}":`, imageError);
        // Continue to next image
      }
    }
    
    if (images.length === 0) {
      throw new Error('No images were successfully generated');
    }
    
    // Accept at least 1 image (2+ is preferred but not required)
    if (images.length < 1) {
      throw new Error('No images were successfully generated');
    }
    
    if (images.length < 2) {
      console.warn(`⚠️ Only ${images.length} image(s) successfully generated, expected at least 2, but proceeding`);
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
