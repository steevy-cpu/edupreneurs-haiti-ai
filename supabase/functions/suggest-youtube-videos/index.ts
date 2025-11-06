import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lessonTitle, contenu, exemplesExercices, subject, gradeLevel } = await req.json();

    console.log('🎥 Generating YouTube video suggestions for:', lessonTitle);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const YOUTUBE_API_KEY = Deno.env.get('GEMINI_API_KEY'); // Using Gemini API key for YouTube
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    const combinedContent = `${contenu || ''}\n\n${exemplesExercices || ''}`.trim();

    // Step 1: Use Lovable AI to generate optimal search queries
    const systemPrompt = `Tu es un expert en recherche de vidéos éducatives YouTube. Tu dois générer 2-3 requêtes de recherche optimales en français/créole pour trouver des vidéos éducatives pertinentes.

RÈGLES:
1. Générer 2-3 requêtes de recherche différentes
2. Les requêtes doivent être en français ou créole haïtien
3. Cibler des vidéos éducatives, cours, leçons
4. Inclure le niveau scolaire si pertinent
5. Varier les termes pour maximiser les résultats

FORMAT DE RÉPONSE (JSON uniquement):
{
  "queries": [
    "première requête de recherche",
    "deuxième requête de recherche",
    "troisième requête de recherche"
  ]
}

IMPORTANT: Réponds UNIQUEMENT avec le JSON, sans texte additionnel.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Génère des requêtes de recherche YouTube pour cette leçon:

Titre: ${lessonTitle}
Matière: ${subject}
Niveau: ${gradeLevel}

Contenu:
${combinedContent.substring(0, 1000)}...`
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('Failed to generate search queries');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    // Extract JSON from response
    let searchQueries: string[] = [];
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        searchQueries = parsed.queries || [];
      }
    } catch (e) {
      console.error('Failed to parse AI response, using fallback queries');
      searchQueries = [
        `${lessonTitle} cours ${subject}`,
        `leçon ${lessonTitle} français`,
        `${subject} ${gradeLevel} ${lessonTitle}`
      ];
    }

    console.log('🔍 Search queries generated:', searchQueries);

    // Step 2: Search YouTube for each query
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get banned videos
    const { data: bannedVideos } = await supabase
      .from('banned_youtube_videos')
      .select('video_id');
    
    const bannedIds = new Set(bannedVideos?.map(v => v.video_id) || []);

    const allVideos: any[] = [];
    const seenIds = new Set<string>();

    for (const query of searchQueries.slice(0, 3)) {
      try {
        const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoEmbeddable=true&maxResults=3&key=${YOUTUBE_API_KEY}&relevanceLanguage=fr&safeSearch=strict`;
        
        const ytResponse = await fetch(youtubeUrl);
        if (!ytResponse.ok) continue;

        const ytData = await ytResponse.json();
        
        if (ytData.items) {
          for (const item of ytData.items) {
            const videoId = item.id.videoId;
            
            // Skip if already seen or banned
            if (seenIds.has(videoId) || bannedIds.has(videoId)) continue;
            
            seenIds.add(videoId);
            allVideos.push({
              id: videoId,
              title: item.snippet.title,
              description: item.snippet.description,
              thumbnail: item.snippet.thumbnails.medium.url,
              channelTitle: item.snippet.channelTitle,
            });
          }
        }
      } catch (error) {
        console.error('Error searching YouTube:', error);
      }
    }

    // Return top 2 unique videos
    const topVideos = allVideos.slice(0, 2);

    console.log(`✅ Found ${topVideos.length} suggested videos`);

    return new Response(
      JSON.stringify({ videos: topVideos }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in suggest-youtube-videos function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
