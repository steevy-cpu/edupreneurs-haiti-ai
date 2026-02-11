/**
 * Security-Hardened: NatCash Create Order
 * 
 * Features:
 * - Rate limiting
 * - Input validation
 * - Security headers
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from "../_shared/rateLimiter.ts";
import { corsHeaders, securityHeaders, noCacheHeaders, corsPreflightResponse } from "../_shared/securityHeaders.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Validation schema
const orderSchema = z.object({
  amount: z.number().positive().max(1000000),
  description: z.string().max(500).optional(),
  natcashPhone: z.string().regex(/^\d{8}$/, "NatCash phone must be 8 digits").optional(),
});

function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `NC-${timestamp}-${randomPart}`.toUpperCase();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsPreflightResponse();
  }

  const responseHeaders = { ...corsHeaders, ...securityHeaders, ...noCacheHeaders, 'Content-Type': 'application/json' };

  try {
    console.log('[NatCash Create Order] Starting order creation...');

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[NatCash Create Order] No authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: responseHeaders }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('[NatCash Create Order] User authentication failed:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: responseHeaders }
      );
    }

    // Rate limiting
    const clientIp = getClientIp(req);
    const rateCheck = await checkRateLimit(supabase, RATE_LIMITS.PAYMENT, user.id, clientIp);
    if (!rateCheck.allowed) {
      console.warn(`Rate limit exceeded for natcash-create-order user ${user.id}`);
      return rateLimitResponse(rateCheck.retryAfter!, rateCheck.remaining, responseHeaders);
    }

    console.log('[NatCash Create Order] User authenticated:', user.id);

    // Parse and validate input
    const rawBody = await req.json();
    const validation = orderSchema.safeParse(rawBody);
    
    if (!validation.success) {
      console.error('[NatCash Create Order] Validation failed:', validation.error);
      return new Response(
        JSON.stringify({ success: false, error: validation.error.issues.map(i => i.message).join(', ') }),
        { status: 400, headers: responseHeaders }
      );
    }

    const { amount, description, natcashPhone } = validation.data;

    // Get NatCash account details from environment
    const natcashAccountNumber = Deno.env.get('NATCASH_ACCOUNT_NUMBER') || 'NOT_CONFIGURED';
    const natcashAccountName = Deno.env.get('NATCASH_ACCOUNT_NAME') || 'NOT_CONFIGURED';

    console.log('[NatCash Create Order] NatCash account configured:', natcashAccountNumber !== 'NOT_CONFIGURED');

    // Generate unique order ID
    const orderId = generateOrderId();

    // Create pending transaction in database
    const { data: transaction, error: insertError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        order_id: orderId,
        amount: amount,
        currency: 'HTG',
        provider: 'natcash',
        status: 'pending',
        description: description || 'NatCash Payment',
        natcash_phone: natcashPhone || null,
        metadata: {
          created_via: 'natcash-create-order',
          natcash_account: natcashAccountNumber,
          user_natcash_phone: natcashPhone || null,
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('[NatCash Create Order] Database insert error:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create order' }),
        { status: 500, headers: responseHeaders }
      );
    }

    console.log('[NatCash Create Order] Order created successfully:', orderId);

    // Return order details with payment instructions
    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: transaction.id,
          orderId: orderId,
          amount: amount,
          currency: 'HTG',
          status: 'pending',
        },
        paymentInstructions: {
          accountNumber: natcashAccountNumber,
          accountName: natcashAccountName,
          steps: [
            'Composez *202# sur votre téléphone Digicel',
            'Sélectionnez "Transfert d\'argent"',
            'Entrez le numéro: ' + natcashAccountNumber,
            'Entrez le montant: ' + amount + ' HTG',
            'Confirmez avec votre PIN NatCash',
            'Notez le code de référence de la transaction',
            'Téléversez la capture d\'écran de confirmation'
          ],
          stepsEnglish: [
            'Dial *202# on your Digicel phone',
            'Select "Transfer Money"',
            'Enter the number: ' + natcashAccountNumber,
            'Enter the amount: ' + amount + ' HTG',
            'Confirm with your NatCash PIN',
            'Note the transaction reference code',
            'Upload the confirmation screenshot'
          ],
          note: 'Après le paiement, veuillez téléverser votre reçu pour vérification.',
          noteEnglish: 'After payment, please upload your receipt for verification.'
        }
      }),
      { headers: responseHeaders }
    );

  } catch (error) {
    console.error('[NatCash Create Order] Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: responseHeaders }
    );
  }
});
