import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsPreflightResponse, secureJsonResponse, secureErrorResponse } from "../_shared/securityHeaders.ts";
import { validateInput, donationThankYouSchema } from "../_shared/validation.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_URL = Deno.env.get("SITE_URL") || "https://edupreneurs-haiti-ai.lovable.app";

function buildThankYouEmail(donorName: string, amount: number, currency: string, orderId: string): string {
  const displayName = donorName || "Ami(e) d'Edupreneurs";
  const formattedAmount = currency === "HTG"
    ? `${amount.toLocaleString("fr-HT")} HTG`
    : `$${amount.toFixed(2)} USD`;

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f7f6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f6;padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#16a34a,#059669);padding:40px 32px;text-align:center;">
  <div style="font-size:48px;margin-bottom:8px;">💚</div>
  <h1 style="color:#ffffff;font-size:28px;margin:0 0 4px;">Mèsi anpil!</h1>
  <p style="color:#d1fae5;font-size:14px;margin:0;">Votre générosité change des vies 🇭🇹</p>
</td></tr>

<!-- Body -->
<tr><td style="padding:32px;">
  <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
    Bonjour <strong>${displayName}</strong>,
  </p>
  <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
    Nous avons bien reçu votre don et nous vous en remercions du fond du cœur. Grâce à des personnes comme vous, des élèves haïtiens accèdent à une éducation de qualité.
  </p>

  <!-- Amount Card -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
  <tr><td style="padding:20px;text-align:center;">
    <p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Montant du don</p>
    <p style="color:#16a34a;font-size:32px;font-weight:700;margin:0;">${formattedAmount}</p>
    <p style="color:#9ca3af;font-size:12px;margin:8px 0 0;">Réf: ${orderId}</p>
  </td></tr>
  </table>

  <!-- Impact Section -->
  <p style="color:#374151;font-size:14px;font-weight:600;margin:0 0 12px;">📊 Où va votre don?</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  <tr>
    <td width="50%" style="padding-right:6px;">
      <table width="100%" style="background:#eff6ff;border-radius:10px;"><tr><td style="padding:16px;text-align:center;">
        <div style="font-size:24px;margin-bottom:4px;">💻</div>
        <p style="color:#1e40af;font-size:13px;font-weight:600;margin:0;">Technologie</p>
        <p style="color:#6b7280;font-size:11px;margin:4px 0 0;">Serveurs & IA</p>
      </td></tr></table>
    </td>
    <td width="50%" style="padding-left:6px;">
      <table width="100%" style="background:#fef3c7;border-radius:10px;"><tr><td style="padding:16px;text-align:center;">
        <div style="font-size:24px;margin-bottom:4px;">📚</div>
        <p style="color:#92400e;font-size:13px;font-weight:600;margin:0;">Contenu éducatif</p>
        <p style="color:#6b7280;font-size:11px;margin:4px 0 0;">Leçons & exercices</p>
      </td></tr></table>
    </td>
  </tr>
  </table>

  <!-- CTA -->
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <a href="${SITE_URL}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;">
      Visiter Edupreneurs
    </a>
  </td></tr></table>
</td></tr>

<!-- Footer -->
<tr><td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
  <p style="color:#9ca3af;font-size:12px;margin:0;">
    © ${new Date().getFullYear()} Edupreneurs Haiti · Transfòme edikasyon an nan Ayiti
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return corsPreflightResponse();

  try {
    if (!RESEND_API_KEY) {
      return secureErrorResponse("Email service not configured", 500);
    }

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
        from: "Edupreneurs Haiti <noreply@edupreneurs.com>",
        to: [donorEmail],
        subject: "💚 Mèsi anpil pou don ou! — Edupreneurs Haiti",
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
