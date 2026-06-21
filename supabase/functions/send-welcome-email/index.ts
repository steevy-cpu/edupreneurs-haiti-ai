/**
 * Security-Hardened: Send Welcome Email
 * 
 * Features:
 * - Rate limiting (10 req/min for auth, 3 req/min for anon)
 * - Input validation with Zod
 * - Security headers
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { validateInput, welcomeEmailSchema, validationErrorResponse } from "../_shared/validation.ts";
import { corsHeaders, securityHeaders, noCacheHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { buildEmailTemplate, BRAND_COLORS } from "../_shared/emails.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const SITE_URL = Deno.env.get("SITE_URL") || "https://mon-edupreneur.com";

// Template: welcome email — sent AFTER email verification is complete
const getEmailTemplate = (fullName: string, nickname: string | null) => {
  const displayName = nickname || fullName;
  return buildEmailTemplate({
    accentColor: BRAND_COLORS.primary,
    icon: '🎉',
    title: 'Bienvenue parmi nous !',
    subtitle: 'Ton aventure éducative commence maintenant',
    body: `
      <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
        Salut <strong style="color:${BRAND_COLORS.primary};">${displayName}</strong> ! 👋
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Ton compte Edupreneurs est maintenant actif. Tu as accès à plus de
        <strong>2 800 leçons</strong> alignées sur le programme du MENFP,
        des examens officiels du BAC avec corrections IA, et ton assistant
        personnel <strong>Jude</strong> disponible 24h/24.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfd;border:1px solid #b2dfdb;border-radius:12px;margin-bottom:20px;">
      <tr><td style="padding:16px;text-align:center;">
        <p style="color:${BRAND_COLORS.primaryDark};font-size:15px;font-weight:700;margin:0 0 4px;">
          🎁 Accès gratuit jusqu'au 8 septembre 2026
        </p>
        <p style="color:#374151;font-size:13px;margin:0;">
          Profite de toutes les fonctionnalités sans limitation.
        </p>
      </td></tr>
      </table>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0;">
        Commence ta première leçon dès aujourd'hui ! 🚀
      </p>
    `,
    ctaText: 'Commencer à apprendre →',
    ctaUrl: SITE_URL + '/dashboard',
    showJudeSignature: true,
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

    // Check rate limit
    const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.EMAIL, null, clientIp);
    if (!rateCheck.allowed) {
      console.warn(`Rate limit exceeded for welcome email from IP: ${clientIp}`);
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validation = validateInput(welcomeEmailSchema, rawBody);
    
    if (!validation.success) {
      console.warn("Validation failed:", validation.errors);
      return validationErrorResponse(validation.errors, responseHeaders);
    }

    const { email, fullName, nickname } = validation.data;

    console.log("Sending welcome email to:", email.substring(0, 3) + "***");

    const emailResponse = await resend.emails.send({
      from: "Edupreneurs <noreply@mon-edupreneur.com>",
      to: [email],
      subject: "🎉 Bienvenue sur Edupreneurs !",
      html: getEmailTemplate(fullName, nickname ?? null),
    });

    console.log("Welcome email sent successfully");

    // Standardized response format
    return new Response(JSON.stringify({ success: true, messageId: emailResponse?.data?.id || null }), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error.message);
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
