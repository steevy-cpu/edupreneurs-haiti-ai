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
      systemPrompt = `Tu es un professeur de français expert pour le niveau AF7 en Haïti, créant des contenus de leçon DÉTAILLÉS, visuels et engageants.

SUJET: "${lessonTopic}"

🎯 OBJECTIF: Génère un contenu de leçon LONG, COMPLET et VISUELLEMENT RICHE (minimum 1500 mots).

STRUCTURE OBLIGATOIRE:

📖 **1. INTRODUCTION CAPTIVANTE** (200-300 mots)
- Commence par une question intrigante ou une anecdote
- Explique l'importance du sujet dans la vie quotidienne
- Présente ce que l'élève va apprendre
- Utilise des émojis pour rendre le texte vivant

📚 **2. CONTEXTE ET DÉFINITIONS** (300-400 mots)
- Définis tous les termes importants avec clarté
- Donne des exemples du quotidien haïtien
- Utilise des comparaisons et métaphores
- Ajoute des encadrés visuels avec émojis (📌 À noter:, 💡 Le savais-tu?, etc.)

📊 **3. CONCEPTS CLÉS DÉTAILLÉS** (500-700 mots)
Pour CHAQUE concept principal:
- Explication approfondie et claire
- 3-4 exemples concrets et variés
- Schémas visuels décrits avec émojis (➡️, ⬇️, ✅, ❌)
- Tableaux comparatifs si pertinent
- Cas pratiques illustrés

Exemple de format visuel à utiliser:
```
🔍 CONCEPT: [Nom du concept]
📝 Définition: [explication détaillée]

✅ EXEMPLE CORRECT:
   [exemple détaillé avec contexte]
   
❌ ERREUR COMMUNE:
   [contre-exemple expliqué]
   
💭 POURQUOI C'EST IMPORTANT:
   [explication de l'importance]
```

💡 **4. EXEMPLES PRATIQUES APPROFONDIS** (400-500 mots)
Minimum 5 exemples variés avec:
- Contexte de la situation
- Dialogue ou texte exemple
- Analyse détaillée ligne par ligne
- Points d'attention particuliers
- Variantes possibles

Format pour chaque exemple:
```
📌 EXEMPLE [numéro]: [Titre descriptif]

🎭 Situation: [contexte détaillé]

💬 Exemple:
   [texte/dialogue]

🔎 Analyse:
   - Point 1: [explication]
   - Point 2: [explication]
   - Point 3: [explication]

⚠️ Attention à: [pièges courants]
```

🎯 **5. RÈGLES ET PRINCIPES** (200-300 mots)
- Liste numérotée de toutes les règles importantes
- Pour chaque règle: explication + exemple + contre-exemple
- Tableau récapitulatif si nécessaire
- Exceptions à noter

✨ **6. ASTUCES ET CONSEILS PRATIQUES** (150-200 mots)
- Moyens mnémotechniques
- Techniques pour ne pas se tromper
- Références à la culture haïtienne
- Conseils de professeur expérimenté

🔑 **7. POINTS CLÉS À RETENIR** (150-200 mots)
- Résumé des 8-10 points essentiels
- Format liste à puces claire
- Chaque point avec mini-exemple

📝 **8. EXERCICE MENTAL**
- Pose 2-3 questions de réflexion
- Encourage l'élève à pratiquer mentalement

STYLE D'ÉCRITURE:
- Ton chaleureux et encourageant
- Phrases variées (courtes ET longues)
- Beaucoup d'exemples du contexte haïtien
- Émojis variés pour la visualisation
- Interpelle l'élève (Tu vois?, Imagine que...)
- Encadrés visuels fréquents
- Espaces et aération du texte

IMPORTANT:
- MINIMUM 1500 mots
- Maximum de détails et d'exemples
- Très visuel avec émojis
- Structuré avec titres clairs
- Pédagogique et engageant
- Adapté au niveau AF7 haïtien`;

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

    // Clean up response
    aiResponse = aiResponse
      .replace(/\*\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .trim();

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
