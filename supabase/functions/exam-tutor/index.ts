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
  partialScore?: number;  // 0-100 percentage (0, 25, 50, 75, 100)
  confidence?: 'high' | 'medium' | 'low';
  reasoning?: string;
  pointsAwarded?: number | null;
  correctAnswer?: string | null;
}

// ============= Subject Detection =============
type SubjectType = 'language' | 'math' | 'science' | 'social' | 'unknown';

/**
 * Detect subject type from exercise data for applying appropriate evaluation strategy
 */
function detectSubjectType(exercise: any, referenceTexts?: any[]): SubjectType {
  const concept = (exercise.concept || '').toLowerCase();
  const questionText = (exercise.question_text || '').toLowerCase();
  
  // Language indicators (French, English, Spanish, Creole)
  const languagePatterns = /compréhension|grammaire|vocabulaire|texte|lecture|reading|writing|conjugaison|orthographe|syntaxe|littéraire|rédaction|production écrite/i;
  if (languagePatterns.test(concept) || languagePatterns.test(questionText)) {
    return 'language';
  }
  
  // If reference texts are provided, likely a language subject
  if (referenceTexts && referenceTexts.length > 0) {
    return 'language';
  }
  
  // Math indicators
  const mathPatterns = /math|calcul|équation|géométrie|algèbre|statistique|arithmétique|nombre|fraction|pourcentage|divisibilité|puissance|racine|triangle|cercle|aire|volume|périmètre/i;
  if (mathPatterns.test(concept) || mathPatterns.test(questionText)) {
    return 'math';
  }
  
  // Science indicators
  const sciencePatterns = /science|physique|chimie|biologie|svt|cellule|atome|énergie|force|électricité|magnétisme|écosystème|organisme/i;
  if (sciencePatterns.test(concept) || sciencePatterns.test(questionText)) {
    return 'science';
  }
  
  // Social studies indicators
  const socialPatterns = /histoire|géographie|civique|sociale|économie|politique|société|culture|haïti|constitution|gouvernement/i;
  if (socialPatterns.test(concept) || socialPatterns.test(questionText)) {
    return 'social';
  }
  
  return 'unknown';
}

/**
 * Build grounding prompt for reference texts with citation requirements
 */
function buildReferenceGroundingPrompt(referenceTexts: any[]): string {
  if (!referenceTexts?.length) return '';
  
  let prompt = `\n\n**TEXTES DE RÉFÉRENCE DE L'EXAMEN (TU DOIS CITER CES TEXTES POUR JUSTIFIER TES RÉPONSES):**\n`;
  
  referenceTexts.forEach((ref: { section?: string; title?: string; text: string }, i: number) => {
    prompt += `\n[Document ${i + 1}${ref.section ? ` - ${ref.section}` : ''}${ref.title ? `: ${ref.title}` : ''}]\n${ref.text}\n`;
  });
  
  prompt += `
**INSTRUCTION CRITIQUE POUR L'ÉVALUATION:**
- Pour CHAQUE réponse que tu évalues, tu DOIS citer le passage exact du texte qui la justifie
- Utilise le format: 《passage cité》 pour les citations textuelles
- Si l'information n'est PAS dans le texte, dis-le clairement: "Cette information n'apparaît pas dans le texte fourni."
- Pour les QCM: L'option correcte est celle qui correspond EXACTEMENT au texte
- Pour les questions ouvertes: La réponse doit être trouvable ou déductible du texte`;
  
  return prompt;
}

/**
 * Build subject-specific evaluation rules
 */
function buildEvaluationRules(subjectType: SubjectType, hasCorrectAnswer: boolean, hasReferenceTexts: boolean): string {
  // If we have a confirmed correct answer, use deterministic mode
  if (hasCorrectAnswer) {
    return `\n\n**MODE D'ÉVALUATION: Réponse officielle connue**
La réponse correcte est définie dans la base de données. Utilise-la pour évaluer avec certitude.`;
  }
  
  // Language with reference texts - citation mode
  if (subjectType === 'language' && hasReferenceTexts) {
    return `\n\n**RÈGLES D'ÉVALUATION - Mode Texte de Référence:**

Tu as accès aux TEXTES DE RÉFÉRENCE de l'examen. Pour évaluer les réponses:

1. **TOUJOURS CITER** le passage exact du texte qui justifie ta correction
2. Pour les QCM: L'option correcte est celle qui correspond au texte - cite le passage
3. Pour les questions ouvertes: La réponse doit être trouvable/déductible du texte
4. Si la question demande une opinion personnelle, accepte toute réponse cohérente et bien argumentée

**Format de réponse pour vérification:**
- Si correct: "Dans le texte, on lit: 《citation exacte》. Ta réponse est correcte! 🎉"
- Si incorrect: "Dans le texte, on lit: 《citation exacte》. La bonne réponse est [X] parce que..."
- Si opinion: "C'est une question d'opinion/analyse. Ton raisonnement est [acceptable/à améliorer]."`;
  }
  
  // Math - computation mode
  if (subjectType === 'math') {
    return `\n\n**RÈGLES D'ÉVALUATION - Mode Mathématique:**

1. **RÉSOUS** le problème étape par étape dans ta tête avant de répondre
2. **MONTRE** ton calcul complet quand tu corriges
3. Compare le résultat de l'élève avec ta solution calculée
4. Pour les équations: Vérifie en substituant la valeur trouvée

**Format de réponse:**
- Si correct: "Vérifions: [calcul rapide]. Bravo, c'est correct! 🎉"
- Si incorrect: "Voici la solution: [calcul étape par étape]. Tu as fait une erreur à [étape]. La bonne réponse est [X]."`;
  }
  
  // Science - reasoning mode
  if (subjectType === 'science') {
    return `\n\n**RÈGLES D'ÉVALUATION - Mode Scientifique:**

1. **EXPLIQUE** le concept scientifique en jeu
2. **RAISONNE** à partir des principes fondamentaux
3. Compare la réponse de l'élève avec le raisonnement scientifique correct

**Format de réponse:**
- Si correct: "C'est exact! [Explication du concept]. 🎉"
- Si incorrect: "Le principe scientifique ici est [explication]. Donc la bonne réponse est [X]."`;
  }
  
  // No ground truth available - cautious mode
  return `\n\n**RÈGLES D'ÉVALUATION - Mode Prudent (pas de réponse officielle):**

⚠️ ATTENTION: Aucune réponse officielle n'est définie pour cette question dans la base de données.

1. **NE JAMAIS dire** "Tu as raison" ou "Tu as tort" de façon définitive
2. **GUIDER** l'élève avec des questions: "As-tu pensé à...?" "Que se passe-t-il si...?"
3. **EXPLIQUER** le concept et le raisonnement sans confirmer/infirmer catégoriquement
4. **ÊTRE TRANSPARENT**: "Je n'ai pas la réponse officielle de cet examen, mais voici comment je raisonnerais..."
5. **ENCOURAGER** la réflexion: "Ta démarche semble [logique/à revoir]. Vérifie en..."

**Format de réponse:**
- "Je n'ai pas la correction officielle, mais [explication du raisonnement]."
- "Ta réponse [semble cohérente / pourrait être améliorée] parce que [explication]."
- "Pour ce type de question, pense à [concept clé]."`;
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

/**
 * Parse structured grade block from AI response
 * Format: <<GRADE:{"score":75,"reason":"..."}>>
 * Returns cleaned text (without grade block) and parsed grade
 */
function parseGradeFromResponse(text: string): {
  cleanText: string;
  grade: { score: number; reason: string } | null;
} {
  const match = text.match(/<<GRADE:(\{.*?\})>>/s);
  if (!match) return { cleanText: text, grade: null };

  try {
    const parsed = JSON.parse(match[1]);
    const rawScore = Math.max(0, Math.min(100, Number(parsed.score) || 0));
    // Snap to valid tiers: 0, 25, 50, 75, 100
    const score = Math.round(rawScore / 25) * 25;
    return {
      cleanText: text.replace(/<<GRADE:\{.*?\}>>/s, '').trim(),
      grade: { score, reason: parsed.reason || '' },
    };
  } catch {
    return {
      cleanText: text.replace(/<<GRADE:\{.*?\}>>/s, '').trim(),
      grade: null,
    };
  }
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

    // Detect subject type and grounding context
    const subjectType = detectSubjectType(exercise, referenceTexts);
    const hasCorrectAnswer: boolean = Boolean(exercise.correct_answer);
    const hasReferenceTexts: boolean = Boolean(referenceTexts && Array.isArray(referenceTexts) && referenceTexts.length > 0);
    
    console.log('Evaluation context:', { subjectType, hasCorrectAnswer, hasReferenceTexts });

    // Build reference texts section with grounding instructions
    const referenceTextsSection = buildReferenceGroundingPrompt(referenceTexts || []);
    
    // Build subject-specific evaluation rules
    const evaluationRules = buildEvaluationRules(subjectType, hasCorrectAnswer, hasReferenceTexts);

    // Build system prompt for Jude as exam tutor
    let systemPrompt = `Tu es Jude, un tuteur pédagogique haïtien qui aide les élèves à préparer leurs examens officiels.

**IMPORTANT: Tu dois TOUJOURS parler en FRANÇAIS, peu importe la matière de l'examen (sauf si c'est un examen de Kreyòl).**

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
- **IMPORTANT - Citation de question**: Quand tu mentionnes ou cites la question de l'exercice, tu DOIS TOUJOURS l'entourer avec 《...》 (ex: 《Quelle est ta préférence?》 ou 《Écrire un petit texte...》). N'utilise JAMAIS ** ou "" pour les questions - SEULEMENT 《...》.
- Utiliser des analogies de la vie quotidienne haïtienne quand c'est pertinent
- Répondre aux questions libres de l'élève sur les concepts
${evaluationRules}
${referenceTextsSection}

**CONTEXTE D'ÉVALUATION:**
- Type de sujet détecté: ${subjectType}
- Réponse officielle connue: ${hasCorrectAnswer ? 'Oui' : 'Non'}
- Textes de référence disponibles: ${hasReferenceTexts ? 'Oui (' + (referenceTexts?.length || 0) + ' documents)' : 'Non'}

**Exercice actuel:**
Question: ${exercise.question_text}
${exercise.options && Array.isArray(exercise.options) && exercise.options.length > 0 
  ? `Options: ${exercise.options.map((opt: string, idx: number) => `${String.fromCharCode(65 + idx)}) ${opt}`).join(', ')}`
  : 'Type: Question ouverte (pas de choix multiples)'}
${exercise.correct_answer ? `Réponse correcte officielle: ${exercise.correct_answer}` : ''}
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
      const needsAiGrading = !exercise.correct_answer || exercise.exercise_type === 'open_ended';
      
      if (needsAiGrading) {
        // No answer key OR open-ended -- let AI evaluate with structured grade output
        const hasKey = exercise.correct_answer ? `\nRéponse officielle connue: ${exercise.correct_answer}` : '\nAucune réponse officielle n\'est définie pour cette question.';
        systemPrompt += `\n\n**ACTION REQUISE: ÉVALUER la réponse de l'élève (${studentAnswer})**${hasKey}
Tu dois:
1. Analyser la question et déterminer toi-même si la réponse est correcte
2. Comparer avec la réponse de l'élève (${studentAnswer})
3. Donner un feedback adapté au score (max 80 mots)
4. Ne dis JAMAIS que l'élève a tort si son raisonnement est correct

Tu dois OBLIGATOIREMENT fournir une note en ajoutant ce bloc EXACTEMENT a la fin de ta reponse:
<<GRADE:{"score":X,"reason":"..."}>>
ou X est un pourcentage (0, 25, 50, 75, ou 100):
- 100: Reponse completement correcte
- 75: Bonne reponse avec erreurs mineures ou formulation incomplete
- 50: Partiellement correct, elements importants manquants
- 25: Tentative avec un debut de raisonnement correct
- 0: Reponse incorrecte`;
      } else {
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
    }

    // PII sanitizer — masks emails (incl. space-around-@ variants), phones, and URLs
    const sanitizeContent = (content: string): string => {
      if (!content) return content;
      return content
        // Mask email addresses including space-before/after-@ variants
        .replace(/[a-zA-Z0-9._%+-]+\s*@\s*[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, '[email masqué]')
        // Mask phone numbers (Haiti +509 format + international)
        .replace(/(\+509|00509)?\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{2}/g, '[téléphone masqué]')
        // Mask URLs to prevent data exfiltration
        .replace(/https?:\/\/[^\s]+/gi, '[lien masqué]');
    };

    // PII hardening: sanitize history and user message before sending to AI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.message_role === 'user' ? 'user' : 'assistant',
        content: sanitizeContent(msg.message_content)
      })),
      { role: 'user', content: sanitizeContent(userMessage) }
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

    // ============= Grade Parsing & Answer Validation =============
    const needsAiGrading = studentAnswer && (!exercise.correct_answer || exercise.exercise_type === 'open_ended');
    const { cleanText, grade } = needsAiGrading
      ? parseGradeFromResponse(judeResponse)
      : { cleanText: judeResponse, grade: null };

    let isCorrect: boolean | undefined = undefined;
    let partialScore: number | undefined = undefined;
    let shouldAwardPoints = false;
    let shouldMoveToNext = false;
    let pointsAwarded = 0;

    if (studentAnswer && exercise.correct_answer && exercise.exercise_type !== 'open_ended') {
      // MCQ with answer key: deterministic validation
      isCorrect = validateAnswer(studentAnswer, exercise);
      shouldAwardPoints = isCorrect;
      pointsAwarded = isCorrect ? exercise.points : 0;
      shouldMoveToNext = true;
    } else if (studentAnswer && grade) {
      // AI-graded: use parsed score
      partialScore = grade.score;
      isCorrect = grade.score >= 75;
      shouldAwardPoints = grade.score > 0;
      pointsAwarded = Math.round(exercise.points * (grade.score / 100));
      shouldMoveToNext = true;
      console.log('AI grade parsed:', { score: grade.score, reason: grade.reason, pointsAwarded });
    } else if (studentAnswer) {
      // Fallback: AI didn't include grade block
      console.warn(`Exercise ${exercise.exercise_number}: AI did not return grade block, falling back`);
      shouldMoveToNext = true;
    }

    // ============= Build Structured Response =============
    
    // Parse cleaned response (without grade tag) into content blocks
    const blocks = parseToBlocks(cleanText);
    
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

    // Build grading info with confidence scoring
    const grading: TutorGrading = {
      isCorrect: partialScore !== undefined ? (partialScore >= 75) :
                 (studentAnswer && exercise.correct_answer && exercise.exercise_type !== 'open_ended') ? isCorrect : undefined,
      partialScore,
      confidence: hasCorrectAnswer ? 'high' : (hasReferenceTexts ? 'medium' : 'low'),
      reasoning: hasCorrectAnswer 
        ? 'Évaluation basée sur la réponse officielle'
        : grade?.reason
          ? grade.reason
          : hasReferenceTexts 
            ? 'Évaluation basée sur les textes de référence'
            : 'Évaluation approximative - pas de réponse officielle',
      pointsAwarded,
      correctAnswer: revealAnswer ? exercise.correct_answer : undefined,
    };

    // Return structured TutorResponse
    return new Response(
      JSON.stringify({
        blocks,
        actions,
        grading,
        shouldAutoAdvance: shouldMoveToNext,
        youtubeQuery,
        // BACKWARD COMPAT
        response: cleanText,
        isCorrect: grading.isCorrect,
        shouldAwardPoints,
        pointsEarned: pointsAwarded,
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