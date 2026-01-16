import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuestionRequest {
  subject: string;
  gradeLevel: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lessonContext?: { title: string; content?: string; objective?: string }[];
  questionCount?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, gradeLevel, difficulty, lessonContext, questionCount = 10 }: QuestionRequest = await req.json();

    const difficultyGuide = {
      easy: "Questions simples avec des concepts de base. Réponses évidentes pour qui a lu le cours.",
      medium: "Questions qui demandent une bonne compréhension. Certaines réponses peuvent sembler similaires.",
      hard: "Questions complexes nécessitant une maîtrise du sujet. Pièges subtils dans les options."
    };

    const lessonInfo = lessonContext && lessonContext.length > 0
      ? lessonContext.map(l => `- ${l.title}: ${l.objective || ''} ${l.content?.substring(0, 300) || ''}`).join('\n')
      : "Utilise le programme scolaire haïtien standard pour ce niveau.";

    const prompt = `Tu es un expert en éducation haïtienne. Génère ${questionCount} questions de quiz pour des élèves de niveau ${gradeLevel} en ${subject}.

CONTEXTE DES LEÇONS:
${lessonInfo}

DIFFICULTÉ: ${difficulty.toUpperCase()}
${difficultyGuide[difficulty]}

RÈGLES IMPORTANTES:
1. Questions en français clair et adapté au niveau ${gradeLevel}
2. Chaque question doit avoir EXACTEMENT 4 options de réponse
3. Une seule réponse correcte par question
4. Les options incorrectes doivent être plausibles mais clairement fausses
5. Inclure une explication pédagogique courte pour chaque réponse
6. Varier les types de questions (définitions, applications, calculs, analyse)
7. Adapter le vocabulaire au contexte haïtien quand pertinent
8. Pour les maths: inclure des calculs adaptés au niveau
9. Chaque question doit tester un concept spécifique

GÉNÈRE EXACTEMENT ${questionCount} questions au format JSON suivant:
{
  "questions": [
    {
      "question": "Texte de la question?",
      "type": "qcm",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Explication courte de la bonne réponse",
      "concept": "Nom du concept testé"
    }
  ]
}

IMPORTANT: correct_answer est l'INDEX (0-3) de la bonne réponse dans le tableau options.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://edupreneurs-haiti-ai.lovable.app',
        'X-Title': 'Edupreneurs Quiz Battle',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Tu es un générateur de quiz éducatif. Réponds UNIQUEMENT avec du JSON valide, sans texte avant ou après.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Parse JSON from response
    let questions;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse questions:', content);
      // Return fallback questions
      questions = {
        questions: generateFallbackQuestions(subject, gradeLevel, questionCount)
      };
    }

    // Validate and clean questions
    if (questions.questions && Array.isArray(questions.questions)) {
      questions.questions = questions.questions.map((q: any, index: number) => ({
        question: q.question || `Question ${index + 1}`,
        type: q.type || 'qcm',
        options: Array.isArray(q.options) && q.options.length === 4 
          ? q.options 
          : ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answer: typeof q.correct_answer === 'number' && q.correct_answer >= 0 && q.correct_answer <= 3
          ? q.correct_answer
          : 0,
        explanation: q.explanation || 'Bonne réponse!',
        concept: q.concept || subject,
      }));
    }

    return new Response(JSON.stringify(questions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate questions',
        questions: generateFallbackQuestions('Général', '9AF', 10)
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateFallbackQuestions(subject: string, gradeLevel: string, count: number) {
  const fallbackQuestions = [
    {
      question: "Quelle est la capitale d'Haïti?",
      type: "qcm",
      options: ["Port-au-Prince", "Cap-Haïtien", "Gonaïves", "Jacmel"],
      correct_answer: 0,
      explanation: "Port-au-Prince est la capitale et la plus grande ville d'Haïti.",
      concept: "Géographie d'Haïti"
    },
    {
      question: "Combien font 15 × 8?",
      type: "qcm",
      options: ["100", "120", "115", "130"],
      correct_answer: 1,
      explanation: "15 × 8 = 120. On peut calculer: 15 × 8 = (10 × 8) + (5 × 8) = 80 + 40 = 120",
      concept: "Multiplication"
    },
    {
      question: "Quel est le synonyme de 'content'?",
      type: "qcm",
      options: ["Triste", "Heureux", "Fâché", "Fatigué"],
      correct_answer: 1,
      explanation: "Content et heureux sont des synonymes qui expriment la joie.",
      concept: "Vocabulaire français"
    },
    {
      question: "En quelle année Haïti a obtenu son indépendance?",
      type: "qcm",
      options: ["1791", "1804", "1810", "1825"],
      correct_answer: 1,
      explanation: "Haïti a proclamé son indépendance le 1er janvier 1804, devenant la première république noire libre.",
      concept: "Histoire d'Haïti"
    },
    {
      question: "Quelle est la formule de l'aire d'un rectangle?",
      type: "qcm",
      options: ["L + l", "L × l", "2L + 2l", "L ÷ l"],
      correct_answer: 1,
      explanation: "L'aire d'un rectangle = Longueur × largeur",
      concept: "Géométrie"
    },
    {
      question: "Quel est le plus grand océan du monde?",
      type: "qcm",
      options: ["Atlantique", "Indien", "Pacifique", "Arctique"],
      correct_answer: 2,
      explanation: "L'océan Pacifique est le plus grand océan, couvrant environ un tiers de la surface de la Terre.",
      concept: "Géographie mondiale"
    },
    {
      question: "Comment s'appelle le processus par lequel les plantes fabriquent leur nourriture?",
      type: "qcm",
      options: ["Respiration", "Photosynthèse", "Digestion", "Transpiration"],
      correct_answer: 1,
      explanation: "La photosynthèse permet aux plantes de transformer la lumière en énergie.",
      concept: "Biologie végétale"
    },
    {
      question: "Quel est le résultat de 3² + 4²?",
      type: "qcm",
      options: ["7", "12", "25", "49"],
      correct_answer: 2,
      explanation: "3² + 4² = 9 + 16 = 25. C'est aussi le théorème de Pythagore (3-4-5).",
      concept: "Puissances"
    },
    {
      question: "Qui est le père de la patrie haïtienne?",
      type: "qcm",
      options: ["Toussaint Louverture", "Jean-Jacques Dessalines", "Henri Christophe", "Alexandre Pétion"],
      correct_answer: 1,
      explanation: "Jean-Jacques Dessalines est considéré comme le père de la patrie pour avoir proclamé l'indépendance.",
      concept: "Histoire d'Haïti"
    },
    {
      question: "Quel type de mot est 'rapidement'?",
      type: "qcm",
      options: ["Nom", "Verbe", "Adjectif", "Adverbe"],
      correct_answer: 3,
      explanation: "Les mots en '-ment' sont généralement des adverbes qui modifient un verbe.",
      concept: "Grammaire française"
    }
  ];

  return fallbackQuestions.slice(0, count);
}
