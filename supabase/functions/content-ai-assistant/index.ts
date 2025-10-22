import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

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

    const { messages, operation, lessonData } = await req.json();

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
- Structure: Question claire → Indice (optionnel) → Solution détaillée`;

    if (operation === 'generate') {
      systemPrompt += `\n\nOPÉRATION: Générer un nouveau contenu de leçon complet basé sur le sujet fourni.`;
    } else if (operation === 'enhance') {
      systemPrompt += `\n\nOPÉRATION: Améliorer le contenu existant en ajoutant plus de détails, exemples, et clarté.`;
    } else if (operation === 'exercises') {
      systemPrompt += `\n\nOPÉRATION: Créer uniquement des exercices pratiques avec solutions.`;
    } else if (operation === 'translate') {
      systemPrompt += `\n\nOPÉRATION: Traduire ou adapter le contenu en créole haïtien.`;
    }

    // Call Lovable AI Gateway
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
