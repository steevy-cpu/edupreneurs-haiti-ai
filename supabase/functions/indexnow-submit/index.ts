/**
 * @file indexnow-submit/index.ts
 * @description Soumet des URLs à Bing IndexNow pour indexation instantanée.
 * @security X-Internal-Secret requis ou JWT fondateur
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Clé IndexNow — doit correspondre exactement au fichier public/{key}.txt
const INDEXNOW_KEY = "ed8f3a2c1b5d4e7f9a0c2b6d8e1f3a5c";
const SITE_URL = "https://mon-edupreneur.com";
const BING_ENDPOINT = "https://www.bing.com/indexnow";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Auth : X-Internal-Secret OU JWT fondateur — protège contre les appels non autorisés
  const internalSecret = req.headers.get("x-internal-secret");
  const expectedSecret = Deno.env.get("INTERNAL_CALL_SECRET");

  if (internalSecret !== expectedSecret) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  try {
    const body = await req.json();
    const { urls } = body;

    // URLs à soumettre — utiliser les URLs fournies ou les URLs publiques par défaut
    const urlsToSubmit: string[] =
      urls && urls.length > 0
        ? urls
        : [
            `${SITE_URL}/`,
            `${SITE_URL}/blog`,
            `${SITE_URL}/templates`,
            `${SITE_URL}/templates/schedule`,
            `${SITE_URL}/templates/planner`,
            `${SITE_URL}/templates/budget`,
            `${SITE_URL}/templates/certificate`,
            `${SITE_URL}/templates/resume`,
            `${SITE_URL}/templates/invoice`,
          ];

    // Payload IndexNow selon la spec officielle
    const payload = {
      host: "mon-edupreneur.com",
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urlsToSubmit,
    };

    // Soumettre à Bing
    const response = await fetch(BING_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });

    const statusCode = response.status;

    // 200 = OK, 202 = Accepted — les deux sont des réponses de succès
    if (statusCode === 200 || statusCode === 202) {
      return new Response(
        JSON.stringify({
          success: true,
          submitted: urlsToSubmit.length,
          urls: urlsToSubmit,
          bingStatus: statusCode,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      const responseText = await response.text();
      return new Response(
        JSON.stringify({
          success: false,
          error: `Bing a retourné ${statusCode}`,
          details: responseText,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
