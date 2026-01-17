import { corsHeaders, secureJsonResponse, secureErrorResponse, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { checkRateLimit, RATE_LIMITS, getClientIp, rateLimitResponse } from "../_shared/rateLimiter.ts";
import { chatMessageSchema, validateInput, validationErrorResponse } from "../_shared/validation.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return corsPreflightResponse();
  }

  try {
    // Validate API key
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return secureErrorResponse("Service non configuré", 500);
    }

    // Parse request body
    const body = await req.json();
    console.log("Reading tutor request received:", { 
      hasMessage: !!body.message,
      bookTitle: body.bookTitle,
      currentPage: body.currentPage,
      selectedText: body.selectedText?.substring(0, 50)
    });

    // Validate input
    const validation = validateInput(chatMessageSchema, body);
    if (!validation.success) {
      return validationErrorResponse(validation.errors, corsHeaders);
    }

    const { message, chatHistory = [], bookTitle, bookAuthor, currentPage, selectedText } = body;

    // Get user from auth header for rate limiting
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader && SUPABASE_URL && SUPABASE_ANON_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false }
      });
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Rate limiting
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false }
      });
      const clientIp = getClientIp(req);
      const rateLimitResult = await checkRateLimit(
        supabase,
        RATE_LIMITS.AI_TUTOR,
        userId,
        clientIp
      );

      if (!rateLimitResult.allowed) {
        console.log("Rate limit exceeded for reading tutor");
        return rateLimitResponse(rateLimitResult.retryAfter || 60, rateLimitResult.remaining, corsHeaders);
      }
    }

    // Build context-aware system prompt
    const bookContext = bookTitle 
      ? `- Titre: "${bookTitle}"${bookAuthor ? `\n- Auteur: ${bookAuthor}` : ''}${currentPage ? `\n- Page actuelle: ${currentPage}` : ''}`
      : "L'élève est dans la bibliothèque d'ebooks.";

    const textContext = selectedText 
      ? `\n- Texte sélectionné: "${selectedText}"`
      : "";

    const systemPrompt = `Tu es Jude, l'assistant de lecture d'EDUPRENEURS Haïti. 🇭🇹📚

CONTEXTE DU LIVRE:
${bookContext}${textContext}

TON RÔLE SPÉCIFIQUE (LECTURE):
1. **DÉFINITIONS** - Explique les mots en français simple, adapté aux élèves haïtiens
2. **TRADUCTION** - Si le livre est en anglais, traduis ET explique en français
3. **SYNONYMES** - Propose 2-3 synonymes utiles
4. **COMPRÉHENSION** - Aide à comprendre le sens du texte dans son contexte
5. **ENCOURAGEMENT** - Motive l'élève à continuer sa lecture

CE QUE TU NE DOIS PAS FAIRE:
- Répondre aux questions non liées au livre ou à la lecture
- Donner des résumés complets du livre (évite les spoilers)
- Faire le travail de l'élève à sa place (résumés de devoirs, etc.)

Si l'élève pose une question hors sujet, réponds poliment:
"Je suis là pour t'aider avec ta lecture! 📚 Pose-moi une question sur le livre ou un mot que tu ne comprends pas."

STYLE DE COMMUNICATION:
- Langage accessible pour collégiens/lycéens haïtiens (7AF à NS4)
- Réponses courtes (3-5 phrases max, sauf pour les définitions détaillées)
- 1-2 emojis maximum par message
- Toujours encourageant et patient
- Tutoie l'élève

FORMAT POUR LES DÉFINITIONS DE MOTS:
📖 **[le mot]**
📝 **Définition**: [explication simple et claire]
✨ **Synonymes**: mot1, mot2, mot3
💬 **Exemple**: "[phrase d'utilisation simple]"
🔍 **Dans le contexte**: [explication contextuelle si texte sélectionné fourni]
🇭🇹 **An kreyòl** (optionnel): [traduction créole si pertinent]

Pour les questions de compréhension générale, réponds de manière conversationnelle et encourageante.`;

    // Prepare messages for AI
    const messages = [
      { role: "system", content: systemPrompt },
      ...chatHistory.slice(-10).map((msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content
      })),
      { role: "user", content: message }
    ];

    console.log("Calling Lovable AI Gateway for reading tutor");

    // Call Lovable AI Gateway (with fallback domain)
    const gatewayUrls = [
      "https://ai-gateway.lovable.dev/v1/chat/completions",
      "https://ai.gateway.lovable.dev/v1/chat/completions",
    ];

    let response: Response | null = null;
    let lastError: unknown = null;

    for (const url of gatewayUrls) {
      try {
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages,
            max_tokens: 800,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Lovable AI Gateway error:", url, response.status, errorText);
          lastError = new Error(`Gateway ${url} returned ${response.status}`);
          response = null;
          continue;
        }

        // Success
        break;
      } catch (err) {
        console.error("Lovable AI Gateway network error:", url, err);
        lastError = err;
        response = null;
        continue;
      }
    }

    if (!response) {
      console.error("All Lovable AI Gateway endpoints failed", lastError);
      return secureErrorResponse("Erreur du service IA", 500);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu traiter ta demande.";

    console.log("Reading tutor response generated successfully");

    return secureJsonResponse({
      response: aiResponse,
      bookContext: bookTitle || null,
    });

  } catch (error) {
    console.error("Reading tutor error:", error);
    return secureErrorResponse("Une erreur est survenue. Réessaie dans quelques instants.", 500);
  }
});
