import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, newPassword }: ResetPasswordRequest = await req.json();

    console.log("Processing password reset request");

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify the token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .rpc('verify_reset_token', {
        reset_token: token
      });

    console.log("Token verification result:", { tokenData, tokenError });

    if (tokenError) {
      console.error("Token error:", tokenError);
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré", details: tokenError.message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!tokenData || (Array.isArray(tokenData) && tokenData.length === 0)) {
      console.error("No token data returned");
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Handle both array and object responses
    const tokenResult = Array.isArray(tokenData) ? tokenData[0] : tokenData;
    console.log("Token result:", tokenResult);
    
    const { valid, user_id } = tokenResult;

    if (!valid) {
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Update user password using admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la mise à jour du mot de passe" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Password reset successfully for user:", user_id);

    return new Response(
      JSON.stringify({ success: true, message: "Mot de passe réinitialisé avec succès" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in reset-password function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
