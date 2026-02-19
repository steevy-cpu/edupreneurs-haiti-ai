import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getReportConfirmationTemplate = (fullName: string) => `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Signalement reçu - Edupreneurs</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
      <tr>
        <td style="padding: 40px 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
            <tr>
              <td style="text-align: center; padding-bottom: 30px;">
                <img src="https://mon-edupreneur.com/logo.png" alt="Edupreneurs" width="180" height="auto" />
              </td>
            </tr>
            <tr>
              <td>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #ffffff; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 50px 40px; text-align: center; border-radius: 24px 24px 0 0;">
                      <div style="font-size: 64px; margin-bottom: 16px;">📬</div>
                      <h1 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 800; color: #ffffff;">
                        Signalement reçu
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 24px 0; font-size: 18px; color: #1e293b;">
                        Bonjour <strong style="color: #8b5cf6;">${fullName}</strong>,
                      </p>
                      <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569; line-height: 1.8;">
                        Nous avons bien reçu votre signalement et nous vous remercions de nous aider à maintenir une communauté saine et respectueuse.
                      </p>
                      <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569; line-height: 1.8;">
                        Notre équipe de modération examinera ce signalement dans les plus brefs délais et prendra les mesures appropriées si nécessaire.
                      </p>
                      <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569; line-height: 1.8;">
                        Merci de votre vigilance ! 💪
                      </p>
                      <p style="margin: 0; font-size: 16px; color: #475569;">
                        L'équipe Edupreneurs
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 20px; text-align: center;">
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create client with user's token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Create admin client to fetch profile
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get reporter's profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single();

    const fullName = profile?.full_name || 'Utilisateur';

    // Send confirmation email and capture response for standardized format
    let messageId: string | null = null;
    if (user.email) {
      const emailResponse = await resend.emails.send({
        from: "Edupreneurs <noreply@mon-edupreneur.com>",
        to: [user.email],
        subject: "📬 Signalement reçu - Merci de votre vigilance",
        html: getReportConfirmationTemplate(fullName),
      });
      messageId = emailResponse?.data?.id || null;
      console.log('Report confirmation email sent to:', user.email);
    }

    return new Response(
      JSON.stringify({ success: true, messageId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error sending report confirmation:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
