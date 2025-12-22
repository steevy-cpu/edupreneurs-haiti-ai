import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderRequest {
  amount: number;
  description?: string;
}

function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `NC-${timestamp}-${randomPart}`.toUpperCase();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[NatCash Create Order] Starting order creation...');

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[NatCash Create Order] No authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[NatCash Create Order] User authenticated:', user.id);

    // Parse request body
    const { amount, description }: OrderRequest = await req.json();
    
    if (!amount || amount <= 0) {
      console.error('[NatCash Create Order] Invalid amount:', amount);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
        metadata: {
          created_via: 'natcash-create-order',
          natcash_account: natcashAccountNumber,
        }
      })
      .select()
      .single();

    if (insertError) {
      console.error('[NatCash Create Order] Database insert error:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[NatCash Create Order] Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
