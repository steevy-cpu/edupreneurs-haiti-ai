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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, verificationUrl }: WelcomeEmailRequest = await req.json();

    console.log("Sending welcome email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Edupreneurs <onboarding@resend.dev>",
      to: [email],
      subject: "🎓 Bienvenue sur Edupreneurs !",
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
                color: #1f2937;
                background: #f3f4f6;
                padding: 20px;
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
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
              .welcome-text {
                font-size: 18px;
                color: #374151;
                margin-bottom: 20px;
              }
              .feature-list {
                background: #f9fafb;
                border-radius: 12px;
                padding: 25px;
                margin: 30px 0;
              }
              .feature-item {
                display: flex;
                align-items: flex-start;
                margin-bottom: 15px;
              }
              .feature-item:last-child {
                margin-bottom: 0;
              }
              .feature-icon {
                font-size: 24px;
                margin-right: 12px;
                flex-shrink: 0;
              }
              .feature-text {
                color: #4b5563;
                font-size: 15px;
              }
              .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-decoration: none;
                padding: 16px 40px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                margin: 20px 0;
                transition: transform 0.2s;
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
                <h1>🎓 Bienvenue !</h1>
                <p style="font-size: 18px; opacity: 0.95;">Votre aventure éducative commence ici</p>
              </div>
              
              <div class="content">
                <p class="welcome-text">
                  Bonjour <strong>${fullName}</strong>,
                </p>
                <p class="welcome-text">
                  Nous sommes ravis de vous accueillir sur <strong>Edupreneurs</strong>, votre plateforme d'apprentissage interactive !
                </p>

                ${verificationUrl ? `
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationUrl}" class="cta-button">
                    ✓ Vérifier mon email
                  </a>
                  <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
                    Cliquez pour activer votre compte
                  </p>
                </div>
                ` : ''}

                <div class="divider"></div>

                <div class="feature-list">
                  <h3 style="color: #1f2937; margin-bottom: 20px; font-size: 20px;">
                    Ce qui vous attend :
                  </h3>
                  
                  <div class="feature-item">
                    <span class="feature-icon">📚</span>
                    <span class="feature-text">
                      <strong>Cours interactifs</strong> - Apprenez les mathématiques de manière ludique et engageante
                    </span>
                  </div>
                  
                  <div class="feature-item">
                    <span class="feature-icon">🤖</span>
                    <span class="feature-text">
                      <strong>Assistant IA Eric</strong> - Un tuteur virtuel disponible 24/7 pour vous aider
                    </span>
                  </div>
                  
                  <div class="feature-item">
                    <span class="feature-icon">🎮</span>
                    <span class="feature-text">
                      <strong>Jeux éducatifs</strong> - Progressez tout en vous amusant avec nos activités
                    </span>
                  </div>
                  
                  <div class="feature-item">
                    <span class="feature-icon">👥</span>
                    <span class="feature-text">
                      <strong>Communauté</strong> - Échangez avec d'autres apprenants et partagez vos progrès
                    </span>
                  </div>
                  
                  <div class="feature-item">
                    <span class="feature-icon">🏆</span>
                    <span class="feature-text">
                      <strong>Récompenses</strong> - Gagnez des points et montez dans le classement
                    </span>
                  </div>
                </div>

                <p style="color: #6b7280; font-size: 15px; margin-top: 30px;">
                  <strong>Besoin d'aide ?</strong> Notre équipe est là pour vous accompagner à chaque étape de votre parcours.
                </p>
              </div>

              <div class="footer">
                <p style="margin-bottom: 10px;">
                  <strong>Edupreneurs</strong> - Votre partenaire pour réussir
                </p>
                <p>© 2025 Edupreneurs. Tous droits réservés.</p>
              </div>
            </div>
          </body>
        </html>
      `,
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
