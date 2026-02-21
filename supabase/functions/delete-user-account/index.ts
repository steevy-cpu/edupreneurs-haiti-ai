import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { getTimeAwareGreeting } from "../_shared/emailGreeting.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getFarewellEmailTemplate = (fullName: string) => `
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
                        ${getTimeAwareGreeting(fullName)}
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client with user's token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the user from the token
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Rate limit: prevent spamming account deletion attempts
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const clientIp = getClientIp(req);
    const rateLimitResult = await checkRateLimit(
      serviceClient, `delete-account:${user.id}`, clientIp, RATE_LIMITS.AUTH
    );
    if (!rateLimitResult.allowed) {
      return rateLimitResponse();
    }

    // Protected accounts that cannot be deleted (Jude AI assistant)
    const PROTECTED_USER_IDS = ['68f2f959-e14a-47f9-8277-07df3a6fcd79'];
    
    if (PROTECTED_USER_IDS.includes(user.id)) {
      throw new Error('This system account cannot be deleted');
    }

    console.log(`Preparing to delete user account: ${user.id}`);

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch user profile BEFORE deletion to get their info for the email
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    const userEmail = user.email;
    const fullName = profile?.full_name || 'Utilisateur';

    // Send farewell email BEFORE deleting the account
    if (userEmail) {
      try {
        console.log(`Sending farewell email to: ${userEmail}`);
        
        const emailResponse = await resend.emails.send({
          from: "Edupreneurs <noreply@mon-edupreneur.com>",
          to: [userEmail],
          subject: "😢 Au revoir - Votre compte a été supprimé",
          html: getFarewellEmailTemplate(fullName),
        });

        console.log('Farewell email sent successfully:', emailResponse);
      } catch (emailError) {
        // Log the error but don't fail the deletion
        console.error('Error sending farewell email:', emailError);
      }
    }

    // Now delete the user from auth (this will cascade delete profile and related data)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      throw deleteError;
    }

    console.log(`User account deleted successfully: ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, message: 'Account deleted successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error deleting account:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
