// DEPRECATED: This function is unused. Farewell emails are sent inline by
// delete-user-account and admin-delete-user-account.
// Do not delete the file in case it is needed for rollback.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { 
  getSecureHeaders, 
  secureJsonResponse, 
  secureErrorResponse, 
  corsPreflightResponse 
} from "../_shared/securityHeaders.ts";
import { checkRateLimit, RATE_LIMITS, getClientIp } from "../_shared/rateLimiter.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Input validation schema
const farewellEmailSchema = z.object({
  email: z.string().email().max(255),
  fullName: z.string().min(1).max(200).trim()
}).strict();

const getEmailTemplate = (fullName: string) => `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Au revoir - Edupreneurs</title>
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
                    <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 50px 40px; text-align: center;">
                      <div style="font-size: 64px; margin-bottom: 16px;">😢</div>
                      <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                        Au revoir...
                      </h1>
                      <p style="margin: 0; font-size: 18px; color: rgba(255, 255, 255, 0.9); font-weight: 500;">
                        Nous sommes tristes de vous voir partir
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 24px 0; font-size: 18px; color: #1e293b; line-height: 1.7;">
                        Salut <strong style="color: #8b5cf6;">${fullName}</strong> 👋
                      </p>
                      <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569; line-height: 1.8;">
                        Votre compte a été supprimé avec succès. Nous sommes vraiment désolés de vous voir partir et nous espérons que vous avez passé un bon moment avec nous.
                      </p>
                      <p style="margin: 0 0 32px 0; font-size: 16px; color: #475569; line-height: 1.8;">
                        Merci d'avoir fait partie de la communauté Edupreneurs. Votre présence a contribué à rendre notre plateforme plus riche et dynamique.
                      </p>
                      
                      <!-- Message Box -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 16px; padding: 24px; border-left: 4px solid #0ea5e9;">
                            <div style="font-size: 28px; margin-bottom: 12px;">💜</div>
                            <p style="margin: 0; font-size: 15px; color: #0c4a6e; line-height: 1.7;">
                              <strong>Vous nous manquerez !</strong><br><br>
                              Si jamais vous changez d'avis, sachez que les portes d'Edupreneurs seront toujours ouvertes pour vous. Vous pourrez recréer un compte à tout moment et reprendre votre parcours d'apprentissage.
                            </p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Feedback Section -->
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="background: #faf5ff; border-radius: 16px; padding: 24px; text-align: center;">
                            <div style="font-size: 28px; margin-bottom: 12px;">📝</div>
                            <p style="margin: 0; font-size: 15px; color: #6b21a8; line-height: 1.7;">
                              <strong>Vos retours comptent</strong><br>
                              Si vous avez des suggestions pour améliorer notre plateforme, n'hésitez pas à nous contacter. Chaque feedback nous aide à devenir meilleur !
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Goodbye Message -->
                  <tr>
                    <td style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0; font-size: 18px; color: #64748b; font-style: italic;">
                        "Chaque au revoir ouvre la porte à de nouvelles rencontres" 🌟
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 40px 20px; text-align: center;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b; font-weight: 600;">
                  Edupreneurs - Merci pour tout
                </p>
                <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                  © ${new Date().getFullYear()} Edupreneurs. Tous droits réservés.
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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return corsPreflightResponse();
  }

  try {
    // Initialize Supabase for rate limiting
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP for rate limiting
    const clientIp = getClientIp(req);

    // Check rate limit (no auth required for this endpoint typically, but we limit by IP)
    const rateLimitResult = await checkRateLimit(
      supabase,
      RATE_LIMITS.EMAIL,
      null, // No user ID for this endpoint
      clientIp
    );

    if (!rateLimitResult.allowed) {
      console.warn('[send-farewell-email] Rate limit exceeded for IP:', clientIp);
      return secureErrorResponse('Too many requests. Please try again later.', 429);
    }

    // Parse and validate input
    const body = await req.json();
    const validation = farewellEmailSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      console.error('[send-farewell-email] Validation failed:', errors);
      return secureErrorResponse('Invalid input', 400, errors);
    }

    const { email, fullName } = validation.data;

    console.log("[send-farewell-email] Sending farewell email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Edupreneurs <noreply@mon-edupreneur.com>",
      to: [email],
      subject: "😢 Au revoir - Votre compte a été supprimé",
      html: getEmailTemplate(fullName),
    });

    console.log("[send-farewell-email] Farewell email sent successfully:", emailResponse);

    // Standardized response format
    return secureJsonResponse({ success: true, messageId: emailResponse?.data?.id || null }, 200, true);
  } catch (error: any) {
    console.error("[send-farewell-email] Error:", error);
    // Manual response instead of secureErrorResponse to include success: false
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Internal server error' }),
      { status: 500, headers: { "Content-Type": "application/json", "X-Content-Type-Options": "nosniff" } }
    );
  }
};

serve(handler);
