import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

// HTML sanitization - only allow safe tags and attributes
const sanitizeHTML = (html: string): string => {
  // Remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
};

// Content validation
const validateContent = (content: string): { valid: boolean; error?: string } => {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Le contenu ne peut pas être vide' };
  }
  if (content.length > 50000) {
    return { valid: false, error: 'Le contenu est trop long (max 50000 caractères)' };
  }
  return { valid: true };
};

// Generate content templates
const getContentTemplate = (type: string): string => {
  const templates = {
    lesson: `
      <div class="lesson-content">
        <section class="introduction">
          <h2>Introduction</h2>
          <p>[Introduction engageante]</p>
        </section>
        
        <section class="main-content">
          <h2>Contenu Principal</h2>
          <p>[Contenu détaillé]</p>
        </section>
        
        <section class="examples">
          <h2>Exemples</h2>
          <div class="example">
            <h3>Exemple 1</h3>
            <p>[Exemple concret]</p>
          </div>
        </section>
        
        <section class="exercises">
          <h2>Exercices</h2>
          <div class="exercise">
            <h3>Exercice 1</h3>
            <p>[Question]</p>
            <details>
              <summary>Solution</summary>
              <p>[Solution détaillée]</p>
            </details>
          </div>
        </section>
      </div>
    `,
    exercises: `
      <div class="exercises-set">
        <h2>Exercices Pratiques</h2>
        [Exercices 1-5 avec difficulté progressive]
      </div>
    `,
  };
  return templates[type as keyof typeof templates] || '';
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create Supabase client for server-side operations
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const { messages, operation, lessonData, options } = await req.json();
    
    // Validate request
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user has content editor role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has editor role
    const { data: editorRole } = await supabase
      .from('content_editor_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!editorRole || !['admin', 'editor'].includes(editorRole.role)) {
      console.log('Access denied for user:', user.id);
      return new Response(
        JSON.stringify({ error: 'Access denied - editor role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Content editor request from:', user.id, 'Operation:', operation);

    // Get content template if requested
    const template = options?.useTemplate ? getContentTemplate(operation) : '';

    // Build system prompt based on operation
    let systemPrompt = `Tu es un assistant IA spécialisé dans la création de contenu éducatif pour le programme MENFP (Ministère de l'Éducation Nationale et de la Formation Professionnelle) en Haïti.

CONTEXTE IMPORTANT:
- Niveau: Secondaire (collège et lycée)
- Langue principale: Français avec termes créoles quand approprié
- Curriculum: MENFP Haïti
- Format de sortie: HTML bien formaté et structuré

TON RÔLE:
Tu aides à créer et améliorer le contenu pédagogique pour les matières suivantes:
- Mathématiques (algèbre, géométrie, calcul)
- Sciences (physique, chimie, biologie)
- Français (grammaire, conjugaison, littérature)
- Histoire (Histoire d'Haïti et mondiale)

DIRECTIVES DE CONTENU:
1. Rédige en français clair et accessible pour les élèves haïtiens
2. Utilise des exemples concrets tirés du contexte haïtien quand possible
3. Structure le contenu avec des sections claires: Introduction, Contenu principal, Exemples, Exercices
4. Inclus des analogies et des métaphores pour faciliter la compréhension
5. Adapte le niveau de complexité au niveau scolaire (6ème, 5ème, 4ème, 3ème, etc.)

FORMAT HTML REQUIS:
- Utilise des balises HTML sémantiques: <h2>, <h3>, <p>, <ul>, <ol>, <strong>, <em>
- Pour les formules mathématiques: utilise du texte formaté ou LaTeX si nécessaire
- Crée des sections bien organisées avec des titres clairs
- Ajoute des listes à puces pour les points importants
- Utilise <div class="example"> pour les exemples
- Utilise <div class="exercise"> pour les exercices

EXEMPLES D'EXERCICES:
- Inclus toujours 3-5 exercices de difficulté progressive
- Fournis des indices pour les exercices difficiles
- Structure: Question claire → Indice (optionnel) → Solution détaillée

SÉCURITÉ ET QUALITÉ:
- Ne génère jamais de contenu offensant ou inapproprié
- Vérifie la précision mathématique et scientifique
- Utilise un langage respectueux et inclusif
- Adapte le vocabulaire au niveau scolaire`;

    // Add operation-specific instructions
    if (operation === 'generate') {
      systemPrompt += `\n\nOPÉRATION: Générer un nouveau contenu de leçon complet basé sur le sujet fourni.
      
ÉTAPES À SUIVRE:
1. Comprendre le sujet et le niveau scolaire
2. Définir les objectifs d'apprentissage clairs
3. Créer une introduction captivante
4. Développer le contenu principal avec des sous-sections
5. Ajouter des exemples concrets et pertinents
6. Créer 5 exercices de difficulté progressive
7. Formatter le tout en HTML bien structuré`;

    } else if (operation === 'enhance') {
      systemPrompt += `\n\nOPÉRATION: Améliorer le contenu existant en ajoutant plus de détails, exemples, et clarté.

AMÉLIORATIONS À APPORTER:
- Enrichir les explications existantes
- Ajouter des analogies et métaphores
- Inclure plus d'exemples concrets
- Améliorer la structure et la lisibilité
- Renforcer la progression pédagogique`;

    } else if (operation === 'exercises') {
      systemPrompt += `\n\nOPÉRATION: Créer uniquement des exercices pratiques avec solutions.

TYPES D'EXERCICES À CRÉER:
1. Exercices de compréhension (QCM)
2. Exercices d'application directe
3. Problèmes contextualisés
4. Exercices de synthèse
5. Défi bonus (plus difficile)

Pour chaque exercice:
- Question claire et précise
- Indice si nécessaire
- Solution complète et détaillée`;

    } else if (operation === 'translate') {
      systemPrompt += `\n\nOPÉRATION: Traduire ou adapter le contenu en créole haïtien.

RÈGLES DE TRADUCTION:
- Garde les termes techniques en français avec explication en créole
- Adapte les exemples au contexte haïtien
- Maintiens la structure HTML
- Assure la clarté et la fluidité`;

    } else if (operation === 'simplify') {
      systemPrompt += `\n\nOPÉRATION: Simplifier le contenu pour le rendre plus accessible.

SIMPLIFICATION:
- Utilise des phrases plus courtes
- Explique les termes techniques
- Ajoute plus d'exemples visuels
- Décompose les concepts complexes`;

    } else if (operation === 'quiz') {
      systemPrompt += `\n\nOPÉRATION: Créer un quiz interactif de 10 questions.

FORMAT DU QUIZ:
- 10 questions à choix multiples (4 options chacune)
- Difficulté progressive
- Une seule bonne réponse par question
- Explications pour chaque réponse
- Score et feedback final`;
    }

    if (template) {
      systemPrompt += `\n\nTEMPLATE DE BASE:\n${template}\n\nUtilise cette structure comme guide.`;
    }

    if (lessonData) {
      systemPrompt += `\n\nCONTEXTE DE LA LEÇON:
Titre: ${lessonData.title || 'Non spécifié'}
Niveau: ${lessonData.grade_level || 'Non spécifié'}
Objectif: ${lessonData.objectif || 'Non spécifié'}`;
    }

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Crédits insuffisants. Veuillez ajouter des crédits à votre espace Lovable.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Erreur du service IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Stream the response back
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
      },
    });

  } catch (error) {
    console.error('Content AI Assistant error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
