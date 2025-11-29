import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, year, extractedText } = await req.json();

    if (!subject || !year || !extractedText) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es un expert en analyse de documents d'examens officiels haïtiens. 
Ton rôle est de parser le texte d'un examen officiel de 9ème AF et d'extraire toutes les informations structurées.

Règles importantes:
1. Identifier tous les exercices/questions dans l'ordre
2. Pour chaque exercice, extraire:
   - Le numéro d'exercice
   - Le type (multiple_choice ou open_ended)
   - Le texte complet de la question
   - Les options de réponse (A, B, C, D) si c'est un QCM
   - La réponse correcte si elle est indiquée
   - Le nombre de points
   - Le concept/thème abordé
3. Calculer le nombre total d'exercices et le nombre total de points
4. Créer un titre approprié pour l'examen

IMPORTANT: Tu dois retourner UNIQUEMENT un objet JSON valide, sans texte additionnel, sans markdown, sans balises de code.`;

    const userPrompt = `Analyse cet examen officiel de ${subject} ${year} pour la 9ème AF et retourne un JSON structuré:

${extractedText}

Retourne exactement ce format JSON (sans balises markdown, sans texte additionnel):
{
  "title": "Examen Officiel de [Matière] ${year}",
  "totalExercises": <nombre total d'exercices>,
  "totalPoints": <somme totale des points>,
  "exercises": [
    {
      "exerciseNumber": <numéro de l'exercice>,
      "exerciseType": "multiple_choice" ou "open_ended",
      "questionText": "<texte complet de la question>",
      "options": {"a": "...", "b": "...", "c": "...", "d": "..."} ou null,
      "correctAnswer": "a/b/c/d" ou null,
      "explanation": "<explication de la réponse si pertinent>" ou null,
      "points": <nombre de points>,
      "concept": "<concept/thème de la question>"
    }
  ]
}`;

    console.log("🤖 Calling Lovable AI to parse exam text...");

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("❌ AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;

    console.log("✅ AI response received");

    // Parse the JSON response
    let parsedData;
    try {
      // Remove markdown code blocks if present
      const cleanContent = aiContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsedData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      console.error("AI raw content:", aiContent);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate the parsed data
    if (
      !parsedData.title ||
      !parsedData.exercises ||
      !Array.isArray(parsedData.exercises)
    ) {
      throw new Error("Invalid parsed data structure");
    }

    console.log(
      `✅ Successfully parsed ${parsedData.exercises.length} exercises`
    );

    return new Response(JSON.stringify(parsedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error in parse-exam-text:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
