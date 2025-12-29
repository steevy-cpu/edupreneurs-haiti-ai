import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Utility function to strip HTML tags and convert to plain text
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .split('\n').map(line => line.trim())
    .join('\n')
    .trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { exercisesContent, lessonTitle, gradeLevel, subject } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('📋 Request params:', { 
      lessonTitle, 
      gradeLevel, 
      subject,
      exercisesLength: exercisesContent?.length 
    });

    // Detect if this is a Creole lesson
    const subjectNormalized = (subject || '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const isCreoleLesson = subjectNormalized === 'kreyol ayisyen' || 
                           subjectNormalized === 'creole haitien' || 
                           subjectNormalized === 'kreyol' ||
                           subjectNormalized === 'creole';
    
    console.log('🔍 Creole detection:', { subject, subjectNormalized, isCreoleLesson });

    // Simplified prompt - ONLY QUIZ type with strict 4-option format
    const systemPrompt = isCreoleLesson 
      ? `🚨 RÈGLE ABSOLUE: LE CONTENU DOIT ÊTRE EN KREYÒL AYISYEN! 🚨

Tu es un expert en création de quiz éducatifs pour des élèves haïtiens.
Tu transformes des exercices en quiz à choix multiples (QCM).

FORMAT EXACT OBLIGATOIRE - RESPECTE CE FORMAT À LA LETTRE:

## Activites Interactives

**TYPE: QUIZ**

**Question 1:**
Tèks kesyon an isit la?

A) Premye opsyon
B) Dezyèm opsyon
C) Twazyèm opsyon
D) Katriyèm opsyon

**Réponse correcte: B**

**Explication:** Esplikasyon detaye an kreyòl pou ede elèv yo konprann.

---

**Question 2:**
Lòt kesyon isit la?

A) Opsyon A
B) Opsyon B
C) Opsyon C
D) Opsyon D

**Réponse correcte: A**

**Explication:** Esplikasyon an kreyòl.

---

RÈGLES CRITIQUES:
1. EXACTEMENT 4 options par question (A, B, C, D) - PAS PLUS, PAS MOINS
2. Options sur lignes séparées: "A) texte" (pas de tiret avant!)
3. Génère 10-15 questions minimum
4. Sépare les questions avec "---"
5. Réponse au format: "**Réponse correcte: X**" (X = A, B, C ou D)
6. Explication au format: "**Explication:** texte"
7. TOUT le contenu en KREYÒL AYISYEN`
      : `Tu es un expert en création de quiz éducatifs pour des élèves haïtiens.
Tu transformes des exercices en quiz à choix multiples (QCM).

FORMAT EXACT OBLIGATOIRE - RESPECTE CE FORMAT À LA LETTRE:

## Activites Interactives

**TYPE: QUIZ**

**Question 1:**
Texte de la question ici?

A) Première option
B) Deuxième option
C) Troisième option
D) Quatrième option

**Réponse correcte: B**

**Explication:** Explication pédagogique détaillée en français pour aider l'élève.

---

**Question 2:**
Autre question ici?

A) Option A
B) Option B
C) Option C
D) Option D

**Réponse correcte: A**

**Explication:** Explication en français.

---

RÈGLES CRITIQUES:
1. EXACTEMENT 4 options par question (A, B, C, D) - PAS PLUS, PAS MOINS
2. Options sur lignes séparées: "A) texte" (pas de tiret avant!)
3. Génère 10-15 questions minimum
4. Sépare les questions avec "---"
5. Réponse au format: "**Réponse correcte: X**" (X = A, B, C ou D)
6. Explication au format: "**Explication:** texte"
7. Tout en FRANÇAIS`;

    const cleanedContent = stripHtml(exercisesContent);

    console.log('Original exercises length:', exercisesContent.length);
    console.log('Cleaned exercises length:', cleanedContent.length);

    const userPrompt = isCreoleLesson
      ? `Lesyon: "${lessonTitle}"
Nivo: ${gradeLevel}
Matyè: ${subject}

Men kontni egzèsis yo pou transfòme an QCM:

${cleanedContent}

ENSTRIKSYON KRITIK:
- Jenere 10-15 kesyon QCM diferan
- CHAK kesyon dwe gen EGZAKTEMAN 4 opsyon (A, B, C, D)
- Opsyon yo dwe sou liy separe: "A) tèks" (pa gen tirè anvan!)
- Separe kesyon yo ak "---"
- Bay yon esplikasyon klè pou chak repons
- TOU KONTNI AN KREYÒL AYISYEN!`
      : `Leçon: "${lessonTitle}"
Niveau: ${gradeLevel}
Matière: ${subject}

Voici le contenu des exercices à transformer en QCM:

${cleanedContent}

INSTRUCTIONS CRITIQUES:
- Génère 10-15 questions QCM différentes
- CHAQUE question doit avoir EXACTEMENT 4 options (A, B, C, D)
- Les options doivent être sur des lignes séparées: "A) texte" (pas de tiret avant!)
- Sépare les questions avec "---"
- Fournis une explication claire pour chaque réponse
- TOUT EN FRANÇAIS`;

    console.log('Generating interactive activities with Lovable AI...');

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
      const errorText = await response.text();
      console.error('Lovable AI API error:', response.status, errorText);
      throw new Error(`Lovable AI API error: ${response.status}`);
    }

    const data = await response.json();
    let generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated from Lovable AI');
    }

    // Post-process: normalize option format (remove any leading dashes)
    generatedContent = generatedContent
      .replace(/^-\s*([A-D]\))/gm, '$1')  // Remove leading dashes before options
      .replace(/^\*\s*([A-D]\))/gm, '$1') // Remove leading asterisks before options
      .replace(/^([A-D])\.\s*/gm, '$1) ') // Convert A. to A)
      .replace(/^([A-D]):\s*/gm, '$1) '); // Convert A: to A)

    console.log('Interactive activities generated successfully');
    console.log('First 500 chars:', generatedContent.substring(0, 500));

    return new Response(
      JSON.stringify({ 
        content: generatedContent,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-interactive-activities:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
