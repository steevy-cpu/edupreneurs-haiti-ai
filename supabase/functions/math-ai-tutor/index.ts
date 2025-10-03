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
    const { message, lessonType, chatHistory } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Build system prompt based on lesson type
    let systemPrompt = `Tu es un tuteur de mathématiques expert pour les élèves de Terminale en Haïti. 
Tu expliques les concepts mathématiques de manière claire et simple, en français et en créole haïtien selon les besoins de l'élève.
Tu utilises des exemples concrets et tu t'assures que l'élève comprend avant de passer au concept suivant.`;

    if (lessonType === 'lesson') {
      systemPrompt += `\n\nTu es en mode leçon. Présente le chapitre de manière structurée et pédagogique.`;
    } else if (lessonType === 'exercise') {
      systemPrompt += `\n\nTu es en mode exercice. Propose des exercices et guide l'élève dans leur résolution.`;
    } else if (lessonType === 'quiz') {
      systemPrompt += `\n\nTu es en mode quiz. Pose des questions pour vérifier la compréhension de l'élève.`;
    }

    // Prepare messages for Gemini
    const messages = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      ...(chatHistory || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Désolé, je n\'ai pas pu générer une réponse.';

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in math-ai-tutor function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
