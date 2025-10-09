import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    console.log("Sending test email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Edupreneurs <onboarding@resend.dev>",
      to: [email],
      subject: "Test Email - Authentication System",
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
              .success-badge {
                background: #10b981;
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                display: inline-block;
                margin: 20px 0;
                font-weight: bold;
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
              <h1>🎓 Email Test Successful!</h1>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              <p>This is a test email from your Edupreneurs authentication system.</p>
              
              <div class="success-badge">
                ✓ Email System Working
              </div>
              
              <p>Your email authentication features are working correctly:</p>
              <ul>
                <li>✓ Email sending configured</li>
                <li>✓ Resend API connected</li>
                <li>✓ Email templates working</li>
                <li>✓ Password reset available</li>
                <li>✓ User verification ready</li>
              </ul>
              
              <p>You can now use features like:</p>
              <ul>
                <li>User signup with email confirmation</li>
                <li>Password reset requests</li>
                <li>Email notifications</li>
              </ul>
            </div>
            <div class="footer">
              <p>© 2025 Edupreneurs. Tous droits réservés.</p>
            </div>
          </body>
        </html>
      `,
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
