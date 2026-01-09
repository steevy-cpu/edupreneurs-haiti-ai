import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { corsHeaders, securityHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Input validation schema
const youtubeSearchSchema = z.object({
  query: z.string().min(1).max(500).transform(s => s.trim()),
  maxResults: z.number().int().min(1).max(25).optional().default(6),
}).strict();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get auth token
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    // Rate limiting
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(
      supabase,
      RATE_LIMITS.GENERAL,
      userId,
      clientIp
    );

    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfter!, rateLimit.remaining, corsHeaders);
    }

    // Validate input
    const body = await req.json();
    const validation = youtubeSearchSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error.errors, videos: [] }),
        { status: 400, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query, maxResults } = validation.data;

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    
    if (!YOUTUBE_API_KEY) {
      console.error('YOUTUBE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'YouTube API not configured', videos: [] }),
        { status: 500, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `maxResults=${maxResults}&` +
      `q=${encodeURIComponent(query)}&` +
      `type=video&` +
      `videoEmbeddable=true&` +
      `videoDuration=medium&` +
      `relevanceLanguage=fr&` +
      `regionCode=HT&` +
      `videoDefinition=any&` +
      `safeSearch=strict&` +
      `order=relevance&` +
      `key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('YouTube API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch videos from YouTube', videos: [] }),
        { status: 200, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return new Response(
        JSON.stringify({ videos: [] }),
        { headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter out English-only content
    const videos = data.items
      .filter((item: any) => {
        const title = item.snippet.title.toLowerCase();
        const description = item.snippet.description.toLowerCase();
        const englishIndicators = ['english', 'in english', 'english lesson'];
        return !englishIndicators.some(indicator => 
          title.includes(indicator) || description.includes(indicator)
        );
      })
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        channelTitle: item.snippet.channelTitle
      }));

    return new Response(
      JSON.stringify({ videos }),
      { headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in youtube-search function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', videos: [] }),
      { status: 500, headers: { ...corsHeaders, ...securityHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
