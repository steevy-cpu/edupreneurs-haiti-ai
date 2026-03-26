/**
 * Sync INTERNAL_CALL_SECRET from edge function env into app_internal_config table.
 * This bridges the gap: edge functions have the secret as an env var,
 * but pg_cron jobs need it stored in the database to pass it in HTTP headers.
 * Safe to invoke multiple times (upsert).
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (_req) => {
  const secret = Deno.env.get("INTERNAL_CALL_SECRET");
  if (!secret) {
    return new Response(JSON.stringify({ error: "INTERNAL_CALL_SECRET not set in env" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Service-role client to write to app_internal_config
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Upsert the real secret value into the config table
    const { error } = await supabase
      .from("app_internal_config")
      .upsert(
        { key: "internal_call_secret", value: secret, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );

    if (error) {
      return new Response(JSON.stringify({
        error: "Failed to upsert secret",
        detail: error.message,
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Secret synced to app_internal_config",
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
