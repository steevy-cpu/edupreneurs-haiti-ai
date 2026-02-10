
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
    const { pageImages, subjectName, gradeLevel, existingLessons } = await req.json();

    if (!pageImages || !Array.isArray(pageImages) || pageImages.length === 0) {
      throw new Error('pageImages array is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Analyzing curriculum PDF for ${subjectName} (${gradeLevel}) with ${pageImages.length} pages`);
    console.log(`Existing lessons to compare: ${existingLessons?.length || 0}`);

    const systemPrompt = `Tu es un expert en analyse de programmes scolaires haïtiens. Analyse ce document PDF de programme éducatif de façon EXHAUSTIVE.

MATIÈRE: ${subjectName}
NIVEAU: ${gradeLevel}

INSTRUCTIONS:
1. Identifie TOUS les chapitres, leçons, thèmes du document
2. Compare avec les leçons existantes: ${JSON.stringify(existingLessons || [])}
3. Identifie ce qui est couvert, manquant, ou partiellement couvert

Sois EXHAUSTIF - examine chaque page minutieusement.`;

    // Prepare image content
    const imageContent = pageImages.map((base64Image: string) => ({
      type: "image_url",
      image_url: {
        url: base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}`
      }
    }));

    // Use tool calling for reliable structured output
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: [
              { type: 'text', text: 'Analyse ce document de programme scolaire et utilise la fonction analyze_curriculum pour retourner les résultats.' },
              ...imageContent
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_curriculum",
              description: "Retourne l'analyse complète du curriculum avec les topics couverts, manquants et partiellement couverts",
              parameters: {
                type: "object",
                properties: {
                  documentTitle: { type: "string", description: "Titre du document analysé" },
                  chapters: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        topics: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              description: { type: "string" },
                              objectives: { type: "array", items: { type: "string" } },
                              keyNotions: { type: "array", items: { type: "string" } }
                            },
                            required: ["name", "description"]
                          }
                        }
                      },
                      required: ["name", "topics"]
                    }
                  },
                  coveredTopics: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        pdfTopic: { type: "string" },
                        matchedLesson: { type: "string" },
                        matchConfidence: { type: "string", enum: ["exact", "partial"] }
                      },
                      required: ["pdfTopic", "matchedLesson", "matchConfidence"]
                    }
                  },
                  missingTopics: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        chapter: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                        suggestedLessonTitle: { type: "string" },
                        description: { type: "string" }
                      },
                      required: ["name", "chapter", "priority", "suggestedLessonTitle", "description"]
                    }
                  },
                  partiallyCoovered: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        pdfTopic: { type: "string" },
                        existingLesson: { type: "string" },
                        missingAspects: { type: "array", items: { type: "string" } }
                      },
                      required: ["pdfTopic", "existingLesson", "missingAspects"]
                    }
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["documentTitle", "chapters", "coveredTopics", "missingTopics", "partiallyCoovered", "recommendations"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_curriculum" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Crédits AI insuffisants. Veuillez recharger votre compte.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'analyze_curriculum') {
      console.error('No valid tool call in response');
      throw new Error('AI did not return structured analysis');
    }

    let result;
    try {
      result = JSON.parse(toolCall.function.arguments);
    } catch (parseError) {
      console.error('Failed to parse tool arguments:', parseError);
      console.error('Arguments:', toolCall.function.arguments?.substring(0, 500));
      throw new Error('Failed to parse AI analysis');
    }

    // Ensure all fields exist
    result.gradeLevel = gradeLevel;
    result.subject = subjectName;
    result.coveredTopics = result.coveredTopics || [];
    result.missingTopics = result.missingTopics || [];
    result.partiallyCoovered = result.partiallyCoovered || [];
    result.recommendations = result.recommendations || [];
    result.chapters = result.chapters || [];

    // Calculate statistics
    const totalTopics = result.chapters.reduce((acc: number, ch: any) => acc + (ch.topics?.length || 0), 0);
    result.statistics = {
      totalTopicsInPDF: totalTopics,
      coveredCount: result.coveredTopics.length,
      missingCount: result.missingTopics.length,
      partialCount: result.partiallyCoovered.length,
      coveragePercentage: totalTopics > 0 
        ? Math.round(((result.coveredTopics.length + result.partiallyCoovered.length * 0.5) / totalTopics) * 100)
        : 0
    };

    console.log('Analysis complete:', result.statistics);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-curriculum-pdf:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
