/**
 * @file useEnsureProfile — Ensures a profile row exists for OAuth users.
 *
 * Email/password signup creates profiles in signup.service.ts.
 * OAuth (Google) bypasses that flow entirely, so this hook fills the gap
 * by creating a minimal profile with a 7-day free trial on first login.
 *
 * SAFETY: Never overwrites an existing profile — only INSERTs when absent.
 * If the profile already exists and the provider is Google, it syncs
 * email_confirmed = true (since Google verifies emails).
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Ensure a profile row exists for the given user.
 * - If profile exists + Google provider + email_confirmed=false → fix to true.
 * - If profile absent → INSERT minimal row with 7-day trial.
 * - Always resolves (never throws) — fail-open to avoid blocking auth.
 */
export async function ensureProfileExists(
  userId: string,
  userMeta: Record<string, any> | undefined,
  provider: string
): Promise<void> {
  try {
    // Check if profile already exists
    const { data: existing, error: selectError } = await supabase
      .from('profiles')
      .select('id, email_confirmed')
      .eq('user_id', userId)
      .maybeSingle();

    if (selectError) {
      console.error('[ensureProfile] Select error:', selectError.message);
      return; // Fail open — don't block auth
    }

    if (existing) {
      // Profile exists — sync email_confirmed for Google users
      if (provider === 'google' && existing.email_confirmed === false) {
        await supabase
          .from('profiles')
          .update({ email_confirmed: true } as any)
          .eq('user_id', userId);
      }
      return; // Nothing else to do
    }

    // No profile — create minimal one with 7-day free trial
    const trialEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        full_name: userMeta?.full_name || userMeta?.name || null,
        avatar_url: userMeta?.avatar_url || userMeta?.picture || null,
        email_confirmed: true,          // Google verifies email
        phone_confirmed: false,
        subscription_status: 'timed_free',
        has_free_access: true,
        subscription_end_date: trialEnd,
        onboarding_tour_completed: false,
      } as any);

    if (insertError) {
      console.error('[ensureProfile] Insert error:', insertError.message);
      // Fail open — user can still browse; profile may be created on next visit
    }
  } catch (err) {
    // Catch-all — never block the auth flow
    console.error('[ensureProfile] Unexpected error:', err);
  }
}
