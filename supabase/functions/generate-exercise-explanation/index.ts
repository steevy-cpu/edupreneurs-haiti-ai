/**
 * generate-exercise-explanation
 * Generates a model answer for an open-ended exam exercise using Lovable AI.
 * Returns { explanation: string } — never streams, non-mutating.
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questionText, subject, gradeLevel = "NS4", series } = await req.json();

    if (!questionText || !subject) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: questionText, subject" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build a context label that reflects the Haitian exam system
    const examContext = gradeLevel === "NS4"
      ? `Baccalauréat haïtien (NS4)${series ? ` — Série ${series}` : ""}`
      : `9ème Année Fondamentale haïtienne (9AF)`;

    const systemPrompt = `Tu es un professeur expert en ${subject} pour le ${examContext}.
Génère une réponse modèle complète et pédagogique pour la question suivante.
La réponse doit:
- Être adaptée au niveau ${gradeLevel} haïtien
- Inclure toutes les étapes de raisonnement (pour les matières scientifiques)
- Utiliser la notation LaTeX pour les formules mathématiques (ex: $E = mc^2$)
- Être rédigée en français académique clair
- Ne pas dépasser 300 mots
Retourne uniquement la réponse modèle, sans introduction ni conclusion sur ta tâche.`;

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
          { role: "user", content: `Question: ${questionText}` },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      // Surface rate-limit and payment errors to the client clearly
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte. Réessayez dans quelques instants." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits insuffisants pour générer une explication." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content?.trim();

    if (!explanation) throw new Error("Empty response from AI");

    console.log(`Generated explanation for ${subject} [${gradeLevel}${series ? `/${series}` : ""}] — ${explanation.length} chars`);

    return new Response(
      JSON.stringify({ explanation }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-exercise-explanation error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
