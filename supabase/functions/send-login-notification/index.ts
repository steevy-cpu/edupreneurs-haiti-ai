import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LoginNotificationRequest {
  email: string;
  fullName: string;
  timestamp: string;
  location?: string;
  device?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, timestamp, location, device }: LoginNotificationRequest = await req.json();

    console.log("Sending login notification to:", email);

    const emailResponse = await resend.emails.send({
      from: "Edupreneurs <noreply@mon-edupreneur.com>",
      to: [email],
      subject: "🔔 Nouvelle connexion à votre compte",
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
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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
              .info-box {
                background: #f0f9ff;
                border-left: 4px solid #3b82f6;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e0f2fe;
              }
              .info-row:last-child {
                border-bottom: none;
              }
              .info-label {
                color: #0369a1;
                font-weight: 600;
                font-size: 14px;
              }
              .info-value {
                color: #075985;
                font-size: 14px;
              }
              .alert-box {
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
                text-align: center;
              }
              .cta-button {
                display: inline-block;
                background: #ef4444;
                color: white;
                text-decoration: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 14px;
                margin-top: 15px;
              }
              .footer {
                background: #f9fafb;
                padding: 30px;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔔 Connexion détectée</h1>
                <p style="font-size: 18px; opacity: 0.95;">Nouvelle activité sur votre compte</p>
              </div>
              
              <div class="content">
                <p style="font-size: 18px; color: #2d2d2d; margin-bottom: 20px; line-height: 1.7;">
                  Bonjour <strong>${fullName}</strong>,
                </p>
                <p style="color: #3d3d3d; margin-bottom: 20px; line-height: 1.7;">
                  Nous vous informons qu'une connexion a été effectuée sur votre compte Edupreneurs.
                </p>

                <div class="info-box">
                  <h3 style="color: #0369a1; margin-bottom: 15px; font-size: 16px;">
                    📊 Détails de la connexion
                  </h3>
                  
                  <div class="info-row">
                    <span class="info-label">📧 Email</span>
                    <span class="info-value">${email}</span>
                  </div>
                  
                  <div class="info-row">
                    <span class="info-label">🕐 Date et heure</span>
                    <span class="info-value">${timestamp}</span>
                  </div>
                  
                  ${device ? `
                  <div class="info-row">
                    <span class="info-label">💻 Appareil</span>
                    <span class="info-value">${device}</span>
                  </div>
                  ` : ''}
                  
                  ${location ? `
                  <div class="info-row">
                    <span class="info-label">📍 Localisation</span>
                    <span class="info-value">${location}</span>
                  </div>
                  ` : ''}
                </div>

                <div style="background: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin: 25px 0;">
                  <p style="color: #065f46;">
                    <strong>✓ C'était vous ?</strong> Parfait ! Vous n'avez rien à faire. Profitez de votre expérience sur Edupreneurs.
                  </p>
                </div>

                <div class="alert-box">
                  <p style="color: #991b1b; font-weight: 600; margin-bottom: 10px;">
                    ⚠️ Ce n'était pas vous ?
                  </p>
                  <p style="color: #991b1b; font-size: 14px; margin-bottom: 15px;">
                    Si vous ne reconnaissez pas cette connexion, sécurisez immédiatement votre compte en changeant votre mot de passe.
                  </p>
                  <a href="#" class="cta-button">
                    🔐 Changer mon mot de passe
                  </a>
                </div>

                <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
                  <strong>Conseil de sécurité :</strong> N'utilisez jamais le même mot de passe sur plusieurs sites et activez l'authentification à deux facteurs lorsque disponible.
                </p>
              </div>

              <div class="footer">
                <p style="margin-bottom: 10px;">
                  <strong>Edupreneurs</strong> - Votre sécurité est notre priorité
                </p>
                <p>© 2025 Edupreneurs. Tous droits réservés.</p>
                <p style="margin-top: 15px; font-size: 12px;">
                  Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Login notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending login notification:", error);
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
