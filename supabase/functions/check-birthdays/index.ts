import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    // We compare the month and day part of date_of_birth
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

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Joyeux Anniversaire!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="https://mon-edupreneur.com/logo.png" alt="Edupreneurs Logo" style="height: 60px; width: auto;" />
    </div>
    
    <!-- Main Card -->
    <div style="background: linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%); border-radius: 24px; padding: 50px 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
      
      <!-- Birthday Icon -->
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="font-size: 80px; line-height: 1;">🎂</div>
      </div>
      
      <!-- Main Title -->
      <h1 style="text-align: center; font-size: 32px; font-weight: 700; color: #1a1a2e; margin: 0 0 10px 0;">
        🎉 Joyeux Anniversaire! 🎉
      </h1>
      
      <!-- Greeting -->
      <p style="text-align: center; font-size: 18px; color: #4a5568; margin: 0 0 30px 0;">
        Salut ${username}! 🌟
      </p>
      
      <!-- Birthday Message Box -->
      <div style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%); border-radius: 16px; padding: 30px; margin-bottom: 30px; text-align: center;">
        <p style="font-size: 18px; color: #5c3d2e; margin: 0 0 15px 0; font-weight: 600;">
          Toute l'équipe d'Edupreneurs te souhaite une merveilleuse journée remplie de joie et de bonheur! 🎈
        </p>
        <p style="font-size: 16px; color: #7c5c4e; margin: 0;">
          Que cette nouvelle année de ta vie soit riche en apprentissages, en réussites et en belles surprises! 🌈✨
        </p>
      </div>
      
      <!-- Fun Facts -->
      <div style="background: #f0f4ff; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
        <p style="text-align: center; font-size: 16px; color: #4a5568; margin: 0;">
          🎁 <strong>Cadeau spécial:</strong> Continue à apprendre avec nous et atteins tes objectifs! Tu es incroyable! 💪
        </p>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="https://mon-edupreneur.com/dashboard" 
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
          🎓 Célébrer en apprenant
        </a>
      </div>
      
      <!-- Decorations -->
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 30px;">🎈🎊🎁🎀🎈</span>
      </div>
      
      <!-- Signature -->
      <p style="text-align: center; color: #718096; font-size: 14px; margin: 0;">
        Avec toute notre affection,<br>
        <strong style="color: #667eea;">L'équipe Edupreneurs</strong> 💜
      </p>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 30px;">
      <p style="color: rgba(255, 255, 255, 0.8); font-size: 12px; margin: 0;">
        © 2025 Edupreneurs. Tous droits réservés.
      </p>
    </div>
  </div>
</body>
</html>
        `;

        await resend.emails.send({
          from: "Edupreneurs <noreply@mon-edupreneur.com>",
          to: [email],
          subject: `🎂 Joyeux Anniversaire ${username}! 🎉`,
          html: emailHtml,
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
