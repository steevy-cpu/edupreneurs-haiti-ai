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

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface DeviceVerificationRequest {
  email: string;
  fullName: string;
  verificationCode: string;
  deviceName: string;
  browser: string;
  os?: string;
}

const getEmailTemplate = (
  fullName: string,
  verificationCode: string,
  deviceName: string,
  browser: string,
  timestamp: string
) => `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <title>Vérification de nouvel appareil</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
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
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #ffffff; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Hero Section -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 50px 40px; text-align: center;">
                      <div style="font-size: 64px; margin-bottom: 16px;">🔐</div>
                      <h1 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 800; color: #ffffff;">
                        Nouvel appareil détecté
                      </h1>
                      <p style="margin: 0; font-size: 16px; color: rgba(255, 255, 255, 0.9);">
                        Une vérification supplémentaire est requise
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 24px 0; font-size: 18px; color: #1e293b; line-height: 1.7;">
                        Salut <strong style="color: #d97706;">${fullName}</strong> 👋
                      </p>
                      <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569; line-height: 1.8;">
                        Nous avons détecté une tentative de connexion depuis un nouvel appareil. Pour protéger votre compte, veuillez entrer le code ci-dessous.
                      </p>
                      
                      <!-- Device Info -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 16px;">
                            <p style="margin: 0 0 8px 0; font-size: 14px; color: #92400e; font-weight: 600;">📱 Appareil détecté :</p>
                            <p style="margin: 0 0 4px 0; font-size: 14px; color: #78350f;">${deviceName}</p>
                            <p style="margin: 0 0 4px 0; font-size: 14px; color: #78350f;">Navigateur : ${browser}</p>
                            <p style="margin: 0; font-size: 14px; color: #78350f;">Date : ${timestamp}</p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Code Box -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px dashed #cbd5e1; border-radius: 16px; padding: 32px; text-align: center;">
                            <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                              Votre code de vérification
                            </p>
                            <div style="font-size: 42px; font-weight: 800; color: #d97706; letter-spacing: 8px; font-family: 'SF Mono', monospace;">
                              ${verificationCode}
                            </div>
                            <p style="margin: 12px 0 0 0; font-size: 13px; color: #94a3b8;">
                              Ce code expire dans 15 minutes
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Security Notice -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="background: #fee2e2; border-left: 4px solid #ef4444; border-radius: 0 12px 12px 0; padding: 16px 20px;">
                            <p style="margin: 0; font-size: 14px; color: #991b1b; line-height: 1.6;">
                              <strong>⚠️ Ce n'est pas vous ?</strong> Si vous n'avez pas tenté de vous connecter, ignorez cet email et envisagez de changer votre mot de passe.
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
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b;">
                  Si vous n'avez pas demandé cette vérification, ignorez cet email.
                </p>
                <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                  © 2025 Edupreneurs. Tous droits réservés.
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
      subject: "🔐 Vérification de nouvel appareil - Edupreneurs",
      html: getEmailTemplate(fullName, verificationCode, deviceName, browser, timestamp),
    });

    console.log("Device verification email sent successfully");

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Error sending device verification email:", error.message);
    return new Response(
      JSON.stringify({ error: "Erreur lors de l'envoi de l'email" }),
      {
        status: 500,
        headers: responseHeaders,
      }
    );
  }
};

serve(handler);
