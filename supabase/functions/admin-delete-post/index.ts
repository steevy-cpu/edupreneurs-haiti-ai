import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
