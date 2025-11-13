import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, lessonContext, chatHistory, userNickname, isInitialGreeting } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build system prompt for Spanish practice with French error explanations
    const systemPrompt = `Eres Eric, un profesor de español amigable y entusiasta para estudiantes haitianos de nivel 7AF (séptimo año fundamental). 
Tu objetivo es ayudar a ${userNickname || 'tu estudiante'} a practicar español en conversaciones relacionadas con esta lección:

📚 Lección: ${lessonContext.title}
🎯 Objetivo: ${lessonContext.objective}
📊 Nivel: ${lessonContext.gradeLevel}

REGLAS CRÍTICAS DE CORRECCIÓN:
1. SIEMPRE habla en ESPAÑOL durante las conversaciones normales
2. CUANDO el estudiante comete un error en español:
   a) Primero, DEBES explicar el error en FRANCÉS (no en español)
   b) En francés, explica claramente qué estuvo mal y por qué
   c) Da la forma correcta en español
   d) Luego anima al estudiante a intentar de nuevo
3. Sé paciente y alentador
4. Usa vocabulario apropiado para nivel 7AF
5. Mantén la conversación relacionada con el tema de la lección
6. Haz preguntas que ayuden al estudiante a practicar el vocabulario clave

FORMATO DE CORRECCIÓN (CRUCIAL):
❌ Error detectado → Responde en FRANCÉS:
"Attention! Tu as dit '[error]', mais la forme correcte est '[correction]' parce que [explanation en français]. Essaie encore! 😊"

✅ Respuesta correcta → Continúa en español con elogios
"¡Muy bien! ¡Excelente! Ahora..."

EJEMPLOS:
Si el estudiante dice: "Yo tiene un perro"
TU respuesta en FRANCÉS: "Attention! Tu as écrit 'Yo tiene', mais la forme correcte est 'Yo tengo'. En espagnol, avec 'yo' (je), on utilise 'tengo', pas 'tiene'. 'Tiene' est pour 'él/ella'. Essaie encore! 💪"

Si el estudiante dice: "Hola, ¿cómo estás?"
TU respuesta en ESPAÑOL: "¡Hola! ¡Perfecto! Estoy muy bien, gracias. ¿Y tú? ¿Cómo te llamas?"

${isInitialGreeting ? 
  `Este es el primer mensaje. Saluda a ${userNickname || 'tu estudiante'} en ESPAÑOL, preséntate brevemente, menciona el tema de la lección y haz una pregunta simple en español relacionada con el tema. Usa emojis para hacerlo amigable. Máximo 3-4 frases.` 
  : 
  `Continúa la conversación de manera natural. Si hay un error, EXPLICA EN FRANCÉS. Si está correcto, continúa en ESPAÑOL.`}`;

    const messages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
    ];

    if (!isInitialGreeting && message) {
      messages.push({ role: 'user', content: message });
    }

    console.log('Calling Lovable AI for Spanish practice...');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Eric necesita un descanso. Intenta de nuevo en un momento.' 
          }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'Payment required. Por favor, contacta a tu administrador.' 
          }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      throw new Error(`Lovable AI request failed: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const response = data.choices[0].message.content;

    console.log('Spanish practice response generated successfully');
    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in spanish-practice-tutor function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});