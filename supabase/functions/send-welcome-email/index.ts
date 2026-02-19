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

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Template: welcome email — no verification URL needed (custom OTP flow handles it)
const getEmailTemplate = (fullName: string) => `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue sur Edupreneurs</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
      <tr>
        <td style="padding: 40px 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
            
            <tr>
              <td style="text-align: center; padding-bottom: 30px;">
                <img src="https://mon-edupreneur.com/logo.png" alt="Edupreneurs" width="180" height="auto" style="display: block; margin: 0 auto;" />
              </td>
            </tr>
            
            <tr>
              <td>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #ffffff; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <tr>
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); padding: 50px 40px; text-align: center;">
                      <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
                      <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 800; color: #ffffff;">
                        Bienvenue parmi nous !
                      </h1>
                      <p style="margin: 0; font-size: 18px; color: rgba(255, 255, 255, 0.9);">
                        Votre aventure éducative commence maintenant
                      </p>
                    </td>
                  </tr>
                  
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 24px 0; font-size: 18px; color: #1e293b;">
                        Salut <strong style="color: #10b981;">${fullName}</strong> 👋
                      </p>
                      <p style="margin: 0 0 32px 0; font-size: 16px; color: #475569; line-height: 1.8;">
                        Félicitations ! Vous faites maintenant partie de la communauté Edupreneurs.
                      </p>
                      
                      ${verificationUrl ? `
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                        <tr>
                          <td style="text-align: center;">
                            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700;">
                              ✓ Vérifier mon email
                            </a>
                          </td>
                        </tr>
                      </table>
                      ` : ''}
                      
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                        <tr>
                          <td style="padding-bottom: 20px;">
                            <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1e293b;">
                              🚀 Ce qui vous attend
                            </h3>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td width="48%" style="vertical-align: top; padding-right: 8px; padding-bottom: 16px;">
                                  <table style="background: #f0fdf4; border-radius: 16px; padding: 20px;" width="100%">
                                    <tr><td>
                                      <div style="font-size: 32px; margin-bottom: 12px;">📚</div>
                                      <h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #166534;">Cours interactifs</h4>
                                      <p style="margin: 0; font-size: 13px; color: #15803d;">Apprenez de manière ludique</p>
                                    </td></tr>
                                  </table>
                                </td>
                                <td width="48%" style="vertical-align: top; padding-left: 8px; padding-bottom: 16px;">
                                  <table style="background: #eff6ff; border-radius: 16px; padding: 20px;" width="100%">
                                    <tr><td>
                                      <div style="font-size: 32px; margin-bottom: 12px;">🤖</div>
                                      <h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #1e40af;">Assistant IA Jude</h4>
                                      <p style="margin: 0; font-size: 13px; color: #1d4ed8;">Tuteur disponible 24/7</p>
                                    </td></tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
            
            <tr>
              <td style="padding: 40px 20px; text-align: center;">
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
      html: getEmailTemplate(fullName),
    });

    console.log("Welcome email sent successfully");

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error.message);
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
