/**
 * Security-Hardened: Send Password Reset Email
 * 
 * Features:
 * - Rate limiting (5 req/min to prevent abuse)
 * - Input validation
 * - Security headers
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { validateInput, passwordResetEmailSchema, validationErrorResponse } from "../_shared/validation.ts";
import { corsHeaders, securityHeaders, noCacheHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { buildEmailTemplate, BRAND_COLORS } from "../_shared/emails.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Template: password reset — uses red accent for urgency
const getEmailTemplate = (resetUrl: string, fullName?: string) => {
  const userName = fullName || 'Utilisateur';
  return buildEmailTemplate({
    accentColor: BRAND_COLORS.red,
    icon: '🔐',
    title: 'Réinitialisation',
    subtitle: 'de votre mot de passe',
    body: `
      <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
        Salut <strong style="color:${BRAND_COLORS.red};">${userName}</strong> ! 👋
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Tu as demandé la réinitialisation de ton mot de passe Edupreneurs.
        Clique sur le bouton ci-dessous pour créer un nouveau mot de passe sécurisé.
      </p>
      <!-- Warning box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td style="background:#fef2f2;border-left:4px solid ${BRAND_COLORS.red};border-radius:0 12px 12px 0;padding:16px 20px;">
        <p style="margin:0;font-size:14px;color:#991b1b;line-height:1.6;">
          ⚠️ Si tu n'as pas demandé cette réinitialisation, ignore cet email.
          Ton compte reste sécurisé.
        </p>
      </td></tr>
      </table>
      <p style="color:#9ca3af;font-size:13px;margin:0;">
        Ce lien expire dans 1 heure.
      </p>
    `,
    ctaText: 'Réinitialiser mon mot de passe →',
    ctaUrl: resetUrl,
  });
};

const handler = async (req: Request): Promise<Response> => {
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
    // Initialize Supabase for rate limiting
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get client IP for rate limiting
    const clientIp = getClientIp(req);

    // Check rate limit (very strict for password reset)
    const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.EMAIL, null, clientIp);
    if (!rateCheck.allowed) {
      console.warn(`Rate limit exceeded for password reset email from IP: ${clientIp}`);
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validation = validateInput(passwordResetEmailSchema, rawBody);
    
    if (!validation.success) {
      console.warn("Validation failed:", validation.errors);
      return validationErrorResponse(validation.errors, responseHeaders);
    }

    const { email, resetUrl, fullName } = validation.data;

    console.log("Sending password reset email to:", email.substring(0, 3) + "***");

    const emailResponse = await resend.emails.send({
      from: "Edupreneurs <noreply@mon-edupreneur.com>",
      to: [email],
      subject: "🔐 Réinitialisation de votre mot de passe - Edupreneurs",
      html: getEmailTemplate(resetUrl, fullName),
    });

    console.log("Password reset email sent successfully");

    // Standardized response format
    return new Response(JSON.stringify({ success: true, messageId: emailResponse?.data?.id || null }), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Error sending password reset email:", error.message);
    return new Response(
      JSON.stringify({ success: false, error: "Erreur lors de l'envoi de l'email" }),
      {
        status: 500,
        headers: responseHeaders,
      }
    );
  }
};

serve(handler);
