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

    // Updated prompt - QUIZ + TRUE_FALSE types
    const systemPrompt = isCreoleLesson 
      ? `🚨 RÈGLE ABSOLUE: LE CONTENU DOIT ÊTRE EN KREYÒL AYISYEN! 🚨

Tu es un expert en création d'activités éducatives interactives pour des élèves haïtiens.
Tu transformes des exercices en un mélange de:
1. Quiz à choix multiples (QCM)
2. Questions Vrai/Faux

⚠️ VÉRIFICATION D'EXACTITUDE OBLIGATOIRE - TRÈS IMPORTANT:
- VÉRIFIE chaque fait linguistique AVANT de l'inclure
- En créole haïtien: les adjectifs se placent généralement APRÈS le nom (ex: "kay bèl" = belle maison, "moun gran" = grande personne)
- C'est DIFFÉRENT de l'anglais où les adjectifs sont AVANT le nom
- NE JAMAIS inventer de règles grammaticales
- En cas de doute sur un fait, NE PAS l'inclure
- Chaque réponse VRAI/FAUX doit être 100% correcte

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

**TYPE: TRUE_FALSE**

**Affirmation 1:**
Solèy la se yon zetwal.

**Réponse: VRAI**

**Explication:** Solèy la se vrèman yon zetwal, li se zetwal ki pi pre Latè.

---

**Affirmation 2:**
Dlo bouyi a 50 degre Celsius.

**Réponse: FAUX**

**Explication:** Dlo bouyi a 100 degre Celsius nan nivo lanmè.

---

RÈGLES CRITIQUES:
1. Pour QUIZ: EXACTEMENT 4 options par question (A, B, C, D) - PAS PLUS, PAS MOINS
2. TOUJOURS lister les options dans l'ordre A, B, C, D - JAMAIS dans un autre ordre!
3. Placer la bonne réponse aléatoirement parmi A, B, C, ou D (pa toujou A!)
4. Pour TRUE_FALSE: Une affirmation claire, réponse VRAI ou FAUX uniquement
5. Options sur lignes séparées: "A) texte" (pas de tiret avant!)
6. Génère 8-10 questions QUIZ + 5-7 affirmations TRUE_FALSE
7. Sépare les questions/affirmations avec "---"
8. Réponse QUIZ: "**Réponse correcte: X**" (X = A, B, C ou D)
9. Réponse TRUE_FALSE: "**Réponse: VRAI**" ou "**Réponse: FAUX**"
10. Explication au format: "**Explication:** texte"
11. TOUT le contenu en KREYÒL AYISYEN
12. VÉRIFIE L'EXACTITUDE DE CHAQUE RÉPONSE - ne génère que des faits vérifiés!`
      : `Tu es un expert en création d'activités éducatives interactives pour des élèves haïtiens.
Tu transformes des exercices en un mélange de:
1. Quiz à choix multiples (QCM)
2. Questions Vrai/Faux

⚠️ VÉRIFICATION D'EXACTITUDE OBLIGATOIRE:
- VÉRIFIE chaque fait AVANT de l'inclure
- Pour les langues (créole, français, anglais): vérifie la grammaire et syntaxe
- En créole haïtien: les adjectifs se placent généralement APRÈS le nom (ex: "kay bèl" = belle maison)
- NE JAMAIS inventer de règles grammaticales ou linguistiques
- En cas de doute sur un fait, NE PAS l'inclure

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

**TYPE: TRUE_FALSE**

**Affirmation 1:**
Le soleil est une étoile.

**Réponse: VRAI**

**Explication:** Le soleil est effectivement une étoile de type naine jaune, c'est l'étoile la plus proche de la Terre.

---

**Affirmation 2:**
L'eau bout à 50 degrés Celsius.

**Réponse: FAUX**

**Explication:** L'eau bout à 100 degrés Celsius au niveau de la mer, pas à 50 degrés.

---

RÈGLES CRITIQUES:
1. Pour QUIZ: EXACTEMENT 4 options par question (A, B, C, D) - PAS PLUS, PAS MOINS
2. TOUJOURS lister les options dans l'ordre A, B, C, D - JAMAIS dans un autre ordre!
3. Placer la bonne réponse aléatoirement parmi A, B, C, ou D (pas toujours A!)
4. Pour TRUE_FALSE: Une affirmation claire, réponse VRAI ou FAUX uniquement
5. Options sur lignes séparées: "A) texte" (pas de tiret avant!)
6. Génère 8-10 questions QUIZ + 5-7 affirmations TRUE_FALSE
7. Sépare les questions/affirmations avec "---"
8. Réponse QUIZ: "**Réponse correcte: X**" (X = A, B, C ou D)
9. Réponse TRUE_FALSE: "**Réponse: VRAI**" ou "**Réponse: FAUX**"
10. Explication au format: "**Explication:** texte"
11. Tout en FRANÇAIS
12. VÉRIFIE L'EXACTITUDE DE CHAQUE RÉPONSE - ne génère que des faits vérifiés!`;

    const cleanedContent = stripHtml(exercisesContent);

    console.log('Original exercises length:', exercisesContent.length);
    console.log('Cleaned exercises length:', cleanedContent.length);

    const userPrompt = isCreoleLesson
      ? `Lesyon: "${lessonTitle}"
Nivo: ${gradeLevel}
Matyè: ${subject}

Men kontni egzèsis yo pou transfòme an aktivite entèaktif:

${cleanedContent}

ENSTRIKSYON KRITIK:
- Jenere 8-10 kesyon QUIZ (QCM ak 4 opsyon A, B, C, D)
- Jenere 5-7 afimasyon TRUE_FALSE (Vrai/Faux)
- Opsyon yo dwe sou liy separe: "A) tèks" (pa gen tirè anvan!)
- Separe kesyon/afimasyon yo ak "---"
- Bay yon esplikasyon klè pou chak repons
- TOU KONTNI AN KREYÒL AYISYEN!`
      : `Leçon: "${lessonTitle}"
Niveau: ${gradeLevel}
Matière: ${subject}

Voici le contenu des exercices à transformer en activités interactives:

${cleanedContent}

INSTRUCTIONS CRITIQUES:
- Génère 8-10 questions QUIZ (QCM avec 4 options A, B, C, D)
- Génère 5-7 affirmations TRUE_FALSE (Vrai/Faux)
- Les options doivent être sur des lignes séparées: "A) texte" (pas de tiret avant!)
- Sépare les questions/affirmations avec "---"
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

    // POST-PROCESS QUIZ QUESTIONS: Shuffle options and randomize correct answer position
    generatedContent = shuffleQuizOptions(generatedContent);

    console.log('Interactive activities generated and shuffled successfully');
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

// Function to shuffle quiz options and update correct answer
function shuffleQuizOptions(content: string): string {
  // Split content into QUIZ and TRUE_FALSE sections
  const parts = content.split(/(\*\*TYPE:\s*(?:TRUE_FALSE|TRUEFALSE)\*\*)/i);
  
  let result = '';
  let inTrueFalseSection = false;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (/\*\*TYPE:\s*(?:TRUE_FALSE|TRUEFALSE)\*\*/i.test(part)) {
      inTrueFalseSection = true;
      result += part;
      continue;
    }
    
    if (inTrueFalseSection) {
      // Don't shuffle TRUE_FALSE sections
      result += part;
      continue;
    }
    
    // Process QUIZ questions in this part
    result += shuffleQuizQuestionsInSection(part);
  }
  
  return result;
}

function shuffleQuizQuestionsInSection(section: string): string {
  // Match each question block: from **Question X:** to the next **Question or ---
  const questionPattern = /(\*\*Question\s*\d*:?\*\*\s*\n?[^\n]+\n\n?)((?:[A-D]\)\s*[^\n]+\n?)+)(\n?\*\*Réponse\s+correcte:?\s*\**\s*([A-D])\s*\**)/gi;
  
  return section.replace(questionPattern, (match, questionPart, optionsPart, answerPart, correctLetter) => {
    console.log('🔀 Shuffling question, original correct:', correctLetter);
    
    // Parse options
    const optionMatches = [...optionsPart.matchAll(/([A-D])\)\s*([^\n]+)/gi)];
    if (optionMatches.length !== 4) {
      console.log('⚠️ Not exactly 4 options, skipping shuffle');
      return match; // Don't shuffle if we don't have exactly 4 options
    }
    
    const options: { letter: string; text: string }[] = optionMatches.map(m => ({
      letter: m[1].toUpperCase(),
      text: m[2].trim()
    }));
    
    // Find the correct answer text
    const correctIndex = correctLetter.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    const correctText = options[correctIndex]?.text;
    
    if (!correctText) {
      console.log('⚠️ Could not find correct answer text');
      return match;
    }
    
    // Fisher-Yates shuffle
    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Find new position of correct answer
    const newCorrectIndex = shuffled.findIndex(opt => opt.text === correctText);
    const newCorrectLetter = String.fromCharCode('A'.charCodeAt(0) + newCorrectIndex);
    
    console.log('🔀 After shuffle, new correct:', newCorrectLetter);
    
    // Rebuild options block
    const newOptionsPart = shuffled.map((opt, idx) => {
      const letter = String.fromCharCode('A'.charCodeAt(0) + idx);
      return `${letter}) ${opt.text}`;
    }).join('\n') + '\n';
    
    // Rebuild answer part
    const newAnswerPart = `\n**Réponse correcte: ${newCorrectLetter}**`;
    
    return questionPart + newOptionsPart + newAnswerPart;
  });
}
