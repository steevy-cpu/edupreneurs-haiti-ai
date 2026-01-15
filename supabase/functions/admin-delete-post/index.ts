import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getPostDeletionEmailTemplate = (fullName: string, reason?: string) => `
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Publication supprimée - Edupreneurs</title>
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
                    <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 50px 40px; text-align: center; border-radius: 24px 24px 0 0;">
                      <div style="font-size: 64px; margin-bottom: 16px;">📢</div>
                      <h1 style="margin: 0 0 12px 0; font-size: 28px; font-weight: 800; color: #ffffff;">
                        Publication supprimée
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 24px 0; font-size: 18px; color: #1e293b;">
                        Bonjour <strong style="color: #f97316;">${fullName}</strong>,
                      </p>
                      <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569; line-height: 1.8;">
                        Nous vous informons que l'une de vos publications a été supprimée par notre équipe de modération car elle ne respectait pas nos règles communautaires.
                      </p>
                      ${reason ? `<p style="margin: 0 0 24px 0; font-size: 14px; color: #64748b; padding: 12px; background: #f1f5f9; border-radius: 8px;"><strong>Motif :</strong> ${reason}</p>` : ''}
                      <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569; line-height: 1.8;">
                        Nous vous encourageons à consulter nos règles de la communauté pour éviter que cela ne se reproduise. Si vous pensez qu'il s'agit d'une erreur, vous pouvez nous contacter.
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
      throw new Error('Unauthorized: Only founders can delete posts');
    }

    // Parse request body
    const { postId, reason } = await req.json();

    if (!postId) {
      throw new Error('Post ID is required');
    }

    console.log(`Admin ${requestingUser.id} deleting post: ${postId}`);

    // Fetch the post to get media URLs
    const { data: post, error: postError } = await supabaseAdmin
      .from('posts')
      .select('id, user_id, image_url, video_url')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      throw new Error('Post not found');
    }

    // Fetch post owner's profile and email for notification
    let ownerEmail = '';
    let ownerName = 'Utilisateur';

    try {
      const { data: ownerProfile } = await supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('user_id', post.user_id)
        .single();
      
      if (ownerProfile?.full_name) {
        ownerName = ownerProfile.full_name;
      }

      const { data: { user: ownerUser } } = await supabaseAdmin.auth.admin.getUserById(post.user_id);
      if (ownerUser?.email) {
        ownerEmail = ownerUser.email;
      }
    } catch (err) {
      console.error('Error fetching owner info:', err);
    }

    // Delete media from storage if exists
    const mediaToDelete: string[] = [];
    
    if (post.image_url) {
      // Extract the path from the URL
      const imageMatch = post.image_url.match(/post-images\/(.+)/);
      if (imageMatch && imageMatch[1]) {
        mediaToDelete.push(imageMatch[1]);
      }
    }

    if (post.video_url) {
      const videoMatch = post.video_url.match(/post-images\/(.+)/);
      if (videoMatch && videoMatch[1]) {
        mediaToDelete.push(videoMatch[1]);
      }
    }

    // Delete media files
    if (mediaToDelete.length > 0) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('post-images')
        .remove(mediaToDelete);

      if (storageError) {
        console.error('Error deleting media:', storageError);
        // Continue with post deletion even if media deletion fails
      } else {
        console.log(`Deleted ${mediaToDelete.length} media files`);
      }
    }

    // Delete the post (cascades to likes, comments, shares, notifications automatically)
    const { error: deleteError } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('id', postId);

    if (deleteError) {
      throw deleteError;
    }

    // Update all related user_reports with this post_id to status='resolved'
    const { error: updateReportsError } = await supabaseAdmin
      .from('user_reports')
      .update({
        status: 'resolved',
        reviewed_by: requestingUser.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: reason || 'Post supprimé par un administrateur',
      })
      .eq('post_id', postId);

    if (updateReportsError) {
      console.error('Error updating reports:', updateReportsError);
      // Don't throw, post is already deleted
    }

    // Send notification email to post owner
    if (ownerEmail) {
      try {
        await resend.emails.send({
          from: "Edupreneurs <noreply@mon-edupreneur.com>",
          to: [ownerEmail],
          subject: "📢 Votre publication a été supprimée",
          html: getPostDeletionEmailTemplate(ownerName, reason),
        });
        console.log('Post deletion email sent to:', ownerEmail);
      } catch (emailError) {
        console.error('Error sending post deletion email:', emailError);
        // Don't throw, post is already deleted
      }
    }

    // Log the admin action (optional - if admin_actions table exists)
    try {
      await supabaseAdmin
        .from('admin_actions')
        .insert({
          admin_id: requestingUser.id,
          action_type: 'delete_post',
          target_post_id: postId,
          target_user_id: post.user_id,
          reason: reason || null,
        });
    } catch (logError) {
      // Table might not exist, that's okay
      console.log('Admin action logging skipped (table may not exist)');
    }

    console.log(`Post deleted successfully by admin: ${postId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Post deleted successfully',
        deletedPostId: postId,
        reportsUpdated: !updateReportsError
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error deleting post:', error);
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
