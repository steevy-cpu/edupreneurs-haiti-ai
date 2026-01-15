import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Protected accounts that cannot be deleted
const PROTECTED_USER_IDS = [
  '68f2f959-e14a-47f9-8277-07df3a6fcd79', // Jude AI
  '0de08330-4183-48f9-b169-19b92f4d114f', // Steevy (founder)
  '7580cd10-e18c-4b2f-ac50-def28d046c9d', // Djood (founder)
];

const getFarewellEmailTemplate = (fullName: string, deletedByAdmin: boolean = false) => `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Au revoir - Edupreneurs</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
      <tr>
        <td style="padding: 40px 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px;">
            <tr>
              <td style="text-align: center; padding-bottom: 30px;">
                <img src="https://mon-edupreneur.com/logo.png" alt="Edupreneurs" width="180" height="auto" style="display: block; margin: 0 auto;" />
              </td>
            </tr>
            <tr>
              <td>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #ffffff; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%); padding: 50px 40px; text-align: center;">
                      <div style="font-size: 64px; margin-bottom: 16px;">😢</div>
                      <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 800; color: #ffffff;">
                        Au revoir...
                      </h1>
                      <p style="margin: 0; font-size: 18px; color: rgba(255, 255, 255, 0.9);">
                        ${deletedByAdmin ? "Votre compte a été supprimé par l'équipe de modération" : "Nous sommes tristes de vous voir partir"}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 24px 0; font-size: 18px; color: #1e293b;">
                        Salut <strong style="color: #8b5cf6;">${fullName}</strong> 👋
                      </p>
                      <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569; line-height: 1.8;">
                        ${deletedByAdmin 
                          ? "Votre compte a été supprimé suite à une violation des conditions d'utilisation de notre plateforme. Si vous pensez qu'il s'agit d'une erreur, veuillez nous contacter."
                          : "Votre compte a été supprimé avec succès. Nous sommes vraiment désolés de vous voir partir."
                        }
                      </p>
                      <p style="margin: 0; font-size: 16px; color: #475569; line-height: 1.8;">
                        Merci d'avoir fait partie de la communauté Edupreneurs.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 20px; text-align: center;">
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client with user's token to validate auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get the requesting user from the token
    const {
      data: { user: requestingUser },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !requestingUser) {
      throw new Error('User not authenticated');
    }

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate that the requesting user is a founder
    const { data: isFounder, error: founderError } = await supabaseAdmin
      .rpc('is_founder', { check_user_id: requestingUser.id });

    if (founderError || !isFounder) {
      throw new Error('Unauthorized: Only founders can delete user accounts');
    }

    // Parse request body
    const { targetUserId, reason } = await req.json();

    if (!targetUserId) {
      throw new Error('Target user ID is required');
    }

    // Check if target is a protected account
    if (PROTECTED_USER_IDS.includes(targetUserId)) {
      throw new Error('This account is protected and cannot be deleted');
    }

    console.log(`Admin ${requestingUser.id} deleting user account: ${targetUserId}`);

    // Fetch target user's profile BEFORE deletion
    const { data: targetProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('user_id', targetUserId)
      .single();

    if (profileError) {
      console.error('Error fetching target profile:', profileError);
    }

    // Fetch target user's email
    const { data: { user: targetUser }, error: targetUserError } = await supabaseAdmin.auth.admin.getUserById(targetUserId);

    if (targetUserError || !targetUser) {
      throw new Error('Target user not found');
    }

    const targetEmail = targetUser.email;
    const fullName = targetProfile?.full_name || 'Utilisateur';

    // Send farewell email BEFORE deleting the account
    if (targetEmail) {
      try {
        console.log(`Sending admin deletion email to: ${targetEmail}`);
        
        await resend.emails.send({
          from: "Edupreneurs <noreply@mon-edupreneur.com>",
          to: [targetEmail],
          subject: "😢 Votre compte Edupreneurs a été supprimé",
          html: getFarewellEmailTemplate(fullName, true),
        });

        console.log('Admin deletion email sent successfully');
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    }

    // Log the admin action (optional - if admin_actions table exists)
    try {
      await supabaseAdmin
        .from('admin_actions')
        .insert({
          admin_id: requestingUser.id,
          action_type: 'delete_user',
          target_user_id: targetUserId,
          reason: reason || null,
        });
    } catch (logError) {
      // Table might not exist, that's okay
      console.log('Admin action logging skipped (table may not exist)');
    }

    // Delete the user from auth (cascades to profile and related data)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`User account deleted successfully by admin: ${targetUserId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account deleted successfully',
        deletedUserId: targetUserId 
      }),
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
