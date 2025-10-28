import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
//    co// removed destructure line
    t//
    const url = new URL(req.url);
cons lessonTitle = url.searchParams.get("lessonTitle");
const lessonNumber = url.searchParams.get("lessonNumber");
const subject = url.searchParams.get("subject");
const grade = url.searchParams.get("grade");
const targetWords = url.searchParams.get("targetWords");{ lessonTitle, lessonNumber, subject, grade, targetWords } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es un expert pédagogue haïtien créant des leçons de Sciences Sociales pour le niveau ${grade} (7AF - 12-13 ans) selon le programme du MENFP d'Haïti.

CONTEXTE CRITIQUE:
- Public: Élèves haïtiens de 7AF (12-13 ans)
- Langue: Français accessible avec vocabulaire adapté
- Contextualisation: MAXIMUM d'exemples, références et situations haïtiennes/caribéennes
- Ton: Captivant, stimulant, encourageant la curiosité

STRUCTURE REQUISE (~${targetWords} mots):

1. INTRODUCTION (250-300 mots):
   - Accroche captivante avec question stimulante ou citation
   - 2-3 paragraphes de mise en contexte avec lien haïtien fort
   - 4-5 objectifs d'apprentissage clairs et mesurables
   - Utiliser émojis et encadrés colorés

2. CONTENU DÉTAILLÉ (900-1000 mots):
   - 6-7 sections principales (h3) bien développées
   - Explications claires avec vocabulaire adapté niveau 7AF
   - 2-3 encadrés "💡 Le savais-tu ?" avec anecdotes haïtiennes/caribéennes fascinantes
   - Listes structurées avec puces
   - Exemples concrets haïtiens intégrés dans chaque section
   - 2-3 suggestions YouTube intégrées dans le contenu (format: "🎥 Vidéo recommandée: '[Titre]'")

3. EXEMPLES ET EXERCICES (350-400 mots):
   - 5-6 exemples concrets haïtiens détaillés (encadrés bleus 🇭🇹)
   - 8-10 types d'exercices VARIÉS:
     * QCM (5 questions, 4 choix)
     * Vrai/Faux (5 affirmations)
     * Appariement/Correspondance
     * Questions de réflexion (3-4 questions ouvertes)
     * Étude de cas haïtien
     * Activité pratique (observation, enquête, création)
     * Recherche/Investigation
     * Débat ou discussion
     * Mini-recherche
     * Composition/Rédaction
   - 3-4 suggestions YouTube finales avec titres précis

FORMAT HTML AVEC TAILWIND:
- Utiliser classes Tailwind pour dark/light mode
- Encadrés colorés: bg-[color]-50 dark:bg-[color]-950/30 border-l-4 border-[color]-500
- Émojis pour capter attention
- Structure claire avec h2, h3, p, ul, li
- Tableaux comparatifs si pertinent

PRINCIPES PÉDAGOGIQUES:
✅ Contextualisation haïtienne MAXIMALE
✅ Langage adapté 7AF (12-13 ans)
✅ Exactitude scientifique/historique
✅ Ton engageant et motivant
✅ Diversité des activités
✅ Ancrage dans la réalité haïtienne

RÉPONDS UNIQUEMENT AVEC LE CONTENU HTML, SANS PRÉAMBULE.`;

    const userPrompt = `Génère le contenu complet pour la Leçon ${lessonNumber}: "${lessonTitle}" du cours de ${subject} niveau ${grade}.

Structure attendue:
1. Introduction (250-300 mots)
2. Contenu détaillé (900-1000 mots, 6-7 sections)
3. Exemples et Exercices (350-400 mots)

Total: ~${targetWords} mots

IMPORTANT:
- Maximum de contextualisation haïtienne
- Exemples concrets de la vie en Haïti
- Anecdotes caribéennes fascinantes
- Exercices variés et stimulants
- Format HTML avec classes Tailwind`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let generatedContent = data.choices[0].message.content;
    
    // Remove markdown code blocks if present
    generatedContent = generatedContent.replace(/```html\n?/g, '').replace(/```\n?/g, '');
    
    // Split content into three sections based on HTML comments or headers
    let introduction = '';
    let contenu = '';
    let exemplesExercices = '';
    
    // Try to find section markers in the content
    const introMatch = generatedContent.match(/<!-- Introduction -->([\s\S]*?)<!-- Contenu|<h3[^>]*>.*?Contenu Détaillé/i);
    const contenuMatch = generatedContent.match(/<!-- Contenu Détaillé|Contenu -->([\s\S]*?)<!-- Exemples et Exercices|<h3[^>]*>.*?Exemples et Exercices/i);
    const exercicesMatch = generatedContent.match(/<!-- Exemples et Exercices -->([\s\S]*)/i);
    
    if (introMatch) {
      introduction = introMatch[1].trim();
    }
    if (contenuMatch) {
      contenu = contenuMatch[1].trim();
    }
    if (exercicesMatch) {
      exemplesExercices = exercicesMatch[1].trim();
    }
    
    // If sections not found by markers, try to split by detecting patterns
    if (!introduction || !contenu || !exemplesExercices) {
      // Fallback: use the full content as contenu
      contenu = generatedContent;
      introduction = '<div class="mb-4"><p>Contenu généré par IA.</p></div>';
      exemplesExercices = '<div class="mb-4"><p>Exercices à compléter.</p></div>';
    }

    return new Response(JSON.stringify({ 
      introduction,
      contenu,
      exemplesExercices,
      lessonTitle,
      lessonNumber 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-lesson-content function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
