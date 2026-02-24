import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import {
  secureJsonResponse,
  secureErrorResponse,
  corsPreflightResponse,
} from "../_shared/securityHeaders.ts";
import { checkRateLimit, RATE_LIMITS, getClientIp } from "../_shared/rateLimiter.ts";

// Strip HTML to plain text for AI prompt context
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .trim();
}

// Input validation — keeps payloads sane
const inputSchema = z.object({
  lessonTitle: z.string().min(1).max(500),
  contenu: z.string().max(100000).optional(),
  exemplesExercices: z.string().max(100000).optional(),
  objectif: z.string().max(5000).optional(),
  gradeLevel: z.string().min(1).max(50),
  subject: z.string().min(1).max(200),
});

// Output card schema — validates AI response before returning to client
const cardSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(10).max(500),
  emoji: z.string().min(1).max(10),
  type: z.enum(["concept", "example", "formula", "tip", "remember"]),
});

const cardsArraySchema = z.array(cardSchema).min(3).max(10);

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return corsPreflightResponse();
  }

  try {
    // Rate limiting — uses RESOURCE_INTENSIVE since AI generation is expensive
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(
        authHeader.replace("Bearer ", "")
      );
      userId = user?.id ?? null;
    }

    const clientIp = getClientIp(req);
    const rateLimitResult = await checkRateLimit(
      supabaseAdmin,
      RATE_LIMITS.RESOURCE_INTENSIVE,
      userId,
      clientIp
    );

    if (!rateLimitResult.allowed) {
      return secureErrorResponse("Trop de requêtes. Réessayez dans un moment.", 429);
    }

    // Validate input
    const body = await req.json();
    const validation = inputSchema.safeParse(body);
    if (!validation.success) {
      return secureErrorResponse("Entrée invalide", 400);
    }

    const { lessonTitle, contenu, exemplesExercices, objectif, gradeLevel, subject } = validation.data;

    // Build plain-text lesson context for the AI prompt
    const contentText = stripHtml(contenu || "");
    const examplesText = stripHtml(exemplesExercices || "");
    const objectifText = stripHtml(objectif || "");

    // Prompt: instructs AI to extract key points as structured flashcards
    const systemPrompt = `Tu es un assistant pédagogique haïtien expert. Tu crées des fiches de révision (flashcards) à partir du contenu de cours.

RÈGLES STRICTES:
- Génère exactement 5 à 8 cartes
- Chaque carte résume UN point clé du cours
- Le contenu doit être en français, adapté au niveau ${gradeLevel}
- Utilise des exemples concrets liés à Haïti quand c'est pertinent
- Chaque carte fait 40-80 mots maximum
- Les titres font maximum 10 mots
- Utilise un emoji pertinent par carte
- Attribue un type à chaque carte: concept, example, formula, tip, ou remember

Tu dois répondre UNIQUEMENT avec un tableau JSON valide, sans texte avant ni après.`;

    const userPrompt = `Crée des flashcards de révision pour cette leçon:

**Matière:** ${subject}
**Titre:** ${lessonTitle}
**Objectif:** ${objectifText}

**Contenu du cours:**
${contentText.slice(0, 8000)}

**Exemples et exercices:**
${examplesText.slice(0, 4000)}

Réponds avec un tableau JSON de cartes au format:
[{\\"title\\": \\"...\\", \\"content\\": \\"...\\", \\"emoji\\": \\"...\\", \\"type\\": \\"concept|example|formula|tip|remember\\"}]`;

    // Call Lovable AI Gateway — gemini-2.5-flash for speed/cost balance
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      // Surface rate limit / payment errors to client
      if (status === 429) {
        return secureErrorResponse("Limite IA atteinte. Réessayez plus tard.", 429);
      }
      if (status === 402) {
        return secureErrorResponse("Crédits IA épuisés.", 402);
      }
      console.error("[generate-studygram] AI gateway error:", status, await aiResponse.text());
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from AI response — handle markdown code fences
    let jsonStr = rawContent.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      jsonStr = fenceMatch[1].trim();
    }

    let parsedCards;
    try {
      parsedCards = JSON.parse(jsonStr);
    } catch {
      console.error("[generate-studygram] Failed to parse AI JSON:", jsonStr.slice(0, 200));
      return secureErrorResponse("La réponse IA est invalide. Réessayez.", 500);
    }

    // Validate card structure with Zod
    const cardsValidation = cardsArraySchema.safeParse(parsedCards);
    if (!cardsValidation.success) {
      console.error("[generate-studygram] Validation failed:", cardsValidation.error.issues);
      return secureErrorResponse("Les cartes générées sont invalides. Réessayez.", 500);
    }

    return secureJsonResponse({
      success: true,
      cards: cardsValidation.data,
    });
  } catch (error) {
    console.error("[generate-studygram] Error:", error);
    return secureErrorResponse(
      error instanceof Error ? error.message : "Erreur inconnue"
    );
  }
});
