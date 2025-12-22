import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// MonCash API endpoints
const MONCASH_ENDPOINTS = {
  sandbox: {
    auth: 'https://sandbox.moncashbutton.digicelgroup.com/Api/oauth/token',
    retrieveByOrderId: 'https://sandbox.moncashbutton.digicelgroup.com/Api/v1/RetrieveOrderPayment',
    retrieveByTransactionId: 'https://sandbox.moncashbutton.digicelgroup.com/Api/v1/RetrieveTransactionPayment',
  },
  live: {
    auth: 'https://moncashbutton.digicelgroup.com/Api/oauth/token',
    retrieveByOrderId: 'https://moncashbutton.digicelgroup.com/Api/v1/RetrieveOrderPayment',
    retrieveByTransactionId: 'https://moncashbutton.digicelgroup.com/Api/v1/RetrieveTransactionPayment',
  }
};

interface VerifyRequest {
  orderId?: string;
  transactionId?: string;
}

// Get OAuth token from MonCash
async function getMonCashToken(clientId: string, clientSecret: string, mode: string): Promise<string> {
  const endpoints = mode === 'live' ? MONCASH_ENDPOINTS.live : MONCASH_ENDPOINTS.sandbox;
  
  const credentials = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch(endpoints.auth, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: 'scope=read,write&grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('MonCash auth error:', errorText);
    throw new Error(`Failed to authenticate with MonCash: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

// Retrieve payment by order ID
async function retrievePaymentByOrderId(token: string, orderId: string, mode: string) {
  const endpoints = mode === 'live' ? MONCASH_ENDPOINTS.live : MONCASH_ENDPOINTS.sandbox;
  
  const response = await fetch(endpoints.retrieveByOrderId, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ orderId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('MonCash retrieve error:', errorText);
    throw new Error(`Failed to retrieve payment: ${response.status}`);
  }

  return await response.json();
}

// Retrieve payment by transaction ID
async function retrievePaymentByTransactionId(token: string, transactionId: string, mode: string) {
  const endpoints = mode === 'live' ? MONCASH_ENDPOINTS.live : MONCASH_ENDPOINTS.sandbox;
  
  const response = await fetch(endpoints.retrieveByTransactionId, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ transactionId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('MonCash retrieve error:', errorText);
    throw new Error(`Failed to retrieve payment: ${response.status}`);
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get MonCash credentials from secrets
    const clientId = Deno.env.get('MONCASH_CLIENT_ID');
    const clientSecret = Deno.env.get('MONCASH_CLIENT_SECRET');
    const mode = Deno.env.get('MONCASH_MODE') || 'sandbox';

    if (!clientId || !clientSecret) {
      console.error('MonCash credentials not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payment gateway not configured' 
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { orderId, transactionId }: VerifyRequest = await req.json();

    if (!orderId && !transactionId) {
      return new Response(
        JSON.stringify({ success: false, error: 'orderId or transactionId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Verifying MonCash payment: orderId=${orderId}, transactionId=${transactionId}, mode=${mode}`);

    // Get OAuth token
    const token = await getMonCashToken(clientId, clientSecret, mode);
    console.log('MonCash authentication successful');

    // Retrieve payment details
    let paymentData;
    if (orderId) {
      paymentData = await retrievePaymentByOrderId(token, orderId, mode);
    } else {
      paymentData = await retrievePaymentByTransactionId(token, transactionId!, mode);
    }

    console.log('Payment data received:', JSON.stringify(paymentData));

    // Check if payment was successful
    if (paymentData.status !== 'Success') {
      return new Response(
        JSON.stringify({
          success: false,
          error: paymentData.message || 'Payment verification failed',
          data: paymentData,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payment = paymentData.payment;
    const paymentStatus = payment?.message === 'successful' ? 'completed' : 'failed';

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update transaction in database
    const updateData: Record<string, unknown> = {
      status: paymentStatus,
      transaction_id: payment?.transactionId?.toString(),
      payer_phone: payment?.payer,
      updated_at: new Date().toISOString(),
    };

    if (paymentStatus === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update(updateData)
      .eq('order_id', orderId || payment?.orderId);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      // Don't fail - the payment is verified, just log the error
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: paymentStatus,
        payment: {
          transactionId: payment?.transactionId,
          orderId: payment?.orderId,
          amount: payment?.cost,
          payer: payment?.payer,
          message: payment?.message,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in moncash-verify-payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify payment';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
