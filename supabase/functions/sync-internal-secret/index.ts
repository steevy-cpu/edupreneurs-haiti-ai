/**
 * TEMPORARY — One-shot function to sync INTERNAL_CALL_SECRET
 * from edge function env vars into PostgreSQL GUC setting.
 * DELETE after successful execution.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (_req) => {
  const secret = Deno.env.get("INTERNAL_CALL_SECRET");
  if (!secret) {
    return new Response(JSON.stringify({ error: "INTERNAL_CALL_SECRET not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
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
      message: "GUC configured on authenticator role",
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
