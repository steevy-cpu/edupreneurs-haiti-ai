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
    const { lessonTitle, contenu, exemplesExercices, gradeLevel, subject } = await req.json();

    console.log('📝 Generating Quiz Final for:', lessonTitle);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const combinedContent = `${contenu || ''}\n\n${exemplesExercices || ''}`.trim();

    const systemPrompt = `Tu es un expert en création de quiz éducatifs. Tu dois générer un quiz final de 10-15 questions à choix multiples basé sur le contenu de la leçon fournie.

RÈGLES STRICTES:
1. Générer EXACTEMENT 10-15 questions
2. Chaque question doit avoir 4 options (A, B, C, D)
3. Les questions doivent couvrir TOUT le contenu de la leçon
4. Varier les niveaux de difficulté (facile, moyen, difficile)
5. Tester la COMPRÉHENSION, pas juste la mémorisation
6. Chaque question doit inclure une explication détaillée

FORMAT EXACT (HTML):
<div class="quiz-container">
  <div class="quiz-question" data-number="1">
    <h3>Question 1</h3>
    <p>Texte de la question ici</p>
    <div class="quiz-options">
      <div class="option" data-answer="A">A) Première option</div>
      <div class="option" data-answer="B">B) Deuxième option</div>
      <div class="option" data-answer="C">C) Troisième option</div>
      <div class="option" data-answer="D">D) Quatrième option</div>
    </div>
    <div class="correct-answer" data-correct="A">
      <p><strong>Réponse correcte: A</strong></p>
      <p>Explication détaillée de pourquoi cette réponse est correcte...</p>
    </div>
  </div>
  
  <!-- Répéter pour toutes les questions -->
</div>

IMPORTANT:
- NE PAS utiliser de classes Tailwind
- NE PAS utiliser d'emojis
- Générer le HTML directement sans balises markdown
- S'assurer que l'attribut data-correct correspond exactement à une des options (A, B, C, ou D)`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Génère un quiz final pour cette leçon:

Titre: ${lessonTitle}
Niveau: ${gradeLevel}
Matière: ${subject}

Contenu de la leçon:
${combinedContent}`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const quizContent = data.choices[0].message.content;

    console.log('✅ Quiz Final generated successfully');

    return new Response(
      JSON.stringify({ quizContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-quiz-final function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
