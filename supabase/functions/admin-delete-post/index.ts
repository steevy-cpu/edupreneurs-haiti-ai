import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { buildEmailTemplate, BRAND_COLORS } from "../_shared/emails.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Template: post deletion notification — uses red accent for moderation
const getPostDeletionEmailTemplate = (fullName: string, reason?: string) => {
  return buildEmailTemplate({
    accentColor: BRAND_COLORS.red,
    icon: '📢',
    title: 'Publication supprimée',
    subtitle: 'Action de modération',
    body: `
      <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
        Salut <strong style="color:${BRAND_COLORS.red};">${fullName}</strong>,
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
        Une de tes publications a été retirée par notre équipe de modération
        car elle ne respectait pas les conditions d'utilisation d'Edupreneurs.
      </p>
      ${reason ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td style="background:#f1f5f9;border-radius:8px;padding:12px 16px;">
        <p style="margin:0;font-size:14px;color:#64748b;"><strong>Motif :</strong> ${reason}</p>
      </td></tr>
      </table>` : ''}
      <!-- Warning -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr><td style="background:#fef2f2;border-left:4px solid ${BRAND_COLORS.red};border-radius:0 12px 12px 0;padding:16px 20px;">
        <p style="margin:0;font-size:14px;color:#991b1b;line-height:1.6;">
          ⚠️ En cas de violations répétées, ton compte pourra être suspendu.
        </p>
      </td></tr>
      </table>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0;">
        Si tu penses que c'est une erreur, contacte-nous à
        <a href="mailto:contact@edupreneurs.com" style="color:${BRAND_COLORS.primary};text-decoration:none;">contact@edupreneurs.com</a>
      </p>
    `,
  });
};

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
