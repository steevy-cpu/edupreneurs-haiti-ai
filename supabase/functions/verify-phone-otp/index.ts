import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// TEST MODE - Set to false when ready for production with Vonage
const TEST_MODE = true;
const TEST_OTP_CODE = "123456";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOtpRequest {
  code: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, userId }: VerifyOtpRequest = await req.json();

    if (!code || !userId) {
      return new Response(
        JSON.stringify({ error: "Code and user ID are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[verify-phone-otp] Verifying code for user: ${userId}`);

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the stored request ID from the user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("phone_verification_request_id, phone_number")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      console.error("[verify-phone-otp] Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!profile.phone_verification_request_id) {
      console.log("[verify-phone-otp] No pending verification request");
      return new Response(
        JSON.stringify({ error: "Aucune demande de vérification en cours. Veuillez renvoyer un code." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    let isValid = false;

    if (TEST_MODE) {
      // TEST MODE: Accept the test code
      isValid = code.trim() === TEST_OTP_CODE;
      console.log(`[TEST MODE] Code verification: ${isValid ? "SUCCESS" : "FAILED"}`);
      console.log(`[TEST MODE] Expected: ${TEST_OTP_CODE}, Received: ${code}`);
    } else {
      // PRODUCTION MODE: Use Vonage Verify Check API
      const vonageApiKey = Deno.env.get("VONAGE_API_KEY");
      const vonageApiSecret = Deno.env.get("VONAGE_API_SECRET");

      if (!vonageApiKey || !vonageApiSecret) {
        console.error("[verify-phone-otp] Vonage credentials not configured");
        return new Response(
          JSON.stringify({ error: "SMS service not configured" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Call Vonage Verify Check API
      const vonageResponse = await fetch("https://api.nexmo.com/verify/check/json", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          api_key: vonageApiKey,
          api_secret: vonageApiSecret,
          request_id: profile.phone_verification_request_id,
          code: code.trim(),
        }),
      });

      const vonageData = await vonageResponse.json();
      console.log("[verify-phone-otp] Vonage response:", vonageData);

      isValid = vonageData.status === "0";

      if (!isValid) {
        console.error("[verify-phone-otp] Vonage error:", vonageData.error_text);
        return new Response(
          JSON.stringify({ error: vonageData.error_text || "Code incorrect" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Code incorrect" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Update the profile to mark phone as verified
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        phone_confirmed: true,
        phone_verification_request_id: null,
        phone_verification_sent_at: null,
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("[verify-phone-otp] Error updating profile:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update verification status" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`[verify-phone-otp] Phone verified successfully for user: ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Numéro de téléphone vérifié avec succès! ✅",
        phoneNumber: profile.phone_number,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("[verify-phone-otp] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
