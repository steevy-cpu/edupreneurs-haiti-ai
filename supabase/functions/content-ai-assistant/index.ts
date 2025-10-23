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

    // Verify user authentication first
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create admin client for role checking
    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get ANON key for user-authenticated client
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    // Create user-authenticated client (uses user's JWT token with anon key)
    // This ensures auth.uid() works in triggers and RLS policies
    const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });
    
    const { messages, context } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check editor role
    const { data: editorRole } = await supabaseAdmin
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
    type ToolResult = {
      ok: boolean;
      data?: any;
      message?: string;
      warnings?: string[];
      error?: string;
    };

    async function executeTool(toolName: string, args: any): Promise<ToolResult> {
      console.log(`🔧 Executing: ${toolName}`, args);
      
      try {
        switch (toolName) {
          case "create_lesson": {
            const { grade, subjectId, title, slug } = args;
            const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            
            if (!user?.id) {
              return { ok: false, error: 'User not authenticated' };
            }
            
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
            
            // First check if lesson exists
            const { data: existingLesson, error: checkError } = await supabase
              .from('lessons')
              .select('id')
              .eq('id', lessonId)
              .maybeSingle();
            
            if (checkError) throw checkError;
            if (!existingLesson) {
              return { ok: false, error: `Leçon non trouvée: ${lessonId}` };
            }
            
            // Update the lesson
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
            const validation: ToolResult = await executeTool("validate_lesson", { lessonId });
            
            if (!validation.data?.isValid) {
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
3. Générer du contenu en TEXTE BRUT (pas de HTML) - le système formatera automatiquement
4. Être corrigible: accepter les corrections immédiatement
5. Processus: Analyser → Générer → Confirmer

⚡ **RÈGLES D'OPÉRATION:**
- TOUJOURS répondre en TEXTE BRUT, JAMAIS en HTML
- Utiliser des listes à puces simples avec - ou *
- Utiliser des numéros pour les étapes (1. 2. 3.)
- JAMAIS utiliser de balises HTML comme <p>, <div>, <h3>, etc.
- Localiser TOUS les exemples au contexte haïtien:
  * Prix en gourdes (HTG)
  * Distances en kilomètres
  * Scénarios: tap-taps, marchandes, Port-au-Prince, vendeurs de rue
  * Références culturelles: nourriture, musique, traditions haïtiennes
- Être direct et concis dans les réponses
- Structurer le contenu de manière claire avec des sections distinctes
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
6. **contenu** - Contenu principal DÉTAILLÉ avec concepts et exemples travaillés (HTML structuré avec sections, listes, exemples concrets)
7. **exemples_exercices** - Pratique guidée + indépendante (minimum 6 problèmes)
8. **workflow_status** - draft|in_review|approved|published
9. **is_published** - boolean

🎨 **MODÈLE DE CONTENU IDÉAL (Utiliser comme référence):**
Le contenu doit être LONG et DÉTAILLÉ, structuré avec du HTML propre. Voici un exemple de structure à suivre:

\`\`\`html
<div class="content-section">
  <h3>1. Qu'est-ce qu'une balance?</h3>
  <p>Une balance est un instrument qui permet de <strong>mesurer la masse</strong> d'un objet...</p>
  <ul>
    <li><strong>Balance à plateaux (Roberval)</strong>: Deux plateaux équilibrés...</li>
    <li><strong>Balance électronique</strong>: Affichage numérique précis...</li>
  </ul>
</div>

<div class="content-section">
  <h3>2. Les différentes parties d'une balance</h3>
  <ul>
    <li><strong>Plateau de mesure</strong>: Où on place l'objet à peser</li>
    <li><strong>Écran/Cadran</strong>: Affiche la mesure</li>
    <li><strong>Bouton de tare/remise à zéro</strong>: Pour annuler le poids du récipient</li>
  </ul>
</div>

<div class="example-box">
  <h4>💡 Exemple pratique:</h4>
  <p><strong>Situation:</strong> Madame Rose au marché...</p>
  <p><strong>Étapes:</strong></p>
  <ol>
    <li>Placer le bol vide → affiche 50g</li>
    <li>Appuyer sur "TARE" → affiche 0g</li>
    <li>Ajouter le riz → affiche 500g de riz pur</li>
  </ol>
</div>
\`\`\`

**RÈGLES DE CONTENU:**
- Minimum 5-7 sections bien détaillées
- Chaque section avec titre, paragraphes explicatifs, listes
- Au moins 2-3 exemples pratiques concrets avec contexte haïtien
- Utiliser des balises HTML: <h3>, <h4>, <p>, <ul>, <ol>, <li>, <strong>, <em>
- Classes CSS disponibles: content-section, example-box, exercise, important-note
- Le contenu doit faire au moins 800-1200 mots pour être complet

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
- Matière: ${lesson.subjectName || 'Non spécifiée'} (ID: ${lesson.subject_id})
- Niveau: ${lesson.grade_level}
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

    // Call AI with tools - handle tool calling iteratively
    let conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];
    
    let maxIterations = 10; // Allow enough iterations for complex operations
    let iteration = 0;
    
    while (iteration < maxIterations) {
      iteration++;
      console.log(`🔄 AI iteration ${iteration}/${maxIterations}`);
      
    // Also switch to Gemini Pro for better educational content generation
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro', // Using Pro for better educational content
        messages: conversationMessages,
        tools: TOOLS,
        tool_choice: "auto",
        stream: false, // Non-streaming for tool execution
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

      const aiResponse = await response.json();
      const choice = aiResponse.choices[0];
      const message = choice.message;
      
      // Add assistant message to conversation
      conversationMessages.push(message);
      
      // Check if AI wants to use tools
      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log(`🔧 Executing ${message.tool_calls.length} tool(s)`);
        
        // Execute all tool calls
        const toolResults = await Promise.all(
          message.tool_calls.map(async (toolCall: any) => {
            const toolName = toolCall.function.name;
            let toolArgs;
            try {
              toolArgs = JSON.parse(toolCall.function.arguments);
            } catch (e) {
              console.error(`Failed to parse tool arguments for ${toolName}:`, toolCall.function.arguments);
              return {
                tool_call_id: toolCall.id,
                role: 'tool',
                name: toolName,
                content: JSON.stringify({ ok: false, error: 'Invalid tool arguments JSON' })
              };
            }
            
            console.log(`  → ${toolName}:`, toolArgs);
            const result = await executeTool(toolName, toolArgs);
            console.log(`  ✓ Result:`, result.ok ? '✅' : '❌', result.message || result.error);
            
            // Enhance result message for better AI understanding
            if (result.ok && ['update_lesson_content', 'create_lesson', 'publish_lesson'].includes(toolName)) {
              result.message = `SUCCESS: ${result.message || 'Operation completed'}. You can now provide a summary to the user.`;
            }
            
            return {
              tool_call_id: toolCall.id,
              role: 'tool',
              name: toolName,
              content: JSON.stringify(result)
            };
          })
        );
        
        // Add tool results to conversation
        conversationMessages.push(...toolResults);
        
        // Continue loop to get AI's response after tool execution
        continue;
      }
      
      // No tool calls - AI has final response, stream it back
      console.log('✅ Final response ready, streaming to client');
      console.log('📝 Response content length:', message.content?.length || 0);
      
      // Create streaming response manually
      const encoder = new TextEncoder();
      const content = message.content || 'Aucune réponse générée';
      
      console.log('🔄 Starting stream with content:', content.substring(0, 100) + '...');
      
      const stream = new ReadableStream({
        start(controller) {
          try {
            // Split content into words for progressive streaming
            const words = content.split(' ');
            console.log(`📦 Streaming ${words.length} word chunks`);
            
            for (let i = 0; i < words.length; i++) {
              const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
              const sseData = `data: ${JSON.stringify({
                id: `gen-${Date.now()}`,
                choices: [{
                  index: 0,
                  delta: { content: chunk },
                  finish_reason: null
                }]
              })}\n\n`;
              
              controller.enqueue(encoder.encode(sseData));
            }
            
            // Send completion
            const doneData = `data: ${JSON.stringify({
              id: `gen-${Date.now()}`,
              choices: [{
                index: 0,
                delta: {},
                finish_reason: 'stop'
              }]
            })}\n\n`;
            controller.enqueue(encoder.encode(doneData));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            
            console.log('✅ Stream completed successfully');
            controller.close();
          } catch (error) {
            console.error('❌ Stream error:', error);
            controller.error(error);
          }
        }
      });
      
      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }
    
    // Max iterations reached
    throw new Error('Max tool execution iterations reached');

  } catch (error) {
    console.error('Content AI error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
