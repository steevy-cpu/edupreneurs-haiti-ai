/**
 * Security-Hardened: Spanish Practice Tutor
 * 
 * Features:
 * - Rate limiting
 * - Input validation
 * - Security headers
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { validateInput, chatMessageSchema } from "../_shared/validation.ts";
import { corsHeaders, securityHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return corsPreflightResponse();
  }

  const responseHeaders = { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' };

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get client IP for rate limiting
    const clientIp = getClientIp(req);

    // Check rate limit
    const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.AI_TUTOR, null, clientIp);
    if (!rateCheck.allowed) {
      console.warn(`Rate limit exceeded for spanish-practice-tutor from IP ${clientIp}`);
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validation = validateInput(chatMessageSchema, rawBody);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        { status: 400, headers: responseHeaders }
      );
    }

    const { message, lessonContext, chatHistory, userNickname, isInitialGreeting } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt for Spanish practice with French error explanations
    const systemPrompt = `Eres Jude, un profesor de español amigable y entusiasta. Ayudas a ${userNickname || "tu estudiante"} (estudiante haitiano de 7AF) a practicar español.

CONTEXTO DE LA LECCIÓN:
📚 ${lessonContext?.title || 'Práctica de español'}
🎯 ${lessonContext?.objective || 'Mejorar tu español'}

TU COMPORTAMIENTO:
1. Habla SIEMPRE en español claro y natural
2. Usa vocabulario simple apropiado para nivel 7AF (séptimo año fundamental)
3. Mantén respuestas breves (2-3 frases máximo)
4. Sé amigable, paciente y motivador
5. Relaciona la conversación con el tema de la lección
6. Usa emojis ocasionalmente para ser amigable

CORRECCIÓN DE ERRORES (MUY IMPORTANTE):
- Si el estudiante comete un error en español, CAMBIA A FRANCÉS para explicar
- Formato: "Attention! Tu as dit '[error]'. La forme correcte est '[corrección]'. [Breve explicación en francés]. Essaie encore! 😊"
- Después de la corrección, espera que el estudiante intente de nuevo
- Si el estudiante habla correctamente, responde en ESPAÑOL con elogios breves: "¡Perfecto! ¡Muy bien!"

EJEMPLOS:
Usuario: "Yo tiene un perro"
Eric (en FRANCÉS): "Attention! Tu as dit 'Yo tiene', mais c'est 'Yo tengo'. Avec 'yo', on utilise 'tengo'. Essaie encore! 💪"

Usuario: "Hola, ¿cómo estás?"
Eric (en ESPAÑOL): "¡Hola! Estoy muy bien, gracias. ¿Y tú? 😊"

${
  isInitialGreeting
    ? `PRIMERA INTERACCIÓN: Saluda en ESPAÑOL brevemente, menciona el tema de la lección, haz UNA pregunta simple. Máximo 2-3 frases.`
    : `CONTINÚA LA CONVERSACIÓN: Responde de forma natural en español. Si hay error, explícalo en francés.`
}`;

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
      ...(chatHistory || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    if (!isInitialGreeting && message) {
      messages.push({ role: "user", content: message });
    }

    console.log("Calling Lovable AI for Spanish practice...");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: messages,
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Lovable AI error:", aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Eric necesita un descanso. Intenta de nuevo en un momento.",
          }),
          { status: 429, headers: responseHeaders }
        );
      }

      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Payment required. Por favor, contacta a tu administrador.",
          }),
          { status: 402, headers: responseHeaders }
        );
      }

      throw new Error(`Lovable AI request failed: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const response = data.choices[0].message.content;

    console.log("Spanish practice response generated successfully");
    return new Response(JSON.stringify({ response }), {
      headers: responseHeaders,
      status: 200,
    });
  } catch (error) {
    console.error("Error in spanish-practice-tutor function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
