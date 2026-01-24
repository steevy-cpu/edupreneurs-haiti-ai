import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsPreflightResponse, secureJsonResponse, secureErrorResponse } from '../_shared/securityHeaders.ts';
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '../_shared/rateLimiter.ts';
import { validateInput, contactFormSchema, validationErrorResponse } from '../_shared/validation.ts';
import { corsHeaders } from '../_shared/securityHeaders.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return secureErrorResponse('Method not allowed', 405);
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const clientIp = getClientIp(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Rate limiting (IP-based for anonymous, stricter limits)
    const rateLimitResult = await checkRateLimit(
      supabase,
      RATE_LIMITS.CONTACT_FORM,
      null, // Always treat as anonymous for contact form
      clientIp
    );

    if (!rateLimitResult.allowed) {
      return rateLimitResponse(
        rateLimitResult.retryAfter || 60,
        rateLimitResult.remaining,
        corsHeaders
      );
    }

    // Parse and validate input
    const rawBody = await req.json();
    const validation = validateInput(contactFormSchema, rawBody);

    if (!validation.success) {
      return validationErrorResponse(validation.errors, corsHeaders);
    }

    const { name, email, message } = validation.data;

    // Insert submission
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        message,
        ip_address: clientIp,
        user_agent: userAgent,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Database error:', error);
      return secureErrorResponse('Une erreur est survenue. Veuillez réessayer.', 500);
    }

    console.log(`Contact form submitted: ${data.id} from ${email}`);

    return secureJsonResponse({
      success: true,
      message: 'Votre message a été envoyé avec succès. Nous vous répondrons sous 24 heures.',
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return secureErrorResponse('Une erreur est survenue. Veuillez réessayer.', 500);
  }
});
