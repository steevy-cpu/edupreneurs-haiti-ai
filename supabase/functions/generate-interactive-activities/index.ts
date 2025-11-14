import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Utility function to strip HTML tags and convert to plain text
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')           // Convert <br> to newlines
    .replace(/<\/p>/gi, '\n\n')              // Convert </p> to double newlines
    .replace(/<\/li>/gi, '\n')               // Convert </li> to newlines
    .replace(/<[^>]*>/g, '')                 // Remove all other HTML tags
    .replace(/&nbsp;/gi, ' ')                // Replace &nbsp; with space
    .replace(/&quot;/gi, '"')                // Replace &quot; with "
    .replace(/&apos;/gi, "'")                // Replace &apos; with '
    .replace(/&amp;/gi, '&')                 // Replace &amp; with &
    .replace(/&lt;/gi, '<')                  // Replace &lt; with <
    .replace(/&gt;/gi, '>')                  // Replace &gt; with >
    .replace(/\s+/g, ' ')                    // Normalize whitespace
    .split('\n').map(line => line.trim())    // Trim each line
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

    // Detect if this is a Creole lesson
    const isCreoleLesson = subject && (subject.toLowerCase().includes('kreyol') || subject.toLowerCase().includes('créole'));
    const contentLanguage = isCreoleLesson ? 'KREYÒL AYISYEN (créole haïtien)' : 'Français';

    const systemPrompt = isCreoleLesson 
      ? `🚨🚨🚨 RÈGLE ABSOLUE: TOUT LE CONTENU DOIT ÊTRE EN KREYÒL AYISYEN (créole haïtien) - PAS EN FRANÇAIS! 🚨🚨🚨

Tu es un expert en création d'activités interactives éducatives pour des élèves haïtiens.
Ton rôle est de transformer des exercices traditionnels en activités interactives engageantes.

⛔ INTERDICTION TOTALE: NE PAS écrire en FRANÇAIS. Tout le contenu DOIT être en KREYÒL AYISYEN.

EXEMPLES DE TRADUCTION REQUIS:
- "Question" → "Kesyon"
- "Réponse correcte" → "Repons ki kòrèk"
- "Explication" → "Esplikasyon"
- "Complétez" → "Ranpli"
- "Associez" → "Asosye"
- "Vrai" → "Vre"
- "Faux" → "Fo"

RÈGLES STRICTES:
- Utilise UNIQUEMENT le KREYÒL AYISYEN (PAS de français)
- Génère AU MOINS 10-15 activités variées pour couvrir TOUS les exercices
- PRÉSERVE LE CONTENU ORIGINAL des exercices autant que possible
- Formate le contenu EXACTEMENT comme spécifié ci-dessous
- TRANSFORME TOUS les exercices fournis (Exercice 1, 2, 3, 4, 5, 6, etc.)

🔴🔴🔴 RAPPEL: TOUT DOIT ÊTRE EN KREYÒL AYISYEN!`
      : `Tu es un expert en création d'activités interactives éducatives pour des élèves haïtiens.
Ton rôle est de transformer des exercices traditionnels en activités interactives engageantes.

RÈGLES STRICTES:
- Utilise UNIQUEMENT le français
- Génère AU MOINS 10-15 activités variées pour couvrir TOUS les exercices
- PRÉSERVE LE CONTENU ORIGINAL des exercices autant que possible
- Formate le contenu EXACTEMENT comme spécifié ci-dessous
- TRANSFORME TOUS les exercices fournis (Exercice 1, 2, 3, 4, 5, 6, etc.)

IMPORTANT: Le contenu des exercices peut être en HTML ou texte brut. Tu dois:
1. Extraire le texte des exercices (ignorer toutes balises HTML)
2. Identifier les questions et leurs options (A, B, C, D ou a, b, c, d ou 1, 2, 3, 4)
3. GARDER les questions et exemples TELS QUELS - ne les modifie PAS
4. Si les réponses correctes ne sont pas explicites, déduis-les logiquement basé sur la grammaire/contexte
5. Créer des explications claires pour chaque réponse

FORMATS D'ACTIVITÉS DISPONIBLES:

1. QUIZ - Questions à choix multiples
2. MATCHING - Associer des éléments
3. TRUEFALSE - Vrai ou Faux
4. FILLIN - Remplir les blancs

DISTRIBUTION RECOMMANDÉE (pour 10-15 activités):
- 4-5 activités QUIZ
- 2-3 activités MATCHING
- 2-3 activités TRUEFALSE
- 2-4 activités FILLIN

IMPORTANT: 
- Sépare chaque activité par une ligne vide
- Commence toujours par le titre avec ###
- GARDE LE CONTENU ORIGINAL DES EXERCICES - ne change PAS les phrases, noms, ou exemples
- Ton seul rôle est de reformater en activités interactives, PAS de réécrire le contenu
- RESPECTE FIDÈLEMENT le contenu source`;

    // Strip HTML and clean the content
    const cleanedContent = stripHtml(exercisesContent);

    console.log('Original exercises length:', exercisesContent.length);
    console.log('Cleaned exercises length:', cleanedContent.length);
    console.log('First 500 chars of cleaned:', cleanedContent.substring(0, 500));

    const userPrompt = isCreoleLesson
      ? `Lesyon: "${lessonTitle}"
Nivo: ${gradeLevel}
Matyè: ${subject}

Men kontni egzèsis yo pou transfòme:

${cleanedContent}

ENSTRIKSYON KRITIK:
- TRANSFÒME (pa reekri) TOU egzèsis ki egziste yo an fòma entèaktif
- Jenere 10-15 aktivite pou kouvri TOU egzèsis yo (1, 2, 3, 4, 5, 6, elatriye)
- KENBE EGZAKTEMAN menm fraz, kesyon, ak egzanp ki nan kontni sous la
- Sèl wòl ou se pou REFÒMATE lè w ap itilize tip aktivite yo (QUIZ, MATCHING, elatriye)
- Si egzèsis la di yon bagay, aktivite ou a dwe di menm bagay la
- PA CHANJE non, fraz, oswa kontèks yo - KONSÈVE YO FIDÈLMAN
- Asire w transfòme chak egzèsis (pa sèlman 2 premye yo)
- Si repons yo pa endike, dedwi yo lojikman baze sou gramè
- Pou chak aktivite, bay yon esplikasyon klè ak pedagojik

🔴🔴🔴 SONJE: TOU DOIT ÊTRE AN KREYÒL AYISYEN!`
      : `Leçon: "${lessonTitle}"
Niveau: ${gradeLevel}
Matière: ${subject}

Voici le contenu des exercices à transformer:

${cleanedContent}

INSTRUCTIONS CRITIQUES:
- TRANSFORME (ne réécris PAS) TOUS les exercices existants en format interactif
- Génère 10-15 activités pour couvrir TOUS les exercices (1, 2, 3, 4, 5, 6, etc.)
- GARDE EXACTEMENT les mêmes phrases, questions, et exemples que dans le contenu source
- Ton seul rôle est de REFORMATER en utilisant les types d'activités (QUIZ, MATCHING, etc.)
- Si l'exercice dit "My sister _______ a beautiful voice", ton activité doit dire "My sister _______ a beautiful voice"
- Si l'exercice dit "They _______ from Gonaïves", ton activité doit dire "They _______ from Gonaïves"
- Si l'exercice dit "My uncle _______ a taxi", ton activité doit dire "My uncle _______ a taxi"
- NE CHANGE PAS les noms, phrases, ou contextes - PRÉSERVE-LES FIDÈLEMENT
- Assure-toi de transformer chaque exercice (pas seulement les 2 premiers)
- Si les réponses ne sont pas indiquées, déduis-les logiquement basé sur la grammaire
- Pour chaque activité, fournis une explication claire et pédagogique`;

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
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No content generated from Lovable AI');
    }

    console.log('Interactive activities generated successfully');

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
