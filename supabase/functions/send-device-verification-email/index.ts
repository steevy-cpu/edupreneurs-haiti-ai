/**
 * Send Device Verification Email
 * 
 * Sends a 6-digit OTP code when a user logs in from an unknown/untrusted device.
 * Rate limited and security hardened.
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { corsHeaders, securityHeaders, noCacheHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { buildEmailTemplate, BRAND_COLORS } from "../_shared/emails.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface DeviceVerificationRequest {
  email: string;
  fullName: string;
  verificationCode: string;
  deviceName: string;
  browser: string;
  os?: string;
}

// Template: device verification — uses amber accent for attention
const getEmailTemplate = (
  fullName: string,
  verificationCode: string,
  deviceName: string,
  browser: string,
  timestamp: string
) => {
  return buildEmailTemplate({
    accentColor: BRAND_COLORS.accent,
    icon: '🛡️',
    title: 'Nouvel appareil détecté',
    subtitle: 'Une vérification supplémentaire est requise',
    body: `
      <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
        Salut <strong style="color:${BRAND_COLORS.accent};">${fullName}</strong> ! 👋
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
        Une connexion depuis un nouvel appareil a été détectée.
        Entre ce code pour confirmer :
      </p>
      <!-- Device info -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef3c7;border-radius:12px;margin-bottom:20px;">
      <tr><td style="padding:16px;">
        <p style="margin:0 0 8px;font-size:14px;color:#92400e;font-weight:600;">📱 Appareil détecté :</p>
        <p style="margin:0 0 4px;font-size:14px;color:#78350f;">${deviceName}</p>
        <p style="margin:0 0 4px;font-size:14px;color:#78350f;">Navigateur : ${browser}</p>
        <p style="margin:0;font-size:14px;color:#78350f;">Date : ${timestamp}</p>
      </td></tr>
      </table>
      <!-- Code box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr><td style="background:linear-gradient(135deg,#f8fafc 0%,#f1f5f9 100%);border:2px dashed #cbd5e1;border-radius:16px;padding:32px;text-align:center;">
        <p style="margin:0 0 12px;font-size:14px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
          Ton code de vérification
        </p>
        <div style="font-size:42px;font-weight:800;color:${BRAND_COLORS.accent};letter-spacing:8px;font-family:'SF Mono',SFMono-Regular,Consolas,monospace;">
          ${verificationCode}
        </div>
        <p style="margin:12px 0 0;font-size:13px;color:#9ca3af;">Ce code expire dans 15 minutes</p>
      </td></tr>
      </table>
      <!-- Security warning -->
      <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:#fef2f2;border-left:4px solid ${BRAND_COLORS.red};border-radius:0 12px 12px 0;padding:16px 20px;">
        <p style="margin:0;font-size:14px;color:#991b1b;line-height:1.6;">
          ⚠️ Si tu ne reconnais pas cette connexion, <strong>change ton mot de passe immédiatement.</strong>
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

    // Check rate limit — use dedicated DEVICE_VERIFY bucket so other email
    // calls on the same IP cannot exhaust this user's verification budget
    const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.DEVICE_VERIFY, null, clientIp);
    if (!rateCheck.allowed) {
      console.warn(`Device verify rate limit exceeded for IP: ${clientIp}`);
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    // Parse and validate input
    const body: DeviceVerificationRequest = await req.json();
    const { email, fullName, verificationCode, deviceName, browser } = body;

    if (!email || !fullName || !verificationCode || !deviceName || !browser) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: responseHeaders }
      );
    }

    // Log without sensitive data
    console.log("Sending device verification email to:", email.substring(0, 3) + "***");

    const timestamp = new Date().toLocaleString('fr-FR', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    const emailResponse = await resend.emails.send({
      from: "Edupreneurs <noreply@mon-edupreneur.com>",
      to: [email],
      subject: "🛡️ Vérification de nouvel appareil - Edupreneurs",
      html: getEmailTemplate(fullName, verificationCode, deviceName, browser, timestamp),
    });

    // Structured delivery logging so failures are visible in edge function logs
    if (emailResponse.error) {
      console.error("Resend delivery failed:", JSON.stringify(emailResponse.error));
      return new Response(
        JSON.stringify({ success: false, error: "Erreur de livraison email", details: emailResponse.error }),
        { status: 500, headers: responseHeaders }
      );
    }

    console.log("Device verification email delivered. id:", emailResponse.data?.id);

    // Standardized response format
    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id || null }), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Error sending device verification email:", error.message);
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
