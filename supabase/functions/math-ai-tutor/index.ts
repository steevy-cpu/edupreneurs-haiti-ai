/**
 * Security-Hardened: Math AI Tutor
 * 
 * Features:
 * - Rate limiting (60 req/min for auth, 10 req/min for anon)
 * - Input validation with Zod
 * - Security headers
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { validateInput, chatMessageSchema, validationErrorResponse } from "../_shared/validation.ts";
import { corsHeaders, securityHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  const responseHeaders = { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' };

  try {
    // Initialize Supabase for rate limiting
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Extract user ID from auth header if present
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }

    // Get client IP for rate limiting
    const clientIp = getClientIp(req);

    // Check rate limit
    const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.AI_TUTOR, userId, clientIp);
    if (!rateCheck.allowed) {
      console.warn(`Rate limit exceeded for math-ai-tutor`);
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    const rawBody = await req.json();
    
    // Basic validation for message
    if (!rawBody.message || typeof rawBody.message !== 'string' || rawBody.message.length > 10000) {
      return validationErrorResponse(['Message invalide ou trop long'], responseHeaders);
    }

    const { message, lessonType = 'activites', chatHistory = [], userNickname = '', lessonTopic = '' } = rawBody;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get current time for greeting
    const now = new Date();
    const haitiOffset = -5;
    const haitiTime = new Date(now.getTime() + (haitiOffset * 60 * 60 * 1000) + (now.getTimezoneOffset() * 60 * 1000));
    const currentHour = haitiTime.getHours();
    
    let greeting = "Bonjour";
    if (currentHour >= 18 || currentHour < 5) {
      greeting = "Bonsoir";
    } else if (currentHour >= 12 && currentHour < 18) {
      greeting = "Bon après-midi";
    }

    const isFirstMessage = !chatHistory || chatHistory.length === 0;
    const nicknameText = userNickname ? userNickname : "l'élève";
    const greetingInstruction = isFirstMessage 
      ? `SALUTATION PREMIÈRE FOIS:
- C'est la première fois que tu parles à cet utilisateur dans cette conversation
- L'utilisateur s'appelle "${nicknameText}"
- Commence ta réponse par "${greeting} ${nicknameText} ! Je suis Jude, votre professeur spécialisé dans le programme du MENFP."
- Demande comment tu peux aider l'utilisateur`
      : `CONVERSATION EN COURS:
- Tu es DÉJÀ en conversation avec l'utilisateur qui s'appelle "${nicknameText}"
- NE DIS PAS "${greeting}" ou "Bonjour" ou "Bonsoir" à nouveau
- Utilise son pseudo "${nicknameText}" naturellement dans la conversation
- Continue directement la conversation de manière naturelle`;

    const systemPrompts: Record<string, string> = {
      tutor: `Tu es Jude, un professeur haïtien expérimenté et expert du programme du MENFP.

${greetingInstruction}

🗣️ LANGUE: Français standard par défaut. Créole uniquement si demandé explicitement.

🎓 TON EXPERTISE - PROGRAMME MENFP:
- Curriculum complet pour tous les niveaux
- Mathématiques, Sciences, Français, etc.
- Préparation aux examens officiels

📝 TON STYLE:
- Pédagogue et encourageant
- Exemples du contexte haïtien
- Structuré et clair

❌ HORS COMPÉTENCE: Questions non-éducatives → réponds poliment que tu es spécialisé en éducation.`,

      activites: `Tu es un professeur de mathématiques qui crée des activités INTERACTIVES EN FRANÇAIS.

${lessonTopic ? `⚠️ SUJET: "${lessonTopic}" - Reste sur ce sujet.` : ''}

GÉNÈRE 5-7 ACTIVITÉS MÉLANGÉES:
- TYPE 1: QUIZ à choix multiples (2-3)
- TYPE 2: JEU D'ASSOCIATION (1-2)
- TYPE 3: VRAI OU FAUX (1-2)
- TYPE 4: COMPLÈTE LA PHRASE (1-2)

Format strict pour chaque type avec réponse correcte et explication.
Contexte haïtien, difficulté progressive.`,

      quiz: `Tu es un professeur qui crée des quiz d'évaluation EN FRANÇAIS.

${lessonTopic ? `⚠️ SUJET: "${lessonTopic}"` : ''}

GÉNÈRE EXACTEMENT 5 questions:
- Format: Question + 4 options (A,B,C,D) + Réponse correcte + Explication
- Progression: 2 faciles → 2 moyennes → 1 difficile
- Sépare avec "---"`
    };

    const systemPrompt = systemPrompts[lessonType] || systemPrompts.tutor;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    console.log('Calling Lovable AI for type:', lessonType);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        max_tokens: lessonType === 'quiz' ? 4000 : 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requêtes atteinte, réessayez plus tard.' }),
          { status: 429, headers: responseHeaders }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices?.[0]?.message?.content || 'Désolé, je n\'ai pas pu générer une réponse.';
    
    aiResponse = aiResponse.replace(/\*\*/g, '').replace(/\*/g, '');

    let navigationPath = null;
    const navMatch = aiResponse.match(/\[NAVIGATE:(\/[^\]]+)\]/);
    if (navMatch) {
      navigationPath = navMatch[1];
      aiResponse = aiResponse.replace(/\[NAVIGATE:\/[^\]]+\]/g, '').trim();
    }

    console.log('Generated response length:', aiResponse.length);

    return new Response(
      JSON.stringify({ response: aiResponse, navigate: navigationPath }),
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error('Error in math-ai-tutor:', error);
    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue' }),
      { status: 500, headers: responseHeaders }
    );
  }
});
