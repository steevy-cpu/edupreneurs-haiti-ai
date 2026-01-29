import { corsPreflightResponse, secureJsonResponse, secureErrorResponse } from "../_shared/securityHeaders.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ValidationRequest {
  lessonId: string;
  lessonTitle: string;
  gradeLevel: string;
  contenu: string;
  exemples: string;
  questions: QuizQuestion[];
}

interface OffContentQuestion {
  index: number;
  question: string;
  reason: string;
}

interface ValidationResponse {
  aligned: boolean;
  confidence: number;
  offContentQuestions: OffContentQuestion[];
  summary: string;
  totalQuestions: number;
  alignedCount: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    const { lessonId, lessonTitle, gradeLevel, contenu, exemples, questions } = await req.json() as ValidationRequest;

    // Validate required fields
    if (!lessonId || !questions || questions.length === 0) {
      return secureErrorResponse("lessonId and questions are required", 400);
    }

    // If no content to validate against, skip AI call
    if (!contenu && !exemples) {
      return secureJsonResponse({
        aligned: false,
        confidence: 0,
        offContentQuestions: questions.map((q, i) => ({
          index: i,
          question: q.question,
          reason: "Aucun contenu de leçon disponible pour la validation"
        })),
        summary: `0/${questions.length} questions alignées - pas de contenu disponible`,
        totalQuestions: questions.length,
        alignedCount: 0
      });
    }

    // Truncate content to prevent token overflow (max ~15000 chars combined)
    const maxContentLength = 12000;
    const maxExemplesLength = 3000;
    const truncatedContenu = contenu ? contenu.substring(0, maxContentLength) : "";
    const truncatedExemples = exemples ? exemples.substring(0, maxExemplesLength) : "";

    // Format questions for AI analysis
    const questionsForAnalysis = questions.map((q, i) => ({
      index: i,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation
    }));

    const systemPrompt = `Tu es un expert en validation de contenu pédagogique pour des étudiants haïtiens.

TÂCHE: Vérifier si chaque question de quiz peut être répondue UNIQUEMENT avec les informations du contenu fourni.

RÈGLES STRICTES:
1. Une question est "alignée" si TOUS les concepts nécessaires pour y répondre sont présents dans le contenu de la leçon
2. Une question est "hors-contenu" si elle requiert des connaissances NON présentes dans le contenu
3. NE PAS juger si la réponse est correcte - seulement si elle est dérivable du contenu
4. Les concepts généraux ou de culture générale non mentionnés dans le contenu = hors-contenu
5. Si une question demande des détails spécifiques (dates, chiffres, formules) non présents dans le contenu = hors-contenu

EXEMPLES:
- Contenu parle de "la photosynthèse utilise le CO2"
- Question: "Quel gaz est utilisé dans la photosynthèse?" → ALIGNÉE (CO2 est mentionné)
- Question: "Quelle est la formule chimique du glucose produit?" → HORS-CONTENU (formule non mentionnée)

RÉPONSE JSON OBLIGATOIRE:
{
  "offContentQuestions": [
    {
      "index": 0,
      "reason": "Le concept X n'est pas mentionné dans le contenu de la leçon"
    }
  ],
  "confidence": 0.85
}

- "offContentQuestions": tableau des questions hors-contenu avec leur index (0-based) et la raison
- "confidence": niveau de confiance entre 0 et 1 pour l'analyse globale
- Si toutes les questions sont alignées, retourne un tableau vide pour offContentQuestions`;

    const userPrompt = `LEÇON: "${lessonTitle}" (${gradeLevel})

=== CONTENU DE LA LEÇON (SEULE SOURCE AUTORISÉE) ===
${truncatedContenu}

=== EXEMPLES/EXERCICES DE LA LEÇON ===
${truncatedExemples || "Aucun exemple fourni"}

=== QUESTIONS DU QUIZ À VALIDER ===
${JSON.stringify(questionsForAnalysis, null, 2)}

Analyse chaque question et identifie celles qui ne peuvent PAS être répondues uniquement avec le contenu ci-dessus.`;

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
    let parsedResponse: { offContentQuestions: { index: number; reason: string }[]; confidence: number };
    try {
      parsedResponse = JSON.parse(content);
    } catch {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    const offContentQuestions: OffContentQuestion[] = (parsedResponse.offContentQuestions || []).map(ocq => ({
      index: ocq.index,
      question: questions[ocq.index]?.question || "",
      reason: ocq.reason
    }));

    const alignedCount = questions.length - offContentQuestions.length;
    const aligned = offContentQuestions.length === 0;

    const result: ValidationResponse = {
      aligned,
      confidence: parsedResponse.confidence || 0.8,
      offContentQuestions,
      summary: `${alignedCount}/${questions.length} questions alignées`,
      totalQuestions: questions.length,
      alignedCount
    };

    return secureJsonResponse(result);

  } catch (error) {
    console.error('Error in validate-quiz-content-alignment:', error);
    return secureErrorResponse(
      error instanceof Error ? error.message : 'Erreur interne du serveur',
      500
    );
  }
});
