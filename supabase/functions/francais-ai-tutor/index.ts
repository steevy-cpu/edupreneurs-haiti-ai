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

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
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
Tu dois générer EXACTEMENT 4 activités variées sur ce sujet. Utilise ce format EXACT:

===ACTIVITÉ 1: QUIZ===
Question: [Question sur ${lessonTopic}]
A) [Option]
B) [Option]
C) [Option]
D) [Option]
Réponse: [Lettre de la bonne réponse]

===ACTIVITÉ 2: MATCHING===
Associe les éléments:
1. [Élément] -> [Réponse]
2. [Élément] -> [Réponse]
3. [Élément] -> [Réponse]
4. [Élément] -> [Réponse]

===ACTIVITÉ 3: TRUEFALSE===
Vrai ou Faux:
1. [Affirmation] (Vrai/Faux)
2. [Affirmation] (Vrai/Faux)
3. [Affirmation] (Vrai/Faux)
4. [Affirmation] (Vrai/Faux)

===ACTIVITÉ 4: FILLIN===
Complète les phrases:
1. [Phrase avec _____ à compléter] (Réponse: [mot])
2. [Phrase avec _____ à compléter] (Réponse: [mot])
3. [Phrase avec _____ à compléter] (Réponse: [mot])

IMPORTANT:
- Utilise EXACTEMENT ces en-têtes avec ===
- Chaque activité doit être sur "${lessonTopic}"
- Adapte le contenu au niveau AF7
- Reste précis et éducatif`;

    } else if (lessonType === 'quiz') {
      systemPrompt = `Tu es un professeur de français expert pour le niveau AF7 en Haïti, suivant le programme MENFP.

${greetingInstruction}

SUJET DU QUIZ: "${lessonTopic}"

Génère un quiz d'évaluation de 5 questions sur ce sujet.

FORMAT EXACT À SUIVRE:
Question 1: [Question sur ${lessonTopic}]
A) [Option]
B) [Option]
C) [Option]
D) [Option]
Réponse correcte: [Lettre]
Explication: [Courte explication]

[Répète pour 5 questions]

IMPORTANT:
- Questions progressives en difficulté
- Couvre différents aspects de "${lessonTopic}"
- Niveau AF7 (7ème année fondamentale)
- Explications claires et pédagogiques`;

    } else if (lessonType === 'contenu') {
      systemPrompt = `Tu es un professeur de français expert pour le niveau AF7 en Haïti, créant des contenus de leçon visuels et engageants.

SUJET: "${lessonTopic}"

Génère un contenu de leçon riche, structuré et VISUEL avec:

📖 **INTRODUCTION**
Une introduction captivante qui explique pourquoi ce sujet est important.

📊 **CONCEPTS CLÉS**
Explique les concepts principaux avec:
- Des exemples concrets et pertinents
- Des schémas visuels décrits (utilise des emojis pour illustrer)
- Des diagrammes de flux ou tableaux explicatifs

💡 **EXEMPLES PRATIQUES**
Au moins 3 exemples illustrés:
- Exemple 1: [avec illustration décrite]
- Exemple 2: [avec schéma explicatif]
- Exemple 3: [avec diagramme]

🎯 **POINTS CLÉS À RETENIR**
Liste à puces des éléments essentiels

✨ **CONSEILS PRATIQUES**
Astuces pour mieux comprendre et utiliser ces concepts

Utilise:
- 📝 Des listes à puces claires
- 💬 Des dialogues exemple
- 📊 Des descriptions de schémas/diagrammes
- 🎭 Des scènes illustrées
- ✏️ Des exemples annotés

Rends le contenu visuel, engageant et facile à comprendre pour le niveau AF7!`;

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

    // Prepare messages for Gemini
    const messages = [
      {
        role: "user",
        parts: [{ text: systemPrompt }]
      },
      {
        role: "model",
        parts: [{ text: "D'accord, je suis prêt à aider l'élève avec son apprentissage du français selon le programme MENFP AF7." }]
      }
    ];

    // Add chat history if provided
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: { role: string; content: string }) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      });
    }

    // Add current message
    messages.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.candidates[0]?.content?.parts[0]?.text || 
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
