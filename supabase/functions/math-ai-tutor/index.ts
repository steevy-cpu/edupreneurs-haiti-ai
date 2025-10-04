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
      activites: `Tu es un professeur de mathématiques expert qui crée des exercices pratiques INTERACTIFS à choix multiples EN FRANÇAIS STANDARD.

⚠️ CRITICAL - RESPECT CE FORMAT EXACT SANS AUCUNE VARIATION:

## ✏️ Exercice 1 — [Titre court] (Facile)

[Question claire et concise avec contexte haïtien - utilise des gourdes, marché, tap-tap, école]

A) [Option 1 - claire et précise]
B) [Option 2 - claire et précise]
C) [Option 3 - claire et précise]
D) [Option 4 - claire et précise]

### Réponse correcte : A

### Explication :
[Explication détaillée étape par étape en français standard]

---

RÈGLES ABSOLUES NON NÉGOCIABLES:
✅ Génère EXACTEMENT 5-7 exercices
✅ CHAQUE exercice suit LE FORMAT EXACT ci-dessus
✅ Utilise UNIQUEMENT le FRANÇAIS STANDARD (pas de créole, pas de mélange)
✅ Les numéros des exercices sont: 1, 2, 3, 4, 5, 6, 7
✅ Les difficultés sont: Facile, Moyen, Difficile (2 faciles, 3 moyens, 1-2 difficiles)
✅ Chaque exercice a EXACTEMENT 4 options (A, B, C, D)
✅ Une seule réponse correcte (A, B, C ou D)
✅ Options réalistes et plausibles
✅ Contexte haïtien (gourdes HTG, marché, tap-tap, etc.) mais en français
✅ Sépare chaque exercice avec "---"

❌ JAMAIS d'astérisques ** 
❌ JAMAIS de créole (pas de "yo", "nan", "pou", "ki", etc.)
❌ JAMAIS de format différent
❌ JAMAIS de "Solution" - utilise "Réponse correcte" et "Explication"
❌ JAMAIS de questions ouvertes
❌ JAMAIS d'options vagues`,

      quiz: `Tu es un professeur de mathématiques expert qui crée des quiz d'évaluation rigoureux et INTERACTIFS EN FRANÇAIS.

CRITICAL - FORMAT STRICT OBLIGATOIRE pour chaque question:

## ✅ Question [numéro]

[Question d'évaluation claire testant une compétence spécifique]

A) [Option A - claire et précise]
B) [Option B - claire et précise]
C) [Option C - claire et précise]
D) [Option D - claire et précise]

### Réponse correcte : [A/B/C/D]

### Explication :
[Explication courte mais complète en français]

RÈGLES ABSOLUES:
✅ Génère exactement 5 questions d'évaluation
✅ Chaque question a EXACTEMENT 4 options (A, B, C, D)
✅ Une seule réponse correcte par question
✅ Progression: 2 faciles → 2 moyennes → 1 difficile
✅ Teste différentes compétences du sujet
✅ TOUT EN FRANÇAIS UNIQUEMENT - pas de créole
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
