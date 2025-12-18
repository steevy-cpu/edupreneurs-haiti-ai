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
const { 
      exercise, 
      userMessage, 
      conversationHistory,
      studentAnswer,
      revealAnswer,
      referenceTexts
    } = await req.json();

    console.log('Exam tutor request:', { exercise: exercise?.exercise_number, userMessage });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build reference texts section if available
    let referenceTextsSection = '';
    if (referenceTexts && Array.isArray(referenceTexts) && referenceTexts.length > 0) {
      referenceTextsSection = `\n\n**TEXTES DE RÉFÉRENCE DE L'EXAMEN (utilise ces textes pour répondre aux questions):**\n`;
      referenceTexts.forEach((ref: { section?: string; title?: string; text: string }) => {
        referenceTextsSection += `\n[${ref.section || 'Texte'}] ${ref.title || ''}\n${ref.text}\n`;
      });
    }

    // Build system prompt for Eric as exam tutor
    let systemPrompt = `Tu es Eric, un tuteur pédagogique haïtien qui aide les élèves de 9ème année fondamentale à préparer leur examen officiel.

**IMPORTANT: Tu dois TOUJOURS parler en FRANÇAIS, peu importe la matière de l'examen (sauf si c'est un examen de Kreyòl).**
${referenceTextsSection}
**Ton rôle:**
- Guider l'élève à travers chaque exercice
- Expliquer les concepts avec des termes simples et des exemples concrets
- Donner des indices progressifs quand l'élève est bloqué
- Féliciter les efforts et encourager la persévérance
- Corriger les erreurs avec bienveillance en expliquant pourquoi
- SI DES TEXTES DE RÉFÉRENCE SONT FOURNIS, utilise-les pour répondre aux questions de compréhension

**Règles importantes:**
- NE TE PRÉSENTE JAMAIS dans tes réponses (pas de "Salut! Je suis Eric..." ou "Bonjour, je suis Eric...")
- Commence directement par ta réponse sans introduction
- **TOUJOURS utiliser la notation LaTeX pour les formules mathématiques**: Entoure les expressions mathématiques avec $ pour inline (ex: $x^2 + 5$) ou $$ pour les équations (ex: $$\\frac{a}{b}$$)
- Utiliser des analogies de la vie quotidienne haïtienne quand c'est pertinent
- Répondre aux questions libres de l'élève sur les concepts
- Si l'élève donne la BONNE réponse: Félicite brièvement (max 30 mots) et dis "Passons à la question suivante! 🎉"
- Si l'élève donne une MAUVAISE réponse: Explique l'erreur et donne la bonne réponse avec une explication claire (max 80 mots)

**Exercice actuel:**
Question: ${exercise.question_text}
${exercise.options && Array.isArray(exercise.options) && exercise.options.length > 0 
  ? `Options: ${exercise.options.map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}) ${opt}`).join(', ')}`
  : 'Type: Question ouverte (pas de choix multiples)'}
${exercise.correct_answer ? `Réponse correcte: ${exercise.correct_answer}` : 'Note: La réponse correcte n\'est pas définie dans la base de données. Guide l\'élève sans pouvoir valider automatiquement.'}
Concept: ${exercise.concept}`;

    // If reveal answer is requested, modify the prompt
    if (revealAnswer) {
      systemPrompt += `\n\n**ACTION REQUISE:** L'élève te demande de révéler la réponse. Tu dois:
1. Donner la bonne réponse (${exercise.correct_answer})
2. Expliquer clairement POURQUOI c'est la bonne réponse
3. Détailler le concept mathématique impliqué avec des exemples simples
4. Encourager l'élève à passer à la prochaine question

Donne une explication complète mais concise (maximum 150 mots).`;
    }

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.message_role === 'user' ? 'user' : 'assistant',
        content: msg.message_content
      })),
      { role: 'user', content: userMessage }
    ];

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const ericResponse = data.choices[0].message.content;

    // Check if student provided an answer to validate
    let isCorrect = false;
    let shouldAwardPoints = false;
    let shouldMoveToNext = false;

    if (studentAnswer && exercise.correct_answer) {
      // Null-safe comparison - only validate if we have a correct answer
      isCorrect = studentAnswer.toUpperCase() === exercise.correct_answer.toUpperCase();
      shouldAwardPoints = isCorrect;
      shouldMoveToNext = true; // Auto-move after answering (correct or incorrect)
    } else if (studentAnswer && !exercise.correct_answer) {
      // No correct answer in database - log and handle gracefully
      console.warn(`Exercise ${exercise.exercise_number} has no correct_answer defined`);
      shouldMoveToNext = true;
    }

    // Suggest YouTube videos for the concept
    const youtubeKeywords = {
      'divisibilité': 'divisibilité mathématiques 9ème',
      'puissances': 'puissances exposants mathématiques',
      'équations': 'résoudre équations premier degré',
      'géométrie': 'géométrie triangle rectangle',
      'fractions': 'fractions équivalentes simplification',
      'pourcentages': 'calcul pourcentages mathématiques',
      'nombres premiers': 'nombres premiers mathématiques',
      'statistiques': 'médiane statistiques mathématiques',
      'opérations': 'opérations nombres relatifs',
    };

    const youtubeQuery = youtubeKeywords[exercise.concept as keyof typeof youtubeKeywords] || `${exercise.concept} mathématiques 9ème`;

    return new Response(
      JSON.stringify({
        response: ericResponse,
        isCorrect,
        shouldAwardPoints,
        pointsEarned: shouldAwardPoints ? exercise.points : 0,
        shouldMoveToNext,
        youtubeQuery,
        explanation: isCorrect ? exercise.explanation : null,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in exam-tutor function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
