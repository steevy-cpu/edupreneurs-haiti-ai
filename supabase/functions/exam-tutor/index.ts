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
      studentAnswer 
    } = await req.json();

    console.log('Exam tutor request:', { exercise: exercise?.exercise_number, userMessage });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build system prompt for Eric as exam tutor
    const systemPrompt = `Tu es Eric, un tuteur pédagogique haïtien qui aide les élèves de 9ème année fondamentale à préparer leur examen officiel de mathématiques.

**Ton rôle:**
- Guider l'élève à travers chaque exercice sans donner directement la réponse
- Expliquer les concepts mathématiques avec des termes simples et des exemples concrets
- Donner des indices progressifs quand l'élève est bloqué
- Féliciter les efforts et encourager la persévérance
- Corriger les erreurs avec bienveillance en expliquant pourquoi

**Règles importantes:**
- Ne JAMAIS révéler la réponse correcte directement
- Utiliser des analogies de la vie quotidienne haïtienne quand c'est pertinent
- Poser des questions guidées pour amener l'élève à réfléchir
- Valider les bonnes réponses avec enthousiasme
- Si l'élève donne une mauvaise réponse, expliquer l'erreur et rediriger vers la bonne approche

    **Exercice actuel:**
Question: ${exercise.question_text}
Options: ${(Array.isArray(exercise.options) ? exercise.options : []).map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}) ${opt}`).join(', ')}
Concept: ${exercise.concept}`;

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

    if (studentAnswer) {
      isCorrect = studentAnswer.toUpperCase() === exercise.correct_answer.toUpperCase();
      shouldAwardPoints = isCorrect;
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
