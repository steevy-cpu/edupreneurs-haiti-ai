/**
 * parse-exam-vision
 * Uses Gemini 2.5 Pro vision to OCR and structure official Haitian exam pages.
 *
 * Security: JWT required + RESOURCE_INTENSIVE rate limit (15 auth / 3 anon per min)
 */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, RATE_LIMITS, getClientIp, rateLimitResponse } from "../_shared/rateLimiter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── JWT Authentication ──────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Non autorisé" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = claimsData.claims.sub;

    // ── Rate Limiting ───────────────────────────────────────────────────────
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const clientIp = getClientIp(req);
    const rlResult = await checkRateLimit(serviceClient, RATE_LIMITS.RESOURCE_INTENSIVE, userId, clientIp);
    if (!rlResult.allowed) {
      return rateLimitResponse(rlResult.retryAfter ?? 60, rlResult.remaining, corsHeaders);
    }

    // ── Business Logic ──────────────────────────────────────────────────────
    // gradeLevel and series provide exam-type context for the AI — default to '9AF' for safety
    const { subject, year, pageImages, gradeLevel = '9AF', series } = await req.json();

    if (!subject || !year || !pageImages || !Array.isArray(pageImages) || pageImages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: subject, year, pageImages (array)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${pageImages.length} page images for ${subject} ${year} [${gradeLevel}${series ? `/${series}` : ''}]`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build image content for vision
    const imageContent = pageImages.map((img: string) => ({
      type: "image_url",
      image_url: {
        url: img.startsWith("data:") ? img : `data:image/jpeg;base64,${img}`,
      },
    }));

    // Build exam-type-specific context so the AI knows which structure to expect
    const examContext = gradeLevel === 'NS4'
      ? `Tu analyses un examen du BACCALAURÉAT haïtien (NS4)${series ? ` — Série ${series}` : ''}.

SPÉCIFICITÉS NS4 À RESPECTER ABSOLUMENT:
- Les examens NS4 sont composés principalement de questions ouvertes (open_ended) et de problèmes multi-parties
- Les QCM (multiple_choice) sont rares dans les examens NS4, sauf en Anglais/Espagnol/Créole
- Chaque exercice peut contenir plusieurs sous-questions numérotées (a, b, c, d) — traite chaque sous-question comme un exercice distinct
- Les formules mathématiques et physiques doivent être extraites en notation LaTeX
- Les points par question sont souvent indiqués en marge (ex: "4 pts", "/4") — extrait-les précisément
- La structure typique NS4: Texte du problème → sous-questions → données/formules en annexe
- Pour la série ${series || 'NS4'}: les matières scientifiques (Physique, Chimie, Maths, SVT) sont à dominante calcul et démonstration`
      : `Tu analyses un examen de la 9ÈME ANNÉE FONDAMENTALE haïtienne (9AF).

SPÉCIFICITÉS 9AF À RESPECTER ABSOLUMENT:
- Les examens 9AF contiennent un mélange de QCM (multiple_choice) et de questions ouvertes (open_ended)
- Les QCM ont toujours 4 options: A), B), C), D) — extrait les options précisément
- Les textes de référence (Reading, Texte de lecture) précèdent souvent plusieurs questions
- Structure typique 9AF: texte de référence → questions de compréhension → exercices de grammaire → rédaction`;

    const systemPrompt = `Tu es un expert OCR spécialisé dans l'extraction d'examens officiels haïtiens.

${examContext}

INSTRUCTIONS GÉNÉRALES:
1. Analyse attentivement CHAQUE page de l'examen
2. Identifie et extrait TOUS les TEXTES DE RÉFÉRENCE (Reading, Texte, Lecture, passages) — EXTRAIT LE TEXTE COMPLET
3. Identifie TOUS les exercices/questions avec leurs numéros
4. Pour les QCM, extrait précisément les options A), B), C), D)
5. Préserve les accents français et créoles (é, è, à, ç, ô, etc.)
6. Identifie les points attribués à chaque question si visibles
7. Détermine le type: "multiple_choice" ou "open_ended" en respectant les spécificités ci-dessus
8. Pour les formules mathématiques, utilise la notation LaTeX

IMPORTANT:
- EXTRAIT TOUS les textes de référence COMPLETS dans referenceTexts
- Ne rate AUCUNE question
- Si les points ne sont pas visibles: 5 pts pour QCM, 8 pts pour questions ouvertes
- Utilise la fonction extract_exam_data pour retourner les résultats`;

    const userPrompt = `Analyse cet examen officiel de ${subject} ${year}${gradeLevel === 'NS4' && series ? ` (${series})` : ''}. Extrait TOUTES les questions, options, textes de référence. Utilise la fonction extract_exam_data.`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "extract_exam_data",
              description: "Retourne les données structurées de l'examen extrait",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Titre de l'examen" },
                  referenceTexts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        section: { type: "string" },
                        title: { type: "string" },
                        text: { type: "string", description: "Le texte complet du passage" },
                      },
                      required: ["section", "title", "text"],
                    },
                  },
                  exercises: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        exerciseNumber: { type: "integer" },
                        exerciseType: { type: "string", enum: ["multiple_choice", "open_ended"] },
                        questionText: { type: "string", description: "Texte complet de la question" },
                        promptBlocks: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["text", "math-inline", "math-block"] },
                              content: { type: "string" },
                              latex: { type: "string" },
                            },
                            required: ["type"],
                          },
                        },
                        options: {
                          type: "object",
                          properties: {
                            A: { type: "string" },
                            B: { type: "string" },
                            C: { type: "string" },
                            D: { type: "string" },
                          },
                        },
                        optionsJson: {
                          type: "object",
                          description: "Structured options with blocks for KaTeX rendering",
                        },
                        correctAnswer: { type: "string" },
                        answerJson: {
                          type: "object",
                          properties: {
                            index: { type: "integer" },
                            value: { type: "string" },
                          },
                        },
                        explanation: { type: "string" },
                        explanationBlocks: { type: "array" },
                        points: { type: "integer" },
                        concept: { type: "string", description: "Concept principal abordé" },
                      },
                      required: ["exerciseNumber", "exerciseType", "questionText"],
                    },
                  },
                },
                required: ["title", "exercises"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_exam_data" } },
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

    // Extract structured tool call result (no more fragile JSON parsing!)
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "extract_exam_data") {
      console.error("No valid tool call in response");
      throw new Error("AI did not return structured exam data");
    }

    let parsedData;
    try {
      parsedData = JSON.parse(toolCall.function.arguments);
    } catch (parseError) {
      console.error("Failed to parse tool arguments:", parseError);
      console.error("Arguments:", toolCall.function.arguments?.substring(0, 500));
      throw new Error("Failed to parse AI response");
    }

    // Validate exercises array
    if (!parsedData.exercises || !Array.isArray(parsedData.exercises)) {
      throw new Error("Invalid response structure: missing exercises array");
    }

    // Normalize exercises
    const normalizedExercises = parsedData.exercises.map((ex: any, index: number) => ({
      exerciseNumber: ex.exerciseNumber || index + 1,
      exerciseType: ex.exerciseType || (ex.options ? "multiple_choice" : "open_ended"),
      questionText: ex.questionText || `Question ${index + 1}`,
      options: ex.options || null,
      correctAnswer: ex.correctAnswer || null,
      explanation: ex.explanation || null,
      points: typeof ex.points === "number" ? ex.points : (ex.exerciseType === "multiple_choice" ? 5 : 8),
      concept: ex.concept || "Général",
      promptBlocks: ex.promptBlocks || null,
      optionsJson: ex.optionsJson || null,
      answerJson: ex.answerJson || null,
      explanationBlocks: ex.explanationBlocks || null,
    }));

    const totalPoints = normalizedExercises.reduce((sum: number, ex: any) => sum + (ex.points || 0), 0);

    const referenceTexts = Array.isArray(parsedData.referenceTexts)
      ? parsedData.referenceTexts.map((ref: any) => ({
          section: ref.section || "Texte",
          title: ref.title || "",
          text: ref.text || "",
        }))
      : [];

    const result = {
      title: parsedData.title || `Examen officiel de ${subject} ${year}`,
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
