/**
 * Security-Hardened: Send Login Notification
 * 
 * Features:
 * - Rate limiting
 * - Input validation
 * - Security headers
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { corsHeaders, securityHeaders, noCacheHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { buildEmailTemplate, BRAND_COLORS } from "../_shared/emails.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const SITE_URL = Deno.env.get("SITE_URL") || "https://mon-edupreneur.com";

// Validation schema
const loginNotificationSchema = z.object({
  email: z.string().email().max(255),
  fullName: z.string().min(1).max(200).transform(s => s.trim()),
  timestamp: z.string().max(100),
  location: z.string().max(200).optional(),
  device: z.string().max(200).optional(),
  userId: z.string().uuid().optional(),
});

// Template: login notification — uses blue accent for informational
const getEmailTemplate = (fullName: string, email: string, timestamp: string, device?: string, location?: string) => {
  return buildEmailTemplate({
    accentColor: BRAND_COLORS.blue,
    icon: '🔔',
    title: 'Connexion détectée',
    subtitle: 'Nouvelle activité sur votre compte',
    body: `
      <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
        Salut <strong style="color:${BRAND_COLORS.blue};">${fullName}</strong> ! 👋
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Une connexion à ton compte vient d'être détectée :
      </p>
      <!-- Connection details -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-left:4px solid ${BRAND_COLORS.blue};border-radius:0 12px 12px 0;margin-bottom:20px;">
      <tr><td style="padding:20px;">
        <p style="margin:0 0 8px;font-size:14px;color:#1e40af;">📅 <strong>Date :</strong> ${timestamp}</p>
        ${device ? `<p style="margin:0 0 8px;font-size:14px;color:#1e40af;">🌐 <strong>Appareil :</strong> ${device}</p>` : ''}
        ${location ? `<p style="margin:0 0 8px;font-size:14px;color:#1e40af;">📍 <strong>Localisation :</strong> ${location}</p>` : ''}
        <p style="margin:0;font-size:14px;color:#1e40af;">📧 <strong>Email :</strong> ${email}</p>
      </td></tr>
      </table>
      <!-- Success box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr><td style="background:#f0fdf4;border-left:4px solid ${BRAND_COLORS.green};border-radius:0 12px 12px 0;padding:16px 20px;">
        <p style="margin:0;font-size:14px;color:#166534;line-height:1.6;">
          ✅ Si c'est toi, aucune action n'est nécessaire.
        </p>
      </td></tr>
      </table>
      <!-- Warning box -->
      <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:#fef2f2;border-left:4px solid ${BRAND_COLORS.red};border-radius:0 12px 12px 0;padding:16px 20px;">
        <p style="margin:0;font-size:14px;color:#991b1b;line-height:1.6;">
          ⚠️ Sinon, sécurise ton compte immédiatement.
        </p>
      </td></tr>
      </table>
    `,
    ctaText: 'Sécuriser mon compte →',
    ctaUrl: SITE_URL + '/settings',
  });
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return corsPreflightResponse();
  }

  const responseHeaders = { ...corsHeaders, ...securityHeaders, ...noCacheHeaders, 'Content-Type': 'application/json' };

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Rate limiting
    const clientIp = getClientIp(req);
    const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.EMAIL, null, clientIp);
    if (!rateCheck.allowed) {
      console.warn(`Rate limit exceeded for send-login-notification from IP ${clientIp}`);
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validation = loginNotificationSchema.safeParse(rawBody);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: validation.error.issues.map(i => i.message) }),
        { status: 400, headers: responseHeaders }
      );
    }

    const { email, fullName, timestamp, location, device } = validation.data;

    console.log("Sending login notification to:", email);

    // Send login notification — purely informational, no reset token needed
    const emailResponse = await resend.emails.send({
      from: "Edupreneurs <noreply@mon-edupreneur.com>",
      to: [email],
      subject: "🔔 Nouvelle connexion à votre compte - Edupreneurs",
      html: getEmailTemplate(fullName, email, timestamp, device, location),
    });

    console.log("Login notification sent successfully:", emailResponse);

    // Standardized response format — success includes messageId
    return new Response(JSON.stringify({ success: true, messageId: emailResponse?.data?.id || null }), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Error sending login notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: responseHeaders }
    );
  }
};

serve(handler);
