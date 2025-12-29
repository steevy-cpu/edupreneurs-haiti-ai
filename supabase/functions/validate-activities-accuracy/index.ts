import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActivityQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  activityType?: string;
}

interface ValidationRequest {
  lessonId: string;
  activities: ActivityQuestion[];
  lessonContent?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lessonId, activities, lessonContent } = await req.json() as ValidationRequest;

    console.log(`🔍 Validating activities for lesson: ${lessonId}, ${activities.length} activities`);

    if (!activities || activities.length === 0) {
      return new Response(
        JSON.stringify({ 
          confidence: 0, 
          issues: [], 
          error: 'No activities provided' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the validation prompt
    const activitiesText = activities.map((a, idx) => {
      const correctLetter = String.fromCharCode(65 + a.correctAnswer);
      return `
Activité ${idx + 1}${a.activityType ? ` (${a.activityType})` : ''}: ${a.question}
Options:
A) ${a.options[0]}
B) ${a.options[1]}
C) ${a.options[2]}
D) ${a.options[3]}
Réponse marquée correcte: ${correctLetter}) ${a.options[a.correctAnswer]}
Explication fournie: ${a.explanation}
`;
    }).join('\n---\n');

    const systemPrompt = `Tu es un expert en éducation et vérification de contenu pédagogique pour les élèves haïtiens.

Ta tâche est d'analyser chaque activité interactive et de vérifier:
1. Si la réponse marquée comme correcte est vraiment correcte
2. Si l'explication est cohérente avec la réponse
3. Si les options sont toutes plausibles (pas de réponses évidentes)
4. Si la question est claire et bien formulée pour une activité interactive
5. Si le niveau de difficulté est approprié

IMPORTANT: 
- Sois très attentif aux erreurs factuelles
- Vérifie les calculs mathématiques
- Vérifie les faits historiques, scientifiques, géographiques
- Signale si une réponse semble incorrecte
- Les activités interactives doivent être engageantes et pédagogiques

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans backticks) avec cette structure:
{
  "confidence": <number entre 0 et 1 représentant la confiance globale>,
  "issues": [
    {
      "activityIndex": <index de l'activité (0-based)>,
      "issue": "<description du problème>",
      "suggestedFix": "<correction suggérée si applicable>"
    }
  ],
  "summary": "<résumé court de l'évaluation>"
}

Si tout semble correct, retourne une liste d'issues vide avec une confidence élevée.`;

    const userPrompt = `Analyse ces activités interactives et vérifie leur exactitude:

${activitiesText}

${lessonContent ? `\nContenu de la leçon pour référence:\n${lessonContent.substring(0, 2000)}` : ''}

Réponds uniquement avec le JSON, sans texte supplémentaire.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("🤖 AI response:", content.substring(0, 500));

    // Parse the JSON response
    let validationResult;
    try {
      // Clean potential markdown formatting
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      validationResult = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Return a default response if parsing fails
      validationResult = {
        confidence: 0.5,
        issues: [],
        summary: "Unable to parse AI validation response",
        rawResponse: content.substring(0, 500)
      };
    }

    console.log(`✅ Activity validation complete. Confidence: ${validationResult.confidence}, Issues: ${validationResult.issues?.length || 0}`);

    return new Response(
      JSON.stringify(validationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Activity validation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        confidence: 0,
        issues: []
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
