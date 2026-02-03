/**
 * Security-Hardened: Exam Tutor
 * 
 * Features:
 * - Rate limiting
 * - Input validation
 * - Security headers
 * - Structured TutorResponse with blocks and actions
 * - Deterministic answer validation for MCQ
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { validateInput, examTutorSchema } from "../_shared/validation.ts";
import { corsHeaders, securityHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";

// ============= Content Block Types =============
interface ContentBlock {
  type: 'text' | 'math-inline' | 'math-block';
  content?: string;
  latex?: string;
}

interface TutorAction {
  type: 'hint' | 'reveal' | 'next' | 'youtube' | 'reference';
  label: string;
  payload?: any;
}

interface TutorGrading {
  isCorrect?: boolean;
  pointsAwarded?: number | null;
  correctAnswer?: string | null;
}

// ============= Helper Functions =============

/**
 * Normalize answer for comparison (accents, case, special chars)
 */
function normalizeAnswer(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '')       // Remove special chars
    .trim();
}

/**
 * Deterministic answer validation
 * For MCQ: exact letter match
 * For open-ended: normalized comparison
 */
function validateAnswer(studentAnswer: string, exercise: any): boolean {
  const correct = exercise.correct_answer?.toUpperCase().trim();
  const student = studentAnswer?.toUpperCase().trim();
  
  if (!correct) {
    console.warn(`No correct_answer defined for exercise ${exercise.exercise_number}`);
    return false;
  }
  
  // For MCQ (has options): exact letter match
  if (exercise.options && (Array.isArray(exercise.options) || typeof exercise.options === 'object')) {
    return student === correct;
  }
  
  // For open-ended: normalize and compare
  return normalizeAnswer(student) === normalizeAnswer(correct);
}

/**
 * Parse AI response text into structured ContentBlocks
 * Handles $...$ (inline math) and $$...$$ (block math)
 */
function parseToBlocks(text: string): ContentBlock[] {
  if (!text) return [];
  
  const blocks: ContentBlock[] = [];
  const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
  
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const textContent = text.slice(lastIndex, match.index);
      if (textContent.trim()) {
        blocks.push({ type: 'text', content: textContent });
      }
    }
    
    const mathContent = match[0];
    
    // Check if it's block math ($$...$$) or inline math ($...$)
    if (mathContent.startsWith('$$') && mathContent.endsWith('$$')) {
      blocks.push({
        type: 'math-block',
        latex: mathContent.slice(2, -2).trim(),
      });
    } else {
      blocks.push({
        type: 'math-inline',
        latex: mathContent.slice(1, -1).trim(),
      });
    }
    
    lastIndex = match.index + mathContent.length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    const remaining = text.slice(lastIndex);
    if (remaining.trim()) {
      blocks.push({ type: 'text', content: remaining });
    }
  }
  
  // If no blocks were created, treat the whole thing as text
  if (blocks.length === 0 && text.trim()) {
    blocks.push({ type: 'text', content: text });
  }
  
  return blocks;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  const responseHeaders = { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' };

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get client IP for rate limiting
    const clientIp = getClientIp(req);

    // Check rate limit
    const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.AI_TUTOR, null, clientIp);
    if (!rateCheck.allowed) {
      console.warn(`Rate limit exceeded for exam-tutor from IP ${clientIp}`);
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validation = validateInput(examTutorSchema, rawBody);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        { status: 400, headers: responseHeaders }
      );
    }

    const validatedData = validation.data;
    const action = (rawBody.action as string) || 'ask'; // Action-based routing
    const hintLevel = rawBody.hint_level as number || 0;
    const exercise = validatedData.exercise;
    const userMessage = validatedData.userMessage || validatedData.message || '';
    const conversationHistory = validatedData.conversationHistory || [];
    const studentAnswer = validatedData.studentAnswer;
    const revealAnswer = validatedData.revealAnswer || action === 'reveal';
    const referenceTexts = validatedData.referenceTexts;

    console.log('Exam tutor request:', { action, exercise: exercise?.exercise_number, hintLevel });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build reference texts section if available
    let referenceTextsSection = '';
    if (referenceTexts && Array.isArray(referenceTexts) && referenceTexts.length > 0) {
      referenceTextsSection = `\n\n**TEXTES DE RÉFÉRENCE DE L'EXAMEN (utilise ces textes pour répondre aux questions):**\n`;
      referenceTexts.forEach((ref: { section?: string; title?: string; text: string }) => {
        referenceTextsSection += `\n[${ref.section || 'Texte'}] ${ref.title || ''}\n${ref.text}\n`;
      });
    }

    // Build system prompt for Jude as exam tutor
    let systemPrompt = `Tu es Jude, un tuteur pédagogique haïtien qui aide les élèves à préparer leurs examens officiels.

**IMPORTANT: Tu dois TOUJOURS parler en FRANÇAIS, peu importe la matière de l'examen (sauf si c'est un examen de Kreyòl).**
${referenceTextsSection}
**Ton rôle:**
- Guider l'élève à travers chaque exercice
- Expliquer les concepts avec des termes simples et des exemples concrets
- Donner des indices progressifs quand l'élève est bloqué
- Féliciter les efforts et encourager la persévérance
- Corriger les erreurs avec bienveillance en expliquant pourquoi
- SI DES TEXTES DE RÉFÉRENCE SONT FOURNIS, utilise-les pour répondre aux questions de compréhension

**Règles importantes:**
- NE TE PRÉSENTE JAMAIS dans tes réponses (pas de "Salut! Je suis Jude..." ou "Bonjour, je suis Jude...")
- Commence directement par ta réponse sans introduction
- **TOUJOURS utiliser la notation LaTeX pour les formules mathématiques**: Entoure les expressions mathématiques avec $ pour inline (ex: $x^2 + 5$) ou $$ pour les équations (ex: $$\\frac{a}{b}$$)
- **Pour citer la question de l'exercice**: Utilise les guillemets spéciaux 《...》 pour entourer le texte de la question (ex: 《What do you like the most?》). NE PAS utiliser ** pour les questions.
- Utiliser des analogies de la vie quotidienne haïtienne quand c'est pertinent
- Répondre aux questions libres de l'élève sur les concepts
- Si l'élève donne la BONNE réponse: Félicite brièvement (max 30 mots) et dis "Passons à la question suivante! 🎉"
- Si l'élève donne une MAUVAISE réponse: Explique l'erreur et donne la bonne réponse avec une explication claire (max 80 mots)

**Exercice actuel:**
Question: ${exercise.question_text}
${exercise.options && Array.isArray(exercise.options) && exercise.options.length > 0 
  ? `Options: ${exercise.options.map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}) ${opt}`).join(', ')}`
  : 'Type: Question ouverte (pas de choix multiples)'}
${exercise.correct_answer ? `Réponse correcte: ${exercise.correct_answer}` : 'Note: La réponse correcte n\'est pas définie dans la base de données. Guide l\'élève sans pouvoir valider automatiquement.'}
Concept: ${exercise.concept}`;

    // ============= Action-Based Prompt Modification =============
    
    // Handle hint action with progressive levels
    if (action === 'hint') {
      const HINT_PROMPTS: Record<number, string> = {
        1: 'Donne un indice qui pointe vers le concept sans révéler la réponse (max 40 mots).',
        2: 'Donne un indice plus précis qui élimine certaines mauvaises réponses (max 50 mots).',
        3: 'Donne un dernier indice qui mène presque directement à la réponse, sans la donner explicitement (max 60 mots).',
      };
      systemPrompt += `\n\n**ACTION REQUISE: INDICE (niveau ${hintLevel}/3)**\n${HINT_PROMPTS[hintLevel] || HINT_PROMPTS[1]}`;
    }

    // Handle reveal action
    if (action === 'reveal' || revealAnswer) {
      systemPrompt += `\n\n**ACTION REQUISE:** L'élève te demande de révéler la réponse. Tu dois:
1. Donner la bonne réponse (${exercise.correct_answer})
2. Expliquer clairement POURQUOI c'est la bonne réponse
3. Détailler le concept mathématique impliqué avec des exemples simples
4. Encourager l'élève à passer à la prochaine question

Donne une explication complète mais concise (maximum 150 mots).`;
    }

    // Handle check action - feedback on answer
    if (action === 'check' && studentAnswer) {
      const isCorrect = validateAnswer(studentAnswer, exercise);
      if (isCorrect) {
        systemPrompt += `\n\n**ACTION REQUISE: L'élève a donné la BONNE réponse (${studentAnswer})**
Félicite brièvement (max 30 mots) avec enthousiasme! 🎉`;
      } else {
        systemPrompt += `\n\n**ACTION REQUISE: L'élève a donné une MAUVAISE réponse (${studentAnswer})**
La bonne réponse est: ${exercise.correct_answer}
Explique l'erreur avec bienveillance et donne la bonne réponse avec une explication claire (max 80 mots).`;
      }
    }

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.message_role === 'user' ? 'user' : 'assistant',
        content: msg.message_content
      })),
      { role: 'user', content: userMessage }
    ];

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const judeResponse = data.choices[0].message.content;

    // ============= Deterministic Answer Validation =============
    let isCorrect = false;
    let shouldAwardPoints = false;
    let shouldMoveToNext = false;

    if (studentAnswer && exercise.correct_answer) {
      // Use deterministic validation
      isCorrect = validateAnswer(studentAnswer, exercise);
      shouldAwardPoints = isCorrect;
      shouldMoveToNext = true; // Auto-move after answering (correct or incorrect)
    } else if (studentAnswer && !exercise.correct_answer) {
      // No correct answer in database - log and handle gracefully
      console.warn(`Exercise ${exercise.exercise_number} has no correct_answer defined`);
      shouldMoveToNext = true;
    }

    // ============= Build Structured Response =============
    
    // Parse response into content blocks for KaTeX rendering
    const blocks = parseToBlocks(judeResponse);
    
    // Build available actions
    const actions: TutorAction[] = [];
    
    if (shouldMoveToNext || revealAnswer) {
      actions.push({ type: 'next', label: 'Question suivante' });
    }

    // YouTube suggestion
    const youtubeKeywords: Record<string, string> = {
      'divisibilité': 'divisibilité mathématiques',
      'puissances': 'puissances exposants mathématiques',
      'équations': 'résoudre équations premier degré',
      'géométrie': 'géométrie triangle rectangle',
      'fractions': 'fractions équivalentes simplification',
      'pourcentages': 'calcul pourcentages mathématiques',
      'nombres premiers': 'nombres premiers mathématiques',
      'statistiques': 'médiane statistiques mathématiques',
      'opérations': 'opérations nombres relatifs',
    };

    const youtubeQuery = youtubeKeywords[exercise.concept as string] || `${exercise.concept} mathématiques`;
    
    if (youtubeQuery) {
      actions.push({ type: 'youtube', label: 'Voir vidéo', payload: youtubeQuery });
    }

    // Build grading info
    const grading: TutorGrading = {
      isCorrect: studentAnswer ? isCorrect : undefined,
      pointsAwarded: shouldAwardPoints ? exercise.points : 0,
      correctAnswer: revealAnswer ? exercise.correct_answer : undefined,
    };

    // Return structured TutorResponse
    return new Response(
      JSON.stringify({
        // NEW: Structured content blocks for KaTeX
        blocks,
        
        // NEW: Available action buttons
        actions,
        
        // NEW: Grading info
        grading,
        
        // Auto-advance flag
        shouldAutoAdvance: shouldMoveToNext,
        
        // YouTube query for video suggestions
        youtubeQuery,
        
        // BACKWARD COMPAT: Keep raw response for older clients
        response: judeResponse,
        isCorrect,
        shouldAwardPoints,
        pointsEarned: shouldAwardPoints ? exercise.points : 0,
        shouldMoveToNext,
        explanation: isCorrect ? exercise.explanation : null,
      }),
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error('Error in exam-tutor function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});