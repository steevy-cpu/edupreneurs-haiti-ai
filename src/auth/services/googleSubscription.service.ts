/**
 * @file googleSubscription.service.ts
 * @description Subscription activation for Google OAuth users with existing profiles.
 * Called from GoogleSetupPage after the user selects their access method.
 * Performs an UPDATE (never INSERT) — the profile row already exists via useEnsureProfile.
 * @module auth/services
 */

import { supabase } from "@/integrations/supabase/client";

export interface GoogleSubscriptionData {
  accessMethod: "trial" | "moncash" | "promo" | "gift";
  paymentOrderId?: string;
  paymentCompleted?: boolean;
  promoCode?: string;
  promoGrantsFreeAccess?: boolean;
}

/**
 * Activate a subscription for a Google OAuth user who already has a profile row.
 * Derives subscription_status, has_free_access, and subscription_end_date from the chosen access method.
 *
 * @param userId - The auth.users UUID
 * @param data - Access method selection from GoogleSetupPage
 * @returns { success, error? }
 */
export async function activateSubscriptionForExistingProfile(
  userId: string,
  data: GoogleSubscriptionData
): Promise<{ success: boolean; error?: string }> {
  try {
    const isMonCash = data.accessMethod === "moncash" && data.paymentCompleted;
    const isGift = data.accessMethod === "gift";
    const isTrial = data.accessMethod === "trial";
    const isPromo = data.accessMethod === "promo" && data.promoGrantsFreeAccess;

    // Derive subscription status — mirrors logic in signup.service.ts
    const subscriptionStatus = isMonCash
      ? "active"
      : isGift
        ? "pending_gift"
        : (isTrial || isPromo) ? "timed_free"
          : "none";

    // Derive end date — 30 days for MonCash, 7 days for trial/promo, fixed date for promo free access
    const subscriptionEndDate = isMonCash
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : isTrial
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : isPromo
          ? "2026-09-08T00:00:00.000Z"
          : null;

    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_status: subscriptionStatus,
        has_free_access: isMonCash || isTrial || isPromo,
        subscription_end_date: subscriptionEndDate,
        payment_order_id: isMonCash ? data.paymentOrderId : null,
        promo_code_used: data.promoCode?.toUpperCase().trim() || null,
      } as any)
      .eq("user_id", userId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
