
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSecureHeaders, secureJsonResponse, secureErrorResponse, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Security: Input validation schema
const generateQuizSchema = z.object({
  lessonTitle: z.string().min(1).max(500),
  lessonSlug: z.string().min(1).max(200).optional(),
  subjectSlug: z.string().min(1).max(200).optional(),
  contenu: z.string().max(50000).optional(),
  exemplesExercices: z.string().max(50000).optional(),
  gradeLevel: z.string().max(10).optional(),
  subject: z.string().max(200).optional(),
  outputFormat: z.enum(['json', 'html']).optional().default('html'), // Default to HTML for backward compatibility
}).strict();

// Canonical Quiz JSON Schema (matches frontend quiz.schema.ts)
const QuizQuestionMCQSchema = z.object({
  type: z.literal('mcq'),
  prompt: z.string().min(10).max(500),
  choices: z.array(z.string().max(200)).length(4),
  answerIndex: z.number().min(0).max(3),
  explanation: z.string().min(10).max(500),
  tags: z.array(z.string()).max(5).default([]),
});

const QuizPayloadSchema = z.object({
  version: z.literal(1),
  lessonSlug: z.string().min(1),
  gradeLevel: z.string().min(1),
  subjectSlug: z.string().min(1),
  language: z.enum(['fr', 'ht', 'en', 'es']).default('fr'),
  questions: z.array(QuizQuestionMCQSchema).min(10).max(15),
});

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
    
    const { lessonTitle, lessonSlug, subjectSlug, contenu, exemplesExercices, gradeLevel, subject, outputFormat } = parseResult.data;

    console.log('📝 Generating Quiz Final for:', lessonTitle);
    console.log('📋 Request params:', { 
      lessonTitle, 
      lessonSlug,
      subjectSlug,
      gradeLevel, 
      subject,
      outputFormat,
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
    
    // Determine language code
    const language = isCreoleLesson ? 'ht' : 'fr';
    
    console.log('🔍 Creole detection:', { subject, subjectNormalized, isCreoleLesson, language });

    // Use JSON output format if requested
    if (outputFormat === 'json') {
      return await generateJsonQuiz({
        lessonTitle,
        lessonSlug: lessonSlug || lessonTitle.toLowerCase().replace(/\s+/g, '-'),
        subjectSlug: subjectSlug || (subject || 'general').toLowerCase().replace(/\s+/g, '-'),
        gradeLevel: gradeLevel || '7AF',
        contenu: contenu || '',
        exemplesExercices: exemplesExercices || '',
        isCreoleLesson,
        language,
        LOVABLE_API_KEY,
      });
    }
    
    const combinedContent = `${contenu || ''}\n\n${exemplesExercices || ''}`.trim();
    
    // Legacy HTML generation (backward compatibility)

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

// ============================================================================
// JSON Quiz Generation (Phase 2 - Structured Content)
// ============================================================================

// Strip HTML tags to send clean text to the AI
function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

interface JsonQuizParams {
  lessonTitle: string;
  lessonSlug: string;
  subjectSlug: string;
  gradeLevel: string;
  contenu: string;
  exemplesExercices: string;
  isCreoleLesson: boolean;
  language: 'fr' | 'ht' | 'en' | 'es';
  LOVABLE_API_KEY: string;
}

async function generateJsonQuiz(params: JsonQuizParams): Promise<Response> {
  const { lessonTitle, lessonSlug, subjectSlug, gradeLevel, contenu, exemplesExercices, isCreoleLesson, language, LOVABLE_API_KEY } = params;

  console.log('🎯 Generating JSON Quiz (Phase 2)');

  // Strip HTML from content before sending to AI
  const cleanContenu = stripHtml(contenu).substring(0, 12000);
  const cleanExemples = stripHtml(exemplesExercices).substring(0, 8000);

  const jsonSystemPrompt = isCreoleLesson
    ? `Ou se yon ekspè nan kreye quiz edikasyon. Jenere yon quiz final ak 10-15 kesyon QCM.

FÒMA JSON EGZAKT OBLIGATWA:
{
  "version": 1,
  "lessonSlug": "${lessonSlug}",
  "gradeLevel": "${gradeLevel}",
  "subjectSlug": "${subjectSlug}",
  "language": "ht",
  "questions": [
    {
      "type": "mcq",
      "prompt": "Tèks kesyon an isit la?",
      "choices": ["Premye opsyon", "Dezyèm opsyon", "Twazyèm opsyon", "Katriyèm opsyon"],
      "answerIndex": 1,
      "explanation": "Esplikasyon detaye poukisa repons sa a kòrèk...",
      "tags": ["tag1", "tag2"]
    }
  ]
}

RÈG KRITIK:
1. EGZAKTEMAN 4 chwa pa kesyon
2. answerIndex se yon nimewo ant 0 ak 3 (0=premye chwa, 1=dezyèm, elatriye)
3. Jenere 10-15 kesyon
4. PA itilize emojis nan kesyon yo
5. TOUT KONTNI AN KREYÒL AYISYEN
6. Retounen SÈL JSON valid, pa gen tèks anvan oswa apre
7. TOUT kesyon yo DOIT baze SÈLMAN sou kontni leson an ki bay la. PA JANM jenere kesyon sou sijè ekstèn.`
    : `Tu es un expert en création de quiz éducatifs. Génère un quiz final de 10-15 questions QCM.

FORMAT JSON EXACT OBLIGATOIRE:
{
  "version": 1,
  "lessonSlug": "${lessonSlug}",
  "gradeLevel": "${gradeLevel}",
  "subjectSlug": "${subjectSlug}",
  "language": "fr",
  "questions": [
    {
      "type": "mcq",
      "prompt": "Texte de la question ici?",
      "choices": ["Première option", "Deuxième option", "Troisième option", "Quatrième option"],
      "answerIndex": 0,
      "explanation": "Explication détaillée de pourquoi cette réponse est correcte...",
      "tags": ["concept1", "concept2"]
    }
  ]
}

RÈGLES CRITIQUES:
1. EXACTEMENT 4 choix par question
2. answerIndex est un nombre entre 0 et 3 (0=premier choix, 1=deuxième, etc.)
3. Générer 10-15 questions
4. NE PAS utiliser d'emojis dans les questions
5. TOUT EN FRANÇAIS
6. Retourner UNIQUEMENT du JSON valide, pas de texte avant ou après
7. TOUTES les questions doivent être basées UNIQUEMENT sur le contenu fourni dans la leçon. Ne génère JAMAIS de questions sur des sujets externes.`;

  const jsonUserPrompt = isCreoleLesson
    ? `Jenere yon quiz JSON pou lesyon sa a:

Tit: ${lessonTitle}
Nivo: ${gradeLevel}
Matyè: ${subjectSlug}

=== KONTNI LESON AN ===
${cleanContenu || 'Pa gen kontni.'}

=== EGZANP AK EGZÈSIS LESON AN ===
${cleanExemples || 'Pa gen egzanp.'}

ENSTRIKSYON KRITIK:
- Jenere EGZAKTEMAN 10 a 15 kesyon QCM
- TOUT kesyon yo dwe baze SÈLMAN sou kontni ak egzanp ki anwo a
- PA JANM poze kesyon sou sijè ki pa kouvri nan leson an
- Chak kesyon dwe teste konpreyansyon kontni espesifik leson sa a
- Retounen SÈL yon objè JSON valid.`
    : `Génère un quiz JSON pour cette leçon:

Titre: ${lessonTitle}
Niveau: ${gradeLevel}
Matière: ${subjectSlug}

=== CONTENU DE LA LEÇON ===
${cleanContenu || 'Pas de contenu.'}

=== EXEMPLES ET EXERCICES DE LA LEÇON ===
${cleanExemples || "Pas d'exemples."}

INSTRUCTIONS CRITIQUES:
- Génère EXACTEMENT 10 à 15 questions QCM
- TOUTES les questions doivent être basées UNIQUEMENT sur le contenu et les exemples ci-dessus
- Ne pose JAMAIS de questions sur des sujets non couverts dans la leçon
- Chaque question doit tester la compréhension du contenu spécifique de cette leçon
- Retourne UNIQUEMENT un objet JSON valide.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: jsonSystemPrompt },
        { role: 'user', content: jsonUserPrompt }
      ],
      response_format: { type: 'json_object' },
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
  let rawContent = data.choices[0].message.content;

  // Clean up any markdown code blocks
  rawContent = rawContent
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  console.log('📦 Raw JSON response (first 500 chars):', rawContent.substring(0, 500));

  // Sanitize common AI JSON escape issues (math backslashes, etc.)
  const sanitizeJsonString = (str: string): string => {
    return str.replace(/\\([^"\\\/bfnrtu])/g, '\\\\$1');
  };

  // Parse and validate the JSON
  let parsedQuiz;
  try {
    parsedQuiz = JSON.parse(rawContent);
  } catch (parseError) {
    console.warn('First JSON parse failed, attempting sanitization...');
    try {
      const sanitized = sanitizeJsonString(rawContent);
      parsedQuiz = JSON.parse(sanitized);
      console.log('JSON parse succeeded after sanitization');
    } catch (secondError) {
      console.error('Failed to parse JSON even after sanitization:', secondError);
      return secureErrorResponse('AI returned invalid JSON', 500);
    }
  }

  // Validate against schema
  const validationResult = QuizPayloadSchema.safeParse(parsedQuiz);
  
  if (!validationResult.success) {
    console.error('Schema validation failed:', validationResult.error.errors);
    
    return secureJsonResponse({
      success: false,
      validationErrors: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      rawPayload: parsedQuiz,
    }, 400);
  }

  console.log('✅ JSON Quiz generated and validated successfully');
  console.log(`📊 ${validationResult.data.questions.length} questions generated`);

  return secureJsonResponse({
    success: true,
    payload: validationResult.data,
    format: 'json',
  });
}
