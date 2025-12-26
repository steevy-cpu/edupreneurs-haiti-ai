import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
  verificationUrl?: string;
}

const getEmailTemplate = (fullName: string, verificationUrl?: string) => `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Bienvenue sur Edupreneurs</title>
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
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); padding: 50px 40px; text-align: center;">
                      <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
                      <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                        Bienvenue parmi nous !
                      </h1>
                      <p style="margin: 0; font-size: 18px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
                        Votre aventure éducative commence maintenant
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 24px 0; font-size: 18px; color: #1e293b; line-height: 1.7;">
                        Bonjour <strong style="color: #10b981;">${fullName}</strong> 👋
                      </p>
                      <p style="margin: 0 0 32px 0; font-size: 16px; color: #475569; line-height: 1.8;">
                        Félicitations ! Vous faites maintenant partie de la communauté Edupreneurs. Nous sommes ravis de vous accompagner dans votre parcours d'apprentissage.
                      </p>
                      
                      ${verificationUrl ? `
                      <!-- CTA Button -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                        <tr>
                          <td style="text-align: center;">
                            <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 14px -3px rgba(16, 185, 129, 0.4);">
                              ✓ Vérifier mon email
                            </a>
                          </td>
                        </tr>
                      </table>
                      ` : ''}
                      
                      <!-- Features Grid -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                        <tr>
                          <td style="padding-bottom: 20px;">
                            <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1e293b;">
                              🚀 Ce qui vous attend
                            </h3>
                          </td>
                        </tr>
                        
                        <!-- Feature Row 1 -->
                        <tr>
                          <td>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td width="48%" style="vertical-align: top; padding-right: 8px; padding-bottom: 16px;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f0fdf4; border-radius: 16px; padding: 20px;">
                                    <tr>
                                      <td>
                                        <div style="font-size: 32px; margin-bottom: 12px;">📚</div>
                                        <h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #166534;">Cours interactifs</h4>
                                        <p style="margin: 0; font-size: 13px; color: #15803d; line-height: 1.5;">Apprenez de manière ludique et engageante</p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                                <td width="48%" style="vertical-align: top; padding-left: 8px; padding-bottom: 16px;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #eff6ff; border-radius: 16px; padding: 20px;">
                                    <tr>
                                      <td>
                                        <div style="font-size: 32px; margin-bottom: 12px;">🤖</div>
                                        <h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #1e40af;">Assistant IA Eric</h4>
                                        <p style="margin: 0; font-size: 13px; color: #1d4ed8; line-height: 1.5;">Tuteur virtuel disponible 24/7</p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        
                        <!-- Feature Row 2 -->
                        <tr>
                          <td>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                              <tr>
                                <td width="48%" style="vertical-align: top; padding-right: 8px; padding-bottom: 16px;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #fef3c7; border-radius: 16px; padding: 20px;">
                                    <tr>
                                      <td>
                                        <div style="font-size: 32px; margin-bottom: 12px;">🏆</div>
                                        <h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #92400e;">Récompenses</h4>
                                        <p style="margin: 0; font-size: 13px; color: #b45309; line-height: 1.5;">Gagnez des points et montez dans le classement</p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                                <td width="48%" style="vertical-align: top; padding-left: 8px; padding-bottom: 16px;">
                                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #fae8ff; border-radius: 16px; padding: 20px;">
                                    <tr>
                                      <td>
                                        <div style="font-size: 32px; margin-bottom: 12px;">👥</div>
                                        <h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #86198f;">Communauté</h4>
                                        <p style="margin: 0; font-size: 13px; color: #a21caf; line-height: 1.5;">Échangez avec d'autres apprenants</p>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Help Box -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="background: #f8fafc; border-radius: 16px; padding: 24px; text-align: center;">
                            <p style="margin: 0; font-size: 15px; color: #475569; line-height: 1.7;">
                              <strong style="color: #1e293b;">Besoin d'aide ?</strong><br>
                              Notre équipe est là pour vous accompagner à chaque étape de votre parcours.
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
    const { email, fullName, verificationUrl }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Edupreneurs <noreply@mon-edupreneur.com>",
      to: [email],
      subject: "🎉 Bienvenue sur Edupreneurs !",
      html: getEmailTemplate(fullName, verificationUrl),
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
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
