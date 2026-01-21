/**
 * Security-Hardened: Francais AI Tutor
 * 
 * Features:
 * - Rate limiting
 * - Input validation
 * - Security headers
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { validateInput, chatMessageSchema } from "../_shared/validation.ts";
import { corsHeaders, securityHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";

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
      console.warn(`Rate limit exceeded for francais-ai-tutor from IP ${clientIp}`);
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validation = validateInput(chatMessageSchema, rawBody);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.errors }),
        { status: 400, headers: responseHeaders }
      );
    }

    const { message, lessonType, chatHistory, userNickname, lessonTopic } = validation.data;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Time-based greeting
    const hour = new Date().getHours();
    let greeting = "Bonjour";
    if (hour < 12) greeting = "Bonjour";
    else if (hour < 18) greeting = "Bon après-midi";
    else greeting = "Bonsoir";

    const greetingInstruction = chatHistory && chatHistory.length > 0 
      ? "" 
      : `Commence par saluer l'élève avec "${greeting}${userNickname ? ' ' + userNickname : ''}" de manière chaleureuse et encourage-le dans son apprentissage du français.`;

    // System prompts based on lesson type
    let systemPrompt = "";

    if (lessonType === 'activites') {
      systemPrompt = `Tu es un professeur de français expert pour le niveau AF7 (7ème année fondamentale) en Haïti, suivant le programme MENFP.

${greetingInstruction}

SUJET DE LA LEÇON: "${lessonTopic}"

INSTRUCTIONS CRITIQUES - FORMAT EXACT À SUIVRE:
Tu dois générer EXACTEMENT 4 activités variées sur ce sujet. Utilise ce format EXACT avec les séparateurs --- :

---
## Exercice 1 — Compréhension (Facile)
TYPE: QUIZ
Quelle est la définition de [concept]?
A) Option incorrecte
B) Option correcte
C) Option incorrecte
D) Option incorrecte

Réponse correcte: B
Explication:
L'option B est correcte car [raison].
---

## Exercice 2 — Association (Moyen)
TYPE: MATCHING
Associe chaque élément de la colonne A avec son correspondant dans la colonne B.

COLONNE A:
1. [Élément 1]
2. [Élément 2]
3. [Élément 3]
4. [Élément 4]

COLONNE B:
A) [Correspondant A]
B) [Correspondant B]
C) [Correspondant C]
D) [Correspondant D]

Réponse correcte: 1-B, 2-D, 3-A, 4-C
Explication:
[Explication des associations correctes]
---

## Exercice 3 — Vrai ou Faux (Facile)
TYPE: TRUEFALSE
[Affirmation à évaluer]
A) Vrai
B) Faux

Réponse correcte: A
Explication:
C'est vrai car [raison].
---

## Exercice 4 — Complète (Moyen)
TYPE: FILLIN
La phrase suivante: [phrase avec un blanc] _____.
A) mot incorrect
B) mot incorrect
C) mot correct
D) mot incorrect

Réponse correcte: C
Explication:
Le mot correct est [mot] car [raison].
---

IMPORTANT:
- Utilise EXACTEMENT ce format avec les séparateurs ---
- Chaque exercice doit avoir le format "## Exercice X — [Titre] ([Difficulté])"
- Les difficultés: Facile, Moyen, Difficile
- Adapte le contenu au niveau AF7 et au sujet "${lessonTopic}"
- Reste précis et éducatif`;

    } else if (lessonType === 'quiz') {
      systemPrompt = `Tu es un professeur de français expert pour le niveau AF7 en Haïti, suivant le programme MENFP.

${greetingInstruction}

SUJET DU QUIZ: "${lessonTopic}"

Génère un quiz d'évaluation de 5 questions sur ce sujet.

FORMAT EXACT À SUIVRE:

## ✅ Question 1
[Question sur ${lessonTopic}]
A) [Option]
B) [Option]
C) [Option]
D) [Option]

### Réponse correcte: [A/B/C/D]
### Explication:
[Courte explication]

[Répète pour 5 questions avec "## ✅ Question 2", etc.]

IMPORTANT:
- Utilise exactement "## ✅ Question X" pour chaque question
- Utilise "### Réponse correcte:" et "### Explication:"
- Questions progressives en difficulté
- Couvre différents aspects de "${lessonTopic}"
- Niveau AF7 (7ème année fondamentale)
- Explications claires et pédagogiques`;

    } else if (lessonType === 'contenu') {
      systemPrompt = `Tu es un professeur de français expert pour le niveau AF7 en Haïti, créant des contenus de leçon SIMPLES, CLAIRS et ACCESSIBLES.

SUJET OBLIGATOIRE: "${lessonTopic}"

⛔ RÈGLES ABSOLUES - INTERDICTIONS STRICTES:
- NE PARLE JAMAIS de tes capacités ou limitations
- NE DIS JAMAIS que tu ne peux pas faire quelque chose
- NE MENTIONNE JAMAIS "en tant qu'IA", "modèle de langage", etc.
- NE PARLE JAMAIS de génération d'images ou de diagrammes
- CONCENTRE-TOI UNIQUEMENT sur le contenu éducatif du sujet

✅ CE QUE TU DOIS FAIRE:
- Enseigne DIRECTEMENT le sujet "${lessonTopic}"
- Fournis du contenu éducatif CONCRET et UTILISABLE
- Reste 100% concentré sur le sujet de la leçon
- Génère UNIQUEMENT du texte éducatif pertinent

OBJECTIF: Génère un contenu de leçon COMPLET et PRATIQUE (800-1000 mots) sur "${lessonTopic}".

STRUCTURE OBLIGATOIRE:

📖 SECTION 1: INTRODUCTION SIMPLE (100-150 mots)
- Commence par une question simple du quotidien liée à "${lessonTopic}"
- Explique pourquoi ce sujet est important pour l'élève
- Présente clairement ce que l'élève va apprendre
- Utilise "tu" pour parler directement à l'élève
- Exemple: "As-tu déjà remarqué comment...?" ou "Savais-tu que...?"

📚 SECTION 2: EXPLICATION DE BASE (200-300 mots)
- Définis les concepts clés de "${lessonTopic}" en mots SIMPLES
- Donne 2-3 exemples concrets de la vie quotidienne haïtienne
- Une idée par paragraphe
- Phrases courtes: 10-15 mots maximum
- Pose des questions pour engager: "Tu vois?", "Tu comprends?"
- Utilise des comparaisons familières

💡 SECTION 3: EXEMPLES PRATIQUES (300-400 mots)
Fournis 3-4 exemples CONCRETS et DÉTAILLÉS sur "${lessonTopic}":
- Situations réelles de la vie quotidienne
- Dialogues courts et naturels
- Explications en phrases simples
Chaque exemple DOIT contenir:
1. Une situation concrète
2. Un dialogue ou texte d'exemple
3. Une explication claire du concept

🎯 SECTION 4: RÈGLES PRINCIPALES (150-200 mots)
- Liste 3-5 règles ESSENTIELLES sur "${lessonTopic}"
- Une règle = une phrase simple et claire
- Un exemple concret par règle
- Vocabulaire accessible au niveau AF7
- Pas de termes techniques compliqués

✨ SECTION 5: ASTUCES FACILES (100-150 mots)
- 3-4 trucs PRATIQUES pour maîtriser "${lessonTopic}"
- Moyens mnémotechniques simples
- Conseils pour éviter les erreurs courantes
- Techniques faciles à retenir

🔑 SECTION 6: À RETENIR (50-100 mots)
- 4-5 points ESSENTIELS à retenir sur "${lessonTopic}"
- Une phrase courte par point
- Les informations les plus importantes
- Récapitulatif clair et concis

STYLE D'ÉCRITURE OBLIGATOIRE:
- Phrases COURTES (10-15 mots maximum)
- Vocabulaire SIMPLE du quotidien
- Ton AMICAL et ENCOURAGEANT
- Exemples CONCRETS et PERTINENTS au sujet
- Interpelle l'élève: "Tu vois?", "C'est simple!", "Regarde:"
- Émojis de section: 📖 📚 💡 🎯 ✨ 🔑
- Langage adapté au contexte haïtien

⛔ À ÉVITER ABSOLUMENT:
- Parler de tes capacités ou limitations
- Phrases longues et compliquées
- Vocabulaire technique ou difficile
- Trop d'informations théoriques
- Sujets non pertinents à "${lessonTopic}"

RAPPEL CRITIQUE:
- Concentre-toi sur "${lessonTopic}" UNIQUEMENT
- 800-1000 mots de contenu ÉDUCATIF pur
- Très SIMPLE et PRATIQUE
- Niveau AF7 haïtien
- Comme un prof qui explique à son élève`;

    } else {
      systemPrompt = `Tu es Jude, un assistant IA spécialisé dans l'enseignement du français pour le niveau AF7 en Haïti (programme MENFP).

${greetingInstruction}

Tu aides les élèves avec:
- Grammaire française
- Conjugaison
- Orthographe  
- Expression écrite et orale
- Compréhension de texte

Sois encourageant, patient et utilise des exemples adaptés à la culture haïtienne.`;
    }

    // Prepare messages for Lovable AI (OpenAI-compatible format)
    const messages = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    // Add chat history if provided
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: { role: string; content: string }) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Add current message (use empty string fallback for TypeScript)
    if (message) {
      messages.push({
        role: "user",
        content: message
      });
    }

    const response = await fetch(
      'https://ai.gateway.lovable.dev/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please try again in a moment.",
            response: "Désolé, trop de demandes en cours. Réessaie dans un instant."
          }),
          { status: 429, headers: responseHeaders }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "Payment required. Please add credits to your Lovable AI workspace.",
            response: "Désolé, crédits insuffisants. Contacte ton enseignant."
          }),
          { status: 402, headers: responseHeaders }
        );
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse = data.choices?.[0]?.message?.content || 
                     "Désolé, je n'ai pas pu générer de réponse.";

    console.log('✅ AI Response received:', aiResponse.substring(0, 200));
    console.log('📊 Response length:', aiResponse.length);
    console.log('📝 Lesson type:', lessonType);

    // Don't clean up markdown for structured formats
    // Only clean if it's a general chat response
    if (!lessonType || lessonType === 'chat') {
      aiResponse = aiResponse
        .replace(/\*\*/g, '')
        .trim();
    } else {
      // Keep the formatting for activities and quiz
      aiResponse = aiResponse.trim();
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: responseHeaders, status: 200 }
    );

  } catch (error) {
    console.error('Error in francais-ai-tutor function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        response: "Désolé, une erreur s'est produite. Réessaie plus tard."
      }),
      { status: 500, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
