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
    console.log("Received request:", req.method, req.url);
    
    const url = new URL(req.url);
    const lessonTitle = url.searchParams.get("lessonTitle");
    const lessonNumber = url.searchParams.get("lessonNumber");
    const subject = url.searchParams.get("subject");
    const grade = url.searchParams.get("grade");
    const targetWords = url.searchParams.get("targetWords");

    console.log("Parameters:", { lessonTitle, lessonNumber, subject, grade, targetWords });

    if (!lessonTitle || !lessonNumber || !subject || !grade || !targetWords) {
      console.error("Missing parameters");
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log("Calling AI Gateway...");

    const systemPrompt = `Tu es un expert pédagogique haïtien créant du contenu éducatif pour des élèves de ${grade}e année en ${subject}. 
Génère un contenu riche et détaillé d'environ ${targetWords} mots pour la leçon "${lessonTitle}".

Le contenu doit être structuré en 3 sections:
1. introduction: Une introduction engageante qui capte l'attention des élèves
2. contenu: Le contenu principal détaillé de la leçon avec des exemples haïtiens pertinents
3. exemplesExercices: Des exercices variés et progressifs avec des exemples pratiques`;

    const userPrompt = `Génère le contenu pour la leçon ${lessonNumber}: "${lessonTitle}" en ${subject} pour la ${grade}e année.
Objectif: environ ${targetWords} mots au total.
Contexte haïtien obligatoire avec des exemples locaux pertinents.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_lesson_content",
              description: "Generate structured lesson content",
              parameters: {
                type: "object",
                properties: {
                  introduction: {
                    type: "string",
                    description: "Engaging introduction for the lesson"
                  },
                  contenu: {
                    type: "string",
                    description: "Detailed main content of the lesson"
                  },
                  exemplesExercices: {
                    type: "string",
                    description: "Varied exercises and examples"
                  }
                },
                required: ["introduction", "contenu", "exemplesExercices"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_lesson_content" } }
      }),
    });

    console.log("AI Gateway response status:", aiResponse.status);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { 
            status: 429, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable AI workspace." }),
          { 
            status: 402, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI Gateway error", details: errorText }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await aiResponse.json();
    console.log("AI Response received, parsing...");

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ 
          error: "No valid content generated", 
          details: "Tool call not found in AI response" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const generatedContent = JSON.parse(toolCall.function.arguments);
    console.log("Content generated successfully");
    
    return new Response(
      JSON.stringify(generatedContent),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error("Error in generate-lesson-content:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
