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

// Input validation — same shape as generate-studygram
const inputSchema = z.object({
  lessonTitle: z.string().min(1).max(500),
  contenu: z.string().max(100000).optional(),
  exemplesExercices: z.string().max(100000).optional(),
  objectif: z.string().max(5000).optional(),
  gradeLevel: z.string().min(1).max(50),
  subject: z.string().min(1).max(200),
});

// Allowed color palette — maps to Tailwind pastels on frontend
const allowedColors = ["blue", "pink", "green", "purple", "amber", "rose"] as const;

// Node style determines visual rendering on frontend
const nodeSchema = z.object({
  text: z.string().min(1).max(300),
  style: z.enum(["highlight", "outline", "plain", "quote"]),
});

// Each section groups related key points under a thematic heading
const sectionSchema = z.object({
  heading: z.string().min(1).max(80),
  color: z.enum(allowedColors),
  emoji: z.string().min(1).max(10),
  nodes: z.array(nodeSchema).min(2).max(5),
});

// Complete studygram structure returned to client
const studygramSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().min(1).max(100),
  sections: z.array(sectionSchema).min(3).max(5),
});

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return corsPreflightResponse();
  }

  try {
    // Rate limiting — AI generation is resource-intensive
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

    // Build plain-text lesson context
    const contentText = stripHtml(contenu || "");
    const examplesText = stripHtml(exemplesExercices || "");
    const objectifText = stripHtml(objectif || "");

    // Prompt: structured visual study sheet with thematic sections
    const systemPrompt = `Tu es un assistant pédagogique haïtien expert. Tu crées des fiches de révision visuelles structurées (studygrams) à partir du contenu de cours.

RÈGLES STRICTES:
- Génère exactement 3 à 5 sections thématiques
- Chaque section a 2 à 5 points clés (nodes)
- Le contenu doit être en français, adapté au niveau ${gradeLevel}
- Utilise des exemples concrets liés à Haïti quand c'est pertinent
- Chaque node fait 10-50 mots maximum
- Les headings font maximum 8 mots
- Utilise un emoji pertinent par section
- Attribue une couleur à chaque section parmi: blue, pink, green, purple, amber, rose (varie les couleurs!)
- Attribue un style à chaque node parmi: highlight (point important), outline (définition/concept), plain (détail), quote (citation/formule)
- Mélange les styles pour un rendu visuel varié

Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans texte avant ni après.`;

    const userPrompt = `Crée une fiche de révision visuelle (studygram) pour cette leçon:

**Matière:** ${subject}
**Titre:** ${lessonTitle}
**Niveau:** ${gradeLevel}
**Objectif:** ${objectifText}

**Contenu du cours:**
${contentText.slice(0, 8000)}

**Exemples et exercices:**
${examplesText.slice(0, 4000)}

Réponds avec un objet JSON au format:
{
  "title": "Titre de la leçon",
  "subtitle": "${subject} - ${gradeLevel}",
  "sections": [
    {
      "heading": "Titre section",
      "color": "blue",
      "emoji": "📘",
      "nodes": [
        { "text": "Point clé...", "style": "highlight" },
        { "text": "Définition...", "style": "outline" }
      ]
    }
  ]
}`;

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
      if (status === 429) {
        return secureErrorResponse("Limite IA atteinte. Réessayez plus tard.", 429);
      }
      if (status === 402) {
        return secureErrorResponse("Crédits IA épuisés.", 402);
      }
      console.error("[generate-studygram-visual] AI gateway error:", status, await aiResponse.text());
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

    let parsedData;
    try {
      parsedData = JSON.parse(jsonStr);
    } catch {
      console.error("[generate-studygram-visual] Failed to parse AI JSON:", jsonStr.slice(0, 200));
      return secureErrorResponse("La réponse IA est invalide. Réessayez.", 500);
    }

    // Validate structure with Zod
    const studygramValidation = studygramSchema.safeParse(parsedData);
    if (!studygramValidation.success) {
      console.error("[generate-studygram-visual] Validation failed:", studygramValidation.error.issues);
      return secureErrorResponse("Le studygram généré est invalide. Réessayez.", 500);
    }

    return secureJsonResponse({
      success: true,
      studygram: studygramValidation.data,
    });
  } catch (error) {
    console.error("[generate-studygram-visual] Error:", error);
    return secureErrorResponse(
      error instanceof Error ? error.message : "Erreur inconnue"
    );
  }
});
