import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSecureHeaders, secureJsonResponse, secureErrorResponse, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Security: Input validation schema
const generateQuizSchema = z.object({
  lessonTitle: z.string().min(1).max(500),
  contenu: z.string().max(50000).optional(),
  exemplesExercices: z.string().max(50000).optional(),
  gradeLevel: z.string().max(10).optional(),
  subject: z.string().max(200).optional(),
}).strict();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    // Security: Validate input
    const rawInput = await req.json();
    const parseResult = generateQuizSchema.safeParse(rawInput);
    
    if (!parseResult.success) {
      console.error('Validation failed:', parseResult.error.errors);
      return secureErrorResponse('Invalid input', 400, parseResult.error.errors.map(e => e.message));
    }
    
    const { lessonTitle, contenu, exemplesExercices, gradeLevel, subject } = parseResult.data;

    console.log('📝 Generating Quiz Final for:', lessonTitle);
    console.log('📋 Request params:', { 
      lessonTitle, 
      gradeLevel, 
      subject,
      contenuLength: contenu?.length,
      exercicesLength: exemplesExercices?.length
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Detect if this is a Creole lesson
    const subjectNormalized = (subject || '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const isCreoleLesson = subjectNormalized === 'kreyol ayisyen' || 
                           subjectNormalized === 'creole haitien' || 
                           subjectNormalized === 'kreyol' ||
                           subjectNormalized === 'creole';
    
    console.log('🔍 Creole detection:', { subject, subjectNormalized, isCreoleLesson });

    const combinedContent = `${contenu || ''}\n\n${exemplesExercices || ''}`.trim();

    // Strict HTML format with exactly 4 options
    const systemPrompt = isCreoleLesson
      ? `🚨 RÈGLE: LE CONTENU DOIT ÊTRE EN KREYÒL AYISYEN! 🚨

Tu es un expert en création de quiz éducatifs. Tu dois générer un quiz final de 10-15 questions QCM.

FORMAT HTML EXACT OBLIGATOIRE:

<div class="quiz-container">
  <div class="quiz-question" data-number="1">
    <h3>Kesyon 1</h3>
    <p>Tèks kesyon an isit la?</p>
    <div class="quiz-options">
      <div class="option" data-answer="A">A) Premye opsyon</div>
      <div class="option" data-answer="B">B) Dezyèm opsyon</div>
      <div class="option" data-answer="C">C) Twazyèm opsyon</div>
      <div class="option" data-answer="D">D) Katriyèm opsyon</div>
    </div>
    <div class="correct-answer" data-correct="B">
      <p><strong>Repons ki kòrèk: B</strong></p>
      <p>Esplikasyon detaye an kreyòl...</p>
    </div>
  </div>
</div>

RÈGLES CRITIQUES:
1. EXACTEMENT 4 options par question (A, B, C, D) - PAS PLUS, PAS MOINS
2. Chaque option dans un <div class="option" data-answer="X">X) texte</div>
3. data-correct doit correspondre à A, B, C ou D
4. Générer 10-15 questions
5. NE PAS utiliser de classes Tailwind
6. NE PAS utiliser d'emojis dans les questions
7. CONTENU EN KREYÒL AYISYEN`
      : `Tu es un expert en création de quiz éducatifs. Tu dois générer un quiz final de 10-15 questions QCM.

FORMAT HTML EXACT OBLIGATOIRE:

<div class="quiz-container">
  <div class="quiz-question" data-number="1">
    <h3>Question 1</h3>
    <p>Texte de la question ici?</p>
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
</div>

RÈGLES CRITIQUES:
1. EXACTEMENT 4 options par question (A, B, C, D) - PAS PLUS, PAS MOINS
2. Chaque option dans un <div class="option" data-answer="X">X) texte</div>
3. data-correct doit correspondre à A, B, C ou D
4. Générer 10-15 questions
5. NE PAS utiliser de classes Tailwind
6. NE PAS utiliser d'emojis dans les questions
7. TOUT EN FRANÇAIS`;

    const userPrompt = isCreoleLesson
      ? `Jenere yon quiz final pou lesyon sa a:

Tit: ${lessonTitle}
Nivo: ${gradeLevel}
Matyè: ${subject}

Kontni lesyon an:
${combinedContent}

🔴 SONJE: Ekri tout kontni AN KREYÒL AYISYEN! EGZAKTEMAN 4 opsyon pa kesyon!`
      : `Génère un quiz final pour cette leçon:

Titre: ${lessonTitle}
Niveau: ${gradeLevel}
Matière: ${subject}

Contenu de la leçon:
${combinedContent}

🔴 IMPORTANT: EXACTEMENT 4 options par question (A, B, C, D)!`;

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
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return secureErrorResponse('Rate limits exceeded, please try again later.', 429);
      }
      if (response.status === 402) {
        return secureErrorResponse('Payment required, please add funds to your Lovable AI workspace.', 402);
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    let quizContent = data.choices[0].message.content;

    // Post-process: ensure proper HTML structure
    // Remove any markdown code blocks if present
    quizContent = quizContent
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log('✅ Quiz Final generated successfully');
    console.log('First 500 chars:', quizContent.substring(0, 500));

    return secureJsonResponse({ quizContent });

  } catch (error) {
    console.error('Error in generate-quiz-final function:', error);
    return secureErrorResponse(error instanceof Error ? error.message : 'Unknown error');
  }
});
