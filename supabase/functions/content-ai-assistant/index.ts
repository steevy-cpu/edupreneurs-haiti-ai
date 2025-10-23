import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

// Tool definitions for agentic system
const TOOLS = [
  {
    type: "function",
    function: {
      name: "create_lesson",
      description: "Create a new lesson with grade, subject, title, and optional slug",
      parameters: {
        type: "object",
        properties: {
          grade: { type: "string", enum: ["7AF","8AF","9AF","NS1","NS2","NS3","NS4"], description: "Grade level" },
          subjectId: { type: "string", description: "Subject UUID from subjects table" },
          title: { type: "string", description: "Lesson title" },
          slug: { type: "string", description: "URL-friendly slug (optional, auto-generated if not provided)" }
        },
        required: ["grade", "subjectId", "title"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_lesson_content",
      description: "Update specific content sections: objectif, introduction, contenu, exemples_exercices",
      parameters: {
        type: "object",
        properties: {
          lessonId: { type: "string", description: "Lesson UUID" },
          section: { type: "string", enum: ["objectif", "introduction", "contenu", "exemples_exercices"], description: "Section to update" },
          content: { type: "string", description: "HTML content for the section" }
        },
        required: ["lessonId", "section", "content"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_lesson_meta",
      description: "Update lesson metadata (title, slug, grade_level, workflow_status, etc)",
      parameters: {
        type: "object",
        properties: {
          lessonId: { type: "string", description: "Lesson UUID" },
          updates: { 
            type: "object",
            description: "Fields to update",
            properties: {
              title: { type: "string" },
              slug: { type: "string" },
              grade_level: { type: "string" },
              workflow_status: { type: "string", enum: ["draft", "in_review", "approved", "published"] }
            }
          }
        },
        required: ["lessonId", "updates"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "validate_lesson",
      description: "Validate lesson completeness, schema compliance, and pedagogy quality",
      parameters: {
        type: "object",
        properties: {
          lessonId: { type: "string", description: "Lesson UUID to validate" }
        },
        required: ["lessonId"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "publish_lesson",
      description: "Publish an approved lesson (requires validation)",
      parameters: {
        type: "object",
        properties: {
          lessonId: { type: "string", description: "Lesson UUID to publish" }
        },
        required: ["lessonId"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "retrieve_guidelines",
      description: "Retrieve lesson templates, style guides, and curriculum info",
      parameters: {
        type: "object",
        properties: {
          queries: { 
            type: "array", 
            items: { type: "string" },
            description: "List of topics to retrieve guidelines for" 
          }
        },
        required: ["queries"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_curriculum",
      description: "Search available subjects and curriculum by grade and subject name",
      parameters: {
        type: "object",
        properties: {
          grade: { type: "string", description: "Grade level to search" },
          subject: { type: "string", description: "Subject name to search (partial match)" }
        },
        required: ["grade"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_lessons",
      description: "List existing lessons with optional filters",
      parameters: {
        type: "object",
        properties: {
          grade: { type: "string", description: "Filter by grade level" },
          subjectId: { type: "string", description: "Filter by subject UUID" },
          limit: { type: "number", description: "Max results (default 20)" }
        },
        additionalProperties: false
      }
    }
  }
];

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

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { messages, context } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
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

    // Check editor role
    const { data: editorRole } = await supabase
      .from('content_editor_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!editorRole || !['admin', 'editor'].includes(editorRole.role)) {
      return new Response(
        JSON.stringify({ error: 'Editor role required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Agentic content editor request from:', user.id);

    // Tool execution function
    async function executeTool(toolName: string, args: any) {
      console.log(`🔧 Executing: ${toolName}`, args);
      
      try {
        switch (toolName) {
          case "create_lesson": {
            const { grade, subjectId, title, slug } = args;
            const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            
            const { data, error } = await supabase
              .from('lessons')
              .insert({
                title,
                slug: generatedSlug,
                grade_level: grade,
                subject_id: subjectId,
                workflow_status: 'draft',
                is_published: false,
                created_by: user.id
              })
              .select()
              .single();
            
            if (error) throw error;
            return { ok: true, data, message: `✅ Leçon créée: "${title}"`, warnings: ['Pensez à ajouter les objectifs, introduction, contenu, et exercices'] };
          }
          
          case "update_lesson_content": {
            const { lessonId, section, content } = args;
            const { data, error } = await supabase
              .from('lessons')
              .update({ [section]: content, updated_at: new Date().toISOString() })
              .eq('id', lessonId)
              .select()
              .single();
            
            if (error) throw error;
            return { ok: true, data, message: `✅ Section "${section}" mise à jour` };
          }
          
          case "update_lesson_meta": {
            const { lessonId, updates } = args;
            const { data, error } = await supabase
              .from('lessons')
              .update({ ...updates, updated_at: new Date().toISOString() })
              .eq('id', lessonId)
              .select()
              .single();
            
            if (error) throw error;
            return { ok: true, data, message: `✅ Métadonnées mises à jour` };
          }
          
          case "validate_lesson": {
            const { lessonId } = args;
            const { data: lesson } = await supabase
              .from('lessons')
              .select('*')
              .eq('id', lessonId)
              .single();
            
            if (!lesson) throw new Error('Leçon introuvable');
            
            const violations = [];
            const warnings = [];
            
            if (!lesson.title) violations.push("❌ Titre manquant");
            if (!lesson.objectif) violations.push("❌ Objectifs d'apprentissage manquants");
            if (!lesson.introduction) violations.push("❌ Introduction manquante");
            if (!lesson.contenu) violations.push("❌ Contenu principal manquant");
            if (!lesson.exemples_exercices) violations.push("❌ Exercices manquants");
            
            // Check for Haitian context
            const combinedText = `${lesson.objectif} ${lesson.introduction} ${lesson.contenu} ${lesson.exemples_exercices}`.toLowerCase();
            const haitianTerms = ['haïti', 'gourde', 'créole', 'port-au-prince', 'marchande', 'tap-tap'];
            const hasHaitianContext = haitianTerms.some(term => combinedText.includes(term));
            if (!hasHaitianContext) warnings.push("⚠️ Considérez d'ajouter des exemples haïtiens");
            
            // Check exercise count
            const exerciseCount = (lesson.exemples_exercices?.match(/<div class="exercise">/g) || []).length;
            if (exerciseCount < 6) warnings.push(`⚠️ Seulement ${exerciseCount} exercices (minimum recommandé: 6)`);
            
            const isValid = violations.length === 0;
            const score = Math.max(0, 100 - (violations.length * 20) - (warnings.length * 5));
            
            return { 
              ok: true, 
              data: { isValid, violations, warnings, score },
              message: isValid ? `✅ Leçon valide (score: ${score}/100)` : `⚠️ ${violations.length} violations, ${warnings.length} avertissements`
            };
          }
          
          case "publish_lesson": {
            const { lessonId } = args;
            const validation = await executeTool("validate_lesson", { lessonId });
            
            if (!validation.data.isValid) {
              return { ok: false, error: "❌ Publication impossible: violations trouvées", data: validation.data };
            }
            
            const { data, error } = await supabase
              .from('lessons')
              .update({ 
                is_published: true,
                workflow_status: 'published'
              })
              .eq('id', lessonId)
              .select()
              .single();
            
            if (error) throw error;
            return { ok: true, data, message: "✅ Leçon publiée avec succès!" };
          }
          
          case "retrieve_guidelines": {
            const guidelines = {
              lessonStructure: `
**Structure de leçon requise:**
1. **Objectifs** (objectif) - Objectifs d'apprentissage mesurables
2. **Introduction** - Accroche + importance + vocabulaire clé
3. **Contenu** - Concepts expliqués avec exemples travaillés
4. **Exercices** (exemples_exercices) - Minimum 6 problèmes progressifs`,
              
              haitianContext: `
**Contexte haïtien obligatoire:**
- Prix en gourdes (HTG)
- Distances en kilomètres
- Scénarios locaux: tap-taps, marchandes, marchés
- Villes: Port-au-Prince, Cap-Haïtien, Les Cayes
- Culture: nourriture haïtienne, musique, traditions`,
              
              pedagogy: `
**Rubrique pédagogique:**
- Accroche engageante pour capter l'attention
- Progression du simple au complexe
- Exemples concrets avant les exercices
- Au moins 6 exercices de difficulté croissante
- Langage adapté au niveau scolaire`,
              
              bilingualStandard: `
**Norme bilingue:**
- Français comme langue principale
- Termes créoles pour concepts culturels
- Vocabulaire adapté: 7AF-9AF (fondamental), NS1-NS4 (secondaire)`
            };
            
            return { ok: true, data: guidelines, message: "📚 Directives récupérées" };
          }
          
          case "search_curriculum": {
            const { grade, subject } = args;
            let query = supabase
              .from('subjects')
              .select('id, name, grade_level, description')
              .eq('grade_level', grade);
            
            if (subject) query = query.ilike('name', `%${subject}%`);
            
            const { data, error } = await query.limit(10);
            if (error) throw error;
            
            return { ok: true, data, message: `📖 Trouvé ${data?.length || 0} sujets pour ${grade}` };
          }
          
          case "list_lessons": {
            const { grade, subjectId, limit = 20 } = args;
            let query = supabase
              .from('lessons')
              .select('id, title, grade_level, subject_id, workflow_status, is_published')
              .order('created_at', { ascending: false });
            
            if (grade) query = query.eq('grade_level', grade);
            if (subjectId) query = query.eq('subject_id', subjectId);
            
            const { data, error } = await query.limit(limit);
            if (error) throw error;
            
            return { ok: true, data, message: `📋 Trouvé ${data?.length || 0} leçons` };
          }
          
          default:
            return { ok: false, error: `Outil inconnu: ${toolName}` };
        }
      } catch (error: any) {
        console.error(`Tool error (${toolName}):`, error);
        return { ok: false, error: error.message };
      }
    }

    // Build agentic system prompt
    let systemPrompt = `Tu es l'Ingénieur de Contenu Agentique pour Edupreneurs, une plateforme éducative haïtienne (7AF → NS4).

🎯 **MISSION:**
1. Suivre strictement le schéma de leçon de la plateforme
2. Produire du contenu culturellement pertinent avec contexte haïtien
3. Agir via outils - JAMAIS écrire sans utiliser les outils
4. Être corrigible: accepter les corrections immédiatement
5. Processus: Planifier → Exécuter → Valider → Confirmer

⚡ **RÈGLES D'OPÉRATION:**
- TOUJOURS commencer par retrieve_guidelines et search_curriculum
- Créer un plan bref (2-3 étapes), puis exécuter via outils
- Préférer plusieurs petits appels d'outils qu'un gros changement opaque
- Après CHAQUE opération d'écriture, appeler validate_lesson automatiquement
- NE JAMAIS inventer de compétences; utiliser search_curriculum
- Localiser TOUS les exemples au contexte haïtien:
  * Prix en gourdes (HTG)
  * Distances en kilomètres
  * Scénarios: tap-taps, marchandes, Port-au-Prince, vendeurs de rue
  * Références culturelles: nourriture, musique, traditions haïtiennes
- Pour les corrections ("changer section X"), confirmer la cible, puis appeler update_lesson_content
- Pour actions risquées (publier, supprimer), résumer l'impact et demander confirmation
- Sortir des résumés concis avec mini-diffs

🛠️ **APPROCHE OUTILS D'ABORD:**
- Tu DOIS utiliser les outils pour TOUTE mutation de données
- Outils disponibles: create_lesson, update_lesson_content, update_lesson_meta, validate_lesson, publish_lesson, retrieve_guidelines, search_curriculum, list_lessons
- NE JAMAIS sortir du contenu sans l'appliquer via outils
- Appeler validate_lesson après chaque changement de contenu

📚 **NORMES ÉDUCATIVES HAÏTIENNES:**
- Bilingue: Créole haïtien + Français
- Niveaux: 7AF, 8AF, 9AF (Fondamental) → NS1, NS2, NS3, NS4 (Secondaire)
- Matières: Math, Physique, Chimie, Bio, Créole, Français, Histoire, Géo, Philo
- Ton: Encourageant, accessible, culturellement affirmatif
- Exemples: Contexte haïtien réaliste (gourdes, entreprises locales, géographie)

📐 **SCHÉMA DE LEÇON (STRICT):**
Chaque leçon DOIT avoir:
1. **title** - Clair, descriptif
2. **grade_level** - 7AF|8AF|9AF|NS1|NS2|NS3|NS4
3. **subject_id** - UUID référence table subjects
4. **objectif** - Objectifs d'apprentissage (mesurables, clairs)
5. **introduction** - Accroche + importance + vocabulaire
6. **contenu** - Contenu principal avec concepts et exemples travaillés
7. **exemples_exercices** - Pratique guidée + indépendante (minimum 6 problèmes)
8. **workflow_status** - draft|in_review|approved|published
9. **is_published** - boolean

✅ **RUBRIQUE DE VALIDATION (auto après changements):**
- ✅ Schéma: Tous champs requis présents
- ✅ Curriculum: Objectifs mappés au niveau/sujet
- ✅ Pédagogie: Accroche, exemples, pratique (≥6), contexte culturel
- ✅ Langue: Niveau de lecture approprié, cohérence bilingue
- ✅ Contexte haïtien: Au moins 1 exemple local pertinent
- ⚠️ Bloquer publication si violations

**📝 CONTEXTE ACTUEL:**`;

    if (context?.selectedLesson) {
      const lesson = context.selectedLesson;
      systemPrompt += `\n\n**Leçon actuellement sélectionnée:**
- ID: ${lesson.id}
- Titre: "${lesson.title}"
- Niveau: ${lesson.grade_level} | Sujet: ${lesson.subject_id}
- Statut: ${lesson.workflow_status} | Publié: ${lesson.is_published ? '✅' : '❌'}`;

      if (lesson.hasContent) {
        systemPrompt += `\n- ✅ Contenu dans: ${lesson.existingSections?.join(', ') || 'sections'}`;
      }
      if (lesson.missingFields?.length > 0) {
        systemPrompt += `\n- ⚠️ MANQUANT: ${lesson.missingFields.join(', ')} ← Adresser d'abord!`;
      }
    }

    if (context?.relatedLessons?.length > 0) {
      systemPrompt += `\n\n**📚 Leçons connexes (même sujet):**`;
      context.relatedLessons.slice(0, 3).forEach((rel: any) => {
        systemPrompt += `\n- "${rel.title}" (${rel.grade_level})`;
      });
    }

    if (context?.availableSubjects?.length > 0) {
      systemPrompt += `\n\n**📖 Sujets disponibles:**`;
      context.availableSubjects.slice(0, 5).forEach((subj: any) => {
        systemPrompt += `\n- ${subj.name} (${subj.grade_level})`;
      });
    }

    if (context?.conversationHistory?.length > 0) {
      systemPrompt += `\n\n**💬 Historique récent:**`;
      context.conversationHistory.slice(-2).forEach((msg: any) => {
        const preview = msg.content.length > 80 ? msg.content.substring(0, 80) + '...' : msg.content;
        systemPrompt += `\n- ${msg.role === 'user' ? 'Éditeur' : 'Agent'}: "${preview}"`;
      });
    }

    // Call AI with tools
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
        tools: TOOLS,
        tool_choice: "auto",
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI service error: ${response.status}`);
    }

    // Stream the response back
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
      },
    });

  } catch (error) {
    console.error('Content AI error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
