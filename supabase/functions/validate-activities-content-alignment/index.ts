import { corsPreflightResponse, secureJsonResponse, secureErrorResponse } from "../_shared/securityHeaders.ts";

interface ParsedQuizActivity {
  activityType: 'QUIZ';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ParsedTrueFalseActivity {
  activityType: 'TRUE_FALSE';
  statement: string;
  isTrue: boolean;
  explanation: string;
}

type ParsedActivity = ParsedQuizActivity | ParsedTrueFalseActivity;

interface ValidationRequest {
  lessonId: string;
  lessonTitle: string;
  gradeLevel: string;
  contenu: string;
  exemples: string;
  activities: ParsedActivity[];
}

interface OffContentActivity {
  index: number;
  type: 'QUIZ' | 'TRUE_FALSE';
  content: string; // question or statement
  reason: string;
}

interface ValidationResponse {
  aligned: boolean;
  confidence: number;
  offContentActivities: OffContentActivity[];
  summary: string;
  totalActivities: number;
  alignedCount: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    const { lessonId, lessonTitle, gradeLevel, contenu, exemples, activities } = await req.json() as ValidationRequest;

    // Validate required fields
    if (!lessonId || !activities || activities.length === 0) {
      return secureErrorResponse("lessonId and activities are required", 400);
    }

    // If no content to validate against, skip AI call
    if (!contenu && !exemples) {
      return secureJsonResponse({
        aligned: false,
        confidence: 0,
        offContentActivities: activities.map((a, i) => ({
          index: i,
          type: a.activityType,
          content: a.activityType === 'QUIZ' ? a.question : a.statement,
          reason: "Aucun contenu de leçon disponible pour la validation"
        })),
        summary: `0/${activities.length} activités alignées - pas de contenu disponible`,
        totalActivities: activities.length,
        alignedCount: 0
      });
    }

    // Truncate content to prevent token overflow (max ~15000 chars combined)
    const maxContentLength = 12000;
    const maxExemplesLength = 3000;
    const truncatedContenu = contenu ? contenu.substring(0, maxContentLength) : "";
    const truncatedExemples = exemples ? exemples.substring(0, maxExemplesLength) : "";

    // Format activities for AI analysis
    const activitiesForAnalysis = activities.map((a, i) => {
      if (a.activityType === 'QUIZ') {
        return {
          index: i,
          type: 'QUIZ',
          question: a.question,
          options: a.options,
          correctAnswer: a.correctAnswer,
          explanation: a.explanation
        };
      } else {
        return {
          index: i,
          type: 'TRUE_FALSE',
          statement: a.statement,
          isTrue: a.isTrue,
          explanation: a.explanation
        };
      }
    });

    const systemPrompt = `Tu es un expert en validation de contenu pédagogique pour des étudiants haïtiens.

TÂCHE: Vérifier si chaque activité interactive peut être répondue UNIQUEMENT avec les informations du contenu fourni.

TYPES D'ACTIVITÉS À VALIDER:
1. QUIZ (QCM): Vérifie si la question et la bonne réponse sont dérivables du contenu
2. TRUE_FALSE (Vrai/Faux): Vérifie si l'affirmation est abordée dans le contenu

RÈGLES STRICTES:
1. Une activité est "alignée" si TOUS les concepts nécessaires pour y répondre sont présents dans le contenu de la leçon
2. Une activité est "hors-contenu" si elle requiert des connaissances NON présentes dans le contenu
3. NE PAS juger si la réponse est correcte - seulement si elle est dérivable du contenu
4. Les concepts généraux ou de culture générale non mentionnés dans le contenu = hors-contenu
5. Si une activité demande des détails spécifiques (dates, chiffres, formules) non présents dans le contenu = hors-contenu

EXEMPLES:
- Contenu parle de "la photosynthèse utilise le CO2"
- Question QUIZ: "Quel gaz est utilisé dans la photosynthèse?" → ALIGNÉE (CO2 est mentionné)
- Affirmation TRUE_FALSE: "La photosynthèse produit du glucose" → HORS-CONTENU si non mentionné

RÉPONSE JSON OBLIGATOIRE:
{
  "offContentActivities": [
    {
      "index": 0,
      "type": "QUIZ",
      "reason": "Le concept X n'est pas mentionné dans le contenu de la leçon"
    }
  ],
  "confidence": 0.85
}

- "offContentActivities": tableau des activités hors-contenu avec leur index (0-based), type, et raison
- "confidence": niveau de confiance entre 0 et 1 pour l'analyse globale
- Si toutes les activités sont alignées, retourne un tableau vide pour offContentActivities`;

    const userPrompt = `LEÇON: "${lessonTitle}" (${gradeLevel})

=== CONTENU DE LA LEÇON (SEULE SOURCE AUTORISÉE) ===
${truncatedContenu}

=== EXEMPLES/EXERCICES DE LA LEÇON ===
${truncatedExemples || "Aucun exemple fourni"}

=== ACTIVITÉS INTERACTIVES À VALIDER ===
${JSON.stringify(activitiesForAnalysis, null, 2)}

Analyse chaque activité et identifie celles qui ne peuvent PAS être répondues uniquement avec le contenu ci-dessus.`;

    // Call Lovable AI gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse AI response
    let parsedResponse: { offContentActivities: { index: number; type: string; reason: string }[]; confidence: number };
    try {
      parsedResponse = JSON.parse(content);
    } catch {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    const offContentActivities: OffContentActivity[] = (parsedResponse.offContentActivities || []).map(oca => {
      const activity = activities[oca.index];
      return {
        index: oca.index,
        type: (oca.type as 'QUIZ' | 'TRUE_FALSE') || activity?.activityType || 'QUIZ',
        content: activity?.activityType === 'QUIZ' 
          ? (activity as ParsedQuizActivity).question 
          : (activity as ParsedTrueFalseActivity).statement,
        reason: oca.reason
      };
    });

    const alignedCount = activities.length - offContentActivities.length;
    const aligned = offContentActivities.length === 0;

    const result: ValidationResponse = {
      aligned,
      confidence: parsedResponse.confidence || 0.8,
      offContentActivities,
      summary: `${alignedCount}/${activities.length} activités alignées`,
      totalActivities: activities.length,
      alignedCount
    };

    return secureJsonResponse(result);

  } catch (error) {
    console.error('Error in validate-activities-content-alignment:', error);
    return secureErrorResponse(
      error instanceof Error ? error.message : 'Erreur interne du serveur',
      500
    );
  }
});
