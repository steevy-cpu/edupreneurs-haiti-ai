import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, year, pageImages } = await req.json();

    if (!subject || !year || !pageImages || !Array.isArray(pageImages) || pageImages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: subject, year, pageImages (array)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${pageImages.length} page images for ${subject} ${year}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build messages with all page images for vision processing
    const imageContent = pageImages.map((img: string) => ({
      type: "image_url",
      image_url: {
        url: img.startsWith("data:") ? img : `data:image/png;base64,${img}`,
      },
    }));

const systemPrompt = `Tu es un expert OCR spécialisé dans l'extraction d'examens officiels haïtiens pour la 9ème année fondamentale (9AF).

INSTRUCTIONS CRITIQUES:
1. Analyse attentivement CHAQUE page de l'examen
2. Identifie et extrait TOUS les TEXTES DE RÉFÉRENCE (Reading, Texte, Lecture, passages, extraits de texte) qui sont utilisés pour répondre aux questions - EXTRAIT LE TEXTE COMPLET sans le tronquer
3. Identifie TOUS les exercices/questions avec leurs numéros
4. Pour les QCM, extrait précisément les options A), B), C), D)
5. Préserve les accents français et créoles (é, è, à, ç, ô, etc.)
6. Identifie les points attribués à chaque question si visibles
7. Détermine le type d'exercice: "multiple_choice" ou "open_ended"

RETOURNE UN JSON VALIDE avec cette structure EXACTE:
{
  "title": "Examen officiel de [Matière] [Année] - 9AF",
  "referenceTexts": [
    {
      "section": "Section A",
      "title": "Titre du texte (ex: Reading: Going to a Restaurant)",
      "text": "LE TEXTE COMPLET DU PASSAGE - ne pas tronquer, extraire tout le contenu"
    }
  ],
  "exercises": [
    {
      "exerciseNumber": 1,
      "exerciseType": "multiple_choice" ou "open_ended",
      "questionText": "Le texte complet de la question",
      "options": {"A": "option A", "B": "option B", "C": "option C", "D": "option D"} ou null,
      "correctAnswer": "A" ou null si inconnu,
      "explanation": null,
      "points": 5,
      "concept": "Concept mathématique/grammatical principal"
    }
  ],
  "totalExercises": nombre total,
  "totalPoints": somme des points
}

IMPORTANT:
- EXTRAIT TOUS les textes de référence (Reading, Texte, Passage, etc.) COMPLETS dans "referenceTexts"
- Si l'examen contient des textes de lecture pour répondre aux questions, ils DOIVENT être dans "referenceTexts"
- Ne rate AUCUNE question
- Numérote séquentiellement (1, 2, 3...)
- Si les points ne sont pas visibles: 5 pts pour QCM, 8 pts pour questions ouvertes
- Le JSON doit être parsable sans erreur`;

    const userPrompt = `Analyse cet examen officiel de ${subject} ${year} pour la 9ème AF haïtienne.

Extrait TOUTES les questions avec:
- Numéro exact de chaque question
- Texte complet de la question
- Options A, B, C, D pour les QCM
- Points si indiqués
- Type d'exercice (multiple_choice ou open_ended)
- Concept principal abordé

Retourne UNIQUEMENT le JSON structuré, sans texte additionnel.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              ...imageContent,
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    console.log("Raw AI response length:", content.length);

    // Clean the response - remove markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith("```json")) {
      cleanedContent = cleanedContent.slice(7);
    } else if (cleanedContent.startsWith("```")) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith("```")) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    // Parse the JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Content that failed to parse:", cleanedContent.substring(0, 500));
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate and normalize the data
    if (!parsedData.exercises || !Array.isArray(parsedData.exercises)) {
      throw new Error("Invalid response structure: missing exercises array");
    }

    // Normalize exercises
    const normalizedExercises = parsedData.exercises.map((ex: any, index: number) => ({
      exerciseNumber: ex.exerciseNumber || index + 1,
      exerciseType: ex.exerciseType || (ex.options ? "multiple_choice" : "open_ended"),
      questionText: ex.questionText || ex.question || `Question ${index + 1}`,
      options: ex.options || null,
      correctAnswer: ex.correctAnswer || null,
      explanation: ex.explanation || null,
      points: typeof ex.points === "number" ? ex.points : (ex.exerciseType === "multiple_choice" ? 5 : 8),
      concept: ex.concept || "Général",
    }));

    const totalPoints = normalizedExercises.reduce((sum: number, ex: any) => sum + (ex.points || 0), 0);

    // Normalize reference texts
    const referenceTexts = Array.isArray(parsedData.referenceTexts) 
      ? parsedData.referenceTexts.map((ref: any) => ({
          section: ref.section || "Texte",
          title: ref.title || "",
          text: ref.text || "",
        }))
      : [];

    const result = {
      title: parsedData.title || `Examen officiel de ${subject} ${year} - 9AF`,
      referenceTexts,
      exercises: normalizedExercises,
      totalExercises: normalizedExercises.length,
      totalPoints: totalPoints || 100,
    };

    console.log(`Successfully parsed ${result.totalExercises} exercises, ${result.totalPoints} points`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in parse-exam-vision:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
