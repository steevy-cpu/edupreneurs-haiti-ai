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

// Input validation
const inputSchema = z.object({
  lessonTitle: z.string().min(1).max(500),
  contenu: z.string().max(100000).optional(),
  exemplesExercices: z.string().max(100000).optional(),
  objectif: z.string().max(5000).optional(),
  gradeLevel: z.string().min(1).max(50),
  subject: z.string().min(1).max(200),
});

// Fixed section types — enforces the 4-block pedagogical structure
const sectionTypes = ["explicatif", "approfondissement", "a_retenir", "resume_visuel"] as const;
const allowedColors = ["blue", "pink", "green", "purple", "amber", "rose"] as const;

// Node style includes "mindmap" for visual resume section
const nodeSchema = z.object({
  text: z.string().min(1).max(300),
  style: z.enum(["highlight", "outline", "plain", "quote", "mindmap"]),
});

// Each section has a fixed pedagogical type
const sectionSchema = z.object({
  type: z.enum(sectionTypes),
  heading: z.string().min(1).max(80),
  color: z.enum(allowedColors),
  emoji: z.string().min(1).max(10),
  nodes: z.array(nodeSchema).min(2).max(12), // Relaxed from 8 — AI occasionally generates 9-10 nodes
});

// Exactly 4 sections required — one per pedagogical block
const studygramSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().min(1).max(100),
  sections: z.array(sectionSchema).length(4),
});

// Subject-specific prompt instructions for richer content
function getSubjectHint(subject: string): string {
  const s = subject.toLowerCase();
  if (s.includes("math") || s.includes("physique") || s.includes("chimie") || s.includes("svt") || s.includes("science")) {
    return "Inclus des formules, unités et schémas. Utilise le style 'mindmap' pour représenter les relations entre concepts scientifiques.";
  }
  if (s.includes("histoire") || s.includes("géo") || s.includes("geo")) {
    return "Inclus des dates clés, lieux importants et événements majeurs. Utilise le style 'mindmap' pour les chronologies ou liens géopolitiques.";
  }
  if (s.includes("philo") || s.includes("français") || s.includes("francais") || s.includes("littéra")) {
    return "Inclus des auteurs, citations marquantes et courants de pensée. Utilise le style 'mindmap' pour relier les concepts philosophiques ou littéraires.";
  }
  if (s.includes("anglais") || s.includes("espagnol") || s.includes("spanish") || s.includes("english")) {
    return "Inclus des règles grammaticales, vocabulaire clé et exemples d'usage. Utilise le style 'mindmap' pour organiser les points de grammaire.";
  }
  return "Adapte le contenu à la matière. Utilise le style 'mindmap' pour le résumé visuel.";
}

// Sanitize AI output before Zod validation — truncate overlong fields gracefully
function sanitizeParsedData(data: Record<string, unknown>): void {
  if (!data || !Array.isArray(data.sections)) return;

  // Cap title and subtitle lengths
  if (typeof data.title === "string" && data.title.length > 198) {
    data.title = data.title.slice(0, 195) + "...";
  }
  if (typeof data.subtitle === "string" && data.subtitle.length > 98) {
    data.subtitle = data.subtitle.slice(0, 95) + "...";
  }

  for (const section of data.sections) {
    // Truncate heading to stay within 80-char Zod max
    if (typeof section.heading === "string" && section.heading.length > 78) {
      section.heading = section.heading.slice(0, 75) + "...";
    }
    // Truncate node text to stay within 300-char Zod max
    if (Array.isArray(section.nodes)) {
      for (const node of section.nodes) {
        if (typeof node.text === "string" && node.text.length > 295) {
          node.text = node.text.slice(0, 292) + "...";
        }
      }
    }
  }
}

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
    const subjectHint = getSubjectHint(subject);

    // Prompt: structured 4-block pedagogical revision sheet
    const systemPrompt = `Tu es un assistant pédagogique haïtien expert. Tu crées des fiches de révision structurées en 4 blocs pédagogiques fixes.

STRUCTURE OBLIGATOIRE — exactement 4 sections dans cet ordre :

1. **Bloc explicatif synthétique** (type: "explicatif", color: "blue", emoji: "📖")
   - Définition principale (style "highlight")
   - 3 à 5 idées clés (style "outline")
   - Un exemple concret (style "quote")

2. **Approfondissement** (type: "approfondissement", color: "purple", emoji: "🔍")
   - Théories, formules, dates ou auteurs selon la matière (style "highlight" ou "outline")
   - Comparaisons si pertinent (style "plain")
   - ${subjectHint}

3. **À retenir** (type: "a_retenir", color: "green", emoji: "⭐")
   - 5 points essentiels numérotés (style "outline")
   - Formule ou citation clé (style "quote")
   - Astuce de mémorisation (style "highlight")

4. **Résumé visuel** (type: "resume_visuel", color: "rose", emoji: "🧠")
   - Le premier node est le concept central (style "mindmap")
   - 3 à 5 sous-concepts reliés au concept central (style "mindmap")
   - Ces nodes formeront une carte mentale visuelle

RÈGLES :
- Le contenu doit être en français, adapté au niveau ${gradeLevel}
- Utilise des exemples concrets liés à Haïti quand c'est pertinent
- Chaque node fait 10-40 mots maximum (200 caractères max)
- Maximum 8 nodes par section, jamais plus
- Les headings font maximum 8 mots
- Tu dois répondre UNIQUEMENT avec un objet JSON valide, sans texte avant ni après.`;

    const userPrompt = `Crée une fiche de révision structurée (studygram) pour cette leçon :

**Matière:** ${subject}
**Titre:** ${lessonTitle}
**Niveau:** ${gradeLevel}
**Objectif:** ${objectifText}

**Contenu du cours:**
${contentText.slice(0, 8000)}

**Exemples et exercices:**
${examplesText.slice(0, 4000)}

Réponds avec un objet JSON au format :
{
  "title": "Titre de la leçon",
  "subtitle": "${subject} - ${gradeLevel}",
  "sections": [
    {
      "type": "explicatif",
      "heading": "Bloc Explicatif",
      "color": "blue",
      "emoji": "📖",
      "nodes": [
        { "text": "Définition: ...", "style": "highlight" },
        { "text": "Idée clé 1", "style": "outline" },
        { "text": "Exemple: ...", "style": "quote" }
      ]
    },
    {
      "type": "approfondissement",
      "heading": "Approfondissement",
      "color": "purple",
      "emoji": "🔍",
      "nodes": [
        { "text": "Théorie / Formule...", "style": "highlight" },
        { "text": "Comparaison...", "style": "plain" }
      ]
    },
    {
      "type": "a_retenir",
      "heading": "À Retenir",
      "color": "green",
      "emoji": "⭐",
      "nodes": [
        { "text": "1. Point essentiel...", "style": "outline" },
        { "text": "Citation clé...", "style": "quote" },
        { "text": "Astuce: ...", "style": "highlight" }
      ]
    },
    {
      "type": "resume_visuel",
      "heading": "Résumé Visuel",
      "color": "rose",
      "emoji": "🧠",
      "nodes": [
        { "text": "Concept central", "style": "mindmap" },
        { "text": "Sous-concept A", "style": "mindmap" },
        { "text": "Sous-concept B", "style": "mindmap" }
      ]
    }
  ]
}`;

    // Call Lovable AI Gateway — gemini-2.5-flash for speed/cost balance
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Retry loop — 1 automatic retry on parse/validation failure
    const MAX_ATTEMPTS = 2;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
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
          // Force valid JSON output — prevents markdown wrapping and truncation
          response_format: { type: "json_object" },
          // Ensure enough output budget for the full 4-section structure
          max_tokens: 4096,
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
        console.error(`[generate-studygram-visual] AI gateway error (attempt ${attempt}):`, status, await aiResponse.text());
        // Don't retry on non-transient AI gateway errors
        throw new Error("AI gateway error");
      }

      const aiData = await aiResponse.json();
      const rawContent = aiData.choices?.[0]?.message?.content || "";

      // Parse JSON from AI response — handle markdown code fences as fallback
      let jsonStr = rawContent.trim();
      const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (fenceMatch) {
        jsonStr = fenceMatch[1].trim();
      }

      let parsedData;
      try {
        parsedData = JSON.parse(jsonStr);
      } catch {
        console.error(`[generate-studygram-visual] Failed to parse AI JSON (attempt ${attempt}):`, jsonStr.slice(0, 200));
        // Retry on parse failure
        if (attempt < MAX_ATTEMPTS) continue;
        return secureErrorResponse("La réponse IA est invalide. Réessayez.", 500);
      }

      // Sanitize — truncate overlong nodes/headings before validation
      sanitizeParsedData(parsedData);

      // Validate structure with Zod
      const studygramValidation = studygramSchema.safeParse(parsedData);
      if (!studygramValidation.success) {
        console.error(`[generate-studygram-visual] Validation failed (attempt ${attempt}):`, studygramValidation.error.issues);
        // Retry on validation failure
        if (attempt < MAX_ATTEMPTS) continue;
        return secureErrorResponse("Le studygram généré est invalide. Réessayez.", 500);
      }

      // Success — log attempt number for observability
      if (attempt > 1) {
        console.log(`[generate-studygram-visual] Succeeded on attempt ${attempt}`);
      }

      return secureJsonResponse({
        success: true,
        studygram: studygramValidation.data,
      });
    }

    // Fallback — should not reach here due to loop logic
    return secureErrorResponse("Erreur interne inattendue.", 500);
  } catch (error) {
    console.error("[generate-studygram-visual] Error:", error);
    return secureErrorResponse(
      error instanceof Error ? error.message : "Erreur inconnue"
    );
  }
});
