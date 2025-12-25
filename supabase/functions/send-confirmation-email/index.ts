import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  email: string;
  fullName: string;
  nickname: string;
  academicGrade: string;
  confirmationCode: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName, nickname, academicGrade, confirmationCode }: ConfirmationEmailRequest = 
      await req.json();

    console.log("Sending confirmation email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Edupreneurs <noreply@mon-edupreneur.com>",
      to: [email],
      subject: "Bienvenue ! Confirmez votre inscription",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .code-box {
                background: white;
                border: 2px solid #667eea;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
              }
              .code {
                font-size: 32px;
                font-weight: bold;
                color: #667eea;
                letter-spacing: 5px;
              }
              .info-box {
                background: white;
                border-left: 4px solid #667eea;
                padding: 15px;
                margin: 15px 0;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🎓 Bienvenue sur notre plateforme !</h1>
            </div>
            <div class="content">
              <h2>Bonjour ${fullName} !</h2>
              <p>Merci de vous être inscrit sur notre plateforme d'éducation. Nous sommes ravis de vous accueillir !</p>
              
              <div class="code-box">
                <p style="margin: 0; color: #666;">Votre code de confirmation :</p>
                <div class="code">${confirmationCode}</div>
              </div>
              
              <div class="info-box">
                <h3 style="margin-top: 0;">📋 Informations de votre compte :</h3>
                <p><strong>Nom complet :</strong> ${fullName}</p>
                <p><strong>Pseudo :</strong> ${nickname}</p>
                <p><strong>Niveau académique :</strong> ${academicGrade}</p>
                <p><strong>Email :</strong> ${email}</p>
              </div>
              
              <p>Ce code de confirmation a également été envoyé sur WhatsApp. Vous pouvez l'utiliser pour vérifier votre compte.</p>
              
              <p><strong>Important :</strong> Gardez ce code en sécurité et ne le partagez avec personne.</p>
            </div>
            <div class="footer">
              <p>Si vous n'avez pas créé ce compte, veuillez ignorer cet email.</p>
              <p>© 2025 Edupreneurs. Tous droits réservés.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending confirmation email:", error);
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
