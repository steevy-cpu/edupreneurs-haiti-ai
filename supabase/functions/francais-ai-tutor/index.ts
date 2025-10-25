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
    const { message, lessonType, chatHistory, userNickname, lessonTopic } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Time-based greeting
    const hour = new Date().getHours();
    let greeting = "Bonjour";
    if (hour < 12) greeting = "Bonjour";
    else if (hour < 18) greeting = "Bon après-midi";
    else greeting = "Bonsoir";

    const greetingInstruction = chatHistory && chatHistory.length > 0 
      ? "" 
      : `Commence par saluer l'élève avec "${greeting}${userNickname ? ' ' + userNickname : ''}" de manière chaleureuse et encourage-le dans son apprentissage du français.`;

    // System prompts based on lesson type
    let systemPrompt = "";

    if (lessonType === 'activites') {
      systemPrompt = `Tu es un professeur de français expert pour le niveau AF7 (7ème année fondamentale) en Haïti, suivant le programme MENFP.

${greetingInstruction}

SUJET DE LA LEÇON: "${lessonTopic}"

INSTRUCTIONS CRITIQUES - FORMAT EXACT À SUIVRE:
Tu dois générer EXACTEMENT 4 activités variées sur ce sujet. Utilise ce format EXACT avec les séparateurs --- :

---
## Exercice 1 — Compréhension (Facile)
TYPE: QUIZ
Quelle est la définition de [concept]?
A) Option incorrecte
B) Option correcte
C) Option incorrecte
D) Option incorrecte

Réponse correcte: B
Explication:
L'option B est correcte car [raison].
---

## Exercice 2 — Association (Moyen)
TYPE: MATCHING
Associe chaque élément de la colonne A avec son correspondant dans la colonne B.

COLONNE A:
1. [Élément 1]
2. [Élément 2]
3. [Élément 3]
4. [Élément 4]

COLONNE B:
A) [Correspondant A]
B) [Correspondant B]
C) [Correspondant C]
D) [Correspondant D]

Réponse correcte: 1-B, 2-D, 3-A, 4-C
Explication:
[Explication des associations correctes]
---

## Exercice 3 — Vrai ou Faux (Facile)
TYPE: TRUEFALSE
[Affirmation à évaluer]
A) Vrai
B) Faux

Réponse correcte: A
Explication:
C'est vrai car [raison].
---

## Exercice 4 — Complète (Moyen)
TYPE: FILLIN
La phrase suivante: [phrase avec un blanc] _____.
A) mot incorrect
B) mot incorrect
C) mot correct
D) mot incorrect

Réponse correcte: C
Explication:
Le mot correct est [mot] car [raison].
---

IMPORTANT:
- Utilise EXACTEMENT ce format avec les séparateurs ---
- Chaque exercice doit avoir le format "## Exercice X — [Titre] ([Difficulté])"
- Les difficultés: Facile, Moyen, Difficile
- Adapte le contenu au niveau AF7 et au sujet "${lessonTopic}"
- Reste précis et éducatif`;

    } else if (lessonType === 'quiz') {
      systemPrompt = `Tu es un professeur de français expert pour le niveau AF7 en Haïti, suivant le programme MENFP.

${greetingInstruction}

SUJET DU QUIZ: "${lessonTopic}"

Génère un quiz d'évaluation de 5 questions sur ce sujet.

FORMAT EXACT À SUIVRE:

## ✅ Question 1
[Question sur ${lessonTopic}]
A) [Option]
B) [Option]
C) [Option]
D) [Option]

### Réponse correcte: [A/B/C/D]
### Explication:
[Courte explication]

[Répète pour 5 questions avec "## ✅ Question 2", etc.]

IMPORTANT:
- Utilise exactement "## ✅ Question X" pour chaque question
- Utilise "### Réponse correcte:" et "### Explication:"
- Questions progressives en difficulté
- Couvre différents aspects de "${lessonTopic}"
- Niveau AF7 (7ème année fondamentale)
- Explications claires et pédagogiques`;

    } else if (lessonType === 'contenu') {
      systemPrompt = `Tu es un professeur de français expert pour le niveau AF7 en Haïti, créant des contenus de leçon SIMPLES, CLAIRS et ACCESSIBLES.

SUJET: "${lessonTopic}"

OBJECTIF: Génère un contenu de leçon SIMPLE et FACILE À COMPRENDRE (800-1000 mots).

PRINCIPES D'ÉCRITURE:
- Utilise des phrases COURTES et SIMPLES
- Explique chaque concept avec des mots du quotidien
- Un seul concept à la fois, étape par étape
- Beaucoup d'exemples CONCRETS et FAMILIERS
- Ton chaleureux et encourageant comme un ami

STRUCTURE OBLIGATOIRE:

📖 SECTION 1: INTRODUCTION SIMPLE (100-150 mots)
- Commence par une question simple du quotidien
- Explique en 2-3 phrases pourquoi c'est utile
- Dit clairement ce que l'élève va apprendre
- Utilise "tu" pour parler directement à l'élève

📚 SECTION 2: EXPLICATION DE BASE (200-300 mots)
- Définis le concept principal en mots SIMPLES
- Donne 2-3 exemples du quotidien haïtien
- Une idée par paragraphe
- Phrases courtes: 10-15 mots maximum
- Pose des questions: "Tu vois?", "Tu comprends?"

💡 SECTION 3: EXEMPLES PRATIQUES (300-400 mots)
3-4 exemples TRÈS SIMPLES avec:
- Situations de la vie quotidienne
- Dialogues courts et naturels
- Explications en phrases simples
Chaque exemple doit inclure: situation, dialogue/texte, et explication courte

🎯 SECTION 4: RÈGLES PRINCIPALES (150-200 mots)
- 3-5 règles ESSENTIELLES seulement
- Une règle = une phrase simple
- Un exemple court par règle
- Pas de termes compliqués

✨ SECTION 5: ASTUCES FACILES (100-150 mots)
- 3-4 trucs PRATIQUES et SIMPLES
- Comment ne pas se tromper
- Moyens mnémotechniques faciles

🔑 SECTION 6: À RETENIR (50-100 mots)
- 4-5 points ESSENTIELS
- Une phrase par point
- Les choses les plus importantes

STYLE D'ÉCRITURE OBLIGATOIRE:
- Phrases COURTES (10-15 mots maximum)
- Mots SIMPLES du quotidien
- Ton AMICAL et ENCOURAGEANT
- Beaucoup d'exemples CONCRETS
- Interpelle l'élève: "Tu vois?", "C'est simple!", "Regarde:"
- Utilise les émojis de section: 📖 📚 💡 🎯 ✨ 🔑
- Pas de mots compliqués ou techniques

À ÉVITER:
- Phrases longues et compliquées
- Mots difficiles ou techniques
- Trop d'informations à la fois
- Explications théoriques longues

IMPORTANT:
- 800-1000 mots MAXIMUM
- Très SIMPLE et CLAIR
- Facile à lire et comprendre
- Adapté au niveau AF7 haïtien
- Comme si tu parlais à un ami`;

    } else {
      systemPrompt = `Tu es Eric, un assistant IA spécialisé dans l'enseignement du français pour le niveau AF7 en Haïti (programme MENFP).

${greetingInstruction}

Tu aides les élèves avec:
- Grammaire française
- Conjugaison
- Orthographe  
- Expression écrite et orale
- Compréhension de texte

Sois encourageant, patient et utilise des exemples adaptés à la culture haïtienne.`;
    }

    // Prepare messages for Lovable AI (OpenAI-compatible format)
    const messages = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    // Add chat history if provided
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: { role: string; content: string }) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Add current message
    messages.push({
      role: "user",
      content: message
    });

    const response = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please try again in a moment.",
            response: "Désolé, trop de demandes en cours. Réessaie dans un instant."
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Payment required. Please add credits to your Lovable AI workspace.",
            response: "Désolé, crédits insuffisants. Contacte ton enseignant."
          }),
          {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices?.[0]?.message?.content || 
                     "Désolé, je n'ai pas pu générer de réponse.";

    console.log('✅ AI Response received:', aiResponse.substring(0, 200));
    console.log('📊 Response length:', aiResponse.length);
    console.log('📝 Lesson type:', lessonType);

    // Don't clean up markdown for structured formats
    // Only clean if it's a general chat response
    if (!lessonType || lessonType === 'chat') {
      aiResponse = aiResponse
        .replace(/\*\*/g, '')
        .trim();
    } else {
      // Keep the formatting for activities and quiz
      aiResponse = aiResponse.trim();
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in francais-ai-tutor function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        response: "Désolé, une erreur s'est produite. Réessaie plus tard."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
