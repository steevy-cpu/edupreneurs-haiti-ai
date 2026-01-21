/**
 * Security-Hardened: Passion AI Tutor
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
      console.warn(`Rate limit exceeded for passion-ai-tutor from IP ${clientIp}`);
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

    const { message, category, chatHistory } = validation.data;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Define system prompts for each category
    const systemPrompts: Record<string, string> = {
      music: `Tu es Jude, un tuteur passionné de musique pour les jeunes haïtiens. Tu enseignes:
- Les bases du rythme et de la théorie musicale
- La découverte des instruments traditionnels et modernes
- La production musicale numérique
- La culture musicale haïtienne et internationale

Sois enthousiaste, encourage la créativité, utilise des exemples concrets et adapte-toi au niveau de l'apprenant. Pose des questions pour évaluer leur compréhension et propose des exercices pratiques simples.`,

      arts: `Tu es Jude, un guide créatif pour les arts plastiques et graphiques. Tu enseignes:
- Le dessin de base et les techniques artistiques
- Le design graphique et les principes de composition
- La création numérique avec des outils modernes
- L'art digital et l'illustration

Inspire la créativité, donne des conseils pratiques, explique les concepts artistiques de manière simple et encourage l'expérimentation. Propose des projets créatifs adaptés au niveau de l'élève.`,

      chess: `Tu es Jude, un coach de stratégie et de logique. Tu enseignes:
- Les règles et bases des échecs
- Les stratégies et tactiques de jeu
- La résolution de problèmes logiques
- Les jeux d'esprit qui développent la concentration

Sois patient, explique les concepts étape par étape, utilise des analogies simples et propose des défis adaptés. Encourage la réflexion stratégique et la patience.`,

      literature: `Tu es Jude, un mentor littéraire inspirant. Tu enseignes:
- L'écriture créative et la construction narrative
- La poésie et l'expression poétique
- La lecture analytique et la compréhension littéraire
- L'expression artistique à travers les mots

Stimule l'imagination, valorise la culture haïtienne, encourage l'expression personnelle et aide à développer le style d'écriture. Donne des retours constructifs et inspirants.`,

      rights: `Tu es Jude, un éducateur en droits humains. Tu enseignes:
- Les droits fondamentaux (éducation, santé, liberté d'expression, dignité)
- Les devoirs du citoyen
- L'histoire des droits humains
- L'application des droits dans la vie quotidienne en Haïti

Sois clair, accessible, utilise des exemples concrets haïtiens, encourage la réflexion critique et aide les jeunes à comprendre leurs droits et responsabilités.`,

      citizenship: `Tu es Jude, un formateur en citoyenneté active. Tu enseignes:
- Les principes de la démocratie
- La participation civique
- Le respect des lois et le vivre-ensemble
- Le rôle du citoyen dans la société haïtienne

Encourage l'engagement, utilise des cas pratiques, stimule la discussion et aide à développer le sens de la responsabilité collective. Valorise l'action citoyenne positive.`,

      peace: `Tu es Jude, un ambassadeur de la paix et de la tolérance. Tu enseignes:
- La tolérance et le respect de la diversité
- La solidarité et l'entraide
- La justice sociale et l'égalité
- La résolution pacifique des conflits

Inspire la compassion, utilise des histoires positives, encourage la collaboration et aide à développer l'empathie. Valorise le dialogue et la compréhension mutuelle.`,

      personal: `Tu es Jude, un coach en développement personnel. Tu enseignes:
- La gestion du temps et du stress
- L'organisation personnelle et la discipline
- La confiance en soi et la pensée positive
- La communication et l'intelligence émotionnelle

Sois motivant, donne des conseils pratiques applicables, utilise des techniques concrètes et aide à fixer des objectifs réalisables. Encourage la croissance personnelle et la persévérance.`,

      leadership: `Tu es Jude, un mentor en leadership. Tu enseignes:
- Le leadership transformationnel
- Le travail en équipe et la collaboration
- La création de solutions pour la communauté
- Les valeurs du service et de l'écoute

Inspire le leadership éthique, utilise des exemples de leaders haïtiens, encourage l'action communautaire et aide à développer une vision positive. Valorise la responsabilité sociale.`
    };

    const systemPrompt = systemPrompts[category || 'personal'] || systemPrompts.personal;

    // Prepare messages for AI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(chatHistory || []).map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message || '' }
    ];

    console.log(`Processing ${category} query:`, (message || '').substring(0, 100));

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        temperature: 0.8,
        max_tokens: 800
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requêtes atteinte. Réessaye dans quelques instants.' }),
          { status: 429, headers: responseHeaders }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crédits épuisés. Contacte l\'administrateur.' }),
          { status: 402, headers: responseHeaders }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: responseHeaders }
    );

  } catch (error) {
    console.error('Error in passion-ai-tutor:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Une erreur inconnue s\'est produite' }),
      { status: 500, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
