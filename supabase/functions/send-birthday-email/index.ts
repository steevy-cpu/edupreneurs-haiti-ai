import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BirthdayEmailRequest {
  email: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName }: BirthdayEmailRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    const username = fullName || "Ami(e)";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Joyeux Anniversaire!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="https://mon-edupreneur.com/logo.png" alt="Edupreneurs Logo" style="height: 60px; width: auto;" />
    </div>
    
    <!-- Main Card -->
    <div style="background: linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%); border-radius: 24px; padding: 50px 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
      
      <!-- Birthday Icon -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 80px; line-height: 1;">🎂</div>
      </div>
      
      <!-- Main Title -->
      <h1 style="text-align: center; font-size: 32px; font-weight: 700; color: #1a1a2e; margin: 0 0 10px 0;">
        🎉 Joyeux Anniversaire! 🎉
      </h1>
      
      <!-- Greeting -->
      <p style="text-align: center; font-size: 18px; color: #4a5568; margin: 0 0 30px 0;">
        Salut ${username}! 🌟
      </p>
      
      <!-- Birthday Message Box -->
      <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 16px; padding: 30px; margin-bottom: 30px; text-align: center;">
        <p style="font-size: 18px; color: #5c3d2e; margin: 0 0 15px 0; font-weight: 600;">
          Toute l'équipe d'Edupreneurs te souhaite une merveilleuse journée remplie de joie et de bonheur! 🎈
        </p>
        <p style="font-size: 16px; color: #7c5c4e; margin: 0;">
          Que cette nouvelle année de ta vie soit riche en apprentissages, en réussites et en belles surprises! 🌈✨
        </p>
      </div>
      
      <!-- Fun Facts -->
      <div style="background: #f0f4ff; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
        <p style="text-align: center; font-size: 16px; color: #4a5568; margin: 0;">
          🎁 <strong>Cadeau spécial:</strong> Continue à apprendre avec nous et atteins tes objectifs! Tu es incroyable! 💪
        </p>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="https://mon-edupreneur.com/dashboard" 
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
          🎓 Célébrer en apprenant
        </a>
      </div>
      
      <!-- Decorations -->
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 30px;">🎈🎊🎁🎀🎈</span>
      </div>
      
      <!-- Signature -->
      <p style="text-align: center; color: #718096; font-size: 14px; margin: 0;">
        Avec toute notre affection,<br>
        <strong style="color: #667eea;">L'équipe Edupreneurs</strong> 💜
      </p>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 30px;">
      <p style="color: rgba(255, 255, 255, 0.8); font-size: 12px; margin: 0;">
        © 2025 Edupreneurs. Tous droits réservés.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    console.log(`Sending birthday email to ${email} for ${username}`);

    const emailResponse = await resend.emails.send({
      from: "Edupreneurs <noreply@mon-edupreneur.com>",
      to: [email],
      subject: `🎂 Joyeux Anniversaire ${username}! 🎉`,
      html: emailHtml,
    });

    console.log("Birthday email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-birthday-email function:", error);
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
