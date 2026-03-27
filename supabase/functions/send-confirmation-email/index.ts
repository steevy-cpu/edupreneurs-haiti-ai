/**
 * Security-Hardened: Send Confirmation Email
 * 
 * Features:
 * - Rate limiting (10 req/min for auth, 3 req/min for anon)
 * - Strict input validation with Zod
 * - Security headers
 * 
 * OWASP: API4:2023 - Unrestricted Resource Consumption
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { validateInput, confirmationEmailSchema, validationErrorResponse } from "../_shared/validation.ts";
import { corsHeaders, securityHeaders, noCacheHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { buildEmailTemplate, BRAND_COLORS } from "../_shared/emails.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Template: confirmation code email — uses brand secondary (violet) header
const getEmailTemplate = (fullName: string, nickname: string | null | undefined, academicGrade: string | null | undefined, email: string, confirmationCode: string) => {
  return buildEmailTemplate({
    accentColor: BRAND_COLORS.secondary,
    icon: '✉️',
    title: 'Vérifiez votre email',
    subtitle: "Plus qu'une étape pour rejoindre l'aventure !",
    body: `
      <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
        Salut <strong style="color:${BRAND_COLORS.secondary};">${fullName}</strong> ! 👋
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Voici ton code de confirmation pour finaliser la création de ton compte :
      </p>
      <!-- Code box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="background:linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%);border:2px dashed #cbd5e1;border-radius:16px;padding:32px;text-align:center;">
        <p style="margin:0 0 12px;font-size:14px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
          Ton code de confirmation
        </p>
        <div style="font-size:42px;font-weight:800;color:${BRAND_COLORS.secondary};letter-spacing:8px;font-family:'SF Mono',SFMono-Regular,Consolas,'Liberation Mono',Menlo,monospace;">
          ${confirmationCode}
        </div>
      </td></tr>
      </table>
      <!-- Account info summary -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Nom</td><td style="padding:8px 0;text-align:right;color:#1e293b;font-size:13px;font-weight:600;">${fullName}</td></tr>
        ${nickname ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Pseudo</td><td style="padding:8px 0;text-align:right;color:#1e293b;font-size:13px;font-weight:600;">@${nickname}</td></tr>` : ''}
        ${academicGrade ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Niveau</td><td style="padding:8px 0;text-align:right;color:#1e293b;font-size:13px;font-weight:600;">${academicGrade}</td></tr>` : ''}
        <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Email</td><td style="padding:8px 0;text-align:right;color:#1e293b;font-size:13px;font-weight:600;">${email}</td></tr>
        </table>
      </td></tr>
      </table>
      <!-- Security warning -->
      <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:#fef3c7;border-left:4px solid ${BRAND_COLORS.accent};border-radius:0 12px 12px 0;padding:16px 20px;">
        <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6;">
          ⏱️ Ce code expire dans <strong>15 minutes</strong>. Ne le partage avec personne.
        </p>
      </td></tr>
      </table>
    `,
  });
};

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
    // Initialize Supabase for rate limiting
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get client IP for rate limiting
    const clientIp = getClientIp(req);

    // Check rate limit (email endpoints are strictly limited)
    const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.EMAIL, null, clientIp);
    if (!rateCheck.allowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validation = validateInput(confirmationEmailSchema, rawBody);
    
    if (!validation.success) {
      console.warn("Validation failed:", validation.errors);
      return validationErrorResponse(validation.errors, responseHeaders);
    }

    const { email, fullName, nickname, academicGrade, confirmationCode } = validation.data;

    // Log without sensitive data
    console.log("Sending confirmation email to:", email.substring(0, 3) + "***");

    const emailResponse = await resend.emails.send({
      from: "Edupreneurs <noreply@mon-edupreneur.com>",
      to: [email],
      subject: "✉️ Confirmez votre inscription - Edupreneurs",
      html: getEmailTemplate(fullName, nickname, academicGrade, email, confirmationCode),
    });

    console.log("Email sent successfully");

    // Standardized response format
    return new Response(JSON.stringify({ success: true, messageId: emailResponse?.data?.id || null }), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error.message);
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
