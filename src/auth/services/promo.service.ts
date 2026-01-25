/**
 * Promo Code Service - Promotional code validation
 */

import { supabase } from "@/integrations/supabase/client";

export interface PromoValidationResult {
  valid: boolean;
  goldReward?: number;
  grantsFreeAccess?: boolean;
  networkError?: boolean;
}

/**
 * Validate promo code with server
 */
export async function validatePromoCode(code: string): Promise<PromoValidationResult> {
  if (!code.trim() || code.trim().length < 3) {
    return { valid: false, networkError: false };
  }

  try {
    const { data, error } = await supabase.functions.invoke('validate-promo-code', {
      body: { code: code.trim() }
    });
    
    if (error) {
      console.error('Promo code validation error:', error);
      // Check if it's a network error
      if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('Failed')) {
        return { valid: false, networkError: true };
      }
      return { valid: false, networkError: false };
    }
    
    return { 
      valid: data.valid, 
      goldReward: data.goldReward, 
      grantsFreeAccess: data.grantsFreeAccess,
      networkError: false
    };
  } catch (error: any) {
    console.error('Promo code validation failed:', error);
    return { valid: false, networkError: true };
  }
}
