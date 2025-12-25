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
      subject: "🔐 Réinitialisation de votre mot de passe",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #1a1a1a;
                background: #f5f5f5;
                padding: 20px;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .header {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
              }
              .header h1 {
                font-size: 32px;
                margin-bottom: 10px;
                font-weight: 700;
              }
              .content {
                padding: 40px 30px;
              }
              .alert-box {
                background: #fef2f2;
                border-left: 4px solid #ef4444;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
              }
              .alert-box p {
                color: #991b1b;
                font-size: 15px;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
                text-decoration: none;
                padding: 16px 40px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                margin: 20px 0;
                transition: transform 0.2s;
              }
              .security-tips {
                background: #f9fafb;
                border-radius: 12px;
                padding: 25px;
                margin: 30px 0;
              }
              .tip-item {
                display: flex;
                align-items: flex-start;
                margin-bottom: 12px;
              }
              .tip-item:last-child {
                margin-bottom: 0;
              }
              .footer {
                background: #f9fafb;
                padding: 30px;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
              }
              .divider {
                height: 1px;
                background: linear-gradient(to right, transparent, #e5e7eb, transparent);
                margin: 30px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Réinitialisation</h1>
                <p style="font-size: 18px; opacity: 0.95;">de votre mot de passe</p>
              </div>
              
              <div class="content">
                <p style="font-size: 18px; color: #2d2d2d; margin-bottom: 20px; line-height: 1.7;">
                  Bonjour,
                </p>
                <p style="color: #3d3d3d; margin-bottom: 20px; line-height: 1.7;">
                  Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Edupreneurs.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" class="cta-button">
                    🔑 Réinitialiser mon mot de passe
                  </a>
                  <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
                    Ce lien est valide pendant 1 heure
                  </p>
                </div>

                <div class="alert-box">
                  <p style="font-weight: 600; margin-bottom: 8px;">⚠️ Important !</p>
                  <p>
                    Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. 
                    Votre mot de passe actuel restera inchangé et votre compte est en sécurité.
                  </p>
                </div>

                <div class="divider"></div>

                <div class="security-tips">
                  <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 18px;">
                    🛡️ Conseils de sécurité
                  </h3>
                  
                  <div class="tip-item">
                    <span style="color: #10b981; margin-right: 8px;">✓</span>
                    <span style="color: #3d3d3d; font-size: 14px; line-height: 1.6;">
                      Choisissez un mot de passe unique et complexe
                    </span>
                  </div>
                  
                  <div class="tip-item">
                    <span style="color: #10b981; margin-right: 8px;">✓</span>
                    <span style="color: #3d3d3d; font-size: 14px; line-height: 1.6;">
                      Utilisez au moins 8 caractères avec des chiffres et symboles
                    </span>
                  </div>
                  
                  <div class="tip-item">
                    <span style="color: #10b981; margin-right: 8px;">✓</span>
                    <span style="color: #3d3d3d; font-size: 14px; line-height: 1.6;">
                      Ne partagez jamais votre mot de passe avec personne
                    </span>
                  </div>
                  
                  <div class="tip-item">
                    <span style="color: #10b981; margin-right: 8px;">✓</span>
                    <span style="color: #3d3d3d; font-size: 14px; line-height: 1.6;">
                      Changez régulièrement vos mots de passe
                    </span>
                  </div>
                </div>

                <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
                  <strong>Besoin d'aide ?</strong> Contactez notre équipe support si vous rencontrez des difficultés.
                </p>
              </div>

              <div class="footer">
                <p style="margin-bottom: 10px;">
                  <strong>Edupreneurs</strong> - Votre sécurité est notre priorité
                </p>
                <p>© 2025 Edupreneurs. Tous droits réservés.</p>
              </div>
            </div>
          </body>
        </html>
      `,
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
