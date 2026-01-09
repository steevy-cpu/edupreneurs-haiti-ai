/**
 * Security-Hardened: Reset Password
 * 
 * Features:
 * - Rate limiting (5 req/min to prevent brute force)
 * - Strict input validation with Zod
 * - Strong password requirements
 * - Security headers
 * 
 * OWASP: API2:2023 - Broken Authentication
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { validateInput, resetPasswordSchema, validationErrorResponse } from "../_shared/validation.ts";
import { corsHeaders, securityHeaders, noCacheHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";

const handler = async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return corsPreflightResponse();
  }

  const responseHeaders = {
    "Content-Type": "application/json",
    ...corsHeaders,
    ...securityHeaders,
    ...noCacheHeaders,
  };

  try {
    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get client IP for rate limiting
    const clientIp = getClientIp(req);

    // Check rate limit (auth endpoints need strict limiting)
    const rateCheck = await checkRateLimit(supabaseAdmin, RATE_LIMITS.AUTH, null, clientIp);
    if (!rateCheck.allowed) {
      console.warn(`Rate limit exceeded for password reset from IP: ${clientIp}`);
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validation = validateInput(resetPasswordSchema, rawBody);
    
    if (!validation.success) {
      console.warn("Password reset validation failed:", validation.errors);
      return validationErrorResponse(validation.errors, responseHeaders);
    }

    const { token, newPassword } = validation.data;

    console.log("Processing password reset request");

    // Verify the token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .rpc('verify_reset_token', {
        reset_token: token
      });

    if (tokenError) {
      console.error("Token error:", tokenError.message);
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        {
          status: 400,
          headers: responseHeaders,
        }
      );
    }

    if (!tokenData || (Array.isArray(tokenData) && tokenData.length === 0)) {
      console.error("No token data returned");
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        {
          status: 400,
          headers: responseHeaders,
        }
      );
    }

    // Handle both array and object responses
    const tokenResult = Array.isArray(tokenData) ? tokenData[0] : tokenData;
    const { valid, user_id } = tokenResult;

    if (!valid) {
      return new Response(
        JSON.stringify({ error: "Token invalide ou expiré" }),
        {
          status: 400,
          headers: responseHeaders,
        }
      );
    }

    // Update user password using admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { password: newPassword }
    );

    if (updateError) {
      console.error("Error updating password:", updateError.message);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la mise à jour du mot de passe" }),
        {
          status: 500,
          headers: responseHeaders,
        }
      );
    }

    console.log("Password reset successfully for user:", user_id.substring(0, 8) + "...");

    return new Response(
      JSON.stringify({ success: true, message: "Mot de passe réinitialisé avec succès" }),
      {
        status: 200,
        headers: responseHeaders,
      }
    );
  } catch (error: any) {
    console.error("Error in reset-password function:", error.message);
    return new Response(
      JSON.stringify({ error: "Une erreur est survenue" }),
      {
        status: 500,
        headers: responseHeaders,
      }
    );
  }
};

serve(handler);
