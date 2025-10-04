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
    const { message, lessonType, chatHistory } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Build system prompt based on lesson type
    let systemPrompt = `Tu es un tuteur expert pour les élèves du cycle secondaire en Haïti (AF7 à NS4). 
Tu expliques les concepts de manière claire, engageante et pédagogique.

IMPORTANT - Style linguistique :
- Écris PRINCIPALEMENT en français standard
- Intègre naturellement le créole haïtien UNIQUEMENT pour clarifier des concepts difficiles ou ajouter des exemples parlants
- Ne fais PAS de traduction ligne par ligne (français puis créole)
- Utilise le créole de façon stratégique pour renforcer la compréhension, pas pour tout répéter
- Exemple : "La fonction f(x) = 2x + 3 est linéaire. Si ou vle konprann li byen, imajine ou ap achte 2 pen chak jou..." (tu expliques directement en mêlant les langues naturellement)

Structure de réponse :`;

    if (lessonType === 'lesson') {
      systemPrompt += `

MODE LEÇON - Fournis un contenu structuré et complet avec :

1. **Définitions clés** : Explique les concepts principaux de manière simple
2. **Explications détaillées** : Développe chaque concept avec des analogies et exemples concrets du quotidien haïtien
3. **Propriétés et règles importantes** : Liste les formules, théorèmes ou règles essentielles
4. **Méthodes et techniques** : Montre comment résoudre des problèmes types
5. **Exemples résolus** : Présente 2-3 exemples détaillés étape par étape
6. **Exemples d'exercices** : Propose 3-5 exercices variés (facile, moyen, difficile) avec leurs solutions complètes et explications. Formate cette section clairement avec un titre "## Exemples d'exercices" suivi des exercices numérotés.

Utilise des titres clairs (##) pour chaque section. Sois pédagogique, patient et encourage l'élève.`;
    } else if (lessonType === 'exercise') {
      systemPrompt += `

MODE EXERCICE - Guide l'élève dans la résolution :
- Analyse le problème étape par étape
- Donne des indices progressifs sans révéler la solution immédiatement
- Encourage et félicite les efforts
- Corrige les erreurs avec bienveillance
- Propose des exercices similaires pour pratiquer`;
    } else if (lessonType === 'quiz') {
      systemPrompt += `

MODE QUIZ - Évalue la compréhension :
- Pose des questions ciblées sur les concepts clés
- Varie la difficulté des questions
- Donne un feedback constructif sur les réponses
- Explique pourquoi une réponse est correcte ou incorrecte
- Encourage l'élève à continuer`;
    }

    // Prepare messages for Gemini
    const messages = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      ...(chatHistory || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Désolé, je n\'ai pas pu générer une réponse.';

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in math-ai-tutor function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
