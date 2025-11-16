import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  curriculumText: string;
  subjectName: string;
  gradeLevel: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { curriculumText, subjectName, gradeLevel }: RequestBody = await req.json();
    
    if (!curriculumText || curriculumText.trim().length < 100) {
      throw new Error("Curriculum text is too short or empty (minimum 100 characters)");
    }

    if (!subjectName || !gradeLevel) {
      throw new Error("Subject name and grade level are required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }
    
    const systemPrompt = `Tu es un expert analyseur de programmes scolaires haïtiens du MENFP (Ministère de l'Éducation Nationale et de la Formation Professionnelle).

Ton rôle est d'analyser le texte du programme scolaire fourni et d'en extraire une structure de leçons organisée et détaillée.

STRUCTURE REQUISE:
Chaque leçon doit contenir:
- title: Titre clair et descriptif de la leçon
- objectif: Objectif pédagogique spécifique (ce que l'élève doit apprendre)
- mois: Mois suggéré pour cette leçon (Septembre, Octobre, Novembre, Décembre, Janvier, Février, Mars, Avril, Mai, Juin)
- order_index: Numéro d'ordre (1, 2, 3, etc.)
- keywords: Liste de 3-5 mots-clés importants pour cette leçon

IMPORTANT - SECTIONS DE CONTENU:
Les leçons que tu crées seront utilisées avec un système de génération IA qui créera automatiquement ces sections:
1. introduction: Introduction engageante à la leçon
2. contenu: Contenu principal détaillé avec explications
3. exemples_exercices: Exemples concrets et exercices pratiques
4. activites_interactives: Activités interactives et ludiques
5. quiz_final: Quiz d'évaluation final

Tu n'as PAS besoin de générer ces sections maintenant, mais assure-toi que les objectifs et titres permettront une bonne génération ultérieure.

DISTRIBUTION MENSUELLE:
- Septembre-Octobre: Leçons d'introduction et bases
- Novembre-Décembre: Développement des compétences
- Janvier-Février: Approfondissement
- Mars-Avril: Applications pratiques
- Mai-Juin: Révisions et évaluations

FORMATS DE TEXTE ACCEPTÉS:
Le texte peut être dans divers formats:
- Listes numérotées (1., 2., 3.)
- Listes à puces (-, *, •)
- Sections avec titres
- Paragraphes avec mois mentionnés
- Mélanges de formats

EXTRACTION INTELLIGENTE:
- Identifie les leçons même si mal formatées
- Détecte les objectifs pédagogiques (mots-clés: "objectif", "compétence", "but", "apprendre à")
- Associe les mois aux leçons (cherche les noms de mois ou indices temporels)
- Génère des titres clairs si absents
- Crée des objectifs si non explicites mais déductibles

COMPÉTENCES GÉNÉRALES:
Identifie aussi les compétences transversales mentionnées dans le programme.

RÉPONSE OBLIGATOIRE en JSON valide:
{
  "lessons": [
    {
      "title": "Titre de la leçon",
      "objectif": "Objectif pédagogique clair et mesurable",
      "mois": "Décembre",
      "order_index": 1,
      "keywords": ["mot1", "mot2", "mot3"]
    }
  ],
  "competencies": ["Compétence 1", "Compétence 2"]
}`;

    const userPrompt = `Matière: ${subjectName}
Niveau: ${gradeLevel}

PROGRAMME À ANALYSER:
${curriculumText}

Analyse ce programme et extrais les leçons selon la structure JSON spécifiée. Assure-toi que chaque leçon a un titre descriptif, un objectif clair, un mois assigné, et des mots-clés pertinents.`;

    console.log(`Analyzing curriculum for ${subjectName} (${gradeLevel})`);
    console.log(`Text length: ${curriculumText.length} characters`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3, // Lower temperature for more consistent extraction
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log("AI Response:", content);

    // Parse JSON response
    let parsedData;
    try {
      // Try to extract JSON if wrapped in markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsedData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Content received:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate structure
    if (!parsedData.lessons || !Array.isArray(parsedData.lessons)) {
      throw new Error("Invalid response structure: missing lessons array");
    }

    // Validate each lesson
    parsedData.lessons.forEach((lesson: any, index: number) => {
      if (!lesson.title || !lesson.objectif || !lesson.mois || !lesson.order_index) {
        throw new Error(`Invalid lesson at index ${index}: missing required fields`);
      }
      if (!Array.isArray(lesson.keywords)) {
        lesson.keywords = [];
      }
    });

    // Ensure competencies is an array
    if (!Array.isArray(parsedData.competencies)) {
      parsedData.competencies = [];
    }

    console.log(`Successfully parsed ${parsedData.lessons.length} lessons`);

    return new Response(JSON.stringify(parsedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-matiere-structure:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
