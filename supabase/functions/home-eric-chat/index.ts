import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, chatHistory } = await req.json();

    if (!message) {
      throw new Error('Missing message field');
    }

    console.log('Home Eric chat request:', { message, historyLength: chatHistory?.length || 0 });

    // Check if the question is about EDUPRENEURS
    const lowerMessage = message.toLowerCase();
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
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Call Lovable AI for general questions
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Tu es Eric, l'assistant IA de la plateforme EDUPRENEURS, une plateforme éducative haïtienne révolutionnaire.

🎯 À propos d'EDUPRENEURS :
- Plateforme créée pour révolutionner l'éducation haïtienne avec l'IA
- Fondée par Djoodoodson Florent (Fondateur) et Steeve Andolf Celestin (Co-fondateur)
- Deux jeunes visionnaires haïtiens passionnés par l'éducation

📚 Ton rôle :
- Accueillir les visiteurs et leur présenter EDUPRENEURS
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

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(chatHistory || []),
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
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices?.[0]?.message?.content || 'Désolé, je n\'ai pas pu générer une réponse.';
    
    // Remove all asterisks from the response
    aiResponse = aiResponse.replace(/\*\*/g, '').replace(/\*/g, '');

    console.log('Generated response length:', aiResponse.length);

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in home-eric-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
