const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  lessonId: string;
  sectionName: 'objectif' | 'introduction' | 'contenu' | 'exemples_exercices';
  lessonTitle: string;
  subject: string;
  gradeLevel: string;
  targetWords: number;
  context?: string;
  currentContent?: string;
}

const SECTION_CONFIGS = {
  objectif: {
    minWords: 150,
    maxWords: 250,
    instructions: `3-5 objectifs mesurables avec verbes d'action (comprendre, analyser, identifier, etc.)
- Format: Liste numérotée avec émojis 🎯
- Commencer par: "À la fin de cette leçon, tu seras capable de..."
- Contextualiser pour les élèves haïtiens
- ESPACEMENT: Ajouter <br/> entre chaque objectif pour meilleure lisibilité`,
  },
  introduction: {
    minWords: 250,
    maxWords: 350,
    instructions: `Accroche captivante (question ou situation du quotidien haïtien)
- 2-3 paragraphes de mise en contexte avec <p> séparés
- Pourquoi c'est important pour l'élève
- Ce qu'on va apprendre
- Encadrés colorés avec émojis (💡 Le savais-tu ?, 🇭🇹 Exemple Haïtien)
- IMPORTANT: NE PAS répéter les objectifs - ils sont dans la section dédiée
- ESPACEMENT: Utiliser des paragraphes distincts, ne pas créer de gros blocs de texte`,
  },
  contenu: {
    minWords: 800,
    maxWords: 1200,
    instructions: `5-7 sections principales avec <h3>
- Explications progressives et claires adaptées au niveau
- 2-3 encadrés "💡 Le savais-tu ?" avec anecdotes haïtiennes
- Listes structurées, tableaux si pertinent
- Vocabulaire clé avec définitions
- Exemples concrets du contexte haïtien (décrits en français)
- IMPORTANT: NE PAS créer de section objectifs - ils sont dans la section dédiée
- ESPACEMENT: Ajouter <br/> ou des paragraphes entre les sections, éviter les blocs de texte denses`,
  },
  exemples_exercices: {
    minWords: 400,
    maxWords: 700,
    instructions: `4-5 exemples détaillés avec contexte haïtien (encadrés bleus 🇭🇹)
- 8-10 exercices VARIÉS:
  * QCM (5 questions, 4 choix chacune)
  * Vrai/Faux (5 affirmations)
  * Correspondance/Appariement (5-8 paires)
  * Questions de réflexion ouvertes (3-4)
  * Étude de cas haïtien
  * Activité pratique (observation, enquête, création)
- Format structuré avec numérotation claire
- CRITIQUE: NE PAS utiliser le créole/kreyòl dans les exemples et exercices - utiliser uniquement le FRANÇAIS
- CRITIQUE: NE PAS créer de section objectifs - ils sont dans la section dédiée
- Les contextes haïtiens doivent être décrits en français
- ESPACEMENT CRITIQUE: Ajouter <br/><br/> entre CHAQUE exercice, utiliser des listes <ul> ou <ol>, séparer visuellement les sections d'exercices`,
  },
};

const SUBJECT_ADDITIONS: Record<string, string> = {
  'mathematiques': 'Utiliser des formules mathématiques, étapes détaillées, graphiques. Problèmes avec solutions étape par étape.',
  'mathématiques': 'Utiliser des formules mathématiques, étapes détaillées, graphiques. Problèmes avec solutions étape par étape.',
  'sciences': 'Décrire des expériences, observations, phénomènes naturels haïtiens. Proposer des expériences simples avec matériel local.',
  'sciences-experimentales': 'Décrire des expériences, observations, phénomènes naturels haïtiens. Proposer des expériences simples avec matériel local.',
  'francais': 'Utiliser des extraits de textes haïtiens, règles de grammaire, conjugaisons. Exercices de conjugaison, rédaction, compréhension.',
  'français': 'Utiliser des extraits de textes haïtiens, règles de grammaire, conjugaisons. Exercices de conjugaison, rédaction, compréhension.',
  'anglais': 'Vocabulaire thématique, structures grammaticales, dialogues pratiques. Exercices de conversation et traduction.',
  'espagnol': 'Vocabulaire, conjugaisons, expressions idiomatiques, comparaisons créole-espagnol. Dialogues et exercices pratiques.',
  'sciences-sociales': 'Utiliser des cartes, chronologies, documents historiques haïtiens. Analyses de documents et études de cas.',
  'kreyol': 'Structures grammaticales créoles, expressions idiomatiques, comparaisons avec le français. Exemples de la vie quotidienne haïtienne.',
  'créole': 'Structures grammaticales créoles, expressions idiomatiques, comparaisons avec le français. Exemples de la vie quotidienne haïtienne.',
};

const HTML_TEMPLATES = {
  didYouKnowBox: '<div class="bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-yellow-500 p-4 mb-4 rounded-lg"><h4 class="font-semibold text-yellow-700 dark:text-yellow-300 mb-2 flex items-center gap-2">💡 Le savais-tu ?</h4><p class="text-gray-700 dark:text-gray-300">{{content}}</p></div>',
  haitianExampleBox: '<div class="bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500 p-4 mb-4 rounded-lg"><h4 class="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">🇭🇹 Exemple Haïtien</h4><p class="text-gray-700 dark:text-gray-300">{{content}}</p></div>',
  exerciseBox: '<div class="bg-purple-50 dark:bg-purple-950/30 border-l-4 border-purple-500 p-4 mb-4 rounded-lg"><h4 class="font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">✏️ Exercice</h4><div class="text-gray-700 dark:text-gray-300">{{content}}</div></div>',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const body: GenerateRequest = await req.json();
    const { 
      lessonId, 
      sectionName, 
      lessonTitle, 
      subject, 
      gradeLevel, 
      targetWords, 
      context, 
      currentContent 
    } = body;

    console.log('📚 Generating section:', { lessonId, sectionName, lessonTitle, subject, gradeLevel });

    const config = SECTION_CONFIGS[sectionName];
    const subjectAddition = subject ? (SUBJECT_ADDITIONS[subject.toLowerCase()] || '') : '';
    
    // Detect if this is a Creole lesson - ONLY for "Kreyòl Ayisyen" subject
    // NOT if it's just mentioned in context (like Sciences Expérimentales teaching in Haiti)
    const subjectNormalized = (subject || '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const isCreoleLesson = subjectNormalized === 'kreyol ayisyen' || 
                           subjectNormalized === 'creole haitien' || 
                           subjectNormalized === 'kreyol' ||
                           subjectNormalized === 'creole';
    
    const contentLanguage = isCreoleLesson ? 'KREYÒL AYISYEN (créole haïtien)' : 'FRANÇAIS';
    const languageInstruction = isCreoleLesson 
      ? 'Le contenu DOIT être écrit en KREYÒL AYISYEN (créole haïtien) standard. Utilise la langue créole naturellement et de manière fluide.'
      : 'Le contenu doit être écrit en français standard adapté au niveau';

    const systemPrompt = isCreoleLesson
      ? `🚨🚨🚨 RÈGLE ABSOLUE #1: TOUT LE CONTENU DOIT ÊTRE EN KREYÒL AYISYEN (créole haïtien) 🚨🚨🚨

Tu es un expert pédagogue haïtien créant du contenu éducatif EXCLUSIVEMENT EN KREYÒL AYISYEN pour ${subject} niveau ${gradeLevel}.

⛔ INTERDICTION TOTALE: NE PAS écrire en FRANÇAIS. Tout le contenu DOIT être en KREYÒL AYISYEN.

EXEMPLES DE CE QUI EST ATTENDU:
- "Objectif" → "Objektif" 
- "Introduction" → "Entwodiksyon"
- "Contenu" → "Kontni"
- "Exercice" → "Egzèsis"
- "Bienvenue" → "Byenveni"
- "Aujourd'hui" → "Jodi a"
- "La lecture est importante" → "Lekti enpòtan"
- "Tu vas apprendre" → "Ou pral aprann"

SECTION À GÉNÉRER: ${sectionName}

PRINCIPES FONDAMENTAUX:
- 🔴 LANGUE: KREYÒL AYISYEN SEULEMENT - PAS UN MOT EN FRANÇAIS
- Contextualisation MAXIMALE avec exemples haïtiens (décrits en créole haïtien)
- Format: HTML avec classes Tailwind (compatible dark/light mode)  
- Longueur cible: ${targetWords} mots (minimum: ${config.minWords}, maximum: ${config.maxWords})
- CRITIQUE: NE JAMAIS créer de section "Objectifs" dans ${sectionName} - les objectifs ont leur propre section dédiée`
      : `Tu es un expert pédagogue haïtien créant du contenu éducatif pour ${subject} niveau ${gradeLevel}.

SECTION À GÉNÉRER: ${sectionName}

PRINCIPES FONDAMENTAUX:
- 🔴 LANGUE: FRANÇAIS SEULEMENT - Tout le contenu DOIT être en FRANÇAIS
- Contextualisation MAXIMALE avec exemples haïtiens (décrits en français)
- Format: HTML avec classes Tailwind (compatible dark/light mode)  
- Longueur cible: ${targetWords} mots (minimum: ${config.minWords}, maximum: ${config.maxWords})
- CRITIQUE: NE JAMAIS créer de section "Objectifs" dans ${sectionName} - les objectifs ont leur propre section dédiée

RÈGLES DE FORMATAGE STRICTES:
- JAMAIS utiliser de blocs de code markdown (pas de \`\`\`)
- TOUJOURS aérer le contenu avec des espaces, <br/>, et paragraphes séparés
- ÉVITER les gros blocs de texte sans respiration
- Utiliser des listes <ul> ou <ol> quand approprié
- Séparer visuellement les différentes parties

INSTRUCTIONS SPÉCIFIQUES POUR ${sectionName.toUpperCase()}:
${config.instructions}

${subjectAddition ? `SPÉCIFICITÉS DE LA MATIÈRE ${subject.toUpperCase()}:\n${subjectAddition}` : ''}

FORMATS HTML À UTILISER:
${Object.entries(HTML_TEMPLATES).map(([key, template]) => `${key}: ${template}`).join('\n')}

IMPORTANT:
- Utilise des émojis pertinents
- ${isCreoleLesson ? '🔴 TOUT EN KREYÒL AYISYEN - chaque mot, chaque phrase, chaque titre' : 'Tous les textes en français'}
- Maximum de références haïtiennes/caribéennes
- Structure claire et progressive avec BEAUCOUP d'espacement
- Vocabulaire adapté au niveau ${gradeLevel}
- NE PAS utiliser de marqueurs de code comme \`\`\` dans le résultat
${isCreoleLesson ? '\n🔴🔴🔴 VÉRIFICATION FINALE OBLIGATOIRE: Relis ton contenu et assure-toi que TOUT est en KREYÒL AYISYEN, pas en français' : ''}`;

    const userPrompt = isCreoleLesson 
      ? `🚨 RAPPEL: Tout le contenu doit être en KREYÒL AYISYEN (créole haïtien), PAS en français.

Jenere kontni pou {{section_name}} selon {{lesson_topic}} pou {{student_grade}} avèk omwen {{words_count}} mo.

Variables:
- {{section_name}}: ${sectionName}
- {{lesson_topic}}: "${lessonTitle}"
- {{student_grade}}: ${gradeLevel}
- {{words_count}}: ${targetWords}

${context ? `Instructions additionnelles: ${context}` : ''}
${currentContent ? `\nKontni aktyèl pou amelyore:\n${currentContent}\n\nJenere yon VÈSYON AMELYORE ki kenbe bon pati yo.` : ''}

KRITIK - RÈG DE FORMATAGE:
1. Reponn SÈLMAN avèk HTML pur pou afiche - PA gen tèks eksplikatif avan oswa apre
2. Pa janm itilize blok kòd markdown tankou \`\`\`html oswa \`\`\`
3. Pa janm mete HTML ant gimet oswa baliz <code>
4. Kòmanse dirèkteman avèk baliz HTML (<div>, <h3>, <p>, etc.)
5. HTML la dwe ka mete dirèkteman nan yon paj wèb

EGZANP SA NOU VLE:
<div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-4 mb-4 rounded-lg">
  <h4 class="font-semibold text-blue-700 dark:text-blue-300 mb-2">🎯 Objektif</h4>
  <p class="text-gray-700 dark:text-gray-300">Nan fen leson sa a, ou pral kapab:</p>
  <ol class="list-decimal list-inside mt-2 space-y-1">
    <li>Objektif 1</li>
    <li>Objektif 2</li>
  </ol>
</div>

🔴🔴🔴 DERNIÈRE VÉRIFICATION: Écris TOUT en KREYÒL AYISYEN (créole haïtien) - pa gen okenn mo an franse!

KÒMANSE KONTNI OU LA (dirèkteman avèk premye baliz HTML):` 
      : `Génère le contenu pour {{section_name}} selon {{lesson_topic}} pour {{student_grade}} avec au moins {{words_count}} mots.

Variables:
- {{section_name}}: ${sectionName}
- {{lesson_topic}}: "${lessonTitle}"
- {{student_grade}}: ${gradeLevel}
- {{words_count}}: ${targetWords}

${context ? `Instructions additionnelles: ${context}` : ''}
${currentContent ? `\nContenu actuel à améliorer:\n${currentContent}\n\nGénère une VERSION AMÉLIORÉE en gardant les bonnes parties.` : ''}

CRITIQUES - RÈGLES DE FORMATAGE:
1. Réponds UNIQUEMENT avec le HTML pur à afficher - PAS de texte explicatif avant ou après
2. N'utilise JAMAIS de blocs de code markdown comme \`\`\`html ou \`\`\`
3. Ne mets JAMAIS le HTML entre guillemets ou balises <code>
4. Commence directement par les balises HTML (<div>, <h3>, <p>, etc.)
5. Le HTML doit être directement insérable dans une page web

EXEMPLE DE CE QU'ON VEUT:
<div class="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 p-4 mb-4 rounded-lg">
  <h4 class="font-semibold text-blue-700 dark:text-blue-300 mb-2">🎯 Objectif</h4>
  <p class="text-gray-700 dark:text-gray-300">À la fin de cette leçon, tu seras capable de :</p>
  <ol class="list-decimal list-inside mt-2 space-y-1">
    <li>Objectif 1</li>
    <li>Objectif 2</li>
  </ol>
</div>

COMMENCE TON CONTENU ICI (directement par la première balise HTML):`;


    const startTime = Date.now();

    console.log('🔵 Calling Lovable AI API...');
    
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
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    console.log('🔵 AI API response status:', response.status);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded',
          message: 'Trop de requêtes. Veuillez attendre quelques secondes.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'Payment required',
          message: 'Crédits Lovable AI épuisés. Veuillez recharger votre compte.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    let generatedContent = data.choices?.[0]?.message?.content || '';

    if (!generatedContent || generatedContent.trim().length < 50) {
      throw new Error('Contenu généré trop court ou vide');
    }

    // Clean up the generated content
    // Remove markdown code blocks if present
    generatedContent = generatedContent.replace(/```html\s*/g, '').replace(/```\s*/g, '');
    // Remove leading/trailing whitespace
    generatedContent = generatedContent.trim();
    // Remove any text before the first HTML tag
    const firstTagIndex = generatedContent.search(/<[a-zA-Z]/);
    if (firstTagIndex > 0) {
      generatedContent = generatedContent.substring(firstTagIndex);
    }

    // Validation: check for unreplaced placeholders
    if (/\{\{.*?\}\}|\[.*?\]/.test(generatedContent)) {
      console.warn('⚠️ Content contains unreplaced placeholders');
    }

    const generationTime = Date.now() - startTime;
    const wordCount = generatedContent.split(/\s+/).length;

    console.log('✅ Generation successful:', { 
      sectionName, 
      wordCount, 
      generationTime: `${generationTime}ms` 
    });

    return new Response(JSON.stringify({ 
      content: generatedContent,
      wordCount,
      generationTimeMs: generationTime,
      sectionName,
      lessonId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Generation error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Erreur lors de la génération du contenu',
      details: error instanceof Error ? error.stack : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
