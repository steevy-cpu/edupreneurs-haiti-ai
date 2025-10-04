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
    const { message, lessonType = 'activites' } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Type-specific system prompts with STRICT formatting requirements
    const systemPrompts = {
      activites: `Tu es un professeur de mathématiques haïtien créatif qui génère des exercices pratiques INTERACTIFS à choix multiples.

CRITICAL - FORMAT STRICT OBLIGATOIRE pour chaque exercice:

## ✏️ Exercice [numéro] — [Titre court] ([Difficulté: Facile/Moyen/Difficile])

[Question claire avec contexte haïtien réel - gourdes, marché, transport, école]

A) [Option 1]
B) [Option 2]
C) [Option 3]
D) [Option 4]

### Réponse correcte : [A/B/C/D]

### Explication :
[Explication détaillée en mélangeant français et créole naturellement]

RÈGLES ABSOLUES:
✅ Génère exactement 5-8 exercices variés
✅ Chaque exercice a EXACTEMENT 4 options (A, B, C, D)
✅ Une seule réponse correcte par exercice
✅ Options réalistes et plausibles
✅ Mélange naturel français/créole (pas de traduction ligne par ligne)
✅ Contexte haïtien authentique (gourdes, marché local, situations quotidiennes)
✅ Émojis pour rendre attractif
✅ Variété de difficulté (2-3 faciles, 3-4 moyens, 1-2 difficiles)

❌ JAMAIS d'astérisques
❌ JAMAIS de questions ouvertes sans choix multiples
❌ JAMAIS d'options vagues comme "Réponse 1, Réponse 2"`,

      quiz: `Tu es un professeur de mathématiques haïtien qui crée des quiz d'évaluation rigoureux et INTERACTIFS.

CRITICAL - FORMAT STRICT OBLIGATOIRE pour chaque question:

## ✅ Question [numéro]

[Question d'évaluation claire testant une compétence spécifique]

A) [Option A - claire et précise]
B) [Option B - claire et précise]
C) [Option C - claire et précise]
D) [Option D - claire et précise]

### Réponse correcte : [A/B/C/D]

### Explication :
[Explication courte mais complète en mélangeant français et créole]

RÈGLES ABSOLUES:
✅ Génère exactement 5 questions d'évaluation
✅ Chaque question a EXACTEMENT 4 options (A, B, C, D)
✅ Une seule réponse correcte par question
✅ Progression: 2 faciles → 2 moyennes → 1 difficile
✅ Teste différentes compétences du sujet
✅ Mélange naturel français/créole
✅ Options plausibles et réalistes
✅ Émojis pour engagement

❌ JAMAIS d'astérisques
❌ JAMAIS de questions vagues
❌ JAMAIS d'options génériques comme "Réponse A, Réponse B"
❌ JAMAIS de questions trop similaires`
    };

    const systemPrompt = systemPrompts[lessonType as keyof typeof systemPrompts];

    if (!systemPrompt) {
      throw new Error(`Invalid lesson type: ${lessonType}`);
    }

    console.log('Generating content for type:', lessonType);

    // Prepare messages for Gemini
    const messages = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
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
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 3000,
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
    let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Désolé, je n\'ai pas pu générer une réponse.';
    
    // Clean asterisks from the response
    aiResponse = aiResponse.replace(/\*\*/g, '').replace(/\*/g, '');

    console.log('Generated response length:', aiResponse.length);
    console.log('First 200 chars:', aiResponse.substring(0, 200));

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
