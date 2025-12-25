import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fen, chatHistory, userMessage, userNickname, isEricTurn } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = `Tu es Eric, un professeur d'échecs patient et encourageant pour des élèves haïtiens. 
Tu parles en français simple et accessible.

Règles importantes:
- Tu joues les pièces NOIRES (l'élève joue les blanches)
- Tu dois TOUJOURS expliquer tes coups de manière pédagogique
- Adapte ton niveau à celui de l'élève (sois un peu plus faible pour l'encourager)
- Utilise des emojis pour rendre la conversation vivante
- Si l'élève pose une question, réponds-y avec patience

L'élève s'appelle ${userNickname || 'mon ami'}.`;

    if (isEricTurn) {
      systemPrompt += `

Position actuelle (FEN): ${fen}

C'est ton tour de jouer (tu joues les NOIRES).
Tu dois répondre avec un JSON valide contenant:
1. "move": ton coup en notation algébrique (ex: "e7e5", "g8f6", "e8g8" pour le roque)
2. "explanation": une explication pédagogique de ton coup en français

IMPORTANT: 
- Le format du coup doit être: case de départ + case d'arrivée (ex: "e7e5", "b8c6")
- Pour le roque côté roi: "e8g8" (noirs) 
- Pour le roque côté dame: "e8c8" (noirs)
- Pour la promotion: ajoute la pièce (ex: "e2e1q" pour une promotion en dame)

Exemple de réponse:
{
  "move": "e7e5",
  "explanation": "Je joue mon pion au centre! 🎯 C'est un coup classique pour contrôler le centre de l'échiquier."
}`;
    } else {
      systemPrompt += `

Position actuelle (FEN): ${fen}

L'élève te pose une question ou fait un commentaire. Réponds de manière pédagogique et encourageante.
Donne des conseils stratégiques si approprié.`;
    }

    const messages: Message[] = [
      { role: 'user', content: systemPrompt }
    ];

    // Add chat history
    if (chatHistory && chatHistory.length > 0) {
      for (const msg of chatHistory.slice(-10)) {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    // Add user message if present
    if (userMessage) {
      messages.push({
        role: 'user',
        content: userMessage
      });
    }

    // If Eric's turn, add a prompt for move
    if (isEricTurn && !userMessage) {
      messages.push({
        role: 'user',
        content: "C'est ton tour de jouer. Analyse la position et choisis ton meilleur coup. Réponds UNIQUEMENT avec un JSON valide."
      });
    }

    console.log('Calling Lovable AI for chess move/chat');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Trop de requêtes. Veuillez réessayer dans quelques secondes." 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "Service temporairement indisponible." 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse);

    // If it's Eric's turn, try to parse the move
    if (isEricTurn) {
      try {
        // Try to extract JSON from the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return new Response(JSON.stringify({
            move: parsed.move,
            explanation: parsed.explanation,
            type: 'move'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } catch (parseError) {
        console.error('Failed to parse move:', parseError);
        // Return a default explanation if parsing fails
        return new Response(JSON.stringify({
          message: aiResponse,
          type: 'chat'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({
      message: aiResponse,
      type: 'chat'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chess-ai-tutor:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Une erreur est survenue' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
