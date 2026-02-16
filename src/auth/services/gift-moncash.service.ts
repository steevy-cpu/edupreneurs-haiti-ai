/**
 * MonCash Gift Subscription Service
 * Handles generating MonCash gift payment links for family members in Haiti
 */

import { supabase } from "@/integrations/supabase/client";

const MONCASH_GIFT_EXPIRY_MINUTES = 15;

/**
 * Generate a MonCash gift payment link (15-min expiry)
 */
export async function generateMonCashGiftLink(
  studentName: string,
  studentEmail: string,
  studentUserId: string | null = null
): Promise<{
  success: boolean;
  token?: string;
  giftUrl?: string;
  error?: string;
}> {
  try {
    // Generate a cryptographically random 32-char hex token
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const token = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");

    // Use first name only for privacy
    const firstName = studentName.split(" ")[0];

    const expiresAt = new Date(Date.now() + MONCASH_GIFT_EXPIRY_MINUTES * 60 * 1000).toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("gift_subscriptions")
      .insert({
        token,
        student_user_id: studentUserId,
        student_name: firstName,
        student_email: studentEmail,
        status: "pending",
        amount_cents: 0, // Not used for MonCash
        amount_htg: 200,
        payment_gateway: "moncash",
        expires_at: expiresAt,
      });

    if (error) {
      console.error("MonCash gift link creation error:", error);
      return { success: false, error: "Impossible de créer le lien" };
    }

    const baseUrl = window.location.origin;
    const giftUrl = `${baseUrl}/gift/moncash/${token}`;

    return { success: true, token, giftUrl };
  } catch (err) {
    console.error("MonCash gift link error:", err);
    return { success: false, error: "Erreur inattendue" };
  }
}

/**
 * Initiate MonCash payment for a gift token (called from the public payment page)
 */
export async function createMonCashGiftPayment(
  token: string
): Promise<{
  success: boolean;
  redirectUrl?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke("moncash-gift-payment", {
      body: { token },
    });

    if (error) {
      return { success: false, error: "Erreur de connexion" };
    }

    if (!data?.success) {
      return { success: false, error: data?.error || "Échec de la création du paiement" };
    }

    return { success: true, redirectUrl: data.redirectUrl };
  } catch (err) {
    console.error("MonCash gift payment error:", err);
    return { success: false, error: "Erreur inattendue" };
  }
}

/**
 * Verify MonCash gift payment after redirect
 */
export async function verifyMonCashGiftPayment(
  token: string,
  orderId: string
): Promise<{
  success: boolean;
  studentName?: string;
  status?: string;
  alreadyCompleted?: boolean;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke("verify-moncash-gift", {
      body: { token, orderId },
    });

    if (error) {
      return { success: false, error: "Erreur de vérification" };
    }

    return data;
  } catch (err) {
    console.error("MonCash gift verify error:", err);
    return { success: false, error: "Erreur inattendue" };
  }
}
