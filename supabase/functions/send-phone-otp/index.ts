import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// TEST MODE - Set to false when ready for production with Vonage
const TEST_MODE = true;
const TEST_OTP_CODE = "123456";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOtpRequest {
  phoneNumber: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, userId }: SendOtpRequest = await req.json();

    if (!phoneNumber || !userId) {
      return new Response(
        JSON.stringify({ error: "Phone number and user ID are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Format phone number for Haiti (+509)
    let formattedPhone = phoneNumber.replace(/\s+/g, "").replace(/-/g, "");
    if (!formattedPhone.startsWith("+")) {
      if (formattedPhone.startsWith("509")) {
        formattedPhone = "+" + formattedPhone;
      } else {
        formattedPhone = "+509" + formattedPhone;
      }
    }

    console.log(`[send-phone-otp] Processing request for user: ${userId}, phone: ${formattedPhone}`);

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limiting - only allow one OTP every 60 seconds
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("phone_verification_sent_at")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      console.error("[send-phone-otp] Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Rate limiting check
    if (profile.phone_verification_sent_at) {
      const lastSent = new Date(profile.phone_verification_sent_at);
      const now = new Date();
      const diffSeconds = (now.getTime() - lastSent.getTime()) / 1000;
      
      if (diffSeconds < 60) {
        const remainingSeconds = Math.ceil(60 - diffSeconds);
        console.log(`[send-phone-otp] Rate limited. ${remainingSeconds}s remaining`);
        return new Response(
          JSON.stringify({ 
            error: `Veuillez attendre ${remainingSeconds} secondes avant de renvoyer un code`,
            remainingSeconds 
          }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    let requestId: string;

    if (TEST_MODE) {
      // TEST MODE: Generate a mock request ID and log the code
      requestId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log("========================================");
      console.log(`[TEST MODE] Phone OTP for ${formattedPhone}`);
      console.log(`[TEST MODE] OTP Code: ${TEST_OTP_CODE}`);
      console.log(`[TEST MODE] Request ID: ${requestId}`);
      console.log("========================================");
    } else {
      // PRODUCTION MODE: Use Vonage Verify API
      const vonageApiKey = Deno.env.get("VONAGE_API_KEY");
      const vonageApiSecret = Deno.env.get("VONAGE_API_SECRET");

      if (!vonageApiKey || !vonageApiSecret) {
        console.error("[send-phone-otp] Vonage credentials not configured");
        return new Response(
          JSON.stringify({ error: "SMS service not configured" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Call Vonage Verify API
      const vonageResponse = await fetch("https://api.nexmo.com/verify/json", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          api_key: vonageApiKey,
          api_secret: vonageApiSecret,
          number: formattedPhone.replace("+", ""),
          brand: "EDUPRENEURS",
          code_length: "6",
          lg: "fr-fr",
        }),
      });

      const vonageData = await vonageResponse.json();
      console.log("[send-phone-otp] Vonage response:", vonageData);

      if (vonageData.status !== "0") {
        console.error("[send-phone-otp] Vonage error:", vonageData.error_text);
        return new Response(
          JSON.stringify({ error: vonageData.error_text || "Failed to send SMS" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      requestId = vonageData.request_id;
    }

    // Store the request ID and timestamp in the user's profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        phone_verification_request_id: requestId,
        phone_verification_sent_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("[send-phone-otp] Error updating profile:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to store verification request" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[send-phone-otp] OTP sent successfully. Request ID: ${requestId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: TEST_MODE 
          ? "Code envoyé (mode test - vérifiez les logs)" 
          : "Code SMS envoyé avec succès",
        testMode: TEST_MODE,
        testCode: TEST_MODE ? TEST_OTP_CODE : undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("[send-phone-otp] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
