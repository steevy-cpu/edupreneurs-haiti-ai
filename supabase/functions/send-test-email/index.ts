import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const getEmailTemplate = () => `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Test Email Réussi</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
      <tr>
        <td style="padding: 40px 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
            
            <!-- Logo Header -->
            <tr>
              <td style="text-align: center; padding-bottom: 30px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%); border-radius: 16px; padding: 12px 24px;">
                      <span style="font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Edupreneurs</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <!-- Main Card -->
            <tr>
              <td>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #ffffff; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  
                  <!-- Hero Section -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%); padding: 50px 40px; text-align: center;">
                      <div style="font-size: 64px; margin-bottom: 16px;">🎓</div>
                      <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                        Test Réussi !
                      </h1>
                      <p style="margin: 0; font-size: 18px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
                        Votre système d'email fonctionne parfaitement
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
                        Ceci est un email de test de votre système d'authentification Edupreneurs. Si vous voyez ce message, tout fonctionne correctement !
                      </p>
                      
                      <!-- Success Badge -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                        <tr>
                          <td style="text-align: center;">
                            <span style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; padding: 12px 32px; border-radius: 50px; font-weight: 700; font-size: 16px;">
                              ✓ Système Email Opérationnel
                            </span>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Features Checklist -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                        <tr>
                          <td>
                            <h3 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 700; color: #1e293b;">
                              ✅ Fonctionnalités vérifiées
                            </h3>
                            
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td style="padding: 10px 0;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                      <td style="vertical-align: top; padding-right: 12px;">
                                        <span style="display: inline-block; width: 28px; height: 28px; background: #dcfce7; border-radius: 50%; text-align: center; line-height: 28px; font-size: 14px; color: #16a34a;">✓</span>
                                      </td>
                                      <td style="font-size: 15px; color: #475569; line-height: 1.6;">
                                        Envoi d'emails configuré
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                      <td style="vertical-align: top; padding-right: 12px;">
                                        <span style="display: inline-block; width: 28px; height: 28px; background: #dcfce7; border-radius: 50%; text-align: center; line-height: 28px; font-size: 14px; color: #16a34a;">✓</span>
                                      </td>
                                      <td style="font-size: 15px; color: #475569; line-height: 1.6;">
                                        API Resend connectée
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                      <td style="vertical-align: top; padding-right: 12px;">
                                        <span style="display: inline-block; width: 28px; height: 28px; background: #dcfce7; border-radius: 50%; text-align: center; line-height: 28px; font-size: 14px; color: #16a34a;">✓</span>
                                      </td>
                                      <td style="font-size: 15px; color: #475569; line-height: 1.6;">
                                        Templates d'emails opérationnels
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                      <td style="vertical-align: top; padding-right: 12px;">
                                        <span style="display: inline-block; width: 28px; height: 28px; background: #dcfce7; border-radius: 50%; text-align: center; line-height: 28px; font-size: 14px; color: #16a34a;">✓</span>
                                      </td>
                                      <td style="font-size: 15px; color: #475569; line-height: 1.6;">
                                        Réinitialisation de mot de passe prête
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 10px 0;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                      <td style="vertical-align: top; padding-right: 12px;">
                                        <span style="display: inline-block; width: 28px; height: 28px; background: #dcfce7; border-radius: 50%; text-align: center; line-height: 28px; font-size: 14px; color: #16a34a;">✓</span>
                                      </td>
                                      <td style="font-size: 15px; color: #475569; line-height: 1.6;">
                                        Vérification d'utilisateur activée
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Available Features -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="background: #eff6ff; border-radius: 16px; padding: 24px;">
                            <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700; color: #1e40af;">
                              🚀 Fonctionnalités disponibles
                            </h3>
                            <ul style="margin: 0; padding: 0 0 0 20px; color: #3b82f6; font-size: 14px; line-height: 2;">
                              <li>Inscription avec confirmation email</li>
                              <li>Réinitialisation de mot de passe</li>
                              <li>Notifications de connexion</li>
                              <li>Emails de bienvenue</li>
                            </ul>
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
                  Edupreneurs - Votre partenaire pour réussir
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
    const { email } = await req.json();

    console.log("Sending test email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Edupreneurs <noreply@mon-edupreneur.com>",
      to: [email],
      subject: "🎓 Test Email Réussi - Edupreneurs",
      html: getEmailTemplate(),
    });

    console.log("Test email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending test email:", error);
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
