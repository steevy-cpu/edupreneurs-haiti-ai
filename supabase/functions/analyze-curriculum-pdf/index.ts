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
    const { pageImages, subjectName, gradeLevel, existingLessons } = await req.json();

    if (!pageImages || !Array.isArray(pageImages) || pageImages.length === 0) {
      throw new Error('pageImages array is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Analyzing curriculum PDF for ${subjectName} (${gradeLevel}) with ${pageImages.length} pages`);
    console.log(`Existing lessons to compare: ${existingLessons?.length || 0}`);

    // Prepare system prompt for thorough curriculum analysis
    const systemPrompt = `Tu es un expert en analyse de programmes scolaires haïtiens. Tu dois analyser minutieusement ce document PDF de programme éducatif.

OBJECTIF: Extraire TOUS les éléments du curriculum de façon exhaustive pour identifier ce qui pourrait manquer dans les leçons existantes.

INSTRUCTIONS D'ANALYSE DÉTAILLÉE:
1. CHAPITRES & UNITÉS: Identifie chaque chapitre, unité ou module
2. LEÇONS & THÈMES: Liste chaque leçon, thème ou sujet mentionné
3. OBJECTIFS: Note les objectifs d'apprentissage spécifiques
4. COMPÉTENCES: Identifie les compétences visées
5. NOTIONS CLÉS: Repère les concepts, définitions et formules importantes
6. EXERCICES TYPES: Note les types d'exercices ou activités suggérées

RÈGLES IMPORTANTES:
- Sois EXHAUSTIF - ne manque aucun élément du programme
- Inclus les sous-thèmes et détails fins
- Note les numéros de pages si visibles
- Préserve la hiérarchie (chapitre > leçon > sous-thème)

COMPARAISON AVEC LES LEÇONS EXISTANTES:
Les leçons déjà créées sont: ${JSON.stringify(existingLessons || [])}

Tu dois identifier:
1. Les topics du PDF qui correspondent à des leçons existantes (match)
2. Les topics du PDF qui ne sont PAS couverts (manquants)
3. Les topics partiellement couverts (le titre existe mais le contenu semble incomplet)

FORMAT DE RÉPONSE (JSON strict):
{
  "documentTitle": "Titre du document analysé",
  "gradeLevel": "${gradeLevel}",
  "subject": "${subjectName}",
  "totalTopicsFound": 0,
  "chapters": [
    {
      "name": "Nom du chapitre",
      "topics": [
        {
          "name": "Nom du topic/leçon",
          "description": "Brève description du contenu",
          "objectives": ["objectif 1", "objectif 2"],
          "keyNotions": ["notion 1", "notion 2"],
          "pageReference": "p. X"
        }
      ]
    }
  ],
  "coveredTopics": [
    {
      "pdfTopic": "Topic du PDF",
      "matchedLesson": "Titre de la leçon existante",
      "matchConfidence": "exact|partial"
    }
  ],
  "missingTopics": [
    {
      "name": "Topic manquant",
      "chapter": "Chapitre parent",
      "priority": "high|medium|low",
      "suggestedLessonTitle": "Titre suggéré pour la nouvelle leçon",
      "description": "Ce que cette leçon devrait couvrir"
    }
  ],
  "partiallyCoovered": [
    {
      "pdfTopic": "Topic du PDF",
      "existingLesson": "Leçon existante",
      "missingAspects": ["Ce qui manque dans la leçon actuelle"]
    }
  ],
  "recommendations": [
    "Recommandation pour améliorer la couverture du programme"
  ]
}`;

    // Prepare image content for the API
    const imageContent = pageImages.map((base64Image: string) => ({
      type: "image_url",
      image_url: {
        url: base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}`
      }
    }));

    const userPrompt = `Analyse attentivement ce document de programme scolaire.

MATIÈRE: ${subjectName}
NIVEAU: ${gradeLevel}
LEÇONS EXISTANTES: ${JSON.stringify(existingLessons || [], null, 2)}

RAPPEL: Tu dois être EXHAUSTIF dans ton analyse. Examine chaque page minutieusement pour ne manquer aucun topic, chapitre, objectif ou notion clé du programme.

Retourne UNIQUEMENT le JSON valide sans commentaires ni markdown.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: userPrompt },
              ...imageContent
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Crédits AI insuffisants. Veuillez recharger votre compte.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('Raw AI response length:', content.length);

    // Clean and parse JSON
    let cleanedContent = content
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    let result;
    try {
      result = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Content to parse:', cleanedContent.substring(0, 500));
      throw new Error('Failed to parse AI response as JSON');
    }

    // Ensure required fields exist
    result.coveredTopics = result.coveredTopics || [];
    result.missingTopics = result.missingTopics || [];
    result.partiallyCoovered = result.partiallyCoovered || [];
    result.recommendations = result.recommendations || [];
    result.chapters = result.chapters || [];

    // Calculate statistics
    result.statistics = {
      totalTopicsInPDF: result.chapters.reduce((acc: number, ch: any) => acc + (ch.topics?.length || 0), 0),
      coveredCount: result.coveredTopics.length,
      missingCount: result.missingTopics.length,
      partialCount: result.partiallyCoovered.length,
      coveragePercentage: 0
    };

    const totalTopics = result.statistics.totalTopicsInPDF;
    if (totalTopics > 0) {
      result.statistics.coveragePercentage = Math.round(
        ((result.coveredTopics.length + result.partiallyCoovered.length * 0.5) / totalTopics) * 100
      );
    }

    console.log('Analysis complete:', {
      totalTopics: result.statistics.totalTopicsInPDF,
      covered: result.statistics.coveredCount,
      missing: result.statistics.missingCount,
      partial: result.statistics.partialCount,
      coverage: result.statistics.coveragePercentage
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-curriculum-pdf:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
