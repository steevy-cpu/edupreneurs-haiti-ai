import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, lessonContext, chatHistory, userNickname, isInitialGreeting } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build system prompt for Spanish practice with French error explanations
    const systemPrompt = `Eres Jude, un profesor de español amigable y entusiasta. Ayudas a ${userNickname || "tu estudiante"} (estudiante haitiano de 7AF) a practicar español.

CONTEXTO DE LA LECCIÓN:
📚 ${lessonContext.title}
🎯 ${lessonContext.objective}

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
      ...chatHistory.map((msg: any) => ({
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
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Payment required. Por favor, contacta a tu administrador.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      throw new Error(`Lovable AI request failed: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const response = data.choices[0].message.content;

    console.log("Spanish practice response generated successfully");
    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
