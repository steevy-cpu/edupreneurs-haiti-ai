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
    const { query, maxResults = 6 } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    
    if (!YOUTUBE_API_KEY) {
      console.error('YOUTUBE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'YouTube API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return new Response(
        JSON.stringify({ videos: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in youtube-search function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error', videos: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
