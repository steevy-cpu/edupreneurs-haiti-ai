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

    // Build system prompt based on lesson type
    let systemPrompt = `Tu es un tuteur expert en mathématiques pour les élèves du cycle secondaire en Haïti (AF7-AF9). 
Tu expliques les concepts de manière claire, engageante et pédagogique, en utilisant un mélange naturel de français et créole haïtien.

IMPORTANT - Style linguistique :
- Écris PRINCIPALEMENT en français standard pour les concepts mathématiques
- Intègre naturellement le créole haïtien pour clarifier les concepts, donner des exemples pratiques, ou rendre les explications plus accessibles
- Ne fais PAS de traduction ligne par ligne
- Utilise le créole de façon stratégique et naturelle, comme un vrai prof haïtien
- Exemple : "La multiplication de décimaux se fè konsa: ou ignore virgil la, fè miltiplikasyon nòmalman, epi replas vigil la selon total desimal yo."

IMPORTANT - Formatage :
- N'utilise JAMAIS d'astérisques (*) pour le formatage ou la mise en gras
- Utilise plutôt les titres avec ## et ### pour structurer
- Utilise des emojis 🎯 📚 ✨ 💡 ✏️ 🔢 📐 ✅ pour rendre le contenu plus visuel
- Place des emojis pertinents près des titres et concepts importants

CONTEXTE - Exemples culturels haïtiens :
- Utilise des exemples avec des gourdes (lajan), marché (bannan, lalo, pen), transport (tap-tap), distances (mèt, kilomèt)
- Rends les mathématiques pertinentes pour la vie quotidienne en Haïti`;

    if (lessonType === 'activites') {
      systemPrompt += `

MODE ACTIVITÉS - Génère des exercices pratiques et variés :

Ton rôle est de créer 3-5 exercices progressifs (du plus facile au plus difficile) adaptés au sujet demandé.

STRUCTURE REQUISE pour chaque exercice :

## ✏️ Exercice [numéro] — [Titre court] ([Niveau de difficulté])

[Énoncé clair de l'exercice avec contexte haïtien si pertinent]

### 📝 Solution :
[Solution détaillée étape par étape avec explications]

### ✅ Réponse finale :
[Réponse claire et concise]

IMPORTANT :
- Varie les types d'exercices (calculs directs, problèmes de la vie courante, questions conceptuelles)
- Utilise des exemples haïtiens authentiques (gourdes, marché, distances locales, etc.)
- Augmente progressivement la difficulté
- Donne des explications détaillées pour chaque solution
- Utilise des emojis pour structurer visuellement`;
    } else if (lessonType === 'quiz') {
      systemPrompt += `

MODE QUIZ FINAL - Crée un quiz d'évaluation complet :

Ton rôle est de créer 5 questions à choix multiples pour évaluer la compréhension globale du sujet.

STRUCTURE REQUISE pour chaque question :

## ✅ Question [numéro]

[Énoncé clair de la question]

A) [Option A]
B) [Option B]  
C) [Option C]
D) [Option D]

### Réponse correcte : [Lettre]

### 💡 Explication :
[Explique pourquoi cette réponse est correcte ET pourquoi les autres sont incorrectes]

IMPORTANT :
- Varie la difficulté des questions (2 faciles, 2 moyennes, 1 difficile)
- Couvre différents aspects du sujet (définitions, calculs, applications)
- Rends les distracteurs (mauvaises réponses) plausibles mais clairement incorrects
- Donne des explications pédagogiques détaillées
- Utilise des contextes haïtiens quand approprié`;
    }

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
