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

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const getEmailTemplate = (fullName: string, nickname: string, academicGrade: string, email: string, confirmationCode: string) => `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Confirmez votre inscription</title>
    <!--[if mso]>
    <noscript>
      <xml>
        <o:OfficeDocumentSettings>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    </noscript>
    <![endif]-->
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
                    <td style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%); padding: 50px 40px; text-align: center;">
                      <div style="font-size: 64px; margin-bottom: 16px;">✉️</div>
                      <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                        Vérifiez votre email
                      </h1>
                      <p style="margin: 0; font-size: 18px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
                        Plus qu'une étape pour rejoindre l'aventure !
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 24px 0; font-size: 18px; color: #1e293b; line-height: 1.7;">
                        Salut <strong style="color: #6366f1;">${fullName}</strong> 👋
                      </p>
                      <p style="margin: 0 0 32px 0; font-size: 16px; color: #475569; line-height: 1.8;">
                        Bienvenue sur Edupreneurs ! Pour activer votre compte et commencer votre parcours d'apprentissage, veuillez utiliser le code de confirmation ci-dessous. <strong style="color: #ef4444;">Ce code expire dans 1 heure.</strong>
                      </p>
                      
                      <!-- Code Box -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px dashed #cbd5e1; border-radius: 16px; padding: 32px; text-align: center;">
                            <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                              Votre code de confirmation
                            </p>
                            <div style="font-size: 42px; font-weight: 800; color: #6366f1; letter-spacing: 8px; font-family: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;">
                              ${confirmationCode}
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Divider -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                        <tr>
                          <td style="height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent);"></td>
                        </tr>
                      </table>
                      
                      <!-- Account Info -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f8fafc; border-radius: 16px; overflow: hidden; margin-bottom: 32px;">
                        <tr>
                          <td style="padding: 24px;">
                            <h3 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 700; color: #1e293b;">
                              📋 Informations de votre compte
                            </h3>
                            
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                  <span style="font-size: 14px; color: #64748b;">Nom complet</span>
                                </td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                  <span style="font-size: 14px; color: #1e293b; font-weight: 600;">${fullName}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                  <span style="font-size: 14px; color: #64748b;">Pseudo</span>
                                </td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                  <span style="font-size: 14px; color: #1e293b; font-weight: 600;">@${nickname}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                                  <span style="font-size: 14px; color: #64748b;">Niveau</span>
                                </td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">
                                  <span style="font-size: 14px; color: #1e293b; font-weight: 600;">${academicGrade}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 0;">
                                  <span style="font-size: 14px; color: #64748b;">Email</span>
                                </td>
                                <td style="padding: 12px 0; text-align: right;">
                                  <span style="font-size: 14px; color: #1e293b; font-weight: 600;">${email}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Security Notice -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 0 12px 12px 0; padding: 16px 20px;">
                            <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.6;">
                              <strong>🔒 Important :</strong> Gardez ce code en sécurité et ne le partagez avec personne.
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
                  Si vous n'avez pas créé ce compte, veuillez ignorer cet email.
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

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error.message);
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
