import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { getTimeAwareGreeting } from "../_shared/emailGreeting.ts";
import { buildEmailTemplate, BRAND_COLORS } from "../_shared/emails.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const SITE_URL = Deno.env.get("SITE_URL") || "https://mon-edupreneur.com";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Template: farewell email — uses neutral slate accent
const getFarewellEmailTemplate = (fullName: string) => {
  return buildEmailTemplate({
    accentColor: '#475569',
    icon: '👋',
    title: 'Au revoir...',
    subtitle: 'Nous sommes tristes de te voir partir',
    body: `
      <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
        Salut <strong>${fullName}</strong>,
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
        Ton compte Edupreneurs a été supprimé conformément à ta demande.
        Toutes tes données personnelles ont été effacées de nos systèmes.
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0;">
        Si tu changes d'avis un jour, tu seras toujours le bienvenu.
        La porte reste ouverte. 🇭🇹
      </p>
    `,
    ctaText: 'Revenir sur Edupreneurs →',
    ctaUrl: SITE_URL,
  });
};

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
      serviceClient, RATE_LIMITS.AUTH, user.id, clientIp
    );
    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult.retryAfter ?? 30, rateLimitResult.remaining, corsHeaders);
    }

    // Protected accounts: Jude AI + founders — cannot be self-deleted
    const PROTECTED_USER_IDS = [
      '68f2f959-e14a-47f9-8277-07df3a6fcd79', // Jude AI
      '0de08330-4183-48f9-b169-19b92f4d114f', // Steevy (founder)
      '7580cd10-e18c-4b2f-ac50-def28d046c9d', // Djood (founder)
    ];
    
    if (PROTECTED_USER_IDS.includes(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Les comptes fondateurs ne peuvent pas être supprimés via cette interface. Contactez le support technique.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
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
          subject: "👋 Au revoir - Votre compte a été supprimé",
          html: getFarewellEmailTemplate(fullName),
        });

        console.log('Farewell email sent successfully:', emailResponse);
      } catch (emailError) {
        // Log the error but don't fail the deletion
        console.error('Error sending farewell email:', emailError);
      }
    }

    // Clean up user storage files before account deletion
    // Wrapped in try/catch — storage cleanup failure must NOT block deletion
    try {
      const { data: avatarFiles } = await supabaseAdmin.storage
        .from('avatars')
        .list(user.id);
      
      if (avatarFiles && avatarFiles.length > 0) {
        const filePaths = avatarFiles.map(f => `${user.id}/${f.name}`);
        const { error: storageError } = await supabaseAdmin.storage
          .from('avatars')
          .remove(filePaths);
        
        if (storageError) {
          console.error('Storage cleanup error:', storageError);
        } else {
          console.log(`Cleaned up ${filePaths.length} avatar files for user ${user.id}`);
        }
      }
    } catch (storageCleanupError) {
      console.error('Storage cleanup failed (non-blocking):', storageCleanupError);
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
