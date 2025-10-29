import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const url = new URL(req.url);
    const lessonTitle = url.searchParams.get("lessonTitle");
    const lessonNumber = url.searchParams.get("lessonNumber");
    const subject = url.searchParams.get("subject");
    const grade = url.searchParams.get("grade");
    const targetWords = url.searchParams.get("targetWords");
    if (!lessonTitle || !lessonNumber || !subject || !grade || !targetWords) {
      throw new Error("Missing required parameters");
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    // ... rest of the function remains unchanged ...
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });
  }
});
