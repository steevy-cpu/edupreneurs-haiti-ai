/**
 * send-donation-thank-you
 * Sends a thank-you email to donors via Resend.
 *
 * Security: JWT required + EMAIL rate limit (10 auth / 3 anon per min)
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsPreflightResponse, secureJsonResponse, secureErrorResponse } from "../_shared/securityHeaders.ts";
import { validateInput, donationThankYouSchema } from "../_shared/validation.ts";
import { checkRateLimit, RATE_LIMITS, getClientIp, rateLimitResponse } from "../_shared/rateLimiter.ts";
import { buildEmailTemplate, BRAND_COLORS } from "../_shared/emails.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_URL = Deno.env.get("SITE_URL") || "https://mon-edupreneur.com";

// Template: donation thank you — uses cyan accent for generosity
function buildThankYouEmail(donorName: string, amount: number, currency: string, orderId: string): string {
  const displayName = donorName || "Ami(e) d'Edupreneurs";
  const formattedAmount = currency === "HTG"
    ? `${amount.toLocaleString("fr-HT")} HTG`
    : `$${amount.toFixed(2)} USD`;

  return buildEmailTemplate({
    accentColor: BRAND_COLORS.cyan,
    icon: '💙',
    title: 'Mèsi anpil!',
    subtitle: 'Votre générosité change des vies 🇭🇹',
    body: `
      <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
        Mèsi anpil <strong style="color:${BRAND_COLORS.cyan};">${displayName}</strong> ! 🙏
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
        Ton don de <strong>${formattedAmount}</strong> va directement aider les élèves
        haïtiens à accéder à une éducation de qualité. Tu fais partie du changement. 🇭🇹
      </p>
      <!-- Amount card -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;margin-bottom:24px;">
      <tr><td style="padding:20px;text-align:center;">
        <p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Montant du don</p>
        <p style="color:${BRAND_COLORS.cyan};font-size:32px;font-weight:700;margin:0;">${formattedAmount}</p>
        <p style="color:#9ca3af;font-size:12px;margin:8px 0 0;">Réf: ${orderId}</p>
      </td></tr>
      </table>
      <!-- Impact message -->
      <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:#f0fdfd;border-left:4px solid ${BRAND_COLORS.primary};border-radius:0 12px 12px 0;padding:16px 20px;">
        <p style="margin:0;font-size:14px;color:${BRAND_COLORS.primaryDark};line-height:1.6;">
          💡 Avec ton soutien, Edupreneurs peut continuer à offrir un accès
          gratuit aux élèves qui en ont le plus besoin.
        </p>
      </td></tr>
      </table>
    `,
    ctaText: 'Visiter Edupreneurs →',
    ctaUrl: SITE_URL,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return corsPreflightResponse();

  try {
    if (!RESEND_API_KEY) {
      return secureErrorResponse("Email service not configured", 500);
    }

    // ── JWT Authentication ──────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return secureErrorResponse("Non autorisé", 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return secureErrorResponse("Non autorisé", 401);
    }
    const userId = claimsData.claims.sub;

    // ── Rate Limiting ───────────────────────────────────────────────────────
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const clientIp = getClientIp(req);
    const rlResult = await checkRateLimit(serviceClient, RATE_LIMITS.EMAIL, userId, clientIp);
    if (!rlResult.allowed) {
      return rateLimitResponse(rlResult.retryAfter ?? 60, rlResult.remaining, corsHeaders);
    }

    // ── Business Logic ──────────────────────────────────────────────────────
    const body = await req.json();
    const validation = validateInput(donationThankYouSchema, body);
    if (!validation.success) {
      return secureErrorResponse("Données invalides", 400, validation.errors);
    }

    const { donorName, donorEmail, amount, currency, orderId } = validation.data;

    const html = buildThankYouEmail(donorName || "", amount, currency, orderId);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Edupreneurs Haiti <noreply@mon-edupreneur.com>",
        to: [donorEmail],
        subject: "💙 Mèsi anpil pou don ou! — Edupreneurs Haiti",
        html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend error:", errorText);
      return secureErrorResponse("Failed to send email", 500);
    }

    return secureJsonResponse({ success: true });
  } catch (error) {
    console.error("send-donation-thank-you error:", error);
    return secureErrorResponse("Internal server error", 500);
  }
});
