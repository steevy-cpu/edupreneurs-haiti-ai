import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { buildEmailTemplate, BRAND_COLORS } from "../_shared/emails.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const SITE_URL = Deno.env.get("SITE_URL") || "https://mon-edupreneur.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Template: birthday email — uses amber accent for celebration
function buildBirthdayEmail(username: string): string {
  return buildEmailTemplate({
    accentColor: BRAND_COLORS.accent,
    icon: '🎂',
    title: 'Joyeux Anniversaire !',
    subtitle: `${username}, c'est ton jour ! 🎉`,
    body: `
      <p style="color:#1f2937;font-size:16px;line-height:1.6;margin:0 0 20px;">
        Salut <strong style="color:${BRAND_COLORS.accent};">${username}</strong> ! 🌟
      </p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px;">
        En ce jour spécial, Jude et toute l'équipe Edupreneurs te souhaitent
        un joyeux anniversaire plein de succès ! 🇭🇹
      </p>
      <!-- Gift card -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:16px;margin-bottom:24px;">
      <tr><td style="padding:24px;text-align:center;">
        <div style="font-size:48px;margin-bottom:8px;">🎁</div>
        <p style="color:#92400e;font-size:16px;font-weight:700;margin:0 0 4px;">
          Cadeau d'anniversaire
        </p>
        <p style="color:#78350f;font-size:14px;margin:0;">
          Connecte-toi aujourd'hui pour une surprise spéciale de Jude !
        </p>
      </td></tr>
      </table>
    `,
    ctaText: 'Récupérer mon cadeau 🎁',
    ctaUrl: SITE_URL + '/dashboard',
    showJudeSignature: true,
  });
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Checking for birthdays today...");

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date in MM-DD format
    const today = new Date();
    const monthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    console.log(`Looking for users with birthday on ${monthDay}`);

    // Get all users whose birthday is today
    const { data: birthdayUsers, error: fetchError } = await supabase
      .from('profiles')
      .select('user_id, full_name, nickname, date_of_birth')
      .not('date_of_birth', 'is', null);

    if (fetchError) {
      console.error("Error fetching profiles:", fetchError);
      throw fetchError;
    }

    // Filter users whose birthday is today
    const usersWithBirthdayToday = birthdayUsers?.filter(user => {
      if (!user.date_of_birth) return false;
      const dob = new Date(user.date_of_birth);
      const userMonthDay = `${String(dob.getMonth() + 1).padStart(2, '0')}-${String(dob.getDate()).padStart(2, '0')}`;
      return userMonthDay === monthDay;
    }) || [];

    console.log(`Found ${usersWithBirthdayToday.length} users with birthday today`);

    const emailsSent: string[] = [];
    const errors: string[] = [];

    // Send birthday emails to each user
    for (const user of usersWithBirthdayToday) {
      try {
        // Get user email from auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.user_id);
        
        if (authError || !authUser?.user?.email) {
          console.error(`Could not get email for user ${user.user_id}:`, authError);
          errors.push(`User ${user.user_id}: No email found`);
          continue;
        }

        const email = authUser.user.email;
        const username = user.full_name || user.nickname || "Ami(e)";

        console.log(`Sending birthday email to ${email} (${username})`);

        await resend.emails.send({
          from: "Edupreneurs <noreply@mon-edupreneur.com>",
          to: [email],
          subject: `🎂 Joyeux Anniversaire ${username}! 🎉`,
          html: buildBirthdayEmail(username),
        });

        emailsSent.push(email);
        console.log(`Birthday email sent to ${email}`);
      } catch (emailError: any) {
        console.error(`Error sending email to user ${user.user_id}:`, emailError);
        errors.push(`User ${user.user_id}: ${emailError.message}`);
      }
    }

    const summary = {
      date: today.toISOString().split('T')[0],
      usersFound: usersWithBirthdayToday.length,
      emailsSent: emailsSent.length,
      emails: emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log("Birthday check complete:", summary);

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in check-birthdays function:", error);
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
