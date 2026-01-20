/**
 * Security-Hardened: Home Eric Chat
 * 
 * Features:
 * - Rate limiting
 * - Input validation
 * - Security headers
 */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { validateInput, ericChatSchema } from "../_shared/validation.ts";
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

    // Check rate limit (HOME_CHAT - more permissive for visitors)
    const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.HOME_CHAT, null, clientIp);
    if (!rateCheck.allowed) {
      console.warn(`Rate limit exceeded for home-eric-chat from IP ${clientIp}`);
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validation = validateInput(ericChatSchema, rawBody);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        { status: 400, headers: responseHeaders }
      );
    }

    const { message, chatHistory } = validation.data;
    const lowerMessage = message.toLowerCase().trim();

    console.log('Home Eric chat request:', { message: message.substring(0, 100), historyLength: chatHistory?.length || 0 });

    // FAQ exact-match responses for instant replies (from button clicks)
    const FAQ_EXACT_RESPONSES: Record<string, string> = {
      "comment puis-je m'inscrire ?": `S'inscrire sur EDUPRENEURS est très simple ! 📝

👉 Voici les étapes :
1. Cliquez sur "Commencer Maintenant" ou "Se Connecter" 🔑
2. Choisissez "Créer un compte" 📧
3. Entrez votre email et créez un mot de passe sécurisé 🔒
4. Confirmez votre email avec le code reçu ✉️
5. Complétez votre profil avec votre niveau scolaire 🎓

C'est gratuit et prend moins de 2 minutes ! 🚀✨

Avez-vous besoin d'aide pour une étape spécifique ? 😊`,

      "quels cours sont disponibles ?": `EDUPRENEURS propose des cours adaptés au programme du MENFP ! 📚

🎓 Nos matières disponibles :
- Mathématiques 📐
- Français 📖
- Sciences Physiques ⚗️
- SVT (Sciences de la Vie) 🌿
- Anglais 🇬🇧
- Espagnol 🇪🇸
- Créole 🇭🇹
- Philosophie 💭
- Histoire-Géographie 🌍

📊 Niveaux couverts :
- 9ème Année Fondamentale
- NS1 à NS4 (Secondaire)

Chaque cours inclut des leçons interactives, exercices et quiz ! ✨🎯`,

      "comment fonctionne la plateforme ?": `EDUPRENEURS utilise l'IA pour personnaliser votre apprentissage ! 🤖✨

📱 Voici comment ça marche :

1️⃣ Choisissez votre matière et niveau 📚
2️⃣ Suivez des leçons interactives adaptées 🎯
3️⃣ Pratiquez avec des exercices et quiz 📝
4️⃣ Posez des questions à Jude, votre tuteur IA 🧠
5️⃣ Suivez votre progression en temps réel 📊

💡 Bonus : Gagnez des XP et des badges en apprenant ! 🏆

Prêt à commencer votre aventure ? 🚀😊`
    };

    // Check for exact FAQ match (instant response)
    const exactFaqResponse = FAQ_EXACT_RESPONSES[lowerMessage];
    if (exactFaqResponse) {
      console.log('FAQ exact match, returning cached response');
      return new Response(
        JSON.stringify({ response: exactFaqResponse }),
        { headers: responseHeaders }
      );
    }

    // Check if the question is about EDUPRENEURS
    const isAboutEdupreneurs = 
      lowerMessage.includes("qu'est-ce qu'edupreneurs") ||
      lowerMessage.includes("qu'est ce qu'edupreneurs") ||
      lowerMessage.includes("c'est quoi edupreneurs") ||
      lowerMessage.includes("edupreneurs c'est quoi") ||
      lowerMessage.includes("qu est-ce qu edupreneurs") ||
      lowerMessage.includes("présente edupreneurs") ||
      lowerMessage.includes("parle moi d'edupreneurs");

    if (isAboutEdupreneurs) {
      const edupreneursResponse = `EDUPRENEURS est une plateforme révolutionnaire créée pour transformer l'éducation haïtienne grâce à l'intelligence artificielle ! 🚀

Cette plateforme innovante a été fondée par deux jeunes visionnaires haïtiens :
• Djoodoodson Florent (Fondateur) 👨‍💼
• Steeve Andolf Celestin (Co-fondateur) 👨‍💼

📚 Notre Mission :
Rendre l'éducation de qualité accessible à tous les étudiants haïtiens en utilisant l'IA pour créer des expériences d'apprentissage personnalisées et engageantes. ✨

🎓 Ce que nous offrons :
- Cours interactifs adaptés au programme du MENFP 📖
- Assistant IA personnel pour chaque étudiant 🤖
- Exercices et quiz interactifs 🎯
- Suivi de progression en temps réel 📊
- Communauté d'apprentissage collaborative 🤝

Voulez-vous en savoir plus sur nos fonctionnalités ou comment vous inscrire ? 😊💡`;

      return new Response(
        JSON.stringify({ response: edupreneursResponse }),
        { headers: responseHeaders }
      );
    }

    // Call Lovable AI for general questions
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

const systemPrompt = `Tu es Jude, l'assistant IA de la plateforme EDUPRENEURS, une plateforme éducative haïtienne révolutionnaire.

🎯 À propos d'EDUPRENEURS :
- Plateforme créée pour révolutionner l'éducation haïtienne avec l'IA
- Fondée par Djoodoodson Florent (Fondateur) et Steeve Andolf Celestin (Co-fondateur)
- Deux jeunes visionnaires haïtiens passionnés par l'éducation

🎓 IMPORTANT - Ton audience :
- Les visiteurs sont principalement des ÉTUDIANTS haïtiens cherchant à apprendre
- Tu parles à des élèves de 9ème année ou de terminale (pas des professeurs)
- N'appelle JAMAIS un visiteur "professeur" ou "futur professeur"
- Utilise des termes comme "futur étudiant", "apprenant", ou simplement "vous"

📚 Ton rôle :
- Accueillir les ÉTUDIANTS et futurs apprenants
- Leur présenter EDUPRENEURS comme leur futur outil d'apprentissage
- Répondre aux questions sur la plateforme et ses fonctionnalités
- Expliquer comment s'inscrire et utiliser la plateforme
- Encourager l'apprentissage et l'inscription

💬 Ton style :
- Chaleureux et encourageant 😊
- Français standard et clair
- Utilise BEAUCOUP d'emojis pertinents dans tes réponses (au moins 5-8 emojis par réponse) 🎓✨📚🚀💡
- N'utilise JAMAIS d'asterisques (*) pour le formatage, utilise uniquement des emojis
- Concis et informatif (maximum 3-4 paragraphes)
- Structure tes réponses avec des sauts de ligne pour la lisibilité

✨ Fonctionnalités de la plateforme :
- Cours interactifs adaptés au programme du MENFP
- Assistant IA personnel pour chaque étudiant
- Exercices et quiz interactifs
- Suivi de progression en temps réel
- Communauté d'apprentissage collaborative

Si on te pose des questions hors sujet, rappelle gentiment que tu es là pour parler d'EDUPRENEURS et de l'éducation.`;

    // Limit chat history to last 6 messages for faster processing
    const recentHistory = (chatHistory || []).slice(-6);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentHistory,
      { role: 'user', content: message }
    ];

    console.log('Calling Lovable AI...');

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
        max_tokens: 350,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requêtes AI atteinte. Réessayez dans un moment.' }),
          { status: 429, headers: responseHeaders }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices?.[0]?.message?.content || 'Désolé, je n\'ai pas pu générer une réponse.';
    
    // Remove all asterisks from the response
    aiResponse = aiResponse.replace(/\*\*/g, '').replace(/\*/g, '');

    console.log('Generated response length:', aiResponse.length);

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error('Error in home-eric-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: responseHeaders }
    );
  }
});
