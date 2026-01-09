import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSecureHeaders, secureJsonResponse, secureErrorResponse, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Security: Input validation schema
const fixQuizSchema = z.object({
  lessonId: z.string().uuid().optional(),
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.number(),
    explanation: z.string(),
  })).optional(),
  issues: z.array(z.object({
    questionIndex: z.number(),
    issue: z.string(),
    suggestedFix: z.string().optional(),
  })).optional(),
  parsingErrors: z.array(z.string()).optional(),
  lessonTitle: z.string().max(500).optional(),
  subject: z.string().max(200).optional(),
  gradeLevel: z.string().max(10).optional(),
  originalContent: z.string().max(100000).optional(),
  needsFullRegeneration: z.boolean().optional(),
}).strict();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuizIssue {
  questionIndex: number;
  issue: string;
  suggestedFix?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    // Security: Validate input
    const rawInput = await req.json();
    const parseResult = fixQuizSchema.safeParse(rawInput);
    
    if (!parseResult.success) {
      console.error('Validation failed:', parseResult.error.errors);
      return secureErrorResponse('Invalid input', 400, parseResult.error.errors.map(e => e.message));
    }
    
    const { 
      lessonId, 
      questions, 
      issues, 
      parsingErrors,
      lessonTitle, 
      subject, 
      gradeLevel,
      originalContent,
      needsFullRegeneration 
    } = parseResult.data;

    console.log(`[fix-invalid-quiz] Processing for lesson: ${lessonTitle}`);
    console.log(`[fix-invalid-quiz] Questions: ${questions?.length || 0}, Issues: ${issues?.length || 0}, ParsingErrors: ${parsingErrors?.length || 0}`);
    console.log(`[fix-invalid-quiz] Needs full regeneration: ${needsFullRegeneration}`);

    // Handle case where quiz failed to parse - need full regeneration
    if (needsFullRegeneration) {
      console.log('[fix-invalid-quiz] Starting full quiz regeneration from scratch');
      return await handleFullRegeneration(
        lessonTitle || 'Unknown', 
        subject || 'Unknown', 
        gradeLevel || '7AF', 
        originalContent || '', 
        parsingErrors || []
      );
    }

    if (!questions || questions.length === 0) {
      return new Response(JSON.stringify({ error: 'No questions provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!issues || issues.length === 0) {
      return new Response(JSON.stringify({ 
        correctedQuestions: questions,
        message: 'No issues to fix' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build a detailed prompt for fixing each question with issues
    const questionsWithIssues = issues.map((issue: QuizIssue) => {
      const question = questions[issue.questionIndex];
      if (!question) return null;
      
      return {
        index: issue.questionIndex,
        question,
        issue: issue.issue,
        suggestedFix: issue.suggestedFix
      };
    }).filter(Boolean);

    const prompt = `Tu es un expert en pédagogie haïtienne. Tu dois corriger des questions de quiz qui contiennent des erreurs.

CONTEXTE DE LA LEÇON:
- Titre: ${lessonTitle}
- Matière: ${subject}
- Niveau: ${gradeLevel}

QUESTIONS À CORRIGER:
${questionsWithIssues.map((item: any) => `
---
QUESTION ${item.index + 1}:
Question: ${item.question.question}
Options:
A) ${item.question.options[0]}
B) ${item.question.options[1]}
C) ${item.question.options[2]}
D) ${item.question.options[3]}
Réponse indiquée: ${String.fromCharCode(65 + item.question.correctAnswer)}
Explication: ${item.question.explanation}

PROBLÈME IDENTIFIÉ: ${item.issue}
${item.suggestedFix ? `SUGGESTION: ${item.suggestedFix}` : ''}
---`).join('\n')}

INSTRUCTIONS IMPORTANTES:
1. Corrige UNIQUEMENT les problèmes identifiés
2. Si la réponse correcte est fausse, trouve la VRAIE bonne réponse et mets à jour le champ correctAnswer (0=A, 1=B, 2=C, 3=D)
3. Assure-toi que l'explication correspond à la réponse correcte
4. **TRÈS IMPORTANT: Toutes les explications DOIVENT être en FRANÇAIS** (pas en anglais, pas en créole)
5. Garde le même format et style de question
6. Ne change pas les questions qui n'ont pas de problème
7. Vérifie que tes corrections sont factuellement correctes

Retourne les questions corrigées au format JSON suivant:
{
  "correctedQuestions": [
    {
      "originalIndex": 0,
      "question": "La question corrigée",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 2,
      "explanation": "L'explication en français...",
      "wasFixed": true,
      "fixApplied": "Description de la correction"
    }
  ]
}`;

    console.log('[fix-invalid-quiz] Calling Lovable AI for corrections...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant pédagogique expert en correction de contenu éducatif pour Haïti. Tu dois fournir des réponses précises et factuellement correctes. Retourne UNIQUEMENT du JSON valide sans markdown.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[fix-invalid-quiz] AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No content from AI');
    }

    console.log('[fix-invalid-quiz] AI response received, parsing...');

    // Parse the JSON response
    let parsedResponse;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('[fix-invalid-quiz] Failed to parse AI response:', aiContent);
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!parsedResponse.correctedQuestions || !Array.isArray(parsedResponse.correctedQuestions)) {
      throw new Error('Invalid response structure: missing correctedQuestions array');
    }

    // Generate the new markdown content for the quiz
    const newMarkdownContent = generateQuizMarkdown(
      questions, 
      parsedResponse.correctedQuestions
    );

    console.log('[fix-invalid-quiz] Generated corrected content');

    return new Response(JSON.stringify({
      correctedQuestions: parsedResponse.correctedQuestions,
      newContent: newMarkdownContent,
      issuesFixed: parsedResponse.correctedQuestions.filter((q: any) => q.wasFixed).length,
      message: 'Quiz questions corrected successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[fix-invalid-quiz] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleFullRegeneration(
  lessonTitle: string,
  subject: string,
  gradeLevel: string,
  originalContent: string,
  parsingErrors: string[]
): Promise<Response> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY is not configured');
  }

  const prompt = `Tu es un expert en pédagogie haïtienne. Tu dois créer des questions de quiz pour une leçon dont le format actuel est invalide.

CONTEXTE DE LA LEÇON:
- Titre: ${lessonTitle}
- Matière: ${subject}
- Niveau: ${gradeLevel}

CONTENU ORIGINAL (format invalide):
${originalContent?.substring(0, 2000) || 'Contenu non disponible'}

ERREURS DE FORMAT DÉTECTÉES:
${parsingErrors.map((e, i) => `${i + 1}. ${e}`).join('\n')}

INSTRUCTIONS:
1. Crée 5-10 questions de quiz basées sur le sujet de la leçon
2. Chaque question doit avoir exactement 4 options (A, B, C, D)
3. Une seule réponse correcte par question
4. **TRÈS IMPORTANT: Toutes les explications DOIVENT être en FRANÇAIS** (pas en anglais, pas en créole)
5. Adapte le niveau aux élèves haïtiens de ${gradeLevel}
6. Les questions doivent être factuellement correctes
7. Varie les types de questions (définitions, applications, exemples)

Retourne les questions au format JSON:
{
  "correctedQuestions": [
    {
      "originalIndex": 0,
      "question": "La question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "L'explication détaillée en français...",
      "wasFixed": true,
      "fixApplied": "Question régénérée à partir de zéro"
    }
  ]
}`;

  console.log('[fix-invalid-quiz] Calling Lovable AI for full regeneration...');

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant pédagogique expert en création de contenu éducatif pour Haïti. Tu dois fournir des questions de quiz précises et factuellement correctes. Retourne UNIQUEMENT du JSON valide sans markdown.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[fix-invalid-quiz] AI API error:', response.status, errorText);
    
    if (response.status === 429) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: 'Payment required. Please add credits.' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    throw new Error(`AI API error: ${response.status}`);
  }

  const aiData = await response.json();
  const aiContent = aiData.choices?.[0]?.message?.content;

  if (!aiContent) {
    throw new Error('No content from AI');
  }

  console.log('[fix-invalid-quiz] AI response received for full regeneration, parsing...');

  let parsedResponse;
  try {
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedResponse = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (parseError) {
    console.error('[fix-invalid-quiz] Failed to parse AI response:', aiContent);
    throw new Error('Failed to parse AI response as JSON');
  }

  if (!parsedResponse.correctedQuestions || !Array.isArray(parsedResponse.correctedQuestions)) {
    throw new Error('Invalid response structure: missing correctedQuestions array');
  }

  // Generate markdown from the new questions
  const newMarkdownContent = generateQuizMarkdownFromNew(parsedResponse.correctedQuestions);

  console.log('[fix-invalid-quiz] Generated new content with', parsedResponse.correctedQuestions.length, 'questions');

  return new Response(JSON.stringify({
    correctedQuestions: parsedResponse.correctedQuestions,
    newContent: newMarkdownContent,
    issuesFixed: parsedResponse.correctedQuestions.length,
    message: 'Quiz questions regenerated successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function generateQuizMarkdownFromNew(questions: any[]): string {
  let markdown = '## ✅ Quiz Final\n\n';

  questions.forEach((question, idx) => {
    markdown += `### Question ${idx + 1}\n\n`;
    markdown += `${question.question}\n\n`;
    markdown += `A) ${question.options[0]}\n`;
    markdown += `B) ${question.options[1]}\n`;
    markdown += `C) ${question.options[2]}\n`;
    markdown += `D) ${question.options[3]}\n\n`;
    markdown += `### Réponse correcte: ${String.fromCharCode(65 + question.correctAnswer)}\n\n`;
    markdown += `### Explication\n\n${question.explanation}\n\n`;
    if (idx < questions.length - 1) {
      markdown += '---\n\n';
    }
  });

  return markdown.trim();
}

function generateQuizMarkdown(
  originalQuestions: QuizQuestion[], 
  correctedQuestions: any[]
): string {
  // Create a map of corrections by original index
  const correctionsMap = new Map();
  for (const corrected of correctedQuestions) {
    if (corrected.wasFixed && corrected.originalIndex !== undefined) {
      correctionsMap.set(corrected.originalIndex, corrected);
    }
  }

  let markdown = '## ✅ Quiz Final\n\n';

  originalQuestions.forEach((question, idx) => {
    const correction = correctionsMap.get(idx);
    const current = correction || question;

    markdown += `### Question ${idx + 1}\n\n`;
    markdown += `${current.question}\n\n`;
    markdown += `A) ${current.options[0]}\n`;
    markdown += `B) ${current.options[1]}\n`;
    markdown += `C) ${current.options[2]}\n`;
    markdown += `D) ${current.options[3]}\n\n`;
    markdown += `### Réponse correcte: ${String.fromCharCode(65 + current.correctAnswer)}\n\n`;
    markdown += `### Explication\n\n${current.explanation}\n\n`;

    if (correction && correction.fixApplied) {
      markdown += `<!-- Correction appliquée: ${correction.fixApplied} -->\n`;
    }

    if (idx < originalQuestions.length - 1) {
      markdown += '---\n\n';
    }
  });

  return markdown.trim();
}
