import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppRequest {
  phoneNumber: string;
  fullName: string;
  confirmationCode: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, fullName, confirmationCode }: WhatsAppRequest = 
      await req.json();

    console.log("Processing WhatsApp confirmation for:", phoneNumber);

    // Format phone number (remove any non-numeric characters)
    const cleanPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    // Create WhatsApp message
    const message = encodeURIComponent(
      `🎓 Bienvenue ${fullName} !\n\n` +
      `Merci de vous être inscrit sur notre plateforme d'éducation.\n\n` +
      `Votre code de confirmation est :\n` +
      `*${confirmationCode}*\n\n` +
      `Gardez ce code en sécurité et ne le partagez avec personne.\n\n` +
      `Si vous n'avez pas créé ce compte, veuillez ignorer ce message.`
    );

    // Generate WhatsApp Web URL
    const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${message}`;

    console.log("WhatsApp URL generated for:", cleanPhoneNumber);

    return new Response(
      JSON.stringify({ 
        success: true, 
        whatsappUrl,
        message: "WhatsApp URL generated successfully" 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error processing WhatsApp confirmation:", error);
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
