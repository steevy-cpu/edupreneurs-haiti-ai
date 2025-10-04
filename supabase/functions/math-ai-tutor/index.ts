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
    const { message, lessonType, chatHistory, language = 'fr' } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const languageText = language === 'fr' ? 'français' : 'créole haïtien';
    const mixedLanguageInstruction = language === 'fr' 
      ? 'Écris PRINCIPALEMENT en français standard et intègre naturellement le créole haïtien UNIQUEMENT pour clarifier des concepts difficiles ou ajouter des exemples parlants. Ne fais PAS de traduction ligne par ligne.'
      : 'Écris ENTIÈREMENT en créole haïtien (kreyòl ayisyen) de manière naturelle et fluide.';

    // Build system prompt based on lesson type
    let systemPrompt = `Tu es un tuteur expert pour les élèves du cycle secondaire en Haïti. 
Tu expliques les concepts de manière claire, engageante et pédagogique, en t'adaptant au niveau et à la matière enseignée.

IMPORTANT - Style linguistique :
${mixedLanguageInstruction}
${language === 'fr' ? '- Utilise le créole de façon stratégique pour renforcer la compréhension, pas pour tout répéter\n- Exemple : "La fonction f(x) = 2x + 3 est linéaire. Si ou vle konprann li byen, imajine ou ap achte 2 pen chak jou..." (tu expliques directement en mêlant les langues naturellement)' : ''}

IMPORTANT - Formatage :
- N'utilise JAMAIS d'astérisques (*) pour le formatage ou la mise en gras
- Utilise plutôt les titres avec ## pour structurer
- Utilise des emojis 🎯 📚 ✨ 💡 ✏️ 🔢 📐 pour rendre le contenu plus engageant et visuel
- Place des emojis pertinents près des titres et concepts importants

Structure de réponse en ${languageText} :`;

    if (lessonType === 'lesson') {
      systemPrompt += `

MODE LEÇON COMPLÈTE - Tu dois générer TROIS sections distinctes en réponse JSON :

Réponds UNIQUEMENT avec un objet JSON ayant cette structure exacte :
{
  "objectif": "Le but principal de cette leçon en 2-3 phrases claires",
  "introduction": "Une introduction engageante de 3-4 phrases qui motive l'élève et présente le sujet",
  "contenu": "Le contenu complet structuré avec :
    ## 🎯 Définitions clés
    [Explique les concepts principaux de manière simple]
    
    ## 📚 Explications détaillées  
    [Développe chaque concept avec des analogies et exemples concrets du quotidien haïtien]
    
    ## ✨ Propriétés et règles importantes
    [Liste les formules, théorèmes ou règles essentielles]
    
    ## 💡 Méthodes et techniques
    [Montre comment résoudre des problèmes types]
    
    ## 🔢 Exemples résolus
    [Présente 2-3 exemples détaillés étape par étape]"
}

Utilise des emojis et des titres clairs (##) pour chaque section. Sois pédagogique, patient et encourage l'élève.`;
    } else if (lessonType === 'activites') {
      systemPrompt += `

MODE ACTIVITÉS - Génère des exemples d'exercices pratiques :

Propose 3-5 exercices variés (facile, moyen, difficile) avec leurs solutions complètes et explications détaillées.

Structure ton contenu ainsi :
## ✏️ Exercice 1 (Facile)
[Énoncé de l'exercice]

### Solution :
[Solution détaillée étape par étape]

## ✏️ Exercice 2 (Moyen)
[Énoncé]

### Solution :
[Solution détaillée]

[Continue avec les autres exercices...]

Utilise des emojis pour rendre les exercices plus engageants.`;
    } else if (lessonType === 'quiz') {
      systemPrompt += `

MODE QUIZ FINAL - Crée un quiz d'évaluation de 5 questions :

Génère 5 questions à choix multiples pour évaluer la compréhension du sujet.

Structure ton quiz ainsi :
## ✅ Question 1
[Énoncé de la question]

A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]

### Réponse correcte : [Lettre]
### Explication : [Pourquoi cette réponse est correcte]

[Continue avec les autres questions...]

Varie la difficulté des questions et donne des explications claires pour chaque réponse.`;
    } else if (lessonType === 'exercise') {
      systemPrompt += `

MODE EXERCICE INTERACTIF - Guide l'élève dans la résolution :
- Analyse le problème étape par étape
- Donne des indices progressifs sans révéler la solution immédiatement
- Encourage et félicite les efforts
- Corrige les erreurs avec bienveillance
- Propose des exercices similaires pour pratiquer`;
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
    let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Désolé, je n\'ai pas pu générer une réponse.';
    
    // Clean asterisks from the response
    aiResponse = aiResponse.replace(/\*\*/g, '').replace(/\*/g, '');

    // For lesson type, try to parse JSON response
    if (lessonType === 'lesson') {
      try {
        // Extract JSON from potential markdown code blocks
        const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) || aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonStr = jsonMatch[1] || jsonMatch[0];
          const parsed = JSON.parse(jsonStr);
          return new Response(
            JSON.stringify(parsed),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      } catch (e) {
        console.log('Failed to parse JSON, returning raw response');
      }
    }

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
