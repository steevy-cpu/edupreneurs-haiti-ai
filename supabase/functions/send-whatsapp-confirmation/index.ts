import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { 
  getSecureHeaders, 
  secureJsonResponse, 
  secureErrorResponse, 
  corsPreflightResponse 
} from "../_shared/securityHeaders.ts";
import { checkRateLimit, RATE_LIMITS, getClientIp } from "../_shared/rateLimiter.ts";

// Input validation schema
const whatsappConfirmationSchema = z.object({
  phoneNumber: z.string()
    .min(8, "Phone number too short")
    .max(20, "Phone number too long")
    .regex(/^[\d+\-\s()]+$/, "Invalid phone number format"),
  fullName: z.string().min(1).max(200).trim(),
  confirmationCode: z.string().length(6, "Confirmation code must be 6 digits")
}).strict();

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return corsPreflightResponse();
  }

  try {
    // Initialize Supabase for rate limiting
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP for rate limiting
    const clientIp = getClientIp(req);

    // Check rate limit
    const rateLimitResult = await checkRateLimit(
      supabase,
      RATE_LIMITS.EMAIL, // Use email rate limit (similar purpose)
      null,
      clientIp
    );

    if (!rateLimitResult.allowed) {
      console.warn('[send-whatsapp-confirmation] Rate limit exceeded for IP:', clientIp);
      return secureErrorResponse('Too many requests. Please try again later.', 429);
    }

    // Parse and validate input
    const body = await req.json();
    const validation = whatsappConfirmationSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
      console.error('[send-whatsapp-confirmation] Validation failed:', errors);
      return secureErrorResponse('Invalid input', 400, errors);
    }

    const { phoneNumber, fullName, confirmationCode } = validation.data;

    console.log("[send-whatsapp-confirmation] Processing for phone:", phoneNumber.slice(0, 4) + "****");

    // Format phone number (remove any non-numeric characters)
    const cleanPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    
    // Create WhatsApp message (properly encoded)
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

    console.log("[send-whatsapp-confirmation] WhatsApp URL generated");

    return secureJsonResponse({ 
      success: true, 
      whatsappUrl,
      message: "WhatsApp URL generated successfully" 
    });
  } catch (error: any) {
    console.error("[send-whatsapp-confirmation] Error:", error);
    return secureErrorResponse(error.message || 'Internal server error', 500);
  }
};

serve(handler);
