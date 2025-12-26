import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetUrl: string;
}

const getEmailTemplate = (resetUrl: string) => `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Réinitialisation de mot de passe</title>
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
                    <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%); padding: 50px 40px; text-align: center;">
                      <div style="font-size: 64px; margin-bottom: 16px;">🔐</div>
                      <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                        Réinitialisation
                      </h1>
                      <p style="margin: 0; font-size: 18px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
                        de votre mot de passe
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 24px 0; font-size: 18px; color: #1e293b; line-height: 1.7;">
                        Bonjour 👋
                      </p>
                      <p style="margin: 0 0 32px 0; font-size: 16px; color: #475569; line-height: 1.8;">
                        Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Edupreneurs. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                        <tr>
                          <td style="text-align: center;">
                            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 14px -3px rgba(249, 115, 22, 0.4);">
                              🔑 Réinitialiser mon mot de passe
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td style="text-align: center; padding-top: 12px;">
                            <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                              Ce lien est valide pendant 1 heure
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Warning Box -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                        <tr>
                          <td style="background: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0 12px 12px 0; padding: 20px;">
                            <p style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #991b1b;">
                              ⚠️ Important !
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #b91c1c; line-height: 1.6;">
                              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe actuel restera inchangé et votre compte est en sécurité.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Divider -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                        <tr>
                          <td style="height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent);"></td>
                        </tr>
                      </table>
                      
                      <!-- Security Tips -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f8fafc; border-radius: 16px; padding: 24px;">
                        <tr>
                          <td>
                            <h3 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 700; color: #1e293b;">
                              🛡️ Conseils de sécurité
                            </h3>
                            
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 8px 0;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                      <td style="vertical-align: top; padding-right: 12px;">
                                        <span style="display: inline-block; width: 24px; height: 24px; background: #dcfce7; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; color: #16a34a;">✓</span>
                                      </td>
                                      <td style="font-size: 14px; color: #475569; line-height: 1.6;">
                                        Choisissez un mot de passe unique et complexe
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                      <td style="vertical-align: top; padding-right: 12px;">
                                        <span style="display: inline-block; width: 24px; height: 24px; background: #dcfce7; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; color: #16a34a;">✓</span>
                                      </td>
                                      <td style="font-size: 14px; color: #475569; line-height: 1.6;">
                                        Utilisez au moins 8 caractères avec des chiffres et symboles
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                      <td style="vertical-align: top; padding-right: 12px;">
                                        <span style="display: inline-block; width: 24px; height: 24px; background: #dcfce7; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; color: #16a34a;">✓</span>
                                      </td>
                                      <td style="font-size: 14px; color: #475569; line-height: 1.6;">
                                        Ne partagez jamais votre mot de passe avec personne
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                      <td style="vertical-align: top; padding-right: 12px;">
                                        <span style="display: inline-block; width: 24px; height: 24px; background: #dcfce7; border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; color: #16a34a;">✓</span>
                                      </td>
                                      <td style="font-size: 14px; color: #475569; line-height: 1.6;">
                                        Changez régulièrement vos mots de passe
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
                  
                </table>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 40px 20px; text-align: center;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">
                  Edupreneurs - Votre sécurité est notre priorité
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetUrl }: PasswordResetRequest = await req.json();

    console.log("Sending password reset email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Edupreneurs <noreply@mon-edupreneur.com>",
      to: [email],
      subject: "🔐 Réinitialisation de votre mot de passe - Edupreneurs",
      html: getEmailTemplate(resetUrl),
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending password reset email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
