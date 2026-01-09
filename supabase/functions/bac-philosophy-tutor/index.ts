/**
 * Security-Hardened: Bac Philosophy Tutor
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

interface DissertationStep {
  step:
    | "choosing_subject"
    | "introduction"
    | "development_1"
    | "development_2"
    | "development_3"
    | "conclusion"
    | "review";
  label: string;
}

const DISSERTATION_STEPS: DissertationStep[] = [
  { step: "choosing_subject", label: "Choix du sujet" },
  { step: "introduction", label: "Introduction" },
  { step: "development_1", label: "Développement I" },
  { step: "development_2", label: "Développement II" },
  { step: "development_3", label: "Développement III" },
  { step: "conclusion", label: "Conclusion" },
  { step: "review", label: "Révision finale" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
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
      console.warn(`Rate limit exceeded for bac-philosophy-tutor from IP ${clientIp}`);
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

    const {
      subjects, // Array of 3 dissertation subjects
      userMessage,
      conversationHistory,
      currentStep,
      studentText,
      chosenSubjectIndex,
    } = validation.data;

    console.log("Bac Philosophy tutor request:", { currentStep, userMessage: userMessage?.substring(0, 50) });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build the subjects section
    let subjectsSection = "";
    if (subjects && Array.isArray(subjects) && subjects.length > 0) {
      subjectsSection = `\n\n**SUJETS DE DISSERTATION PROPOSÉS:**\n`;
      subjects.forEach((subject: string, idx: number) => {
        subjectsSection += `${idx + 1}. "${subject}"\n`;
      });
    }

    // Get current step info
    const currentStepInfo = DISSERTATION_STEPS.find((s) => s.step === currentStep) || DISSERTATION_STEPS[0];
    const stepIndex = DISSERTATION_STEPS.findIndex((s) => s.step === currentStep);
    const nextStep = stepIndex < DISSERTATION_STEPS.length - 1 ? DISSERTATION_STEPS[stepIndex + 1] : null;

    // Build specialized system prompt
    const systemPrompt = `Tu es Jude, un professeur de philosophie haïtien expert en préparation au Baccalauréat NS4.
${subjectsSection}
**MÉTHODOLOGIE DE LA DISSERTATION PHILOSOPHIQUE (4 heures, 20 points)**

## STRUCTURE ATTENDUE

### 1. INTRODUCTION (4 points)
- **Accroche** : Citation d'un philosophe, exemple concret, question rhétorique ou fait d'actualité
- **Définition des termes** : Expliquer les concepts clés du sujet de manière précise
- **Problématique** : Question centrale claire qui guide toute la réflexion
- **Annonce du plan** : Présenter les 3 parties de manière fluide

### 2. DÉVELOPPEMENT (12 points - 4 points par partie)
- **Partie I - Thèse** : Premier point de vue avec 2-3 arguments + exemples
- **Partie II - Antithèse** : Point de vue opposé ou nuance avec 2-3 arguments + exemples
- **Partie III - Synthèse** : Dépassement du problème, réconciliation ou nouvelle perspective
- **Transitions** : Phrases de liaison fluides entre les parties

### 3. CONCLUSION (4 points)
- **Synthèse** : Résumé des arguments principaux
- **Réponse** : Réponse claire à la problématique posée
- **Ouverture** : Question ou perspective nouvelle pour élargir la réflexion

## BARÈME DÉTAILLÉ
- Problématique pertinente et claire : /4
- Arguments logiques et structurés : /6
- Exemples concrets et philosophiques : /4
- Cohérence de la conclusion : /4
- Expression écrite et style : /2

## PHILOSOPHES À CITER (selon le sujet)
- **Liberté** : Sartre, Kant, Rousseau, Spinoza
- **Vérité** : Platon, Descartes, Nietzsche, Popper
- **Justice** : Aristote, Rawls, Platon
- **Bonheur** : Aristote, Épicure, Mill, Kant
- **Conscience** : Descartes, Freud, Husserl
- **Devoir** : Kant, Mill, Sartre

## TON RÔLE ACTUEL
Tu guides l'élève à l'étape: **${currentStepInfo.label}**
${chosenSubjectIndex !== undefined ? `\nSujet choisi: "${subjects?.[chosenSubjectIndex] || "Non défini"}"` : ""}

**INSTRUCTIONS:**
1. **Ne te présente JAMAIS** - commence directement par ta réponse
2. **Sois encourageant** mais exigeant sur la qualité
3. **Donne des feedbacks précis** sur ce qui est bien et ce qui peut être amélioré
4. **Propose des exemples** tirés de la réalité haïtienne quand c'est pertinent
5. **Estime un score** pour chaque partie soumise
6. **Guide vers l'étape suivante** une fois la partie validée

${
  currentStep === "choosing_subject"
    ? `
**ACTION:** L'élève doit choisir un des 3 sujets. Explique brièvement chaque sujet et demande lequel il préfère.
`
    : ""
}

${
  currentStep === "introduction"
    ? `
**ACTION:** Guide l'élève pour rédiger son introduction:
1. Propose une accroche possible
2. Aide à définir les termes clés
3. Formule la problématique ensemble
4. Structure l'annonce du plan
`
    : ""
}

${
  currentStep && currentStep.startsWith("development_")
    ? `
**ACTION:** Guide le développement:
1. Vérifie que l'argument est clair
2. Demande des exemples concrets
3. Aide à formuler la transition
`
    : ""
}

${
  currentStep === "conclusion"
    ? `
**ACTION:** Guide la conclusion:
1. Synthétise les points essentiels
2. Formule une réponse claire
3. Propose une ouverture pertinente
`
    : ""
}

${
  currentStep === "review"
    ? `
**ACTION:** Révision finale:
1. Relis l'ensemble du travail
2. Donne une note estimée sur 20
3. Liste 3 points forts et 3 axes d'amélioration
`
    : ""
}

${studentText ? `\n**TEXTE SOUMIS PAR L'ÉLÈVE:**\n"${studentText}"\n` : ""}`;

    // Build messages array
    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.message_role === "user" ? "user" : "assistant",
        content: msg.message_content,
      })),
      { role: "user", content: userMessage || "Guidez-moi" },
    ];

    // Call Lovable AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte, veuillez réessayer dans quelques instants." }),
          { status: 429, headers: responseHeaders }
        );
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits insuffisants. Veuillez recharger votre compte." }), {
          status: 402,
          headers: responseHeaders,
        });
      }
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const ericResponse = data.choices[0].message.content;

    // Determine if we should suggest moving to next step
    const suggestNextStep =
      ericResponse.toLowerCase().includes("passons") ||
      ericResponse.toLowerCase().includes("continue") ||
      ericResponse.toLowerCase().includes("bravo") ||
      ericResponse.toLowerCase().includes("excellent");

    return new Response(
      JSON.stringify({
        response: ericResponse,
        currentStep,
        nextStep: nextStep?.step || null,
        nextStepLabel: nextStep?.label || null,
        suggestNextStep,
        dissertationSteps: DISSERTATION_STEPS,
      }),
      { headers: responseHeaders }
    );
  } catch (error) {
    console.error("Error in bac-philosophy-tutor function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' },
    });
  }
});
