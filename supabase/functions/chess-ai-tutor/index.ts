/**
 * Security-Hardened: Chess AI Tutor
 * 
 * Features:
 * - Rate limiting
 * - Input validation
 * - Security headers
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { validateInput, chessTutorSchema } from "../_shared/validation.ts";
import { corsHeaders, securityHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

type DifficultyLevel = 'beginner' | 'intermediate' | 'expert';

const getDifficultyPrompt = (difficulty: DifficultyLevel): string => {
  switch (difficulty) {
    case 'beginner':
      return `
NIVEAU DE JEU: DÉBUTANT 🌱
- Tu joues comme un débutant qui apprend les échecs
- Fais parfois des erreurs VOLONTAIRES et évidentes pour permettre à l'élève de les exploiter
- Privilégie les coups simples et prévisibles
- Oublie parfois de protéger tes pièces
- Explique tes coups de manière TRÈS simple, comme si tu parlais à un enfant de 8 ans
- Utilise beaucoup d'encouragements et d'emojis
- Ne fais PAS de tactiques complexes (pas de fourchettes, pas de clouages)`;
      
    case 'intermediate':
      return `
NIVEAU DE JEU: INTERMÉDIAIRE 🎯
- Tu joues à un niveau intermédiaire solide
- Joue des coups corrects mais pas toujours les plus optimaux
- Montre des concepts tactiques de base (fourchettes, clouages simples)
- Explique des stratégies comme le contrôle du centre, le développement des pièces
- Fais occasionnellement une petite erreur que l'élève peut exploiter
- Sois pédagogique et explique le "pourquoi" de tes coups`;
      
    case 'expert':
      return `
NIVEAU DE JEU: EXPERT 🏆
- Tu joues au plus haut niveau possible
- Choisis TOUJOURS le meilleur coup ou un des meilleurs coups
- Utilise des tactiques avancées (sacrifices, combinaisons)
- Explique des concepts stratégiques avancés (structure de pions, cases faibles, initiative)
- Sois un défi pour l'élève, mais reste encourageant
- Si l'élève fait une erreur, exploite-la mais explique comment il aurait pu l'éviter`;
      
    default:
      return getDifficultyPrompt('intermediate');
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
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
      console.warn(`Rate limit exceeded for chess-ai-tutor from IP ${clientIp}`);
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validation = validateInput(chessTutorSchema, rawBody);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        { status: 400, headers: responseHeaders }
      );
    }

    const { 
      fen, 
      chatHistory, 
      userMessage, 
      userNickname, 
      isEricTurn, 
      difficulty,
      moveHistory
    } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const difficultyPrompt = getDifficultyPrompt((difficulty || 'intermediate') as DifficultyLevel);

    let systemPrompt = `Tu es Jude, un professeur d'échecs patient et encourageant pour des élèves haïtiens. 
Tu parles en français simple et accessible.

IDENTITÉ ET RÔLES - TRÈS IMPORTANT:
- TOI (Jude) = TU JOUES TOUJOURS LES PIÈCES NOIRES
- L'ÉLÈVE (${userNickname || 'l\'utilisateur'}) = IL JOUE TOUJOURS LES PIÈCES BLANCHES
- Quand tu analyses la position, rappelle-toi: les noirs c'est TOI, les blancs c'est L'ÉLÈVE
- Ne confonds JAMAIS qui joue quelle couleur

${difficultyPrompt}

Règles importantes:
- Tu dois TOUJOURS expliquer tes coups de manière pédagogique
- Utilise des emojis pour rendre la conversation vivante
- Si l'élève pose une question, réponds-y avec patience

L'élève s'appelle ${userNickname || 'mon ami'}.`;

    if (isEricTurn) {
      systemPrompt += `

Position actuelle (FEN): ${fen}

C'est ton tour de jouer (tu joues les NOIRES).
Tu dois répondre avec un JSON valide contenant:
1. "move": ton coup en notation UCI (case départ + case arrivée)
2. "explanation": une explication pédagogique de ton coup en français

⚠️ FORMAT DU COUP - TRÈS IMPORTANT:
- Utilise UNIQUEMENT la notation UCI: case de départ + case d'arrivée
- Exemples corrects: "e7e5", "g8f6", "b8c6", "d7d5", "f8c5"
- Pour le roque côté roi (petit roque noir): "e8g8"
- Pour le roque côté dame (grand roque noir): "e8c8"
- Pour la promotion: ajoute la lettre de la pièce (ex: "e2e1q" pour dame)

❌ NE JAMAIS utiliser la notation SAN comme "Nf6", "Bc5", "Qh4", "O-O"
❌ NE JAMAIS utiliser de majuscules pour les pièces dans le coup

Exemple de réponse CORRECTE:
{
  "move": "g8f6",
  "explanation": "Je développe mon cavalier vers f6! 🐴 C'est un coup classique qui contrôle le centre et prépare le roque."
}

Autre exemple:
{
  "move": "e7e5",
  "explanation": "Je réponds avec mon pion au centre! 🎯 Maintenant je contrôle les cases d4 et f4."
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
        content: "C'est ton tour de jouer. Analyse la position et choisis ton meilleur coup selon ton niveau. Réponds UNIQUEMENT avec un JSON valide. N'oublie pas: format UCI uniquement (ex: e7e5, g8f6)."
      });
    }

    console.log('Calling Lovable AI for chess move/chat, difficulty:', difficulty);

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
          error: "rate_limit",
          message: "Trop de requêtes. Veuillez réessayer dans quelques secondes." 
        }), {
          status: 429,
          headers: responseHeaders,
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "payment_required",
          message: "Service temporairement indisponible." 
        }), {
          status: 402,
          headers: responseHeaders,
        });
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI Response:', aiResponse.substring(0, 200));

    // If it's Eric's turn, try to parse the move
    if (isEricTurn) {
      try {
        // Try to extract JSON from the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Validate and normalize move format
          let move = parsed.move?.toLowerCase()?.trim() || '';
          
          // Log the original move for debugging
          console.log('Original move from AI:', parsed.move, 'Normalized:', move);
          
          return new Response(JSON.stringify({
            move: move,
            explanation: parsed.explanation || "Je joue ce coup! 🎯",
            type: 'move'
          }), {
            headers: responseHeaders,
          });
        }
      } catch (parseError) {
        console.error('Failed to parse move:', parseError);
        // Return a chat message if parsing fails
        return new Response(JSON.stringify({
          message: aiResponse,
          type: 'chat',
          parseError: true
        }), {
          headers: responseHeaders,
        });
      }
    }

    return new Response(JSON.stringify({
      message: aiResponse,
      type: 'chat'
    }), {
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Error in chess-ai-tutor:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Une erreur est survenue' 
    }), {
      status: 500,
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
    });
  }
});
