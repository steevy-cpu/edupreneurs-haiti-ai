/**
 * TEMPORARY — One-shot function to sync INTERNAL_CALL_SECRET
 * from edge function env vars into PostgreSQL GUC setting.
 * DELETE THIS FUNCTION after successful execution.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  // Only allow service-role bearer token auth
  const authHeader = req.headers.get("Authorization");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!authHeader || !authHeader.includes(serviceKey!)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const secret = Deno.env.get("INTERNAL_CALL_SECRET");
  if (!secret) {
    return new Response(JSON.stringify({ error: "INTERNAL_CALL_SECRET not set in env" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Set the GUC on the authenticator role so pg_cron can read it
    const { error } = await supabase.rpc("exec_sql", {
      query: `ALTER ROLE authenticator SET "app.settings.internal_call_secret" = '${secret.replace(/'/g, "''")}'`,
    });

    if (error) {
      // Fallback: try via direct pg connection if rpc doesn't exist
      return new Response(JSON.stringify({
        error: "rpc exec_sql not available",
        detail: error.message,
        secret_length: secret.length,
        hint: "Run ALTER ROLE manually with this secret length confirmation",
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "GUC set on authenticator role" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
