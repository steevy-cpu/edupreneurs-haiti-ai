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

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Validation schema
const loginNotificationSchema = z.object({
  email: z.string().email().max(255),
  fullName: z.string().min(1).max(200).transform(s => s.trim()),
  timestamp: z.string().max(100),
  location: z.string().max(200).optional(),
  device: z.string().max(200).optional(),
  userId: z.string().uuid().optional(),
});

// Template signature: resetUrl removed — login notification is purely informational
const getEmailTemplate = (fullName: string, email: string, timestamp: string, device?: string, location?: string) => `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Nouvelle connexion détectée</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
      <tr>
        <td style="padding: 40px 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
            
            <!-- Logo Header -->
            <tr>
              <td style="text-align: center; padding-bottom: 30px;">
                <img src="https://mon-edupreneur.com/logo.png" alt="Edupreneurs" width="180" height="auto" style="display: block; margin: 0 auto; max-width: 180px; height: auto;" />
              </td>
            </tr>
            
            <!-- Main Card -->
            <tr>
              <td>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #ffffff; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Hero Section -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%); padding: 50px 40px; text-align: center;">
                      <div style="font-size: 64px; margin-bottom: 16px;">🔔</div>
                      <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                        Connexion détectée
                      </h1>
                      <p style="margin: 0; font-size: 18px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
                        Nouvelle activité sur votre compte
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 24px 0; font-size: 18px; color: #1e293b; line-height: 1.7;">
                        Salut <strong style="color: #3b82f6;">${fullName}</strong> 👋
                      </p>
                      <p style="margin: 0 0 32px 0; font-size: 16px; color: #475569; line-height: 1.8;">
                        Nous vous informons qu'une connexion a été effectuée sur votre compte Edupreneurs.
                      </p>
                      
                      <!-- Connection Details -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0 16px 16px 0; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 24px;">
                            <h3 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 700; color: #1e40af;">
                              📊 Détails de la connexion
                            </h3>
                            
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 10px 0; border-bottom: 1px solid #bfdbfe;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                      <td style="font-size: 14px; color: #1d4ed8; font-weight: 600;">📧 Email</td>
                                      <td style="font-size: 14px; color: #1e40af; text-align: right;">${email}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0; ${device || location ? 'border-bottom: 1px solid #bfdbfe;' : ''}">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                      <td style="font-size: 14px; color: #1d4ed8; font-weight: 600;">🕐 Date et heure</td>
                                      <td style="font-size: 14px; color: #1e40af; text-align: right;">${timestamp}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              ${device ? `
                              <tr>
                                <td style="padding: 10px 0; ${location ? 'border-bottom: 1px solid #bfdbfe;' : ''}">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                      <td style="font-size: 14px; color: #1d4ed8; font-weight: 600;">💻 Appareil</td>
                                      <td style="font-size: 14px; color: #1e40af; text-align: right;">${device}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              ` : ''}
                              ${location ? `
                              <tr>
                                <td style="padding: 10px 0;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                      <td style="font-size: 14px; color: #1d4ed8; font-weight: 600;">📍 Localisation</td>
                                      <td style="font-size: 14px; color: #1e40af; text-align: right;">${location}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              ` : ''}
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Success Box -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                        <tr>
                          <td style="background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 0 12px 12px 0; padding: 20px;">
                            <p style="margin: 0; font-size: 15px; color: #166534; line-height: 1.6;">
                              <strong>✓ C'était vous ?</strong> Parfait ! Vous n'avez rien à faire. Profitez de votre expérience sur Edupreneurs.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Warning Box -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                        <tr>
                          <td style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 16px; padding: 24px; text-align: center;">
                            <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #991b1b;">
                              ⚠️ Ce n'était pas vous ?
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 14px; color: #b91c1c; line-height: 1.6;">
                              Si vous ne reconnaissez pas cette connexion, sécurisez immédiatement votre compte.
                            </p>
                            <a href="https://mon-edupreneur.com/settings" style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 10px; font-weight: 600; font-size: 14px;">
                              🔐 Sécuriser mon compte
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Security Tip -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="background: #f8fafc; border-radius: 12px; padding: 20px;">
                            <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.6;">
                              <strong style="color: #475569;">💡 Conseil de sécurité :</strong> N'utilisez jamais le même mot de passe sur plusieurs sites et activez l'authentification à deux facteurs lorsque disponible.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 40px 20px; text-align: center;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">
                  Edupreneurs - Votre sécurité est notre priorité
                </p>
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #94a3b8;">
                  © ${new Date().getFullYear()} Edupreneurs. Tous droits réservés.
                </p>
                <p style="margin: 0; font-size: 12px; color: #cbd5e1;">
                  Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
                </p>
              </td>
            </tr>
            
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

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
