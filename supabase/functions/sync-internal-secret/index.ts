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
  if (!authHeader || !serviceKey || !authHeader.includes(serviceKey)) {
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
    // Use service-role client to call the helper DB function
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceKey!,
    );

    const { error } = await supabase.rpc("set_internal_call_secret", {
      p_secret: secret,
    });

    if (error) {
      return new Response(JSON.stringify({
        error: "Failed to set GUC",
        detail: error.message,
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "app.settings.internal_call_secret configured on authenticator role",
      secret_length: secret.length,
    }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
