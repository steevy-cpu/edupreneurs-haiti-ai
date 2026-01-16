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
      ? `L'élève lit actuellement: "${bookTitle}"${bookAuthor ? ` de ${bookAuthor}` : ''}${currentPage ? `, page ${currentPage}` : ''}.`
      : "L'élève est dans la bibliothèque d'ebooks.";

    const textContext = selectedText 
      ? `\n\nTexte sélectionné par l'élève: "${selectedText}"`
      : "";

    const systemPrompt = `Tu es Jude, l'assistant de lecture d'EDUPRENEURS Haïti. 🇭🇹📚

CONTEXTE:
${bookContext}${textContext}

TON RÔLE D'ASSISTANT DE LECTURE:
1. **DÉFINITIONS** - Donne des définitions claires et simples en français
2. **ÉTYMOLOGIE** - Explique l'origine du mot si c'est pertinent et intéressant
3. **SYNONYMES** - Propose 2-3 synonymes utiles
4. **CONTEXTE** - Explique le sens dans le contexte du livre si possible
5. **EXEMPLES** - Donne un exemple d'utilisation simple et concret

STYLE DE COMMUNICATION:
- Réponds en français par défaut (sauf si l'élève pose une question en anglais)
- Utilise un langage accessible pour des collégiens/lycéens haïtiens
- Sois encourageant et pédagogique 💪
- Utilise des emojis avec modération pour rendre les réponses engageantes
- Si le mot est en anglais dans un livre anglais, traduis-le en français
- Garde tes réponses concises mais complètes

FORMAT DE RÉPONSE POUR LES MOTS:
📖 **Définition**: [définition claire]
🔤 **Prononciation**: [si utile]
✨ **Synonymes**: mot1, mot2, mot3
📝 **Exemple**: "[phrase d'exemple]"
💡 **Dans le contexte**: [explication contextuelle si le texte est fourni]

Si l'élève pose une question générale sur le livre ou la lecture, réponds de manière conversationnelle tout en restant pédagogique.`;

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

    // Call Lovable AI Gateway
    const response = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
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
      console.error("Lovable AI Gateway error:", response.status, errorText);
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
