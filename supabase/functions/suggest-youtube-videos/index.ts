import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { 
  secureJsonResponse, 
  secureErrorResponse, 
  corsPreflightResponse 
} from "../_shared/securityHeaders.ts";
import { checkRateLimit, RATE_LIMITS, getClientIp } from "../_shared/rateLimiter.ts";

// Input validation schema
const suggestVideosSchema = z.object({
  lessonTitle: z.string().min(1).max(500),
  contenu: z.string().max(50000).optional().default(''),
  exemplesExercices: z.string().max(50000).optional().default(''),
  subject: z.string().max(200).optional().default(''),
  gradeLevel: z.string().max(50).optional().default('')
}).passthrough();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP and user for rate limiting
    const clientIp = getClientIp(req);
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Check rate limit
    const rateLimitResult = await checkRateLimit(
      supabase,
      RATE_LIMITS.GENERAL,
      userId,
      clientIp
    );

    if (!rateLimitResult.allowed) {
      console.warn('[suggest-youtube-videos] Rate limit exceeded');
      return secureErrorResponse('Too many requests. Please try again later.', 429);
    }

    // Parse and validate input
    const body = await req.json();
    const validation = suggestVideosSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      console.error('[suggest-youtube-videos] Validation failed:', errors);
      return secureErrorResponse('Invalid input', 400, errors);
    }

    const { lessonTitle, contenu, exemplesExercices, subject, gradeLevel } = validation.data;

    console.log('🎥 Generating YouTube video suggestions for:', lessonTitle);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    const combinedContent = `${contenu || ''}\n\n${exemplesExercices || ''}`.trim();

    // Step 1: Use Lovable AI to generate optimal search queries
    const systemPrompt = `Tu es un expert en recherche de vidéos éducatives YouTube. Tu dois générer 2-3 requêtes de recherche optimales pour trouver des vidéos éducatives pertinentes.

RÈGLES STRICTES:
1. Générer 2-3 requêtes de recherche en FRANÇAIS uniquement
2. Les requêtes doivent cibler des vidéos éducatives: "cours", "leçon", "tutoriel"
3. Utiliser le titre de la leçon comme base principale
4. NE PAS inclure de termes en créole haïtien
5. Privilégier les termes éducatifs standards

FORMAT DE RÉPONSE (JSON uniquement):
{
  "queries": [
    "première requête de recherche en français",
    "deuxième requête de recherche en français"
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

    // Get banned videos
    const { data: bannedVideos } = await supabase
      .from('banned_youtube_videos')
      .select('video_id');
    
    const bannedIds = new Set(bannedVideos?.map(v => v.video_id) || []);

    const allVideos: any[] = [];
    const seenIds = new Set<string>();

    // Helper function to calculate relevance score
    const calculateRelevance = (videoTitle: string, videoDescription: string, lessonTitle: string): number => {
      const videoTitleLower = videoTitle.toLowerCase();
      const videoDescLower = videoDescription.toLowerCase();
      const lessonLower = lessonTitle.toLowerCase();
      
      // Extract key words from lesson title (ignore common words)
      const commonWords = ['le', 'la', 'les', 'et', 'de', 'des', 'un', 'une', 'à', 'en'];
      const lessonWords = lessonLower.split(/\s+/).filter(w => w.length > 2 && !commonWords.includes(w));
      
      let score = 0;
      
      // Check each lesson word in video title (higher weight)
      for (const word of lessonWords) {
        if (videoTitleLower.includes(word)) score += 3;
        if (videoDescLower.includes(word)) score += 1;
      }
      
      // Bonus for educational keywords
      const eduKeywords = ['cours', 'leçon', 'tutoriel', 'apprendre', 'learning', 'lesson', 'tutorial'];
      for (const keyword of eduKeywords) {
        if (videoTitleLower.includes(keyword)) score += 2;
      }
      
      // Big bonus if exact lesson title is in video title
      if (videoTitleLower.includes(lessonLower)) score += 15;
      
      // Penalty for non-educational content indicators
      const badKeywords = ['music', 'song', 'animation', 'film', 'movie', 'serie', 'fiction'];
      for (const keyword of badKeywords) {
        if (videoTitleLower.includes(keyword) || videoDescLower.includes(keyword)) score -= 10;
      }
      
      return score;
    };
    
    // Helper function to check if video is educational
    const isEducational = (title: string, description: string): boolean => {
      const titleLower = title.toLowerCase();
      const descLower = description.toLowerCase();
      const eduKeywords = ['cours', 'leçon', 'tutoriel', 'apprendre', 'learning', 'lesson', 'tutorial', 'education', 'teaching', 'study'];
      
      return eduKeywords.some(keyword => titleLower.includes(keyword) || descLower.includes(keyword));
    };

    for (const query of searchQueries.slice(0, 2)) {
      try {
        const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoEmbeddable=true&maxResults=5&key=${YOUTUBE_API_KEY}&relevanceLanguage=fr&safeSearch=strict&videoDefinition=any`;
        
        const ytResponse = await fetch(youtubeUrl);
        if (!ytResponse.ok) {
          const errorText = await ytResponse.text();
          console.error('YouTube API error:', ytResponse.status, errorText);
          continue;
        }

        const ytData = await ytResponse.json();
        
        if (ytData.items) {
          for (const item of ytData.items) {
            const videoId = item.id.videoId;
            const title = item.snippet.title;
            const description = item.snippet.description || '';
            
            // Skip if already seen or banned
            if (seenIds.has(videoId) || bannedIds.has(videoId)) continue;
            
            // Filter: Must be educational content
            if (!isEducational(title, description)) {
              console.log(`❌ Skipping non-educational video: "${title}"`);
              continue;
            }
            
            const relevanceScore = calculateRelevance(title, description, lessonTitle);
            
            // Only include videos with positive relevance score
            if (relevanceScore <= 0) {
              console.log(`❌ Skipping low-relevance video: "${title}" (score: ${relevanceScore})`);
              continue;
            }
            
            seenIds.add(videoId);
            allVideos.push({
              id: videoId,
              title: title,
              description: description,
              thumbnail: item.snippet.thumbnails.medium.url,
              channelTitle: item.snippet.channelTitle,
              relevanceScore: relevanceScore,
            });
            
            console.log(`✅ Added video: "${title}" (score: ${relevanceScore})`);
          }
        }
      } catch (error) {
        console.error('Error searching YouTube:', error);
      }
    }

    // Sort by relevance score and return top 2 unique videos with minimum score
    allVideos.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Filter out videos with very low scores (below 3)
    const qualityVideos = allVideos.filter(v => v.relevanceScore >= 3);
    const topVideos = qualityVideos.slice(0, 2);

    console.log(`✅ Found ${topVideos.length} quality suggested videos (sorted by relevance)`);
    if (topVideos.length > 0) {
      console.log(`📹 Top video: "${topVideos[0].title}" (score: ${topVideos[0].relevanceScore})`);
      if (topVideos.length > 1) {
        console.log(`📹 Second video: "${topVideos[1].title}" (score: ${topVideos[1].relevanceScore})`);
      }
    } else {
      console.log('⚠️ No quality videos found with sufficient relevance score');
    }

    return secureJsonResponse({ videos: topVideos });

  } catch (error) {
    console.error('Error in suggest-youtube-videos function:', error);
    return secureErrorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
