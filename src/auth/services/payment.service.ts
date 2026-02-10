/**
 * Payment Service - Signup payment via MonCash/Bazik
 */

import { supabase } from "@/integrations/supabase/client";

export interface SignupPaymentResult {
  success: boolean;
  orderId?: string;
  redirectUrl?: string;
  error?: string;
}

export interface PaymentStatusResult {
  success: boolean;
  status?: string;
  error?: string;
}

/**
 * Create a MonCash payment for signup (unauthenticated)
 */
export async function createSignupPayment(email: string): Promise<SignupPaymentResult> {
  try {
    const { data, error } = await supabase.functions.invoke('moncash-create-payment', {
      body: {
        amount: 200,
        description: 'Abonnement Edupreneurs - 30 jours',
        isSignupPayment: true,
        email,
      },
    });

    if (error) {
      console.error('Signup payment error:', error);
      return { success: false, error: 'Erreur lors de la création du paiement' };
    }

    if (!data?.success) {
      return { success: false, error: data?.error || 'Échec de la création du paiement' };
    }

    return {
      success: true,
      orderId: data.orderId,
      redirectUrl: data.redirectUrl,
    };
  } catch (err: any) {
    console.error('Signup payment exception:', err);
    return { success: false, error: 'Erreur réseau - vérifiez votre connexion' };
  }
}

/**
 * Check payment status for a signup order
 */
export async function checkSignupPaymentStatus(orderId: string): Promise<PaymentStatusResult> {
  try {
    const { data, error } = await supabase.functions.invoke('moncash-check-status', {
      body: { orderId },
    });

    if (error) {
      return { success: false, error: 'Erreur de vérification' };
    }

    return {
      success: data?.success || false,
      status: data?.status,
      error: data?.error,
    };
  } catch (err: any) {
    return { success: false, error: 'Erreur réseau' };
  }
}
