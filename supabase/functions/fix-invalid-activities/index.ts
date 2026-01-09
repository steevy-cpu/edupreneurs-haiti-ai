import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSecureHeaders, secureJsonResponse, secureErrorResponse, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Security: Input validation schema
const fixActivitiesSchema = z.object({
  lessonId: z.string().uuid().optional(),
  activities: z.array(z.any()).optional(),
  issues: z.array(z.object({
    activityIndex: z.number(),
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

interface ActivityIssue {
  activityIndex: number;
  issue: string;
  suggestedFix?: string;
}

// QUIZ type activity
interface QuizActivity {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  activityType: 'QUIZ';
}

// TRUE_FALSE type activity
interface TrueFalseActivity {
  statement: string;
  isTrue: boolean;
  explanation: string;
  activityType: 'TRUE_FALSE';
}

type ActivityToFix = QuizActivity | TrueFalseActivity;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    // Security: Validate input
    const rawInput = await req.json();
    const parseResult = fixActivitiesSchema.safeParse(rawInput);
    
    if (!parseResult.success) {
      console.error('Validation failed:', parseResult.error.errors);
      return secureErrorResponse('Invalid input', 400, parseResult.error.errors.map(e => e.message));
    }
    
    const { 
      lessonId, 
      activities, 
      issues, 
      parsingErrors,
      lessonTitle, 
      subject, 
      gradeLevel,
      originalContent,
      needsFullRegeneration 
    } = parseResult.data;

    console.log(`[fix-invalid-activities] Processing for lesson: ${lessonTitle}`);
    console.log(`[fix-invalid-activities] Activities: ${activities?.length || 0}, Issues: ${issues?.length || 0}, ParsingErrors: ${parsingErrors?.length || 0}`);
    console.log(`[fix-invalid-activities] Needs full regeneration: ${needsFullRegeneration}`);

    // Handle case where activities failed to parse - need full regeneration
    if (needsFullRegeneration) {
      console.log('[fix-invalid-activities] Starting full activity regeneration from scratch');
      return await handleFullRegeneration(
        lessonTitle || 'Unknown', 
        subject || 'Unknown', 
        gradeLevel || '7AF', 
        originalContent || '', 
        parsingErrors || []
      );
    }

    if (!activities || activities.length === 0) {
      return new Response(JSON.stringify({ error: 'No activities provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!issues || issues.length === 0) {
      return new Response(JSON.stringify({ 
        correctedActivities: activities,
        message: 'No issues to fix' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Separate activities by type for targeted fixing
    const quizActivities = activities.filter((a: any) => a.activityType === 'QUIZ' || !a.activityType);
    const trueFalseActivities = activities.filter((a: any) => a.activityType === 'TRUE_FALSE');

    // Build a detailed prompt for fixing each activity with issues
    const activitiesWithIssues = issues.map((issue: ActivityIssue) => {
      const activity = activities[issue.activityIndex];
      if (!activity) return null;
      
      return {
        index: issue.activityIndex,
        activity,
        issue: issue.issue,
        suggestedFix: issue.suggestedFix
      };
    }).filter(Boolean);

    const prompt = `Tu es un expert en pédagogie haïtienne. Tu dois corriger des activités interactives qui contiennent des erreurs.

CONTEXTE DE LA LEÇON:
- Titre: ${lessonTitle}
- Matière: ${subject}
- Niveau: ${gradeLevel}

ACTIVITÉS À CORRIGER:
${activitiesWithIssues.map((item: any, idx: number) => {
  if (item.activity.activityType === 'TRUE_FALSE') {
    return `
---
ACTIVITÉ ${item.index + 1} (TYPE: TRUE_FALSE):
Affirmation: ${item.activity.statement}
Réponse indiquée: ${item.activity.isTrue ? 'VRAI' : 'FAUX'}
Explication: ${item.activity.explanation}

PROBLÈME IDENTIFIÉ: ${item.issue}
${item.suggestedFix ? `SUGGESTION: ${item.suggestedFix}` : ''}
---`;
  } else {
    return `
---
ACTIVITÉ ${item.index + 1} (TYPE: QUIZ):
Question: ${item.activity.question}
Options:
A) ${item.activity.options[0]}
B) ${item.activity.options[1]}
C) ${item.activity.options[2]}
D) ${item.activity.options[3]}
Réponse indiquée: ${String.fromCharCode(65 + item.activity.correctAnswer)}
Explication: ${item.activity.explanation}

PROBLÈME IDENTIFIÉ: ${item.issue}
${item.suggestedFix ? `SUGGESTION: ${item.suggestedFix}` : ''}
---`;
  }
}).join('\n')}

INSTRUCTIONS IMPORTANTES:
1. Corrige UNIQUEMENT les problèmes identifiés
2. Pour les activités QUIZ: Si la réponse correcte est fausse, trouve la VRAIE bonne réponse et mets à jour le champ correctAnswer (0=A, 1=B, 2=C, 3=D)
3. Pour les activités TRUE_FALSE: Si la réponse est incorrecte, inverse le champ isTrue (true/false)
4. Assure-toi que l'explication correspond à la réponse correcte
5. **TRÈS IMPORTANT: Toutes les explications DOIVENT être en FRANÇAIS** (pas en anglais, pas en créole)
6. Garde le même format et style
7. Ne change pas les activités qui n'ont pas de problème
8. Vérifie que tes corrections sont factuellement correctes

Retourne les activités corrigées au format JSON suivant:
{
  "correctedActivities": [
    {
      "originalIndex": 0,
      "activityType": "QUIZ",
      "question": "La question corrigée",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 2,
      "explanation": "L'explication en français...",
      "wasFixed": true,
      "fixApplied": "Description de la correction"
    },
    {
      "originalIndex": 1,
      "activityType": "TRUE_FALSE",
      "statement": "L'affirmation corrigée",
      "isTrue": true,
      "explanation": "L'explication en français...",
      "wasFixed": true,
      "fixApplied": "Description de la correction"
    }
  ]
}`;

    console.log('[fix-invalid-activities] Calling Lovable AI for corrections...');

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
      console.error('[fix-invalid-activities] AI API error:', response.status, errorText);
      
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

    console.log('[fix-invalid-activities] AI response received, parsing...');

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
      console.error('[fix-invalid-activities] Failed to parse AI response:', aiContent);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate the response structure
    if (!parsedResponse.correctedActivities || !Array.isArray(parsedResponse.correctedActivities)) {
      throw new Error('Invalid response structure: missing correctedActivities array');
    }

    // Generate the new markdown content for the activities
    const newMarkdownContent = generateActivityMarkdown(
      activities, 
      parsedResponse.correctedActivities,
      originalContent
    );

    console.log('[fix-invalid-activities] Generated corrected content');

    return new Response(JSON.stringify({
      correctedActivities: parsedResponse.correctedActivities,
      newContent: newMarkdownContent,
      issuesFixed: parsedResponse.correctedActivities.filter((a: any) => a.wasFixed).length,
      message: 'Activities corrected successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[fix-invalid-activities] Error:', error);
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

  const prompt = `Tu es un expert en pédagogie haïtienne. Tu dois créer des activités interactives pour une leçon dont le format actuel est invalide.

CONTEXTE DE LA LEÇON:
- Titre: ${lessonTitle}
- Matière: ${subject}
- Niveau: ${gradeLevel}

CONTENU ORIGINAL (format invalide):
${originalContent?.substring(0, 2000) || 'Contenu non disponible'}

ERREURS DE FORMAT DÉTECTÉES:
${parsingErrors.map((e, i) => `${i + 1}. ${e}`).join('\n')}

INSTRUCTIONS:
1. Crée un mélange d'activités: 2-3 de type QUIZ et 2-3 de type TRUE_FALSE
2. Pour QUIZ: Chaque question doit avoir exactement 4 options (A, B, C, D) avec une seule réponse correcte
3. Pour TRUE_FALSE: Chaque affirmation doit être clairement vraie ou fausse, pas ambiguë
4. **TRÈS IMPORTANT: Toutes les explications DOIVENT être en FRANÇAIS** (pas en anglais, pas en créole)
5. Adapte le niveau aux élèves haïtiens de ${gradeLevel}
6. Les questions/affirmations doivent être factuellement correctes

Retourne les activités au format JSON:
{
  "correctedActivities": [
    {
      "originalIndex": 0,
      "activityType": "QUIZ",
      "question": "La question",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "L'explication détaillée en français...",
      "wasFixed": true,
      "fixApplied": "Activité régénérée à partir de zéro"
    },
    {
      "originalIndex": 1,
      "activityType": "TRUE_FALSE",
      "statement": "Une affirmation claire à évaluer comme vraie ou fausse",
      "isTrue": true,
      "explanation": "Explication détaillée en français de pourquoi c'est vrai/faux...",
      "wasFixed": true,
      "fixApplied": "Activité régénérée à partir de zéro"
    }
  ]
}`;

  console.log('[fix-invalid-activities] Calling Lovable AI for full regeneration...');

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
          content: 'Tu es un assistant pédagogique expert en création de contenu éducatif pour Haïti. Tu dois fournir des activités précises et factuellement correctes. Retourne UNIQUEMENT du JSON valide sans markdown.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[fix-invalid-activities] AI API error:', response.status, errorText);
    
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

  console.log('[fix-invalid-activities] AI response received for full regeneration, parsing...');

  let parsedResponse;
  try {
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedResponse = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('No JSON found in response');
    }
  } catch (parseError) {
    console.error('[fix-invalid-activities] Failed to parse AI response:', aiContent);
    throw new Error('Failed to parse AI response as JSON');
  }

  if (!parsedResponse.correctedActivities || !Array.isArray(parsedResponse.correctedActivities)) {
    throw new Error('Invalid response structure: missing correctedActivities array');
  }

  // Generate markdown from the new activities
  const newMarkdownContent = generateActivityMarkdownFromNew(parsedResponse.correctedActivities);

  console.log('[fix-invalid-activities] Generated new content with', parsedResponse.correctedActivities.length, 'activities');

  return new Response(JSON.stringify({
    correctedActivities: parsedResponse.correctedActivities,
    newContent: newMarkdownContent,
    issuesFixed: parsedResponse.correctedActivities.length,
    message: 'Activities regenerated successfully'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function generateActivityMarkdownFromNew(activities: any[]): string {
  let markdown = '## 🎮 Activités Interactives\n\n';
  
  // Separate by type
  const quizActivities = activities.filter(a => a.activityType === 'QUIZ' || !a.activityType);
  const trueFalseActivities = activities.filter(a => a.activityType === 'TRUE_FALSE');

  // Generate QUIZ section
  if (quizActivities.length > 0) {
    markdown += '**TYPE: QUIZ**\n\n';
    quizActivities.forEach((activity, idx) => {
      markdown += `**Question ${idx + 1}:**\n${activity.question}\n\n`;
      markdown += `A) ${activity.options[0]}\n`;
      markdown += `B) ${activity.options[1]}\n`;
      markdown += `C) ${activity.options[2]}\n`;
      markdown += `D) ${activity.options[3]}\n\n`;
      markdown += `**Réponse correcte: ${String.fromCharCode(65 + activity.correctAnswer)}**\n\n`;
      markdown += `**Explication:** ${activity.explanation}\n\n`;
      if (idx < quizActivities.length - 1) {
        markdown += '---\n\n';
      }
    });
  }

  // Generate TRUE_FALSE section
  if (trueFalseActivities.length > 0) {
    if (quizActivities.length > 0) {
      markdown += '\n---\n\n';
    }
    markdown += '**TYPE: TRUE_FALSE**\n\n';
    trueFalseActivities.forEach((activity, idx) => {
      markdown += `**Affirmation ${idx + 1}:**\n${activity.statement}\n\n`;
      markdown += `**Réponse: ${activity.isTrue ? 'VRAI' : 'FAUX'}**\n\n`;
      markdown += `**Explication:** ${activity.explanation}\n\n`;
      if (idx < trueFalseActivities.length - 1) {
        markdown += '---\n\n';
      }
    });
  }

  return markdown.trim();
}

function generateActivityMarkdown(
  originalActivities: any[], 
  correctedActivities: any[],
  originalContent?: string
): string {
  // Create a map of corrections by original index
  const correctionsMap = new Map();
  for (const corrected of correctedActivities) {
    if (corrected.wasFixed && corrected.originalIndex !== undefined) {
      correctionsMap.set(corrected.originalIndex, corrected);
    }
  }

  // Merge original activities with corrections
  const mergedActivities = originalActivities.map((activity, idx) => {
    const correction = correctionsMap.get(idx);
    if (correction) {
      return { ...correction, activityType: correction.activityType || activity.activityType || 'QUIZ' };
    }
    return { ...activity, activityType: activity.activityType || 'QUIZ' };
  });

  // Separate by type
  const quizActivities = mergedActivities.filter(a => a.activityType === 'QUIZ');
  const trueFalseActivities = mergedActivities.filter(a => a.activityType === 'TRUE_FALSE');

  let markdown = '## 🎮 Activités Interactives\n\n';

  // Generate QUIZ section
  if (quizActivities.length > 0) {
    markdown += '**TYPE: QUIZ**\n\n';
    quizActivities.forEach((activity, idx) => {
      const wasFixed = correctionsMap.has(originalActivities.indexOf(activity)) || activity.wasFixed;
      
      markdown += `**Question ${idx + 1}:**\n${activity.question}\n\n`;
      markdown += `A) ${activity.options[0]}\n`;
      markdown += `B) ${activity.options[1]}\n`;
      markdown += `C) ${activity.options[2]}\n`;
      markdown += `D) ${activity.options[3]}\n\n`;
      markdown += `**Réponse correcte: ${String.fromCharCode(65 + activity.correctAnswer)}**\n\n`;
      markdown += `**Explication:** ${activity.explanation}\n\n`;

      if (wasFixed && activity.fixApplied) {
        markdown += `<!-- Correction appliquée: ${activity.fixApplied} -->\n`;
      }

      if (idx < quizActivities.length - 1) {
        markdown += '---\n\n';
      }
    });
  }

  // Generate TRUE_FALSE section
  if (trueFalseActivities.length > 0) {
    if (quizActivities.length > 0) {
      markdown += '\n---\n\n';
    }
    markdown += '**TYPE: TRUE_FALSE**\n\n';
    trueFalseActivities.forEach((activity, idx) => {
      const wasFixed = correctionsMap.has(originalActivities.indexOf(activity)) || activity.wasFixed;
      
      markdown += `**Affirmation ${idx + 1}:**\n${activity.statement}\n\n`;
      markdown += `**Réponse: ${activity.isTrue ? 'VRAI' : 'FAUX'}**\n\n`;
      markdown += `**Explication:** ${activity.explanation}\n\n`;

      if (wasFixed && activity.fixApplied) {
        markdown += `<!-- Correction appliquée: ${activity.fixApplied} -->\n`;
      }

      if (idx < trueFalseActivities.length - 1) {
        markdown += '---\n\n';
      }
    });
  }

  return markdown.trim();
}
