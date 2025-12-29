import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActivityIssue {
  activityIndex: number;
  issue: string;
  suggestedFix?: string;
}

interface ActivityToFix {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  activityType?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      lessonId, 
      activities, 
      issues, 
      lessonTitle, 
      subject, 
      gradeLevel,
      originalContent 
    } = await req.json();

    console.log(`[fix-invalid-activities] Processing ${activities?.length || 0} activities for lesson: ${lessonTitle}`);
    console.log(`[fix-invalid-activities] Issues to fix: ${issues?.length || 0}`);

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
${activitiesWithIssues.map((item: any, idx: number) => `
---
ACTIVITÉ ${item.index + 1}:
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
---`).join('\n')}

INSTRUCTIONS IMPORTANTES:
1. Corrige UNIQUEMENT les problèmes identifiés
2. Si la réponse correcte est fausse, trouve la VRAIE bonne réponse et mets à jour le champ correctAnswer (0=A, 1=B, 2=C, 3=D)
3. Assure-toi que l'explication correspond à la réponse correcte
4. Garde le même format et style de question
5. Ne change pas les questions qui n'ont pas de problème
6. Vérifie que tes corrections sont factuellement correctes

Retourne les activités corrigées au format JSON suivant:
{
  "correctedActivities": [
    {
      "originalIndex": 0,
      "question": "La question corrigée",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 2,
      "explanation": "L'explication corrigée...",
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
      // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
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
    let newMarkdownContent = generateActivityMarkdown(
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

function generateActivityMarkdown(
  originalActivities: ActivityToFix[], 
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

  // Generate new markdown content
  let markdown = '## 🎮 Activités Interactives\n\n';

  originalActivities.forEach((activity, idx) => {
    const correction = correctionsMap.get(idx);
    const current = correction || activity;

    markdown += `**TYPE: QUIZ**\n\n`;
    markdown += `**Question ${idx + 1}:**\n${current.question}\n\n`;
    markdown += `A) ${current.options[0]}\n`;
    markdown += `B) ${current.options[1]}\n`;
    markdown += `C) ${current.options[2]}\n`;
    markdown += `D) ${current.options[3]}\n\n`;
    markdown += `**Réponse correcte: ${String.fromCharCode(65 + current.correctAnswer)}**\n\n`;
    markdown += `**Explication:** ${current.explanation}\n\n`;

    if (correction && correction.fixApplied) {
      markdown += `<!-- Correction appliquée: ${correction.fixApplied} -->\n\n`;
    }

    markdown += '---\n\n';
  });

  return markdown.trim();
}
