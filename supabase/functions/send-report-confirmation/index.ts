import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { buildEmailTemplate, BRAND_COLORS } from "../_shared/emails.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Template: report confirmation — uses secondary (violet) accent
const getReportConfirmationTemplate = (fullName: string) => {
  return buildEmailTemplate({
    accentColor: BRAND_COLORS.secondary,
    icon: '📬',
    title: 'Signalement reçu',
    subtitle: 'Merci de ta vigilance',
    body: `
      <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
        Salut <strong style="color:${BRAND_COLORS.secondary};">${fullName}</strong> ! 🙏
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
        Notre équipe a bien reçu ton rapport et va l'examiner dans les plus
        brefs délais. Grâce à des membres vigilants comme toi, Edupreneurs
        reste un espace sûr et bienveillant.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="background:#f0fdfd;border-left:4px solid ${BRAND_COLORS.primary};border-radius:0 12px 12px 0;padding:16px 20px;">
        <p style="margin:0;font-size:14px;color:${BRAND_COLORS.primaryDark};line-height:1.6;">
          🔒 Ton signalement est traité de façon confidentielle.
        </p>
      </td></tr>
      </table>
    `,
  });
};

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
