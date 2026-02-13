/**
 * Gift Subscription Service
 * Handles generating gift payment links for family members
 */

import { supabase } from "@/integrations/supabase/client";

interface GiftRecord {
  student_name: string;
  status: string;
  expires_at: string;
}

/**
 * Generate a gift payment link for the current student
 */
export async function generateGiftLink(studentName: string, studentEmail: string): Promise<{
  success: boolean;
  token?: string;
  giftUrl?: string;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Vous devez être connecté" };
    }

    // Generate a cryptographically random 32-char hex token
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const token = Array.from(array, b => b.toString(16).padStart(2, "0")).join("");

    // Use first name only for privacy
    const firstName = studentName.split(" ")[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("gift_subscriptions")
      .insert({
        token,
        student_user_id: user.id,
        student_name: firstName,
        student_email: studentEmail,
        status: "pending",
        amount_usd: 200,
      });

    if (error) {
      console.error("Gift link creation error:", error);
      return { success: false, error: "Impossible de créer le lien" };
    }

    const baseUrl = window.location.origin;
    const giftUrl = `${baseUrl}/gift/pay/${token}`;

    return { success: true, token, giftUrl };
  } catch (err) {
    console.error("Gift link error:", err);
    return { success: false, error: "Erreur inattendue" };
  }
}

/**
 * Create a Stripe Checkout session for a gift payment (called from the public page)
 */
export async function createGiftCheckout(token: string): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke("stripe-gift-payment", {
      body: { token },
    });

    if (error) {
      return { success: false, error: "Erreur de connexion" };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    return { success: true, url: data.url };
  } catch (err) {
    console.error("Gift checkout error:", err);
    return { success: false, error: "Erreur inattendue" };
  }
}

/**
 * Verify a gift payment after Stripe redirect
 */
export async function verifyGiftPayment(token: string): Promise<{
  success: boolean;
  studentName?: string;
  alreadyCompleted?: boolean;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.functions.invoke("verify-gift-payment", {
      body: { token },
    });

    if (error) {
      return { success: false, error: "Erreur de vérification" };
    }

    return data;
  } catch (err) {
    console.error("Gift verify error:", err);
    return { success: false, error: "Erreur inattendue" };
  }
}

/**
 * Fetch gift subscription info by token (for the public payment page)
 */
export async function getGiftInfo(token: string): Promise<{
  success: boolean;
  studentName?: string;
  status?: string;
  error?: string;
}> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("gift_subscriptions")
      .select("student_name, status, expires_at")
      .eq("token", token)
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: "Lien introuvable" };
    }

    const record = data as GiftRecord;

    if (record.status === "completed") {
      return { success: true, studentName: record.student_name, status: "completed" };
    }

    if (new Date(record.expires_at) < new Date()) {
      return { success: false, error: "Ce lien a expiré" };
    }

    return { success: true, studentName: record.student_name, status: record.status };
  } catch (err) {
    return { success: false, error: "Erreur inattendue" };
  }
}
